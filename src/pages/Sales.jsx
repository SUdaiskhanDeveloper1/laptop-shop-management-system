import React, { useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Popconfirm,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import useCollectionRealtime from "../utils/useCollectionRealtime";
import { db } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { addSale, deleteSale } from "../firebase/services";

export default function Sales() {
  const { data: sales } = useCollectionRealtime("sales");
  const { data: laptops } = useCollectionRealtime("laptops");
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  async function onCreate(values) {
    try {
      const laptop = laptops.find((l) => l.id === values.laptopId);
      if (!laptop) throw new Error("Laptop not found");

      const costPerLaptop = laptop.purchasePrice / laptop.quantity;
      const profitPer = values.sellingPrice - costPerLaptop;
      const profit = profitPer * values.quantity;

      await addSale({
        ...values,
        prevQuantity: laptop.quantity,
        laptopGeneration: laptop.Generation,
        totalSale: values.sellingPrice * values.quantity,
        profit,
      });

      message.success("Sale recorded successfully");
      setAddOpen(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Error adding sale");
    }
  }

  async function handleUpdate(values) {
    try {
      const laptop = laptops.find((l) => l.id === values.laptopId);
      if (!laptop) throw new Error("Laptop not found");

      const costPerLaptop = laptop.purchasePrice / laptop.quantity;
      const profitPer = values.sellingPrice - costPerLaptop;
      const profit = profitPer * values.quantity;

      const saleDoc = doc(db, "sales", selected.id);
      await updateDoc(saleDoc, {
        ...values,
        laptopGeneration: laptop.Generation,
        totalSale: values.sellingPrice * values.quantity,
        profit,
      });

      message.success("Sale updated successfully");
      setViewOpen(false);
      editForm.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Error updating sale");
    }
  }

  async function handleDelete(id, laptopId, qtySold) {
    try {
      const laptopDoc = doc(db, "laptops", laptopId);
      const laptop = laptops.find((l) => l.id === laptopId);

      if (laptop) {
        await updateDoc(laptopDoc, {
          quantity: laptop.quantity + qtySold,
        });
      }

      await deleteSale(id);
      message.success("Sale deleted successfully");
      setViewOpen(false);
    } catch (error) {
      console.error(error);
      message.error("Error deleting sale");
    }
  }

  const handleView = (record) => {
    setSelected(record);
    editForm.setFieldsValue({
      laptopId: record.laptopId,
      quantity: record.quantity,
      sellingPrice: record.sellingPrice,
    });
    setViewOpen(true);
  };

  const columns = [
    {
      title: "#",
      render: (text, record, index) => index + 1,
      width: 60,
    },
    { title: "Laptop", dataIndex: "laptopGeneration" },
    { title: "Sale Qty", dataIndex: "quantity" },
    { title: "Total Amount", dataIndex: "totalSale" },
    { title: "Total Profit", dataIndex: "profit" },
    {
      title: "Added On",
      dataIndex: "createdAt",
      render: (val) => {
        if (!val) return "";
        if (val.toDate) return new Date(val.toDate()).toLocaleString();
        return new Date(val).toLocaleString();
      }
    },
    {
      title: "Actions",
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
        title="Sales"
        extra={
          <Button type="primary" onClick={() => setAddOpen(true)}>
            Add Sale
          </Button>
        }
      >
        <Table dataSource={sales || []} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Add Sale"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        footer={null}
        centered
      >
        <Form form={form} onFinish={onCreate} layout="vertical">
          <Form.Item
            name="laptopId"
            label="Laptop"
            rules={[{ required: true }]}
          >
            <Select
              options={laptops.map((l) => ({
                label: `${l.brand} ${l.Generation} (qty:${l.quantity})`,
                value: l.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item
            name="sellingPrice"
            label="Selling Price"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item>
            <Button htmlType="submit" type="primary">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Sale Details`}
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        width={600}
        centered
      >
        {selected && (
          <>
            <Form form={editForm} onFinish={handleUpdate} layout="vertical">
              <Form.Item
                name="laptopId"
                label="Laptop"
                rules={[{ required: true }]}
              >
                <Select
                  options={laptops.map((l) => ({
                    label: `${l.brand} ${l.Generation}`,
                    value: l.id,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>

              <Form.Item
                name="sellingPrice"
                label="Selling Price Per Item"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  marginTop: "20px",
                }}
              >
                <Button type="primary" htmlType="submit">
                  Update
                </Button>

                <Popconfirm
                  title="Are you sure you want to delete this sale?"
                  onConfirm={() =>
                    handleDelete(
                      selected.id,
                      selected.laptopId,
                      selected.quantity
                    )
                  }
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger>Delete</Button>
                </Popconfirm>
              </div>
            </Form>
          </>
        )}
      </Modal>
    </DashboardLayout>
  );
}
