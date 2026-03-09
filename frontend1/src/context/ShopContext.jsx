import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index <= 300; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {

  const [all_product, setall_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {

    fetch('https://quickzo-backend.onrender.com/allproducts')
      .then((response) => response.json())
      .then((data) => setall_Product(data));

    if (localStorage.getItem('auth-token')) {
      fetch('https://quickzo-backend.onrender.com/getcart', {
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

  }, []);

  const addToCart = (itemId) => {

    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));

    if (localStorage.getItem('auth-token')) {
      fetch('https://quickzo-backend.onrender.com/addtocart', {
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

    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

    if (localStorage.getItem('auth-token')) {
      fetch('https://quickzo-backend.onrender.com/removefromcart', {
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
