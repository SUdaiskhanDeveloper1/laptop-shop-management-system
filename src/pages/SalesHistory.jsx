import React from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { Table, Card } from "antd";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useEffect, useState } from "react";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("createdAt", "desc")); // 👈 sort by newest first
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSales(data);
    });
    return () => unsub();
  }, []);

  const columns = [
    { title: "#", render: (t, r, i) => i + 1, width: 60 },
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
          dataSource={sales || []}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </DashboardLayout>
  );
}
