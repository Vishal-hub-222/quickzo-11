import React, { useCallback, useEffect, useState } from "react";
import { ShopContext } from './ShopContextValue';

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index <= 300; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {

  const [all_product, setall_Product] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [cartItems, setCartItems] = useState(getDefaultCart());

  const loadProducts = useCallback(async () => {
    setIsProductsLoading(true);
    setProductsError("");

    try {
      const response = await fetch('https://quickzo.onrender.com/allproducts');

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setall_Product(data);
    } catch (error) {
      console.error('Unable to load products:', error);
      setProductsError('We could not load products. Please try again.');
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  useEffect(() => {

    loadProducts();

    if (localStorage.getItem('auth-token')) {
      fetch('https://quickzo.onrender.com/getcart', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        },
      })
        .then((response) => response.json())
        .then((data) => setCartItems(data));
    }

  }, [loadProducts]);

  const addToCart = (itemId) => {

    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));

    if (localStorage.getItem('auth-token')) {
      fetch('https://quickzo.onrender.com/addtocart', {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId }),
      });
    }
  };

  const removefromCart = (itemId) => {

    setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] ?? 0) - 1, 0) }));

    if (localStorage.getItem('auth-token')) {
      fetch('https://quickzo.onrender.com/removefromcart', {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: itemId }),
      });
    }
  };

  const getTotalCartAmount = () => {

    let totalAmount = 0;

    for (const item in cartItems) {

      if (cartItems[item] > 0) {

        let itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );

        if (itemInfo) {
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }

    return totalAmount;
  };

  const getTotalcartItem = () => {

    let sum = 0;

    for (const i in cartItems) {
      sum += cartItems[i];
    }

    return sum;
  };

  const contextvalue = {
    all_product,
    isProductsLoading,
    productsError,
    loadProducts,
    cartItems,
    addToCart,
    removefromCart,
    getTotalCartAmount,
    getTotalcartItem
  };

  return (
    <ShopContext.Provider value={contextvalue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
