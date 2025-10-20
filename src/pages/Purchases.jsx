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
  Form,
  Select,
  InputNumber,
  Input,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { addPurchase } from "../firebase/services"; 
import { updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import useCollectionRealtime from "../utils/useCollectionRealtime";

export default function Purchases() {
  const { data: purchases } = useCollectionRealtime("purchases");
  const { data: laptops } = useCollectionRealtime("laptops");

  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();

  
  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, "purchases", id));
      message.success("Deleted successfully");
      setViewOpen(false);
    } catch (e) {
      console.error(e);
      message.error("Error deleting purchase");
    }
  }

 
  const handleView = (record) => {
    setSelected(record);
    setViewOpen(true);
  };

 
  async function handleSave(values) {
    try {
      const laptop = laptops.find((l) => l.id === values.laptopId);

      if (selected) {
        
        await updateDoc(doc(db, "purchases", selected.id), {
          ...values,
          laptopBrand: laptop?.brand || "",
        });
        message.success("Purchase updated successfully");
      } else {
      
        await addPurchase({
          ...values,
          laptopBrand: laptop?.brand || "",
          createdAt: new Date(),
        });
        message.success("Purchase added successfully");
      }

      setEditOpen(false);
      setSelected(null);
      form.resetFields();
    } catch (e) {
      console.error("Save error:", e);
      message.error("Error saving purchase");
    }
  }

 
  const columns = [
    {
      title: "#",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 60,
    },
    { title: "Laptop", dataIndex: "laptopBrand", key: "laptopBrand" },
    { title: "Supplier", dataIndex: "supplierName", key: "supplierName" },
    { title: "Qty", dataIndex: "quantity", key: "quantity" },
    {
      title: "Purchase Price",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
    },
    {
      title: "Purchased Date",
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
        title="Purchases"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setSelected(null);
              setEditOpen(true);
              form.resetFields();
            }}
          >
            Add Purchase
          </Button>
        }
      >
        <Table columns={columns} dataSource={purchases || []} rowKey="id" />
      </Card>

      
      <Modal
        title={`Purchase Details`}
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={600}
        centered
      >
        {selected && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Laptop">
                {selected.laptopBrand}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {selected.supplierName}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {selected.quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Purchase Price">
                {selected.purchasePrice}
              </Descriptions.Item>
              <Descriptions.Item label="Purchased On">
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
              <Button
                type="primary"
                onClick={() => {
                  form.setFieldsValue({
                    laptopId: selected.laptopId,
                    supplierName: selected.supplierName,
                    quantity: selected.quantity,
                    purchasePrice: selected.purchasePrice,
                  });
                  setEditOpen(true);
                  setViewOpen(false);
                }}
              >
                Update
              </Button>

              <Popconfirm
                title="Are you sure you want to delete this purchase?"
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

     
      <Modal
        title={selected ? "Update Purchase" : "Add Purchase"}
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setSelected(null);
          form.resetFields();
        }}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="laptopId"
            label="Laptop"
            rules={[{ required: true, message: "Please select a laptop" }]}
          >
            <Select
              options={laptops.map((l) => ({
                label: l.brand,
                value: l.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="supplierName"
            label="Supplier"
            rules={[{ required: true, message: "Please enter supplier name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item
            name="purchasePrice"
            label="Purchase Price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item>
            <Button htmlType="submit" type="primary" block>
              {selected ? "Update" : "Save"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
