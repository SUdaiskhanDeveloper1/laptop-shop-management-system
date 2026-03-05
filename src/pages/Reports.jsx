import React, { useMemo } from 'react'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { Card, Button, Row, Col, Statistic, message, Spin } from 'antd'
import { useData } from '../context/DataContext'
import { exportCollectionCSV } from '../firebase/services'

export default function Reports() {
  const { collections, initialized } = useData();

  const totals = useMemo(() => {
    if (!initialized) return null;

    const sales = collections['sales'] || [];
    const purchases = collections['purchases'] || [];
    const expenses = collections['expenses'] || [];
    const additionalSales = collections['additional_sales'] || [];

    const totalSalesAmount = sales.reduce((sum, s) => sum + Number(s.totalSale || s.amount || 0), 0);
    const totalPurchasesAmount = purchases.reduce((sum, p) => sum + Number(p.totalCost || p.purchasePrice || p.amount || 0), 0);
    const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    
    const totalAdditionalSalesAmount = additionalSales.reduce((sum, s) => {
      const salePrice = Number(s.salePrice || 0);
      const qty = Number(s.qty || 1);
      return sum + (salePrice * qty);
    }, 0);

    const profit = totalSalesAmount - totalPurchasesAmount - totalExpenseAmount;

    return {
      totalSalesAmount,
      totalPurchasesAmount,
      totalExpenseAmount,
      totalAdditionalSalesAmount,
      profit
    };
  }, [collections, initialized]);

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

  if (!initialized) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" tip="Loading report data..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic title="Total Sales" value={totals.totalSalesAmount.toFixed(2)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic title="Additional Sales" value={totals.totalAdditionalSalesAmount.toFixed(2)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic title="Total Purchases" value={totals.totalPurchasesAmount.toFixed(2)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic title="Total Expenses" value={totals.totalExpenseAmount.toFixed(2)} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic title="Net Profit" value={totals.profit.toFixed(2)} />
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
    </DashboardLayout>
  )
}
