import { Layout, Menu } from "antd";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LogoutOutlined,
  DashboardOutlined,
  LaptopOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";

const { Header, Sider, Content } = Layout;

export default function LayoutMain() {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { key: "/dashboard", icon: <DashboardOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    { key: "/laptops", icon: <LaptopOutlined />, label: <Link to="/laptops">Laptops</Link> },
    { key: "/sales", icon: <ShoppingOutlined />, label: <Link to="/sales">Sales</Link> },
    { key: "/suppliers", icon: <FileTextOutlined />, label: <Link to="/suppliers">Suppliers</Link> },
    { key: "/additional-sales", icon: <FileTextOutlined />, label: <Link to="/additional-sales">Additional Sales</Link> },
    { key: "/reports", icon: <FileTextOutlined />, label: <Link to="/reports">Reports</Link> },
    { key: "/expenses", icon: <FileTextOutlined />, label: <Link to="/expenses">Expenses</Link> },
    { key: "/settings", icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo" style={{ color: "white", padding: 16, fontWeight: 700 }}>
          Laptop Shop
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingRight: 20,
          }}
        >
          <a style={{ marginRight: 16, cursor: "pointer" }} onClick={logout}>
            <LogoutOutlined /> Logout
          </a>
        </Header>

        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            {/* This renders the actual page (Dashboard, Laptops, etc.) */}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}