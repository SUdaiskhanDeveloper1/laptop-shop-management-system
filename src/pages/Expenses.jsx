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
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import useCollectionRealtime from "../utils/useCollectionRealtime";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

export default function Expenses() {
  const { data: expenses } = useCollectionRealtime("expenses");
  const [openAdd, setOpenAdd] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  async function onCreate(values) {
    try {
      await addDoc(collection(db, "expenses"), values);
      message.success("Expense added successfully");
      setOpenAdd(false);
      form.resetFields();
    } catch (e) {
      console.error(e);
      message.error("Error adding expense");
    }
  }

 
  async function onUpdate(values) {
    try {
      const expenseDoc = doc(db, "expenses", selectedExpense.id);
      await updateDoc(expenseDoc, values);
      message.success("Expense updated successfully");
      setIsEditing(false);
      setSelectedExpense(null);
      setViewModal(false);
      editForm.resetFields();
    } catch (e) {
      console.error(e);
      message.error("Error updating expense");
    }
  }

 
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "expenses", id));
      message.success("Expense deleted successfully");
      setViewModal(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error("Delete error:", error);
      message.error(`Delete failed: ${error.message}`);
    }
  };

  return (
    <DashboardLayout>
   
      <Card
        title="Expenses"
        extra={
          <Button type="primary" onClick={() => setOpenAdd(true)}>
            Add Expense
          </Button>
        }
      >
        <Table dataSource={expenses} rowKey="id">
          <Table.Column title="#" render={(text, record, index) => index + 1} />
          <Table.Column title="Description" dataIndex="description" />
          <Table.Column title="Amount" dataIndex="amount" />
          <Table.Column title="Date" dataIndex="date" />
          <Table.Column
            title="Action"
            render={(text, record) => (
              <Button
                icon={<EyeOutlined />}
                type="link"
                onClick={() => {
                  setSelectedExpense(record);
                  setViewModal(true);
                  setIsEditing(false);
                }}
              />
            )}
          />
        </Table>
      </Card>

     
      <Modal
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        footer={null}
        title="Add Expense"
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. Electricity bill, office supplies" />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <Input placeholder="YYYY-MM-DD" />
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
        title={isEditing ? "Edit Expense" : "Expense Details"}
      >
        {selectedExpense && !isEditing && (
          <Card bordered style={{ marginBottom: 10 }}>
            <p>
              <strong>Description:</strong> {selectedExpense.description}
            </p>
            <p>
              <strong>Amount:</strong> {selectedExpense.amount}
            </p>
            <p>
              <strong>Date:</strong> {selectedExpense.date}
            </p>

            <Space style={{ marginTop: 10 }}>
              <Button
                type="primary"
                onClick={() => {
                  setIsEditing(true);
                  editForm.setFieldsValue(selectedExpense);
                }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this expense?"
                onConfirm={() => handleDelete(selectedExpense.id)}
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
            <Form.Item
              name="amount"
              label="Amount"
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
