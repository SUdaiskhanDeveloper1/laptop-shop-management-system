import React, { useState } from 'react'
import { Card, Form, Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage() 
  const { login } = useAuth()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          email: values.identifier, 
          id: values.identifier, 
          username: values.identifier, 
          password: values.password 
        })
      })
      
      login(data.user, data.token)

      messageApi.open({
        type: 'success',
        content: '✅ Logged in successfully!',
      })
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000)
    } catch (error) {
      console.error('Login Error:', error.message)
      messageApi.open({
        type: 'error',
        content: error.message || 'Login failed. Please check if backend is running.',
        duration: 3,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
       background: '#f5f6fa',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {contextHolder}

      <Card
        title={
          <div style={{ fontSize: 22, fontWeight: 600, color: '#5563DE' }}>
            <LoginOutlined style={{ marginRight: 8, color: '#5563DE' }} />
            Admin Login
          </div>
        }
        style={{
          width: 380,
          borderRadius: 16,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          textAlign: 'center',
          background: '#fff',
          transition: 'transform 0.3s ease',
        }}
        bodyStyle={{ padding: '28px 32px' }}
        hoverable
      >
        <p style={{ color: '#888', marginBottom: 24 }}>
          Welcome back! Please login to your dashboard.
        </p>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="identifier"
            label={<span style={{ fontWeight: 500 }}>Email or ID</span>}
            rules={[{ required: true, message: 'Please enter your email or ID' }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#5563DE' }} />}
              placeholder="Enter your email or ID"
              size="large"
              style={{
                borderRadius: 8,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 500 }}>Password </span>}
            rules={[{ required: false }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#5563DE' }} />}
              placeholder="Enter your password"
              size="large"
              style={{
                borderRadius: 8,
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{
                borderRadius: 10,
                background: 'linear-gradient(90deg, #5563DE, #74ABE2)',
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <p style={{ marginTop: 16, color: '#888', fontSize: 15 }}>
            © {new Date().getFullYear()} Tech House. All rights reserved.

        </p>
      </Card>
    </div>
  )
}
