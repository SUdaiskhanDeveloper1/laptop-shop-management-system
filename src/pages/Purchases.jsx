import React, { useState } from "react";
import { apiFetch } from '../api';
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
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
  Row,
  Col,
  Empty,
  Spin,
} from "antd";
import { EyeOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { addPurchase } from "../firebase/services";


import useCollectionRealtime from "../utils/useCollectionRealtime";
import { useData } from "../context/DataContext";

export default function Purchases() {
  const { data: purchases, loading: purchasesLoading } = useCollectionRealtime("purchases");
  const { data: laptops, loading: laptopsLoading } = useCollectionRealtime("laptops");
  const { mutateCollection } = useData();

  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();

  async function handleDelete(id) {
    try {
      const purchase = purchases.find(p => p.id === id);
      await apiFetch(`/purchases/${id}`, { method: 'DELETE' });
      
      mutateCollection('purchases', 'delete', { id });
      if (purchase && purchase.laptopId) {
          const laptop = laptops.find(l => l.id === purchase.laptopId);
          if (laptop) {
              mutateCollection('laptops', 'update', { ...laptop, quantity: (Number(laptop.quantity) || 0) - (Number(purchase.quantity) || 0) });
          }
      }

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
        await apiFetch(`/purchases/${selected.id}`, { method: 'PUT', body: JSON.stringify({
          ...values,
          laptopBrand: laptop?.brand || "",
        }) });
        
        mutateCollection('purchases', 'update', { ...values, laptopBrand: laptop?.brand || "", id: selected.id });
        const diff = values.quantity - selected.quantity;
        if (laptop) {
            mutateCollection('laptops', 'update', { ...laptop, quantity: (Number(laptop.quantity) || 0) + diff });
        }

        message.success("Purchase updated successfully");
      } else {
        const purchaseData = {
          ...values,
          laptopBrand: laptop?.brand || "",
          createdAt: new Date().toISOString(),
        };
        const purchaseId = await addPurchase(purchaseData);
        
        mutateCollection('purchases', 'add', { ...purchaseData, id: purchaseId });
        if (laptop) {
            mutateCollection('laptops', 'update', { ...laptop, quantity: (Number(laptop.quantity) || 0) + (Number(values.quantity) || 0) });
        }

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

  const sortedPurchases = purchases
    ? [...purchases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  return (
    <DashboardLayout>
      <Card
        title="Purchases"
        extra={
          <Button
            type="primary"
            disabled={purchasesLoading || laptopsLoading}
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
        <Spin spinning={purchasesLoading || laptopsLoading}/>
          {sortedPurchases.length === 0 ? (
            <Empty description="No Purchases" />
          ) : (
            <Row gutter={[16, 16]}>
              {sortedPurchases.map((purchase, index) => (
                <Col xs={24} sm={12} lg={8} key={purchase.id}>
                  <Card
                    hoverable
                    className="purchase-card"
                    style={{
                      borderLeft: '4px solid #1890ff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <h3 style={{ margin: '0 0 8px 0' }}>{purchase.laptopBrand}</h3>
                      <p style={{ margin: '0', color: '#666' }}>
                        <strong>Supplier:</strong> {purchase.supplierName}
                      </p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        <strong>Qty:</strong> {purchase.quantity}
                      </p>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        <strong>Price/Unit:</strong> ₹{purchase.purchasePrice}
                      </p>
                      <p style={{ margin: '4px 0', color: '#666' }}>
                        <strong>Total:</strong> ₹{Number(purchase.purchasePrice || 0) * Number(purchase.quantity || 0)}
                      </p>
                    </div>
                    <p style={{ margin: '8px 0', fontSize: '12px', color: '#999' }}>
                      {purchase.createdAt ? new Date(purchase.createdAt).toLocaleString() : ""}
                    </p>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Button 
                        type="primary" 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => handleView(purchase)}
                      >
                        View
                      </Button>
                      <Button 
                        type="default" 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => {
                          setSelected(purchase);
                          form.setFieldsValue({
                            laptopId: purchase.laptopId,
                            supplierName: purchase.supplierName,
                            quantity: purchase.quantity,
                            purchasePrice: purchase.purchasePrice,
                          });
                          setEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
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
              <Descriptions.Item label="Purchase Price Per Unit">
                {selected.purchasePrice}
              </Descriptions.Item>
              <Descriptions.Item label="Total Cost">
                {Number(selected.purchasePrice || 0) * Number(selected.quantity || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="Purchased On">
                {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ""}
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
            label="Purchase Price Per Unit"
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
