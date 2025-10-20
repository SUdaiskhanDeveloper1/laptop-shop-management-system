
import React from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { Table, Card } from 'antd'
import useCollectionRealtime from '../utils/useCollectionRealtime'

export default function SalesHistory() {
  const { data: sales } = useCollectionRealtime('sales')

  const columns = [
    { title: '#', render: (t,r,i)=> i+1, width:60 },
    { title: 'Generation', dataIndex: 'laptopGeneration' },
    { title: 'Qty', dataIndex: 'quantity' },
    { title: 'Unit Price', dataIndex: 'sellingPrice' },
    { title: 'Total', dataIndex: 'totalSale' },
    { title: 'Profit', dataIndex: 'profit' },
    { title: 'Sold At', dataIndex: 'createdAt', render: (v)=> v?.toDate ? v.toDate().toLocaleString() : (v ? new Date(v).toLocaleString() : '') }
  ]

  return (
    <DashboardLayout>
      <Card title="Sales History">
        <Table dataSource={sales || []} columns={columns} rowKey="id" />
      </Card>
    </DashboardLayout>
  )
}
