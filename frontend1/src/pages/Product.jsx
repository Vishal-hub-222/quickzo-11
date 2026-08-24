import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useLocation, useParams } from 'react-router-dom';
import Breadcrum from '../components/Breadcrum/Breadcrum';
import { ProductDisplay } from '../components/ProductDisplay/ProductDisplay';
import { Description } from '../components/Description/Description'

export const Product = () => {
  const {all_product}=useContext(ShopContext);
  const{productId}=useParams();
  const { state } = useLocation();
  const product = state?.product ?? all_product.find((e) => String(e.id) === productId);

  if (!product) {
    return <div>Loading product details...</div>;
  }

  return (
  <div>
    <Breadcrum product={product}/> 
    <ProductDisplay product={product}/>
    <Description/>
  </div>
  )
}
