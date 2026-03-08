
require('dotenv').config();
const port = process.env.PORT;
const express=require("express");
const app=express();
const mongoose = require("mongoose");
const jwt=require("jsonwebtoken");
const multer=require("multer");
const path=require("path");
const cors=require("cors");
const { type } = require("os");
const Product = require("./models/imageproduct");
const User = require("./models/usercreation");

app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://quickzo-2.vercel.app",
    "https://quickzo-222-f5nb.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

//DAtabase connection With MongoDB
main()
.then(()=>{
console.log("mongoose connected");
})
.catch((e)=>{
    console.log(e);
})

async function main(){
await mongoose.connect(process.env.MONGO_URI)

}
//create api 
 app.get("/",(req,res)=>{
    res.send("this is vishal pase");
 })

//image storage engine
const storage=multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload=multer({storage:storage})

//creating upload endpoint for images
app.use('/images',express.static('upload/images'))
app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success:1,
       image_url:`${req.protocol}://${req.get("host")}/images/${req.file.filename}`

    })
})


app.post('/addproduct',async(req,res)=>{
   try{
    let products=await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array=products.slice(-1);
        let last_product=last_product_array[0];
        id=last_product.id+1;
    }
    else{
        id=1;
    }
    const product=new Product(req.body);
    product.id=id;
      await product.save();
    console.log(product);
   
     console.log("saved")
    res.json({
        success:true,
        name:req.body.name,
    });
  
} catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
})

//Creating API for deleting products
app.delete("/deleteproduct/:id",async (req,res)=>{
   await Product.findOneAndDelete({ _id:(req.params.id) });
  
    console.log("Removed");
    res.json({
        success:true,
    
    })
});

//Create api for getting all products
app.get('/allproducts',async(req , res)=>{
         const products= await Product.find({});
    
         res.send(products);
})

// Creating Endpoint for registering the user

app.post('/signup', async (req,res)=>{
    try{let check= await User.findOne({email:req.body.email});
    if(check)
    {
        return res.status(400).json({success:false,errors:"exiting user found with same email id"})

    }
    let cart={};
    for(let i=0;i<300;i++)
    {
        cart[i]=0;
    }
    const Userone = new User(req.body);
    await Userone.save();
      const data={
        user:{
            id:Userone.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({
        success:true,
        token
    })
} catch(e){
  res.status(500).json({
            success: false,
            message: e.message
        });
    }
  
})
//create endpoint for User login
app.post('/login',async(req,res)=>{
    let Userone=await User.findOne({email:req.body.email})
    if(Userone)
    {
        const passCampare=req.body.password=== Userone.password;
        if(passCampare)
        {
            const data={
                user:{
                    id:Userone.id
                }
            }
            const token =jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"wrong password"})
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email Id"})
    }
})

//creating endpoint for newcollection data
app.get('/newcollection',async (req,res)=>{
   let products = await Product.find({});
   let newcollection = products.slice(1).slice(-8);
   console.log("Newcollection fetched")
   res.send(newcollection);
})

//creating endpoint for popular in women section 
app.get('/popularinwoman',async (req,res)=>{
    let products = await Product.find({category:"women"})
    let popular_in_women=products.slice(0,4);
    res.send(popular_in_women)
})

//creating middelware to fetch user
const fetchUser = async (req,res,next)=>{
   const token = req.header('auth-token');
   if(!token)
   {
    res.status(401).send({errors:"PLesse authenticate using valid token"})
   }
   else{
    try{
        const data = jwt.verify(token,'secret_ecom');
        req.user=data.user;
        next();
    } catch(error)
    {
      res.status(401).send({errors:"please authenticat using a valid token"})
    }
   }
}

//creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser,async (req,res)=>{
     console.log( "added",req.body.itemId);
     let userData = await User.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await User.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    console.log( "added");
})

//creating endpoint for remove products from cartdata
app.post('/removefromcart', fetchUser,async(req,res)=>{
    console.log( "Remove",req.body.itemId);
   let userData = await User.findOne({_id:req.user.id});
   if( userData.cartData[req.body.itemId]>0)
   {
    userData.cartData[req.body.itemId]-=1;
    await User.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    console.log( "Remove");
   }
    
})

//creating endpoint to get cart
app.post('/getcart', fetchUser ,async(req,res)=>{
    console.log("GetCart");
    let userData = await User.findOne({_id:req.user.id})
    res.json(userData.cartData);


})
app.listen(port,()=>{
 console.log("port are connecter at 4000...." )
})