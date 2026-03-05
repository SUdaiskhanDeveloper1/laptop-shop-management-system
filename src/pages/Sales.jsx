import React, { useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import useCollectionRealtime from "../utils/useCollectionRealtime";
import { useData } from "../context/DataContext";
import { apiFetch } from "../api";
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
import { EyeOutlined,  } from "@ant-design/icons";


import { addSale, deleteSale } from "../firebase/services";

export default function Sales() {
  const { data: sales, loading: salesLoading } = useCollectionRealtime("sales");
  const { data: laptops, loading: laptopsLoading } =
    useCollectionRealtime("laptops");
  const { mutateCollection } = useData();
  const [selected, setSelected] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  async function onCreate(values) {
    try {
      const laptop = laptops.find((l) => l.id === values.laptopId);
      if (!laptop) throw new Error("Laptop not found");
      if (laptop.quantity < values.quantity)
        throw new Error("Not enough stock");

      const costPerLaptop =
        (Number(laptop.purchasePrice) || 0) /
        (Number(laptop.initialQuantity) || Number(laptop.quantity) || 1);
      const profitPer = values.sellingPrice - costPerLaptop;
      const profit = profitPer * values.quantity;

      const saleData = {
        ...values,
        laptopGeneration: laptop.Generation,
        totalSale: values.sellingPrice * values.quantity,
        profit,
        createdAt: new Date().toISOString(),
      };

      const saleId = await addSale(saleData);

      // Update local state
      mutateCollection("sales", "add", { ...saleData, id: saleId });
      mutateCollection("laptops", "update", {
        ...laptop,
        quantity: laptop.quantity - values.quantity,
      });

      message.success("Sale recorded successfully");
      setAddOpen(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error(error.message || "Error adding sale");
    }
  }

  async function handleUpdate(values) {
    try {
      const laptop = laptops.find((l) => l.id === values.laptopId);
      if (!laptop) throw new Error("Laptop not found");

      const costPerLaptop =
        (Number(laptop.purchasePrice) || 0) /
        (Number(laptop.initialQuantity) || Number(laptop.quantity) || 1);
      const profitPer = values.sellingPrice - costPerLaptop;
      const profit = profitPer * values.quantity;

      const updatedSale = {
        ...values,
        laptopGeneration: laptop.Generation,
        totalSale: values.sellingPrice * values.quantity,
        profit,
      };

      await apiFetch(`/sales/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedSale),
      });

      // Update local state
      mutateCollection("sales", "update", { ...updatedSale, id: selected.id });
      // Note: Backend handles laptop quantity adjustment on PUT as well
      const diff = values.quantity - selected.quantity;
      mutateCollection("laptops", "update", {
        ...laptop,
        quantity: laptop.quantity - diff,
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
      const laptop = laptops.find((l) => l.id === laptopId);

      await deleteSale(id);

      // Update local state
      mutateCollection("sales", "delete", { id });
      if (laptop) {
        mutateCollection("laptops", "update", {
          ...laptop,
          quantity: laptop.quantity + qtySold,
        });
      }

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
    {
      title: "Total Qty",
      render: (_, record) => {
        const laptop = laptops.find((l) => l.id === record.laptopId);
        return laptop
          ? laptop.initialQuantity || laptop.quantity + record.quantity
          : "-";
      },
    },
    { title: "Sale Qty", dataIndex: "quantity" },

    { title: "Total Amount", dataIndex: "totalSale" },
    { title: "Total Profit", dataIndex: "profit" },
    {
      title: "Added On",
      dataIndex: "createdAt",
      render: (val) => {
        if (!val) return "";
        return new Date(val).toLocaleString();
      },
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
          <Button
            type="primary"
            disabled={salesLoading || laptopsLoading}
            onClick={() => setAddOpen(true)}
          >
            Add Sale
          </Button>
          
        }

      >
        <Table
          loading={salesLoading || laptopsLoading}
          dataSource={sales || []}
          columns={columns}
          rowKey="id"
        />
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
              loading={laptopsLoading}
              disabled={laptopsLoading}
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
                  loading={laptopsLoading}
                  disabled={laptopsLoading}
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
                      selected.quantity,
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
