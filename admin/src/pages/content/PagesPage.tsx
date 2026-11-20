import { useQuery } from "@tanstack/react-query";
import { Table, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
import { fetchPages } from "../../api/content";
import type { PageListItem } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { formatDateTime } from "../../format/date";
import { ListError } from "../ListError";

function StatusTag({ page }: { page: PageListItem }) {
  if (!page.publishedVersion) return <Tag>Chưa xuất bản</Tag>;
  if (page.hasUnpublishedChanges) return <Tag color="gold">Có thay đổi chưa xuất bản</Tag>;
  return <Tag color="green">Đã xuất bản</Tag>;
}

export function PagesPage() {
  const { can } = useAuth();
  const canEdit = can("content.edit");
  const pages = useQuery({ queryKey: ["pages"], queryFn: fetchPages, gcTime: 0 });

  if (pages.isError) return <ListError error={pages.error} onRetry={() => void pages.refetch()} />;

  return (
    <>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Trang
      </Typography.Title>
      <Table<PageListItem>
        rowKey="id"
        loading={pages.isLoading}
        dataSource={pages.data ?? []}
        pagination={false}
        columns={[
          {
            title: "Tên trang",
            dataIndex: "name",
            render: (name: string, page) => <Link to={`/pages/${page.id}`}>{name}</Link>,
          },
          { title: "Đường dẫn", dataIndex: "path" },
          { title: "Trạng thái", key: "status", render: (_: unknown, page) => <StatusTag page={page} /> },
          {
            title: "Chưa dịch",
            dataIndex: "untranslatedCount",
            render: (count: number) =>
              count > 0 ? <Tag color="orange">{count} chỗ chưa dịch</Tag> : <Tag color="green">Đã dịch đủ</Tag>,
          },
          {
            title: "Bản nháp cập nhật",
            key: "updated",
            render: (_: unknown, page) =>
              page.draftUpdatedAt
                ? `${formatDateTime(page.draftUpdatedAt)}${page.draftUpdatedBy ? ` · ${page.draftUpdatedBy.fullName}` : ""}`
                : "—",
          },
          {
            title: "Thao tác",
            key: "actions",
            render: (_: unknown, page) => <Link to={`/pages/${page.id}`}>{canEdit ? "Sửa" : "Xem"}</Link>,
          },
        ]}
      />
    </>
  );
}
