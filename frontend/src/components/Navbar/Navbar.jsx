import React, { useContext, useRef } from 'react'
import './Navbar.css'
import logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png'
import { NavLink } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'
import nav_dorpdown from '../Assets/nav_dropdown.png'
export const Navbar = () => {
  const {getTotalcartItem}=useContext(ShopContext)
  const menuref= useRef()
  const dropdown_toggle =(e) =>{
  menuref.current.classList.toggle('nav-manu-visible');
  e.target.classList.toggle('open')
  }
   const navLinkStyles = ({ isActive }) => ({
  color: isActive ? '#ff0000' : '#333',
  textDecoration: isActive ? 'none' : 'none',
  fontWeight: isActive ? 'bold' : 'normal',
  padding: '5px 10px'
});
  return (
    <div className='navbar'>
        <div className="nav-logo">
            <img src={logo} alt="" />
            <p>SHOPPER</p>
        </div>
        <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dorpdown} alt="" />
        <ul  ref={menuref} className="nav-menu">
            <li ><NavLink style={navLinkStyles } to='/'>Shop</NavLink> </li>
            <li ><NavLink  style={navLinkStyles} to='/mens'>Men</NavLink> </li>
            <li > <NavLink  style={navLinkStyles} to='/womens'>Women</NavLink></li>
            <li ><NavLink  style={navLinkStyles} to='/kids'>kids</NavLink></li>
        </ul>
        <div className="nav-login-cart">
          {
            localStorage.getItem('auth-token')
            ? <button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace('/')}}>Logout</button>
            :<NavLink style={navLinkStyles} to='/login'><button>Login</button></NavLink>  
          }
          
           <NavLink style={navLinkStyles} to='/cart'><img src={cart_icon} alt="" /></NavLink> 
            <div className="nav-cart-count">{getTotalcartItem()}</div>
        </div>
    </div>
  )
}

