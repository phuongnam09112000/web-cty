import { useQuery } from "@tanstack/react-query";
import { Input, Select, Space, Table, Typography } from "antd";
import { useState } from "react";
import { apiFetch } from "../../api/client";
import type { AuditLogDto, Page, UserDto } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { formatDateTime } from "../../format/date";
import { ListError } from "../ListError";

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Đăng nhập",
  "auth.login_failed": "Đăng nhập thất bại",
  "auth.logout": "Đăng xuất",
  "auth.password_change": "Đổi mật khẩu",
  "user.create": "Tạo người dùng",
  "user.update": "Cập nhật người dùng",
  "user.deactivate": "Vô hiệu hóa người dùng",
  "user.activate": "Kích hoạt người dùng",
  "user.password_reset": "Đặt lại mật khẩu",
  "role.create": "Tạo vai trò",
  "role.update": "Cập nhật vai trò",
  "role.delete": "Xóa vai trò",
  "role.permissions_update": "Cập nhật quyền vai trò",
};

export function AuditLogsPage() {
  const { can } = useAuth();
  const canPickActor = can("users.view");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [action, setAction] = useState<string | undefined>();
  const [actorUserId, setActorUserId] = useState<number | undefined>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const logs = useQuery({
    queryKey: ["audit-logs", { page, pageSize, action, actorUserId, from, to }],
    queryFn: () =>
      apiFetch<Page<AuditLogDto>>("/audit-logs", {
        query: { page, pageSize, action, actorUserId, from: from || undefined, to: to || undefined },
      }),
  });

  const users = useQuery({
    queryKey: ["users", "audit-actors"],
    queryFn: () => apiFetch<Page<UserDto>>("/users", { query: { page: 1, pageSize: 100 } }),
    enabled: canPickActor,
  });

  const reset = () => setPage(1);

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Space wrap>
        <Select
          virtual={false}
          data-testid="action-filter"
          allowClear
          placeholder="Tất cả hành động"
          style={{ width: 240 }}
          value={action}
          options={Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(value) => {
            setAction(value);
            reset();
          }}
        />
        {canPickActor && (
          <Select
            virtual={false}
            data-testid="actor-filter"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Tất cả người thực hiện"
            style={{ width: 260 }}
            value={actorUserId}
            options={(users.data?.items ?? []).map((user) => ({ value: user.id, label: `${user.fullName} (${user.email})` }))}
            onChange={(value) => {
              setActorUserId(value);
              reset();
            }}
          />
        )}
        <Input
          type="date"
          aria-label="Từ ngày"
          style={{ width: 160 }}
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            reset();
          }}
        />
        <Input
          type="date"
          aria-label="Đến ngày"
          style={{ width: 160 }}
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            reset();
          }}
        />
      </Space>
      <Typography.Text type="secondary">
        Bộ lọc ngày tính theo ngày UTC; thời gian hiển thị theo giờ Việt Nam (UTC+7).
      </Typography.Text>
      {logs.isError && <ListError error={logs.error} onRetry={() => void logs.refetch()} />}
      <Table<AuditLogDto>
        rowKey="id"
        loading={logs.isLoading}
        dataSource={logs.data?.items ?? []}
        pagination={{
          current: page,
          pageSize,
          total: logs.data?.total ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextSize) => {
            setPage(nextPage);
            setPageSize(nextSize);
          },
        }}
        columns={[
          { title: "Thời gian", render: (_, log) => formatDateTime(log.createdAt) },
          { title: "Người thực hiện", render: (_, log) => (log.actor ? `${log.actor.fullName} (${log.actor.email})` : "—") },
          { title: "Hành động", render: (_, log) => ACTION_LABELS[log.action] ?? log.action },
          { title: "Đối tượng", render: (_, log) => (log.targetType ? `${log.targetType} #${log.targetId ?? ""}` : "—") },
          { title: "Chi tiết", render: (_, log) => (log.metadata ? JSON.stringify(log.metadata) : "—") },
          { title: "IP", dataIndex: "ip", render: (ip: string | null) => ip ?? "—" },
        ]}
      />
    </Space>
  );
}
