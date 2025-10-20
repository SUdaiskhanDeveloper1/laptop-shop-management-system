import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { Card, Form, Input, Button, message, Typography } from "antd";
import { auth, db } from "../firebase/config";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const { Text } = Typography;

export default function Settings() {
  const [form] = Form.useForm();
  const [lastChanged, setLastChanged] = useState(null);

  useEffect(() => {
    async function fetchLastChange() {
      const user = auth.currentUser;
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.lastPasswordChange) {
          setLastChanged(
            new Date(data.lastPasswordChange.toDate()).toLocaleString()
          );
        }
      }
    }
    fetchLastChange();
  }, []);

  async function onFinish(values) {
    const { oldPassword, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      return message.error("New password do not match");
    }

    try {
      const user = auth.currentUser;
      if (!user) return message.error("Not logged in");

      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          lastPasswordChange: serverTimestamp(),
        },
        { merge: true }
      );

      setLastChanged(new Date().toLocaleString());
      message.success("Password updated successfully");
      form.resetFields();
    } catch (e) {
      console.error(e);
      if (e.code === "auth/wrong-password") {
        message.error("Incorrect old password");
      } else {
        message.error("Error updating password");
      }
    }
  }

  return (
    <DashboardLayout>
      <Card title="Account Settings" style={{ maxWidth: 500 }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="oldPassword"
            label="Old Password"
            rules={[
              { required: true, message: "Please enter your old password" },
            ]}
          >
            <Input.Password placeholder="Enter old password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item>
            <Button htmlType="submit" type="primary" block>
              Change Password
            </Button>
          </Form.Item>
        </Form>

        {lastChanged && (
          <Text type="secondary">🔒 Last password changes: {lastChanged}</Text>
        )}
      </Card>
    </DashboardLayout>
  );
}
