import DashboardLayout from "../components/Layout/DashboardLayout";
import { Row, Col, Card, Statistic, Spin } from "antd";
import useCollectionRealtime from "../utils/useCollectionRealtime";
import dayjs from "dayjs";

export default function Dashboard() {
  const { data: laptops = [], loading: laptopsLoading } = useCollectionRealtime("laptops");
  const { data: sales = [], loading: salesLoading } = useCollectionRealtime("sales");
  const { data: expenses = [], loading: expensesLoading } = useCollectionRealtime("expenses");
  const { data: additionalSales = [], loading: additionalLoading } =
    useCollectionRealtime("additional_sales");

  const todayStart = dayjs().startOf("day");
  const weekStart = dayjs().startOf("week");

  const totalAvailableStock = laptops.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0),
    0,
  );

  const isToday = (date) => dayjs(date?.toDate?.() || date).isAfter(todayStart);
  const isThisWeek = (date) =>
    dayjs(date?.toDate?.() || date).isAfter(weekStart);

  const todayProfit = sales
    .filter((sale) => isToday(sale.createdAt))
    .reduce((sum, sale) => sum + (Number(sale.profit) || 0), 0);

  const weekProfit = sales
    .filter((sale) => isThisWeek(sale.createdAt))
    .reduce((sum, sale) => sum + (Number(sale.profit) || 0), 0);

  const totalAdditionalSales = additionalSales.length;
  const additionalSalesAmount = additionalSales.reduce(
    (sum, sale) =>
      sum + (Number(sale.salePrice) || 0) * (Number(sale.qty) || 1),
    0,
  );

  const additionalProfit = additionalSales.reduce((sum, sale) => {
    const purchase = Number(sale.purchasePrice) || 0;
    const salePrice = Number(sale.salePrice) || 0;
    const qty = Number(sale.qty) || 1;
    return sum + (salePrice - purchase) * qty;
  }, 0);

  const additionalWeeklyProfit = additionalSales
    .filter((sale) => isThisWeek(sale.createdAt))
    .reduce((sum, sale) => {
      const purchase = Number(sale.purchasePrice) || 0;
      const salePrice = Number(sale.salePrice) || 0;
      const qty = Number(sale.qty) || 1;
      return sum + (salePrice - purchase) * qty;
    }, 0);

  const expenseToday = expenses
    .filter((expense) => isToday(expense.createdAt))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const expenseWeek = expenses
    .filter((expense) => isThisWeek(expense.createdAt))
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const netProfitToday = todayProfit + additionalProfit - expenseToday;
  const netProfitWeek = weekProfit + additionalWeeklyProfit - expenseWeek;

  const formatValue = (num) =>
    typeof num === "number" && !isNaN(num) ? num.toLocaleString("en-PK") : "0";

  const loadingAny = laptopsLoading || salesLoading || expensesLoading || additionalLoading;

  return (
    <DashboardLayout>
      {/* <Spin  tip="Loading summary..."> */}
      <Spin  spinning={loadingAny} size="large"  >
        
      <div
        style={{
          margin: 0,
          padding: 0,
          background: "linear-gradient(135deg, #f5f7fa, #e3f2fd)",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Row
          gutter={[24, 24]}
          justify="center"
          style={{
            width: "95%",
            maxWidth: "1300px",
          }}
        >
          {[
            {
              title: "Available Laptops",
              value: formatValue(totalAvailableStock),
              gradient: "linear-gradient(145deg, #42a5f5, #1e88e5)",
            },
            {
              title: "Profit Today",
              value: `Rs ${formatValue(todayProfit)}`,
              gradient: "linear-gradient(145deg, #66bb6a, #43a047)",
            },
            {
              title: "Profit This Week",
              value: `Rs ${formatValue(weekProfit)}`,
              gradient: "linear-gradient(145deg, #388e3c, #81c784)",
            },
            {
              title: "Additional Sales Today",
              value: `Rs ${formatValue(additionalProfit)}`,
              gradient: "linear-gradient(145deg, #ffa726, #fb8c00)",
            },
            {
              title: "Additional Profit (Week)",
              value: `Rs ${formatValue(additionalWeeklyProfit)}`,
              gradient: "linear-gradient(145deg, #fbc02d, #ffeb3b)",
            },
            {
              title: "Expenses Today",
              value: `Rs ${formatValue(expenseToday)}`,
              gradient: "linear-gradient(145deg, #ef5350, #e53935)",
            },
            {
              title: "Net Profit (Today)",
              value: `Rs ${formatValue(netProfitToday)}`,
              gradient: "linear-gradient(145deg, #00acc1, #26c6da)",
            },
            {
              title: "Net Profit (Week)",
              value: `Rs ${formatValue(netProfitWeek)}`,
              gradient: "linear-gradient(145deg, #00bcd4, #4dd0e1)",
            },
          ].map((card, index) => (
            <Col
              key={index}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Card
                variant={false}
                hoverable
                style={{
                  width: "100%",
                  height: "150px",
                  borderRadius: "20px",
                  background: card.gradient,
                  color: "white",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  animation: `fadeInUp 0.6s ease ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(0,0,0,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.2)";
                }}
              >
                <Statistic
                  title={
                    <span style={{ color: "white", fontWeight: 500 }}>
                      {card.title}
                    </span>
                  }
                  value={card.value}
                  valueStyle={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "26px",
                    textAlign: "center",
                  }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <style>
          {`
          @keyframes fadeInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          /* Ensure no scrollbars anywhere */
          ::-webkit-scrollbar {
            display: none;
          }
          html, body {
           
          }
        `}
        </style>
      </div>
      </Spin>
    </DashboardLayout>
  );
}
