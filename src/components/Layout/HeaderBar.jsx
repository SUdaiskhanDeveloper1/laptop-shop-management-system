import React from 'react'
import { Layout } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogoutOutlined } from '@ant-design/icons'

const { Header } = Layout

export default function HeaderBar(){
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <Header style={{ background:'#fff', padding:0, display:'flex', justifyContent:'flex-end', alignItems:'center', paddingRight:20 }}>
      <a style={{ marginRight:16, cursor:'pointer' }} onClick={logout}><LogoutOutlined/> Logout</a>
    </Header>
  )
}
