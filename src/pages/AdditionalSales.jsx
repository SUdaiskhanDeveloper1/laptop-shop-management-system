import React, { useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Popconfirm,
  DatePicker,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import useCollectionRealtime from "../utils/useCollectionRealtime";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export default function AdditionalSales() {
  const { data: salesRaw, loading: salesLoading } = useCollectionRealtime("additional_sales");
  const [openAdd, setOpenAdd] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [currentPage, setCurrentPage] = useState(1); 
  const pageSize = 8; 

  const sales = [...(salesRaw || [])].sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  async function onCreate(values) {
    try {
      await addDoc(collection(db, "additional_sales"), {
        ...values,
        date: values.date.format("YYYY-MM-DD"),
      });
      message.success("Sale added successfully");
      setOpenAdd(false);
      form.resetFields();
    } catch (e) {
      console.error(e);
      message.error("Error adding sale");
    }
  }

  async function onUpdate(values) {
    try {
      const saleDoc = doc(db, "additional_sales", selectedSale.id);
      await updateDoc(saleDoc, values);
      message.success("Sale updated successfully");
      setIsEditing(false);
      setSelectedSale(null);
      setViewModal(false);
      editForm.resetFields();
    } catch (e) {
      console.error(e);
      message.error("Error updating sale");
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "additional_sales", id));
      message.success("Sale deleted successfully");
      setViewModal(false);
      setSelectedSale(null);
    } catch (error) {
      console.error("Delete error:", error);
      message.error(`Delete failed: ${error.message}`);
    }
  };

  return (
    <DashboardLayout>
      <Card
        title="Additional Sales"
        extra={
          <Button type="primary" onClick={() => setOpenAdd(true)}>
            Add Sale
          </Button>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <Table
            loading={salesLoading}
            dataSource={sales}
            rowKey="id"
            scroll={{ x: 800 }}
            pagination={{
              pageSize,
              onChange: (page) => setCurrentPage(page), 
            }}
          >
            <Table.Column
              title="#"
              render={(text, record, index) =>
                (currentPage - 1) * pageSize + index + 1
              } 
            />
            <Table.Column title="Description" dataIndex="description" />
            <Table.Column title="Quantity" dataIndex="qty" />
            <Table.Column title="Purchase Price Per Item" dataIndex="purchasePrice" />
            <Table.Column title="Sale Price Per Item" dataIndex="salePrice" />
            <Table.Column title="Date" dataIndex="date" />
            <Table.Column
              title="Action"
              render={(text, record) => (
                <Button
                  icon={<EyeOutlined />}
                  type="link"
                  onClick={() => {
                    setSelectedSale(record);
                    setViewModal(true);
                    setIsEditing(false);
                  }}
                />
              )}
            />
          </Table>
        </div>
      </Card>

      <Modal
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        footer={null}
        title="Add New Sale"
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter sale description" />
          </Form.Item>
          <Form.Item name="qty" label="Quantity" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter quantity"
            />
          </Form.Item>
          <Form.Item
            name="purchasePrice"
            label="Purchase Price Per Item"
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter purchase price"
            />
          </Form.Item>
          <Form.Item
            name="salePrice Per Item"
            label="Sale Price"
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter sale price"
            />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date of Supply:"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" block>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
        width={500}
        title={isEditing ? "Edit Sale" : "Sale Details"}
      >
        {selectedSale && !isEditing && (
          <Card style={{ marginBottom: 10 }}>
            <p>
              <strong>Description:</strong> {selectedSale.description}
            </p>
            <p>
              <strong>Quantity:</strong> {selectedSale.qty}
            </p>
            <p>
              <strong>Purchase Price:</strong> {selectedSale.purchasePrice}
            </p>
            <p>
              <strong>Sale Price:</strong> {selectedSale.salePrice}
            </p>
            <p>
              <strong>Date:</strong> {selectedSale.date}
            </p>

            <Space style={{ marginTop: 10 }}>
              <Button
                type="primary"
                onClick={() => {
                  setIsEditing(true);
                  editForm.setFieldsValue(selectedSale);
                }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this sale?"
                onConfirm={() => handleDelete(selectedSale.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="primary" danger>
                  Delete
                </Button>
              </Popconfirm>
            </Space>
          </Card>
        )}

        {isEditing && (
          <Form form={editForm} onFinish={onUpdate} layout="vertical">
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="qty" label="Quantity" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="purchasePrice"
              label="Purchase Price"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="salePrice"
              label="Sale Price"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button htmlType="submit" type="primary">
                  Update
                </Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
