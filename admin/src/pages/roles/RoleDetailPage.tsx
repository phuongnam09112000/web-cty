import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Checkbox, Descriptions, Space, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, apiFetch } from "../../api/client";
import type { PermissionCatalog, PermissionKey, RoleDto } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";

export function RoleDetailPage() {
  const { id } = useParams();
  const { refresh } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<PermissionKey[]>([]);

  const role = useQuery({ queryKey: ["roles", id], queryFn: () => apiFetch<RoleDto>(`/roles/${id}`) });
  const catalog = useQuery({
    queryKey: ["permissions"],
    queryFn: () => apiFetch<PermissionCatalog>("/permissions"),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (role.data) setSelected(role.data.permissions);
  }, [role.data]);

  const save = useMutation({
    mutationFn: (permissions: PermissionKey[]) =>
      apiFetch<RoleDto>(`/roles/${id}/permissions`, { method: "PUT", body: { permissions } }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(["roles", id], updated);
      await queryClient.invalidateQueries({ queryKey: ["roles"] });
      await refresh();
      void message.success("Đã lưu quyền của vai trò");
    },
    onError: (error) =>
      void message.error(error instanceof ApiError ? error.message : "Đã xảy ra lỗi, vui lòng thử lại"),
  });

  if (role.isLoading || catalog.isLoading) return <Spin />;
  if (role.isError || !role.data || !catalog.data) {
    return (
      <Alert
        type="error"
        showIcon
        message={role.error instanceof ApiError ? role.error.message : "Không tải được vai trò"}
      />
    );
  }

  const data = role.data;
  const locked = data.isSystem;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Link to="/roles">
        <ArrowLeftOutlined /> Quay lại danh sách vai trò
      </Link>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Tên vai trò">{data.name}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{data.description ?? ""}</Descriptions.Item>
        <Descriptions.Item label="Số người dùng">{data.userCount}</Descriptions.Item>
      </Descriptions>
      {locked && <Alert type="info" showIcon message="Vai trò hệ thống luôn có đầy đủ quyền và không thể thay đổi" />}
      {catalog.data.modules.map((module) => (
        <Card key={module.module} title={module.module} size="small" data-testid={`module-${module.module}`}>
          <Space direction="vertical">
            {module.permissions.map((permission) => (
              <Checkbox
                key={permission.key}
                disabled={locked}
                checked={locked || selected.includes(permission.key)}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, permission.key]
                      : current.filter((key) => key !== permission.key),
                  )
                }
              >
                {permission.label}
              </Checkbox>
            ))}
          </Space>
        </Card>
      ))}
      {!locked && (
        <Button type="primary" loading={save.isPending} onClick={() => save.mutate(selected)}>
          Lưu
        </Button>
      )}
    </Space>
  );
}
