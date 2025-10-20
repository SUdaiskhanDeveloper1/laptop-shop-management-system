import React, { useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
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

export default function Suppliers() {
  const { data: suppliers } = useCollectionRealtime("suppliers");
  const [openAdd, setOpenAdd] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Add Supplier
  async function onCreate(values) {
    try {
      await addDoc(collection(db, "suppliers"), values);
      message.success("Supplier added successfully");
      setOpenAdd(false);
      form.resetFields();
    } catch (e) {
      console.error(e);
      message.error("Error adding supplier");
    }
  }

  // Update Supplier
  async function onUpdate(values) {
    try {
      const supplierDoc = doc(db, "suppliers", selectedSupplier.id);
      await updateDoc(supplierDoc, values);
      message.success("Supplier updated successfully");
      setIsEditing(false);
      setSelectedSupplier(null);
      setViewModal(false);
      editForm.resetFields();
    } catch (e) {
      console.error(e);
      message.error("Error updating supplier");
    }
  }

  // Delete Supplier
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "suppliers", id));
      message.success("Supplier deleted successfully");
      setViewModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error("Delete error:", error);
      message.error(`Delete failed: ${error.message}`);
    }
  };

  return (
    <DashboardLayout>
      {/* Supplier Table */}
      <Card
        title="Suppliers"
        extra={
          <Button type="primary" onClick={() => setOpenAdd(true)}>
            Add Supplier
          </Button>
        }
      >
        <Table dataSource={suppliers} rowKey="id">
          <Table.Column title="#" render={(text, record, index) => index + 1} />
          <Table.Column title="Name" dataIndex="name" />
          <Table.Column title="Company" dataIndex="company" />
          <Table.Column title="Contact" dataIndex="contact" />
          <Table.Column title="Date" dataIndex="date" />
          <Table.Column
            title="Action"
            render={(text, record) => (
              <Button
                icon={<EyeOutlined />}
                type="link"
                onClick={() => {
                  setSelectedSupplier(record);
                  setViewModal(true);
                  setIsEditing(false);
                }}
              />
            )}
          />
        </Table>
      </Card>

      {/* Add Supplier Modal */}
      <Modal
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        footer={null}
        title="Add Supplier"
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Company">
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="Contact">
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" block>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* View/Edit Supplier Modal */}
      <Modal
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
        width={500}
        title={isEditing ? "Edit Supplier" : "Supplier Details"}
      >
        {selectedSupplier && !isEditing && (
          <Card bordered style={{ marginBottom: 10 }}>
            <p>
              <strong>Name:</strong> {selectedSupplier.name}
            </p>
            <p>
              <strong>Company:</strong> {selectedSupplier.company}
            </p>
            <p>
              <strong>Contact:</strong> {selectedSupplier.contact}
            </p>
            <p>
              <strong>Date:</strong> {selectedSupplier.date}
            </p>
            <Space style={{ marginTop: 10 }}>
              <Button
                type="primary"
                onClick={() => {
                  setIsEditing(true);
                  editForm.setFieldsValue(selectedSupplier);
                }}
              >
                Update
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this supplier?"
                onConfirm={() => handleDelete(selectedSupplier.id)}
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

        {/* Edit Form */}
        {isEditing && (
          <Form form={editForm} onFinish={onUpdate} layout="vertical">
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="company" label="Company">
              <Input />
            </Form.Item>
            <Form.Item name="contact" label="Contact">
              <Input />
            </Form.Item>
            <Form.Item name="date" label="Date">
              <Input />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button htmlType="submit" type="primary">
                  Save
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
