import React, { useEffect, useState } from 'react'
import './Listproduct.css'
import cross_icon from '../../Assets/cross_icon.png'
export const Listproduct = () => {
  const[allproducts,setallproducts]=useState([])
  const fetchInfo=async ()=>{
    await fetch('https://quickzo-backend.onrender.com/allproducts')
    .then((resp)=>resp.json())
    .then((data)=>{setallproducts(data)})
  }
  useEffect(()=>{
    fetchInfo()
  },[])

  const removeProduct = async (id) => {
    console.log(id)
  await fetch(`https://quickzo-backend.onrender.com/deleteproduct/${id}`, {
    method: "DELETE",
  })
  .then((resp) => resp.json())
  .then((data) => {
    if (data.success) {
      alert("Product Removed");
      fetchInfo()
    }
  });
};


  return (
   <div className="list-product">
    <h1>All Product List </h1>
    <div className="listproduct-format-main">
      <p>Products</p>
      <p>Title</p>
      <p>Old Price</p>
      <p>New Price</p>
      <p>Category</p>
      <p>Remove</p>
    </div>
    <div className="listproduct-allproducts">
      <hr />
     {allproducts.map((product,index)=>{
      return <> <div key={index} className='listproduct-format-main listproduct-format'>
            <img src={product.image} alt="" className='listproduct-product-icon' />
            <p>{product.name}</p>
            <p>${product.old_price}</p>
             <p>${product.new_price}</p>
             <p>{product.category}</p>
             <img className='listproduct-remove-icon' onClick={()=>removeProduct(product._id)} src={cross_icon} alt="" />
      </div>
      <hr />
     </>
     })}
    </div>
   
   </div>
  )
}
