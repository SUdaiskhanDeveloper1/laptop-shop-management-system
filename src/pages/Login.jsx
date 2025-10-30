import React, { useState } from 'react'
import { Card, Form, Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage() 

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password)
      messageApi.open({
        type: 'success',
        content: '✅ Logged in successfully!',
        duration: 3,
      })
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (error) {
      console.error('Login Error:', error.code)

      let errorMsg = 'Email or password is incorrect'
      if (error.code === 'auth/user-not-found') errorMsg = ' No user found with this email'
      else if (error.code === 'auth/wrong-password') errorMsg = ' Incorrect password'
      else if (error.code === 'auth/invalid-email') errorMsg = 'Invalid email format'

     
      messageApi.open({
        type: 'error',
        content: errorMsg,
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
            name="email"
            label={<span style={{ fontWeight: 500 }}>Email</span>}
            rules={[{ required: true, message: 'Please enter your email' }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#5563DE' }} />}
              placeholder="Enter your email"
              size="large"
              style={{
                borderRadius: 8,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 500 }}>Password</span>}
            rules={[{ required: true, message: 'Please enter your password' }]}
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

        <p style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
          © 2025 Laptop Shop Management System
        </p>
      </Card>
    </div>
  )
}
