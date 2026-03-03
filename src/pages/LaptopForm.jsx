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
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { CloseOutlined } from "@ant-design/icons";
import AccessoryToggleList from "../components/AccessoryToggleList";

export default function LaptopForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const d = await getDoc(doc(db, "laptops", id));
      if (d.exists()) {
        const data = d.data();
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
    }
    load();
  }, [id]);

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
        message.success("Updated");
      } else {
        await addLaptop({ ...payload, createdAt: Timestamp.now() });
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
              <Form.Item name="brand" label="Brand Name:">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="Generation" label="Generation & Processor:">
                {/* <Form.Item name="processor" label="Processor"><Input /></Form.Item> */}

                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[56, 24]}>
            <Col span={12}>
              <Form.Item name="ram" label="RAM:">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="storage" label="Storage:">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[56, 24]}>
            <Col span={12}>
              <Form.Item name="purchasePrice" label="Total Purchase Price:">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quantity" label="Quantity:">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[56, 24]}>
            <Col span={12}>
              <Form.Item name="supplierName" label="Supplier Name:">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="accessories" label="Accessories:">
                <AccessoryToggleList />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            style={{ marginTop:10, justifyContent: "center", display: "flex", width: "100%" }}
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
