require('dotenv').config();
const port = process.env.PORT;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cors = require("cors");
const Product = require("./models/imageproduct");
const User = require("./models/usercreation");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// MongoDB Connection
main()
.then(() => {
  console.log("mongoose connected");
})
.catch((e) => {
  console.log(e);
});

async function main(){
  await mongoose.connect(process.env.MONGO_URL);
}

// Home API 
app.get("/", (req,res)=>{
  res.send("this is vishal pase");
});


// ---------------- CLOUDINARY CONFIG ----------------

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "quickzo_products",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage: storage });


// Upload Image API
app.post("/upload", upload.single("product"), (req,res)=>{
  res.json({
    success: 1,
    image_url: req.file.path
  });
});

// Generate a factual product description. The API key remains server-side.
app.post('/generate-product-description', async (req, res) => {
  const { name, category, new_price, old_price, keywords } = req.body;

  if (!name?.trim() || !category?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Product name and category are required.',
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured.');
    return res.status(503).json({
      success: false,
      message: 'Description generation is not currently available.',
    });
  }

  const productDetails = JSON.stringify({
    name: name.trim(),
    category: category.trim(),
    new_price,
    old_price,
    keywords: keywords || undefined,
  });
  const prompt = `Write one short product description (2-3 sentences) using only the supplied product details. Be accurate and concise. Do not invent materials, features, specifications, sizes, benefits, availability, or other facts. Do not make pricing, discount, value, or promotional claims, including any mention of prices. If a detail is missing, leave it out. Return only the description text.\n\nProduct details: ${productDetails}`;

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 120,
      }),
    });
    const openaiData = await openaiResponse.json();
    const description = openaiData.choices?.[0]?.message?.content?.trim();

    if (!openaiResponse.ok || !description) {
      console.error('OpenAI description generation failed:', openaiData.error?.message || openaiResponse.statusText);
      return res.status(502).json({
        success: false,
        message: 'Unable to generate a product description.',
      });
    }

    return res.json({ success: true, description });
  } catch (error) {
    console.error('OpenAI description generation failed:', error.message);
    return res.status(502).json({
      success: false,
      message: 'Unable to generate a product description.',
    });
  }
});


const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_AI_PRODUCTS = 40;

const normalizeSearchText = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const productForAi = (product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  price: product.new_price,
  originalPrice: product.old_price,
  description: product.description || '',
  available: product.avilable !== false,
});

const extractJson = (text) => {
  const match = String(text || '').match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
};

const getGeminiSuggestions = async ({ intent, products, title }) => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini is not configured. Set GEMINI_API_KEY on the server.');
  }

  const inventory = products.map(productForAi);
  const prompt = `You are a helpful ecommerce product finder. ${title}\n\nCustomer request: ${intent}\n\nOnly recommend products from this inventory JSON: ${JSON.stringify(inventory)}\n\nReturn ONLY valid JSON with this exact shape: {"summary":"one short helpful sentence","productIds":[number],"reason":"one short sentence"}. Pick 1 to 6 available product IDs. Never invent products, prices, materials, sizes, stock status, or discounts. If no product fits, use an empty productIds array and explain briefly.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        maxOutputTokens: 250,
      },
    }),
  });
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  const result = extractJson(text);
  if (!response.ok || !result || !Array.isArray(result.productIds)) {
    console.error('Gemini product search failed:', data.error?.message || response.statusText);
    throw new Error('Gemini could not generate recommendations.');
  }

  const byId = new Map(products.filter((product) => product.avilable !== false).map((product) => [product.id, product]));
  const selected = [...new Set(result.productIds.map(Number))]
    .map((id) => byId.get(id))
    .filter(Boolean)
    .slice(0, 6);

  return {
    summary: normalizeSearchText(result.summary) || 'Here are the closest matches from our catalog.',
    reason: normalizeSearchText(result.reason),
    products: selected,
    provider: 'gemini',
  };
};

// AI-powered natural-language product search. Gemini receives only a capped, public catalog.
app.post('/ai-product-search', async (req, res) => {
  const query = normalizeSearchText(req.body?.query);
  if (query.length < 2 || query.length > 300) {
    return res.status(400).json({ success: false, message: 'Please enter a search request between 2 and 300 characters.' });
  }

  try {
    const products = await Product.find({}).sort({ date: -1 }).limit(MAX_AI_PRODUCTS).lean();
    const aiResult = await getGeminiSuggestions({ intent: query, products, title: 'Find the best products for this request.' });
    return res.json({ success: true, ...aiResult });
  } catch (error) {
    console.error('AI product search failed:', error.message);
    return res.status(502).json({ success: false, message: 'AI search is temporarily unavailable. Please try again shortly.' });
  }
});

// AI recommendations for a product detail page, based solely on the current catalog.
app.get('/ai-recommendations/:id', async (req, res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product id.' });
  }

  try {
    const products = await Product.find({}).sort({ date: -1 }).limit(MAX_AI_PRODUCTS).lean();
    const currentProduct = products.find((product) => product.id === productId);
    if (!currentProduct) return res.status(404).json({ success: false, message: 'Product not found.' });

    const intent = `Recommend complementary or similar items for someone viewing ${currentProduct.name} (${currentProduct.category}). Do not include product ID ${currentProduct.id}.`;
    const aiResult = await getGeminiSuggestions({ intent, products, title: 'Suggest relevant companion products.' });
    const recommendations = aiResult.products.filter((product) => product.id !== currentProduct.id);
    return res.json({ success: true, ...aiResult, products: recommendations });
  } catch (error) {
    console.error('AI recommendations failed:', error.message);
    return res.status(502).json({ success: false, message: 'AI recommendations are temporarily unavailable. Please try again shortly.' });
  }
});


// Add Product
app.post('/addproduct', async(req,res)=>{
  try{
    if (!req.body.description?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A product description is required.',
      });
    }

    let products = await Product.find({});
    let id;

    if(products.length > 0){
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id + 1;
    } else {
      id = 1;
    }

    const product = new Product({ ...req.body, description: req.body.description.trim() });
    product.id = id;

    await product.save();

    console.log("Product Saved");

    res.json({
      success:true,
      name:req.body.name,
    });

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
});


// Delete Product
app.delete("/deleteproduct/:id", async (req,res)=>{
  await Product.findOneAndDelete({ _id:(req.params.id) });

  console.log("Removed");

  res.json({
    success:true
  });
});


// Get All Products
app.get('/allproducts', async(req,res)=>{
  const products = await Product.find({});
  res.send(products);
});


// Signup
app.post('/signup', async (req,res)=>{
  try{

    let check = await User.findOne({email:req.body.email});

    if(check){
      return res.status(400).json({
        success:false,
        errors:"existing user found with same email id"
      })
    }

    let cart = {};
    for(let i=0;i<300;i++){
      cart[i]=0;
    }

    const Userone = new User(req.body);
    await Userone.save();

    const data = {
      user:{
        id:Userone.id
      }
    }

    const token = jwt.sign(data,'secret_ecom');

    res.json({
      success:true,
      token
    })

  }catch(e){
    res.status(500).json({
      success:false,
      message:e.message
    });
  }
});


// Login
app.post('/login', async(req,res)=>{
  let Userone = await User.findOne({email:req.body.email})

  if(Userone){
    const passCampare = req.body.password === Userone.password;

    if(passCampare){

      const data={
        user:{
          id:Userone.id
        }
      }

      const token = jwt.sign(data,'secret_ecom');

      res.json({success:true,token});

    } else {
      res.json({success:false,errors:"wrong password"})
    }

  } else {
    res.json({success:false,errors:"Wrong Email Id"})
  }
});


// New Collection
app.get('/newcollection', async (req,res)=>{
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);

  console.log("Newcollection fetched")

  res.send(newcollection);
});


// Popular Women Products
app.get('/popularinwoman', async (req,res)=>{
  let products = await Product.find({category:"women"});
  let popular_in_women = products.slice(0,4);

  res.send(popular_in_women)
});


// Fetch User Middleware
const fetchUser = async (req,res,next)=>{

  const token = req.header('auth-token');

  if(!token){
    res.status(401).send({errors:"Please authenticate using valid token"})
  }

  else{
    try{
      const data = jwt.verify(token,'secret_ecom');
      req.user = data.user;
      next();

    } catch(error){
      res.status(401).send({errors:"please authenticate using a valid token"})
    }
  }
}


// Add to Cart
app.post('/addtocart', fetchUser, async (req,res)=>{

  console.log("added",req.body.itemId);

  let userData = await User.findOne({_id:req.user.id});

  userData.cartData[req.body.itemId] += 1;

  await User.findOneAndUpdate(
    {_id:req.user.id},
    {cartData:userData.cartData}
  );

  console.log("added");

});


// Remove from Cart
app.post('/removefromcart', fetchUser, async(req,res)=>{

  console.log("Remove",req.body.itemId);

  let userData = await User.findOne({_id:req.user.id});

  if(userData.cartData[req.body.itemId] > 0){

    userData.cartData[req.body.itemId] -= 1;

    await User.findOneAndUpdate(
      {_id:req.user.id},
      {cartData:userData.cartData}
    );

    console.log("Removed");

  }

});


// Get Cart
app.post('/getcart', fetchUser, async(req,res)=>{

  console.log("GetCart");

  let userData = await User.findOne({_id:req.user.id});

  res.json(userData.cartData);

});


// Server
app.listen(port, ()=>{
  console.log("Server running on port", port);
});
