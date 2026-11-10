import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Popconfirm, Select, Space, Table, Tag, message } from "antd";
import { useState } from "react";
import { ApiError, apiFetch } from "../../api/client";
import type { Page, RoleDto, UserDto } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { TemporaryPasswordModal } from "./TemporaryPasswordModal";
import { UserFormModal } from "./UserFormModal";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatDate(value: string | null) {
  if (!value) return "Chưa đăng nhập";
  const parts = Object.fromEntries(formatter.formatToParts(new Date(value)).map((part) => [part.type, part.value]));
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Đã xảy ra lỗi, vui lòng thử lại";
}

export function UsersPage() {
  const { can } = useAuth();
  const canManage = can("users.manage");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");
  const [roleId, setRoleId] = useState<number | undefined>();
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const users = useQuery({
    queryKey: ["users", { page, pageSize, q, roleId, isActive }],
    queryFn: () => apiFetch<Page<UserDto>>("/users", { query: { page, pageSize, q: q || undefined, roleId, isActive } }),
  });

  const roles = useQuery({ queryKey: ["roles"], queryFn: () => apiFetch<RoleDto[]>("/roles") });

  const toggle = useMutation({
    mutationFn: (user: UserDto) => apiFetch<UserDto>(`/users/${user.id}`, { method: "PATCH", body: { isActive: !user.isActive } }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (error) => void message.error(errorText(error)),
  });

  const reset = useMutation({
    mutationFn: (user: UserDto) => apiFetch<{ temporaryPassword: string }>(`/users/${user.id}/reset-password`, { method: "POST" }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      setTemporaryPassword(result.temporaryPassword);
    },
    onError: (error) => void message.error(errorText(error)),
  });

  const openForm = (user: UserDto | null) => {
    setEditing(user);
    setFormOpen(true);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Tìm theo tên hoặc email"
            style={{ width: 280 }}
            onSearch={(value) => {
              setQ(value.trim());
              setPage(1);
            }}
          />
          <Select
            virtual={false}
            data-testid="role-filter"
            allowClear
            placeholder="Tất cả vai trò"
            style={{ width: 200 }}
            value={roleId}
            options={(roles.data ?? []).map((role) => ({ value: role.id, label: role.name }))}
            onChange={(value) => {
              setRoleId(value);
              setPage(1);
            }}
          />
          <Select
            virtual={false}
            data-testid="status-filter"
            allowClear
            placeholder="Tất cả trạng thái"
            style={{ width: 180 }}
            value={isActive}
            options={[
              { value: true, label: "Đang hoạt động" },
              { value: false, label: "Đã vô hiệu hóa" },
            ]}
            onChange={(value) => {
              setIsActive(value);
              setPage(1);
            }}
          />
        </Space>
        {canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>
            Thêm người dùng
          </Button>
        )}
      </Space>
      <Table<UserDto>
        rowKey="id"
        loading={users.isLoading}
        dataSource={users.data?.items ?? []}
        pagination={{
          current: page,
          pageSize,
          total: users.data?.total ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextSize) => {
            setPage(nextPage);
            setPageSize(nextSize);
          },
        }}
        columns={[
          { title: "Họ tên", dataIndex: "fullName" },
          { title: "Email", dataIndex: "email" },
          { title: "Vai trò", render: (_, user) => user.role.name },
          {
            title: "Trạng thái",
            render: (_, user) =>
              user.isActive ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="default">Đã vô hiệu hóa</Tag>,
          },
          { title: "Đăng nhập lần cuối", render: (_, user) => formatDate(user.lastLoginAt) },
          ...(canManage
            ? [
                {
                  title: "Thao tác",
                  render: (_: unknown, user: UserDto) => (
                    <Space>
                      <Button type="link" size="small" onClick={() => openForm(user)}>
                        Sửa
                      </Button>
                      {user.isActive ? (
                        <Popconfirm
                          title="Vô hiệu hóa người dùng này?"
                          okText="Đồng ý"
                          cancelText="Hủy"
                          onConfirm={() => toggle.mutate(user)}
                        >
                          <Button type="link" size="small" danger>
                            Vô hiệu hóa
                          </Button>
                        </Popconfirm>
                      ) : (
                        <Button type="link" size="small" onClick={() => toggle.mutate(user)}>
                          Kích hoạt
                        </Button>
                      )}
                      <Popconfirm
                        title="Đặt lại mật khẩu người dùng này?"
                        okText="Đồng ý"
                        cancelText="Hủy"
                        onConfirm={() => reset.mutate(user)}
                      >
                        <Button type="link" size="small">
                          Đặt lại mật khẩu
                        </Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]
            : []),
        ]}
      />
      <UserFormModal
        open={formOpen}
        user={editing}
        roles={roles.data ?? []}
        onClose={() => setFormOpen(false)}
        onCreated={setTemporaryPassword}
      />
      <TemporaryPasswordModal password={temporaryPassword} onClose={() => setTemporaryPassword(null)} />
    </Space>
  );
}
