import React from 'react'
import { Layout, Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { DashboardOutlined, LaptopOutlined, SwapOutlined, ShoppingOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons'

const { Sider } = Layout

export default function Sidebar(){
  const location = useLocation()
  const items = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/laptops', icon: <LaptopOutlined />, label: <Link to="/laptops">Laptops</Link> },
    { key: '/sales', icon: <ShoppingOutlined />, label: <Link to="/sales">Sales</Link> },
    { key: '/sales-history', icon: <FileTextOutlined />, label: <Link to="/sales-history">Sales History</Link> },
    { key: '/suppliers', icon: <FileTextOutlined />, label: <Link to="/suppliers">Suppliers</Link> },
    { key: '/additional-sales', icon: <FileTextOutlined />, label: <Link to="/additional-sales">Additional Sales</Link> },
    { key: '/reports', icon: <FileTextOutlined />, label: <Link to="/reports">Reports</Link> },
    {key: '/expenses', icon: <FileTextOutlined />, label: <Link to="/expenses">Expenses</Link> },
    { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> }
  ]

  return (
    <Sider   style={{width:"250px"}} breakpoint="lg" collapsedWidth="0">
      <div style={{marginTop:"40px"}} className="logo">Laptop Shop</div>
      <Menu  theme="dark" mode="inline" selectedKeys={[location.pathname]} items={items} />
    </Sider>
  )
}
