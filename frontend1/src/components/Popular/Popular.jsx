import React, { useEffect, useState } from 'react'
import './Popular.css'
import {Item }from '../Item/Item'
export const Popular = () => {
    const [data_product,setdata_product]=useState([]);
    useEffect(()=>{
  fetch('https://quickzo-11.onrender.com/popularinwoman')
  .then((response)=>response.json())
  .then((data)=>setdata_product(data))
    },[])
  return (
   <div className="popular">
       <h1> POPULAR IN WOMEN</h1>
       <hr />
       <div className="popular-item">
        {data_product.map((item,i)=>{
            return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
        })}
       </div>
   </div>
  )
}
