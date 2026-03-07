import React, { useState } from 'react'
import "./Addproduct.css"
import upload_area from '../../Assets/upload_area.svg'
export const Addproduct = () => {
  const[image ,setimage]=useState(false)

  const [productDetails,setproductDetails]= useState({
    name:'',
    image:'',
    category:'women',
    new_price:"",
    old_price:''
  });

  const imagehandler =(e)=>{
   setimage(e.target.files[0]);
  };

  const chengeHandler=(e)=>{
   setproductDetails({...productDetails,[e.target.name]:e.target.value})
  };
  const Add_product=async ()=>{
    console.log(productDetails)
    let responseData;
    let product={...productDetails};

    let formData= new FormData();
    formData.append('product',image);

    await fetch('http://localhost:4000/upload',{
      method:'POST',
      headers:{
        Accept:'application/json',
      },
      body:formData,

   } )
   .then((resp)=> resp.json()).then((data)=>{responseData=data})

   if(responseData.success)
   {
    product.image=responseData.image_url;
    console.log(product)
    await fetch('http://localhost:4000/addproduct',{
      method:"POST",
      headers:{
        Accept:'application/json',
        'Content-Type':'application/json',
      },
      body:JSON.stringify(product),

    }).then((resp)=>resp.json()).then((data)=>{
      data.success?alert("product Added"):alert("failed")
    })
   }
  }

  return (
  
   <div className="add-product">
     <div className="addproduct-itemfield">
      <p>Product title </p>
      <input type="text" value={productDetails.name} onChange={chengeHandler} name="name" placeholder='type here' />
     </div>
     <div className="addproduct-price">
      <div className="addproduct-itemfield">
        <p>Price</p>
        <input value={productDetails.old_price} onChange={chengeHandler} type="text" name='old_price' placeholder='type here' />
      </div>
      <div className="addproduct-itemfield">
        <p>Offer Price</p>
        <input value={productDetails.new_price}  onChange={chengeHandler} type="text" name='new_price' placeholder='type here' />
      </div>
     </div>
     <div className="addproduct-itemfield">
      <p>Product Category</p>
      <select name="category" value={productDetails.category} onChange={chengeHandler} className='add-rpduct-selector'>
        <option value="women"> Women</option>
        <option value="men"> Men</option>
        <option value="kid"> Kid</option>
      </select>
     </div>
     <div className="addproduct-itemfield">
      <label htmlFor="file-input">
        <img src={image ?URL.createObjectURL (image):upload_area} className='addproduct_thumnail_img' />
      </label>
      <input onChange={imagehandler} type="file" name='image' id='file-input'  hidden/>
     </div>
     <button onClick={()=>{Add_product()}} className='addproduct-btn'>ADD</button>
   </div>
  )
}
