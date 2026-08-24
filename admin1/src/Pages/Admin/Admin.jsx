import React from 'react'
import './Admin.css'
import { Sidebar } from '../../Components/Sidebar/Sidebar'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Addproduct } from '../../Components/Addproduct/Addproduct'
import { Listproduct } from '../../Components/Listproduct/Listproduct'
export const Admin = () => {
  return (
   <div className="admin">
   <Sidebar/>
   <Routes>
    <Route path='/' element={<Navigate to='/addproduct' replace />}/>
    <Route path='/addproduct' element={<Addproduct/>}/>
    <Route path='/listproduct' element={<Listproduct/>}/>
    <Route path='*' element={<Navigate to='/addproduct' replace />}/>
   </Routes>
   </div>
  )
}
