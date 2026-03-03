import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { Table, Card } from "antd";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); 
  const pageSize = 8; 

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSales(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const columns = [
    {
      title: "#",
      width: 60,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1, 
    },
    { title: "Generation", dataIndex: "laptopGeneration" },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Unit Price", dataIndex: "sellingPrice" },
    { title: "Total", dataIndex: "totalSale" },
    { title: "Profit", dataIndex: "profit" },
    {
      title: "Sold At",
      dataIndex: "createdAt",
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
        <Table
          loading={loading}
          dataSource={sales || []}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Card>
    </DashboardLayout>
  );
}
