import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Layout, Menu, Space } from "antd";
import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import type { PermissionKey } from "../api/types";
import { useAuth } from "../auth/AuthProvider";

type Item = { key: string; label: string; anyOf?: PermissionKey[] };

const items: Item[] = [
  { key: "/", label: "Tổng quan" },
  { key: "/users", label: "Người dùng", anyOf: ["users.view"] },
  { key: "/roles", label: "Vai trò & quyền", anyOf: ["roles.manage"] },
  { key: "/audit-logs", label: "Nhật ký hoạt động", anyOf: ["audit.view"] },
];

export function AppLayout() {
  const { user, can, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    void refresh();
  }, [location.pathname, refresh]);

  const visible = items
    .filter((item) => !item.anyOf || item.anyOf.some((key) => can(key)))
    .map(({ key, label }) => ({ key, label }));
  const selected = [...visible]
    .sort((a, b) => b.key.length - a.key.length)
    .find((item) => (item.key === "/" ? location.pathname === "/" : location.pathname.startsWith(item.key)));

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider theme="light" width={240}>
        <div style={{ padding: 16, fontWeight: 600, fontSize: 18, color: "#0E5D95" }}>ISTT Admin</div>
        <Menu
          mode="inline"
          items={visible}
          selectedKeys={selected ? [selected.key] : []}
          onClick={({ key }) => navigate(key)}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={{ background: "#fff", display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "0 24px" }}
        >
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                { key: "account", label: "Tài khoản của tôi", onClick: () => navigate("/account") },
                { key: "logout", label: "Đăng xuất", onClick: () => void onLogout() },
              ],
            }}
          >
            <Button type="text">
              <Space>
                {user?.fullName}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </Layout.Header>
        <Layout.Content style={{ margin: 24 }}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
