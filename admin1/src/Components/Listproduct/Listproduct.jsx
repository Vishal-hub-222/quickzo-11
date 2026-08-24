import React, { useEffect, useState } from 'react'
import './Listproduct.css'
import cross_icon from '../../Assets/cross_icon.png'

const BACKEND_URL = 'https://quickzo.onrender.com';

export const Listproduct = () => {
  const[allproducts,setallproducts]=useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchInfo = async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await fetch(`${BACKEND_URL}/allproducts`);
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        throw new Error('Unable to connect to the product server.');
      }

      setallproducts(data);
    } catch {
      setallproducts([]);
      setLoadError('Unable to connect to the product server.');
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(()=>{
    fetchInfo()
  },[])

  const removeProduct = async (id) => {
    console.log(id)
  await fetch(`${BACKEND_URL}/deleteproduct/${id}`, {
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
    {isLoading && <p role="status">Loading products...</p>}
    {loadError && <p className="listproduct-error" role="alert">{loadError}</p>}
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
     {!isLoading && !loadError && allproducts.map((product,index)=>{
      return <> <div key={index} className='listproduct-format-main listproduct-format'>
             <img className='vishal' src={product.image} alt="" />
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
