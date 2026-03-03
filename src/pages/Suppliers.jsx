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
    DatePicker, 
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
  const { data: suppliersRaw, loading: suppliersLoading } = useCollectionRealtime("suppliers");
  const [openAdd, setOpenAdd] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const suppliers = [...(suppliersRaw || [])].sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA; 
  });

  async function onCreate(values) {
    try {
      await addDoc(collection(db, "suppliers"), {
        ...values,
      date: values.date.format("YYYY-MM-DD"),
      });
      message.success("Supplier added successfully");
      setOpenAdd(false);
      form.resetFields();
    } catch (e) {
      console.error(e);
      message.error("Error adding supplier");
    }
  }

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
      <Card
        title="Suppliers"
        extra={
          <Button type="primary" onClick={() => setOpenAdd(true)}>
            Add Supplier
          </Button>
        }
      >
        <Table
          loading={suppliersLoading}
          dataSource={suppliers}
          rowKey="id"
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
          <Table.Column title="Name" dataIndex="name" />
          <Table.Column title="Company" dataIndex="company" />
          <Table.Column title="Contact" dataIndex="contact" />
          <Table.Column title="Date of supply" dataIndex="date" />
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

      <Modal
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        footer={null}
        title="Add Supplier"
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item name="name" label="Name:" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Company:">
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="Contact:">
            <Input />
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
