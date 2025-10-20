import React from 'react'
import { Layout } from 'antd'
import Sidebar from './Sidebar'
import HeaderBar from './HeaderBar'

const { Content } = Layout

const DashboardLayout = ({ children }) => (
  <Layout style={{ minHeight: '100vh' }}>
    <Sidebar />
    <Layout>
      <HeaderBar />
      <Content style={{ margin: '16px', padding: 24 }}>
        <div className="content-card">{children}</div>
      </Content>
    </Layout>
  </Layout>
)

export default DashboardLayout
