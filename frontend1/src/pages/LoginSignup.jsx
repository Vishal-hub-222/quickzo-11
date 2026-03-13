import React, { useState } from 'react'
import './css/loginSignup.css'
export const LoginSignup = () => {
  const [stat,setlogin]=useState("Sign Up")
  const [formData,setformData]=useState({
    username:"",
    email:"",
    password:""
  })

  const changeHandler=(e)=>{
    setformData({...formData,[e.target.name]:e.target.value});
  }
 
  const loginhandler=(e)=>{
    setlogin(e);
  }
  const Login= async ()=>{
 let responseData;
   await fetch('https://quickzo-11.onrender.com/login',{
    method:"POST",
    headers:{
      Accept:'application/form-data',
      'Content-Type':'application/json'
    },
    body:JSON.stringify(formData),
   }).then((response)=>response.json()).then((data)=>responseData=data)
   if(responseData.success)
   {
    localStorage.setItem('auth-token',responseData.token);
    window.location.replace("/");
   }
   else{
   alert(responseData.errors || responseData.message);
   }
  }
  const SignUp=async ()=>{
   let responseData;
   await fetch('https://quickzo-11.onrender.com/signup',{
    method:"POST",
    headers:{
      Accept:'application/form-data',
      'Content-Type':'application/json'
    },
    body:JSON.stringify(formData),
   }).then((response)=>response.json()).then((data)=>responseData=data)
   if(responseData.success)
   {
    localStorage.setItem('auth-token',responseData.token);
    window.location.replace("/");
   }
   else{
  alert(responseData.errors || responseData.message);
   }
  }

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{stat}</h1>
        <div className="loginsignup-fields">
         {stat==="Sign Up"?<input type="text" name='username' value={formData.username} onChange={changeHandler} placeholder='Your Name ' /> : <></>} 
          <input type="email" name='email' value={formData.email} onChange={changeHandler} placeholder='Email Address'/>
          <input type="password" name='password' value={formData.password} onChange={changeHandler} placeholder='Password'/>
        </div>
        <button onClick={stat==="Login" ?Login : SignUp}>Contunue</button>
        {stat==="Sign Up" ? <p className="loginsignup-login">Already have account? <span onClick={()=>loginhandler("Login")}>Login Here</span></p>
        : <p className="loginsignup-login">Create an account? <span onClick={()=>loginhandler("Sign Up")}>Sign Up Here</span></p>
        }
        <div className="loginsignup-aree">
          <input type="checkbox" name='' id='' />
          <p>By Continuing , i agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  )
}
