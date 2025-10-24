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

  const columns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 60,
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
      title: "Purchase Price",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
    },
    {
      title: "Supplier",
      dataIndex: "sellingPrice", 
      key: "sellingPrice",
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
        <Table columns={columns} dataSource={laptops || []} rowKey="id" />
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
              <Descriptions.Item label="Selling Price">
                {selected.sellingPrice}
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
