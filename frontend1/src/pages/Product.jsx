import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContextValue.js'
import { useLocation, useParams } from 'react-router-dom';
import Breadcrum from '../components/Breadcrum/Breadcrum';
import { ProductDisplay } from '../components/ProductDisplay/ProductDisplay';
import { Description } from '../components/Description/Description'
import { Loading } from '../components/Loading/Loading';

export const Product = () => {
  const { all_product, isProductsLoading } = useContext(ShopContext);
  const{productId}=useParams();
  const { state } = useLocation();
  const product = state?.product ?? all_product.find((e) => String(e.id) === productId);

  if (isProductsLoading) {
    return <Loading />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
  <div>
    <Breadcrum product={product}/> 
    <ProductDisplay product={product}/>
    <Description/>
  </div>
  )
}
