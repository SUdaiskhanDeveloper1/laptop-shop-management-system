import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { Card, Button, Row, Col, Statistic, message, Spin } from 'antd'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { exportCollectionCSV } from '../firebase/services'

export default function Reports() {
  const [totals, setTotals] = useState({
    totalSalesAmount: 0,
    totalAdditionalSales: 0,
    totalPurchasesAmount: 0,
    totalExpensesAmount: 0,
    profit: 0
  })
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTotals() {
      setLoading(true)
      try {
        const salesSnap = await getDocs(collection(db, 'sales'))
        const purchasesSnap = await getDocs(collection(db, 'purchases'))
        const expensesSnap = await getDocs(collection(db, 'expenses'))
        const additionalSalesSnap = await getDocs(collection(db, 'additional_sales'))

        const totalSalesAmount = salesSnap.docs.reduce((sum, doc) => {
          const data = doc.data()
          return sum + (data.totalSale || 0)
        }, 0)

        const totalAdditionalSales = additionalSalesSnap.docs.reduce((sum, doc) => {
          const data = doc.data()
          const salePrice = Number(data.salePrice || 0)
          const qty = Number(data.qty || 1)
          return sum + salePrice * qty
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
          totalAdditionalSales,
          totalPurchasesAmount,
          totalExpensesAmount,
          profit
        })
      } catch (error) {
        console.error('Error fetching totals:', error)
        message.error('Error loading report data')
      } finally {
        setLoading(false) 
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" tip="Loading report data..." />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic title="Total Sales" value={totals.totalSalesAmount.toFixed(2)} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="Total Additional Sales"
                  value={totals.totalAdditionalSales ? totals.totalAdditionalSales.toFixed(2) : '0.00'}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic title="Total Expenses" value={totals.totalExpensesAmount.toFixed(2)} />
              </Card>
            </Col>
          </Row>

          <Card style={{ marginTop: 24 }} title="Export Collections">
            <Button onClick={() => downloadCSV('sales')}>Export Sales CSV</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => downloadCSV('expenses')}>
              Export Expense CSV
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={() => downloadCSV('additional_sales')}>
              Export Additional Sales CSV
            </Button>
          </Card>
        </>
      )}
    </DashboardLayout>
  )
}