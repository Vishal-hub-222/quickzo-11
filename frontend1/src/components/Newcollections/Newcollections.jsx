import React, { useState,useEffect } from 'react'
import './Newcollections.css'
import { Item } from '../Item/Item'
export const Newcollections = () => {
  const [new_collection,setNewcollection]=useState([]);
  useEffect(()=>{
    fetch('https://quickzo.onrender.com/newcollection')
    .then((response)=>response.json())
    .then((data)=>setNewcollection(data));
  },[])
  return (
    <div className="new-collections">
    <h1>NEW COLLECTIONS</h1>
    <hr />
   <div className="collections">
  {
    new_collection.map((item,i)=>
    {
         return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
    })
  }
   </div>
    </div>
  )
}
