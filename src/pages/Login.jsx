import React, { useState } from 'react'
import { Card, Form, Input, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'

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
      }}
    >
     
      {contextHolder}

      <Card
        title="Admin Login"
        style={{
          width: 360,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 12,
          
        }}
      >
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please enter your email' }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ borderRadius: 8 }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
