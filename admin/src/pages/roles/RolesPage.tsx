import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Popconfirm, Space, Table, Tag, message } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, apiFetch } from "../../api/client";
import type { RoleDto } from "../../api/types";
import { ListError } from "../ListError";
import { RoleFormModal } from "./RoleFormModal";

export function RolesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoleDto | null>(null);

  const roles = useQuery({ queryKey: ["roles"], queryFn: () => apiFetch<RoleDto[]>("/roles") });

  const remove = useMutation({
    mutationFn: (role: RoleDto) => apiFetch<void>(`/roles/${role.id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      void message.success("Đã xóa vai trò");
    },
    onError: (error) =>
      void message.error(error instanceof ApiError ? error.message : "Đã xảy ra lỗi, vui lòng thử lại"),
  });

  const openForm = (role: RoleDto | null) => {
    setEditing(role);
    setFormOpen(true);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openForm(null)}>
          Thêm vai trò
        </Button>
      </Space>
      {roles.isError && <ListError error={roles.error} onRetry={() => void roles.refetch()} />}
      <Table<RoleDto>
        rowKey="id"
        loading={roles.isLoading}
        dataSource={roles.data ?? []}
        pagination={false}
        columns={[
          {
            title: "Tên vai trò",
            render: (_, role) => (
              <Space>
                {role.name}
                {role.isSystem && <Tag color="blue">Hệ thống</Tag>}
              </Space>
            ),
          },
          { title: "Mô tả", dataIndex: "description", render: (value: string | null) => value ?? "" },
          { title: "Số người dùng", dataIndex: "userCount" },
          {
            title: "Thao tác",
            render: (_, role) => (
              <Space>
                <Link to={`/roles/${role.id}`}>Phân quyền</Link>
                {!role.isSystem && (
                  <>
                    <Button type="link" size="small" onClick={() => openForm(role)}>
                      Sửa
                    </Button>
                    <Popconfirm
                      title="Xóa vai trò này?"
                      okText="Đồng ý"
                      cancelText="Hủy"
                      onConfirm={() => remove.mutate(role)}
                    >
                      <Button type="link" size="small" danger>
                        Xóa
                      </Button>
                    </Popconfirm>
                  </>
                )}
              </Space>
            ),
          },
        ]}
      />
      <RoleFormModal open={formOpen} role={editing} onClose={() => setFormOpen(false)} />
    </Space>
  );
}
