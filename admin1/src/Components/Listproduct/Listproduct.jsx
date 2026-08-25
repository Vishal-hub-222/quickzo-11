import React, { useEffect, useState } from 'react'
import './Listproduct.css'
import cross_icon from '../../Assets/cross_icon.png'
import { API_URL, getResponseData } from '../../api';

export const Listproduct = () => {
  const[allproducts,setallproducts]=useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const fetchInfo = async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await fetch(`${API_URL}/allproducts`);
      const data = await getResponseData(response);

      if (!Array.isArray(data)) {
        throw new Error('The product server returned an invalid product list.');
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
    if (!id || !window.confirm('Remove this product?')) return;
    setRemovingId(id);
    setLoadError('');
    try {
      const response = await fetch(`${API_URL}/deleteproduct/${id}`, { method: 'DELETE' });
      const data = await getResponseData(response);
      if (!data?.success) throw new Error('The product could not be removed.');
      await fetchInfo();
    } catch (error) {
      setLoadError(error.message || 'Unable to remove the product.');
    } finally {
      setRemovingId(null);
    }
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
     {!isLoading && !loadError && allproducts.map((product)=>{
      return <React.Fragment key={product._id}> <div className='listproduct-format-main listproduct-format'>
             <img className='vishal' src={product.image} alt="" />
            <p>{product.name}</p>
            <p>${product.old_price}</p>
             <p>${product.new_price}</p>
             <p>{product.category}</p>
             <button className='listproduct-remove-button' onClick={()=>removeProduct(product._id)} disabled={removingId === product._id} aria-label={`Remove ${product.name}`}>
               <img className='listproduct-remove-icon' src={cross_icon} alt="" />
             </button>
      </div>
      <hr />
     </React.Fragment>
     })}
    </div>
   
   </div>
  )
}
