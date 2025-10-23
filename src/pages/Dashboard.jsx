import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { Row, Col, Card, Statistic } from "antd";
import useCollectionRealtime from "../utils/useCollectionRealtime";
import dayjs from "dayjs";

export default function Dashboard() {
  const { data: laptops = [] } = useCollectionRealtime("laptops");
  const { data: sales = [] } = useCollectionRealtime("sales");
  const { data: purchases = [] } = useCollectionRealtime("purchases");
  const { data: expenses = [] } = useCollectionRealtime("expenses");

  const todayStart = dayjs().startOf("day");
  const weekStart = dayjs().startOf("week");

  const totalStock = laptops.reduce(
    (sum, laptop) => sum + (laptop.quantity || 0),
    0
  );

  const isToday = (date) =>
    dayjs(date?.toDate?.() || date).isAfter(todayStart);
  const isThisWeek = (date) =>
    dayjs(date?.toDate?.() || date).isAfter(weekStart);

  const todayProfit = sales
    .filter((sale) => isToday(sale.createdAt))
    .reduce((sum, sale) => sum + (sale.profit || 0), 0);

 
  const weekProfit = sales
    .filter((sale) => {
      const createdAt = sale.createdAt?.toDate?.() || sale.createdAt;
      return dayjs(createdAt).isAfter(weekStart);
    })
    .reduce((sum, sale) => sum + (sale.profit || 0), 0);

  const expenseToday = expenses
    .filter((expense) => isToday(expense.createdAt))
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalPurchasesToday = purchases
    .filter((purchase) =>
      dayjs(purchase.createdAt?.toDate?.() || purchase.createdAt).isAfter(
        todayStart
      )
    )
    .reduce((s, it) => s + (it.purchasePrice * it.quantity || 0), 0);

  const netProfitToday = todayProfit - expenseToday;

  const formatValue = (num) =>
    typeof num === "number" && !isNaN(num) ? num.toLocaleString() : "0";

  return (
    <DashboardLayout>
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #42a5f5, #478ed1)",
              color: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Statistic
              title={<span style={{ color: "white" }}>Total Stock</span>}
              value={formatValue(totalStock)}
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #66bb6a, #43a047)",
              color: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Statistic
              title={<span style={{ color: "white" }}>Profit Today</span>}
              prefix="Rs"
              value={formatValue(todayProfit)}
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #ffca28, #fdd835)",
              color: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Statistic
              title={<span style={{ color: "white" }}>Profit This Week</span>}
              prefix="Rs"
              value={formatValue(weekProfit)}
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #ab47bc, #8e24aa)",
              color: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Statistic
              title={<span style={{ color: "white" }}>Purchases Today</span>}
              prefix="Rs"
              value={formatValue(totalPurchasesToday)}
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #ef5350, #e53935)",
              color: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Statistic
              title={<span style={{ color: "white" }}>Expenses Today</span>}
              prefix="Rs"
              value={formatValue(expenseToday)}
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Card
            style={{
              background: "linear-gradient(135deg, #26c6da, #00acc1)",
              color: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Statistic
              title={<span style={{ color: "white" }}>Net Profit Today</span>}
              prefix="Rs"
              value={formatValue(netProfitToday)}
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  );
}
