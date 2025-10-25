import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Laptops from './pages/Laptops'
import LaptopForm from './pages/LaptopForm'
import Purchases from './pages/Purchases'
import Sales from './pages/Sales'
import Suppliers from './pages/Suppliers'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import Expenses from './pages/Expenses'
import AdditionalSales from './pages/AdditionalSales' 

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
      <Route path="/laptops" element={<ProtectedRoute><Laptops/></ProtectedRoute>} />
      <Route path="/laptops/add" element={<ProtectedRoute><LaptopForm/></ProtectedRoute>} />
      <Route path="/laptops/edit/:id" element={<ProtectedRoute><LaptopForm/></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Sales/></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><Suppliers/></ProtectedRoute>} />
      <Route path="/AdditionalSales"element={<ProtectedRoute><AdditionalSales/></ProtectedRoute>}/>
      <Route path="/reports" element={<ProtectedRoute><Reports/></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses/></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
