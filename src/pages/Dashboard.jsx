import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { Row, Col, Card, Statistic } from "antd";
import useCollectionRealtime from "../utils/useCollectionRealtime";
import dayjs from "dayjs";

export default function Dashboard() {
  const { data: laptops = [] } = useCollectionRealtime("laptops");
  const { data: sales = [] } = useCollectionRealtime("sales");
  const { data: expenses = [] } = useCollectionRealtime("expenses");

  const todayStart = dayjs().startOf("day");
  const weekStart = dayjs().startOf("week");

  // 🔹 Calculate total sold per laptop ID (or name)
  const soldCountByLaptop = sales.reduce((acc, sale) => {
    const id = sale.laptopId || sale.laptopName; // adapt to your sales schema
    const qty = Number(sale.quantity) || 0;
    acc[id] = (acc[id] || 0) + qty;
    return acc;
  }, {});

  // 🔹 Calculate available stock per laptop (can go negative)
  const laptopsWithAvailableQty = laptops.map((laptop) => {
    const soldQty = soldCountByLaptop[laptop.id || laptop.name] || 0;
    const availableQty = (Number(laptop.quantity) || 0) - soldQty;
    return { ...laptop, availableQty };
  });

  // 🔹 Total available laptops (sum of remaining quantities, including negatives)
  const totalAvailableStock = laptopsWithAvailableQty.reduce(
    (sum, l) => sum + (Number(l.availableQty) || 0),
    0
  );

  // 🔹 Date helpers
  const isToday = (date) => dayjs(date?.toDate?.() || date).isAfter(todayStart);
  const isThisWeek = (date) =>
    dayjs(date?.toDate?.() || date).isAfter(weekStart);

  // 🔹 Profit Today
  const todayProfit = sales
    .filter((sale) => isToday(sale.createdAt))
    .reduce((sum, sale) => sum + (Number(sale.profit) || 0), 0);

  // 🔹 Profit This Week
  const weekProfit = sales
    .filter((sale) => isThisWeek(sale.createdAt))
    .reduce((sum, sale) => sum + (Number(sale.profit) || 0), 0);

  // 🔹 Expenses Today
  const expenseToday = expenses
    .filter((expense) => isToday(expense.createdAt))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 🔹 Net Profit Today
  const netProfitToday = todayProfit - expenseToday;

  // 🔹 Helper to format large numbers
  const formatValue = (num) =>
    typeof num === "number" && !isNaN(num)
      ? num.toLocaleString("en-PK")
      : "0";

  return (
    <DashboardLayout>
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* 🧮 Available Stock */}
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
              title={<span style={{ color: "white" }}>Available Laptops</span>}
              value={formatValue(totalAvailableStock)}
              valueStyle={{
                color:
                  totalAvailableStock < 0
                    ? "#ffcccb"
                    : "white",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>

        {/* 💰 Profit Today */}
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

        {/* 📆 Profit This Week */}
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

        {/* 💸 Expenses Today */}
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

        {/* 📊 Net Profit Today */}
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
