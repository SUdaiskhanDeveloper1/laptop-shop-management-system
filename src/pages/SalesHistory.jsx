import { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { Table, Card, Spin } from "antd";
import useCollectionRealtime from "../utils/useCollectionRealtime";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  
  const { data: laptops } = useCollectionRealtime("laptops");
  const { data: fetchedSales } = useCollectionRealtime("sales");

  useEffect(() => {
    if (fetchedSales) {
      const sorted = [...fetchedSales].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSales(sorted);
      setLoading(false);
    }
  }, [fetchedSales]);

  const getDataForSale = (sale) => {
    const laptop = laptops?.find(l => l.id === sale.laptopId);
    if (!laptop) return { totalQtySold: 0, remainingQty: 0 };

    // Calculate total quantity sold for this laptop
    const totalQtySold = sales
      .filter(s => s.laptopId === sale.laptopId)
      .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

    // Remaining quantity is current stock
    const remainingQty = Number(laptop.quantity) || 0;

    return { totalQtySold, remainingQty };
  };

  const columns = [
    {
      title: "#",
      width: 60,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    { title: "Laptop", dataIndex: "laptopGeneration", width: 150 },
    {
      title: "Qty Sold",
      dataIndex: "quantity",
      width: 80,
      render: (val) => val || 0,
    },
    {
      title: "Total Qty Sold (All)",
      width: 140,
      render: (text, record) => {
        const { totalQtySold } = getDataForSale(record);
        return totalQtySold;
      },
    },
    {
      title: "Remaining Qty",
      width: 120,
      render: (text, record) => {
        const { remainingQty } = getDataForSale(record);
        return remainingQty;
      },
    },
    { title: "Unit Price", dataIndex: "sellingPrice", width: 100 },
    { title: "Total Sale", dataIndex: "totalSale", width: 100 },
    { title: "Profit", dataIndex: "profit", width: 80 },
    {
      title: "Sold At",
      dataIndex: "createdAt",
      width: 180,
      render: (v) =>
        v?.toDate
          ? v.toDate().toLocaleString()
          : v
          ? new Date(v).toLocaleString()
          : "",
    },
  ];

  return (
    <DashboardLayout>
      <Card title="Sales History">
        <Spin spinning={loading}>
          <Table
            loading={loading}
            dataSource={sales || []}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize,
              onChange: (page) => setCurrentPage(page),
            }}
            scroll={{ x: 1200 }}
          />
        </Spin>
      </Card>
    </DashboardLayout>
  );
}
