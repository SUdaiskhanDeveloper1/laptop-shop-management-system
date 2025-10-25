import React, { useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  Table,
  Button,
  Space,
  Card,
  message,
  Descriptions,
  Modal,
  Popconfirm,
} from "antd";
import { Link } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import useCollectionRealtime from "../utils/useCollectionRealtime";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Laptops() {
  const { data: laptops } = useCollectionRealtime("laptops");
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, "laptops", id));
      message.success("Deleted successfully");
      setViewOpen(false);
    } catch (e) {
      console.error(e);
      message.error("Error deleting laptop");
    }
  }

  const handleView = (record) => {
    setSelected(record);
    setViewOpen(true);
  };

  // ✅ Sort by latest first (descending order), then by brand ascending (A → Z)
  const sortedLaptops =
    laptops?.slice().sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);

      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;

      return (a.brand || "").localeCompare(b.brand || "");
    }) || [];

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1, // ✅ Continuous numbering
    },
    { title: "Brand", dataIndex: "brand", key: "brand" },
    { title: "Generation", dataIndex: "Generation", key: "Generation" },
    {
      title: "Accessories",
      dataIndex: "accessories",
      key: "accessories",
      render: (val) => (val ? val : "—"),
    },
    { title: "Qty", dataIndex: "quantity", key: "quantity" },
    {
      title: "T.Purchase Price",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
    },
    {
      title: "Supplier Name",
      dataIndex: "supplierName",
      key: "supplierName",
    },
    {
      title: "Added On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => {
        if (!val) return "";
        if (val.toDate) return new Date(val.toDate()).toLocaleString();
        return new Date(val).toLocaleString();
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Card
        title="Laptops"
        extra={
          <Link to="/laptops/add">
            <Button type="primary">Add Laptop</Button>
          </Link>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <Table
            columns={columns}
            dataSource={sortedLaptops}
            rowKey="id"
            scroll={{ x: 800 }}
            pagination={{
              pageSize,
              onChange: (page) => setCurrentPage(page), // ✅ Track current page
            }}
          />
        </div>
      </Card>

      <Modal
        title={`Laptop Details: ${selected?.brand || ""}`}
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={600}
        centered
      >
        {selected && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Brand">
                {selected.brand}
              </Descriptions.Item>
              <Descriptions.Item label="Accessories">
                {selected.accessories || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Generation">
                {selected.Generation}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {selected.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Purchase Price">
                {selected.purchasePrice}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier Name">
                {selected.supplierName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Added On">
                {selected.createdAt
                  ? selected.createdAt.toDate
                    ? new Date(selected.createdAt.toDate()).toLocaleString()
                    : new Date(selected.createdAt).toLocaleString()
                  : ""}
              </Descriptions.Item>
            </Descriptions>

            <div
              style={{
                display: "flex",
                justifyContent: "space-evenly",
                marginTop: "30px",
              }}
            >
              <Link to={`/laptops/edit/${selected.id}`}>
                <Button type="primary">Update</Button>
              </Link>

              <Popconfirm
                title="Are you sure you want to delete this laptop?"
                onConfirm={() => handleDelete(selected.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary" danger>
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </>
        )}
      </Modal>
    </DashboardLayout>
  );
}
