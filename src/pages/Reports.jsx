import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { Card, Button, Row, Col, Statistic, message } from 'antd'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { exportCollectionCSV } from '../firebase/services'

export default function Reports() {
  const [totals, setTotals] = useState({
    totalSalesAmount: 0,
    totalPurchasesAmount: 0,
    totalExpensesAmount: 0,
    profit: 0
  })

  useEffect(() => {
    async function loadTotals() {
      try {
        const salesSnap = await getDocs(collection(db, 'sales'))
        const purchasesSnap = await getDocs(collection(db, 'purchases'))
        const expensesSnap = await getDocs(collection(db, 'expenses'))

        const totalSalesAmount = salesSnap.docs.reduce((sum, doc) => {
          const data = doc.data()
          return sum + (data.totalSale || 0)
        }, 0)

        const totalPurchasesAmount = purchasesSnap.docs.reduce((sum, doc) => {
          const data = doc.data()
          const qty = data.quantity || 0
          const price = data.purchasePrice || 0
          return sum + qty * price
        }, 0)

        const totalExpensesAmount = expensesSnap.docs.reduce((sum, doc) => {
          const data = doc.data()
          return sum + (data.amount || 0)
        }, 0)

       
        const profit = totalSalesAmount - (totalPurchasesAmount + totalExpensesAmount)

        setTotals({
          totalSalesAmount,
          totalPurchasesAmount,
          totalExpensesAmount,
          profit
        })
      } catch (error) {
        console.error('Error fetching totals:', error)
        message.error('Error loading report data')
      }
    }

    loadTotals()
  }, [])

 
  const downloadCSV = async (collectionName) => {
    const csv = await exportCollectionCSV(collectionName)
    if (!csv) return message.info('No data found')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${collectionName}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Sales" value={totals.totalSalesAmount.toFixed(2)} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Purchases" value={totals.totalPurchasesAmount.toFixed(2)} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Expenses" value={totals.totalExpensesAmount.toFixed(2)} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Profit"
              value={totals.profit.toFixed(2)}
              valueStyle={{ color: totals.profit >= 0 ? 'green' : 'red' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="Export Collections">
        <Button onClick={() => downloadCSV('sales')}>Export Sales CSV</Button>
        <Button style={{ marginLeft: 8 }} onClick={() => downloadCSV('purchases')}>
          Export Purchases CSV
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={() => downloadCSV('expenses')}>
          Export Expenses CSV
        </Button>
      </Card>
    </DashboardLayout>
  )
}
