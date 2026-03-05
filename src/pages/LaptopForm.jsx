import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  message,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { addLaptop, updateLaptop } from "../firebase/services";
import { apiFetch } from "../api";
import { useData } from "../context/DataContext";

import { CloseOutlined } from "@ant-design/icons";
import AccessoryToggleList from "../components/AccessoryToggleList";

export default function LaptopForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const { mutateCollection } = useData();

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await apiFetch(`/laptops/${id}`);
        if (data) {
          form.setFieldsValue({
            brand: data.brand || "",
            Generation: data.Generation || "",
            processor: data.processor || "",
            ram: data.ram || "",
            storage: data.storage || "",
            quantity: data.quantity || 0,
            purchasePrice: data.purchasePrice || 0,
            supplierName: data.supplierName || "",
            accessories: data.accessories || [],
          });
        }
      } catch (e) {
        console.error("Error loading laptop:", e);
      }
    }
    load();
  }, [id, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        brand: values.brand || "",
        Generation: values.Generation || "",
        processor: values.processor || "",
        ram: values.ram || "",
        storage: values.storage || "",
        quantity: Number(values.quantity || 0),
        purchasePrice: Number(values.purchasePrice || 0),
        supplierName: values.supplierName || "",
        accessories: values.accessories || [],
      };
      if (id) {
        await updateLaptop(id, payload);
        mutateCollection("laptops", "update", { ...payload, id });
        message.success("Updated");
      } else {
        const createdAt = new Date().toISOString();
        const newId = await addLaptop({ ...payload, createdAt });
        mutateCollection("laptops", "add", {
          ...payload,
          id: newId,
          createdAt,
        });
        message.success("Added");
      }
      navigate("/laptops");
    } catch (e) {
      console.error(e);
      message.error("Error saving");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <Card
        title={id ? "Edit Laptop" : "Add Laptop"}
        extra={
          <CloseOutlined
            style={{ fontSize: 25, cursor: "pointer" }}
            onClick={() => navigate("/laptops")}
          />
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ quantity: 1, accessories: [] }}
        >
          <Row gutter={[56, 24]}>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="Brand Name:"
                rules={[{ required: true, message: "Brand name is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="Generation"
                label="Generation & Processor:"
                rules={[
                  {
                    required: true,
                    message: "Generation & Processor is required",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[56, 24]}>
            <Col span={12}>
              <Form.Item
                name="ram"
                label="RAM:"
                rules={[{ required: true, message: "RAM is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="storage"
                label="Storage:"
                rules={[{ required: true, message: "Storage is required" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[56, 24]}>
            <Col span={12}>
              <Form.Item
                name="purchasePrice"
                label="Total Purchase Price:"
                rules={[
                  { required: true, message: "Purchase price is required" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity:"
                rules={[{ required: true, message: "Quantity is required" }]}
              >
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[56, 24]}>
            <Col span={12}>
              <Form.Item
                name="supplierName"
                label="Supplier Name:"
                rules={[
                  { required: true, message: "Supplier name is required" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="accessories"
                label="Accessories:"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one accessory",
                  },
                ]}
              >
                <AccessoryToggleList />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            style={{
              marginTop: 10,
              justifyContent: "center",
              display: "flex",
              width: "100%",
            }}
          >
            <Button
              style={{ width: "100px" }}
              htmlType="submit"
              type="primary"
              loading={loading}
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
