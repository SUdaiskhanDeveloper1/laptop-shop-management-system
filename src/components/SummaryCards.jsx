
import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import { getTotals } from '../firebase/services'
import dayjs from 'dayjs'

const boxStyle = { borderRadius: 8, color: '#fff', padding: 18, minHeight: 120 }
const smallCardStyle = { marginTop: 16, background: '#fff', borderRadius: 8, padding: 12 }

export default function SummaryCards() {
  const [totals, setTotals] = useState({})
  useEffect(()=> {
    async function load() {
      const t = await getTotals()
      setTotals(t || {})
    }
    load()
  }, [])

  return (
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Card style={{...boxStyle, background:'#0ea5ff'}}>
          <h3 style={{color:'#fff'}}>Sales Summary</h3>
          <div style={{marginTop:8}}>
            <Statistic title="Overall Revenue" value={`Rs ${totals.totalSalesAmount || 0}`} valueStyle={{ color: '#fff' }} />
          </div>
          <div style={smallCardStyle}>
            <div>Sales This Month</div>
            <div style={{ fontWeight:700 }}>{totals.totalSalesAmount || 0}</div>
            <div style={{ color:'#888', marginTop:8 }}>{dayjs().format('MMM YYYY')}</div>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card style={{...boxStyle, background:'#f43f5e'}}>
          <h3 style={{color:'#fff'}}>Expenses Summary</h3>
          <div style={{marginTop:8}}>
            <Statistic title="Overall Expenditure" value={`Rs ${totals.totalExpenseAmount || 0}`} valueStyle={{ color: '#fff' }} />
          </div>
          <div style={smallCardStyle}>
            <div>This Month</div>
            <div style={{ fontWeight:700 }}>{totals.totalExpenseAmount || 0}</div>
            <div style={{ color:'#888', marginTop:8 }}>{dayjs().format('MMM YYYY')}</div>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card style={{...boxStyle, background:'#34d399'}}>
          <h3 style={{color:'#fff'}}>Order Summary</h3>
          <div style={{marginTop:8}}>
            <Statistic title="Total Orders" value={totals.totalSalesCount || 0} valueStyle={{ color: '#fff' }} />
          </div>
          <div style={smallCardStyle}>
            <div>Stock Remaining</div>
            <div style={{ fontWeight:700 }}>{totals.totalStock || 0}</div>
            <div style={{ color:'#888', marginTop:8 }}>Total Generation {totals.totalLaptops || 0}</div>
          </div>
        </Card>
      </Col>
    </Row>
  )
}
