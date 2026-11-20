import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Empty, Form, Input, Modal, Pagination, Space, Spin, Typography, message } from "antd";
import { useState } from "react";
import { deleteMedia, fetchMediaPage, fetchMediaUsage, updateMediaAlt } from "../../api/content";
import { ApiError } from "../../api/client";
import type { MediaDto } from "../../api/types";
import { useAuth } from "../../auth/AuthProvider";
import { UploadZone } from "../../content/UploadZone";
import { ListError } from "../ListError";

const PAGE_SIZE = 24;

function AltModal({ media, onClose }: { media: MediaDto; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<{ vi: string; en: string }>();
  const save = useMutation({
    mutationFn: (alt: { vi: string; en: string }) => updateMediaAlt(media.id, alt),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["media"] });
      void message.success("Đã cập nhật mô tả ảnh");
      onClose();
    },
    onError: (error) => {
      void message.error(error instanceof ApiError ? error.message : "Không thể kết nối tới máy chủ");
    },
  });
  return (
    <Modal
      open
      title="Sửa mô tả ảnh"
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={save.isPending}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ vi: media.alt.vi, en: media.alt.en }} onFinish={(values) => save.mutate(values)}>
        <Form.Item label="Mô tả (VI)" name="vi" rules={[{ max: 300, message: "Tối đa 300 ký tự" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Mô tả (EN)" name="en" rules={[{ max: 300, message: "Tối đa 300 ký tự" }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function MediaPage() {
  const { can } = useAuth();
  const canManage = can("media.manage");
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<MediaDto | null>(null);

  const list = useQuery({
    queryKey: ["media", "page", page, q],
    queryFn: () => fetchMediaPage(page, PAGE_SIZE, q.trim()),
    gcTime: 0,
  });

  const confirmDelete = (media: MediaDto) => {
    Modal.confirm({
      title: "Xóa ảnh?",
      content: `Ảnh "${media.originalName}" sẽ bị xóa vĩnh viễn.`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteMedia(media.id);
          await queryClient.invalidateQueries({ queryKey: ["media"] });
          void message.success("Đã xóa ảnh");
        } catch (error) {
          if (error instanceof ApiError && error.status === 409) {
            const { pages } = await fetchMediaUsage(media.id).catch(() => ({ pages: [] }));
            Modal.info({
              title: "Không thể xóa ảnh",
              okText: "Đóng",
              content: (
                <div>
                  <p>Ảnh đang được dùng trong các trang sau, hãy gỡ ảnh khỏi các trang này trước khi xóa:</p>
                  <ul>
                    {pages.map((item) => (
                      <li key={item.id}>
                        <span>{item.name}</span> <Typography.Text type="secondary">{item.path}</Typography.Text>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            });
            return;
          }
          void message.error(error instanceof ApiError ? error.message : "Không thể kết nối tới máy chủ");
        }
      },
    });
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Thư viện ảnh
      </Typography.Title>
      {canManage ? <UploadZone /> : null}
      <Input.Search
        allowClear
        placeholder="Tìm theo tên hoặc mô tả ảnh"
        onChange={(event) => {
          setQ(event.target.value);
          setPage(1);
        }}
        style={{ maxWidth: 360 }}
      />
      {list.isError ? (
        <ListError error={list.error} onRetry={() => void list.refetch()} />
      ) : list.isLoading ? (
        <Spin />
      ) : list.data && list.data.items.length === 0 ? (
        <Empty description="Chưa có ảnh nào" />
      ) : (
        <div
          data-testid="media-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}
        >
          {list.data?.items.map((item) => (
            <Card
              key={item.id}
              size="small"
              data-testid={`media-${item.id}`}
              cover={<img src={item.url} alt={item.alt.vi || item.originalName} style={{ height: 140, objectFit: "contain", background: "#fafafa" }} />}
              actions={
                canManage
                  ? [
                      <Button key="edit" type="link" aria-label={`Sửa mô tả: ${item.originalName}`} onClick={() => setEditing(item)}>
                        Sửa mô tả
                      </Button>,
                      <Button key="delete" type="link" danger aria-label={`Xóa: ${item.originalName}`} onClick={() => confirmDelete(item)}>
                        Xóa
                      </Button>,
                    ]
                  : undefined
              }
            >
              <Typography.Text ellipsis style={{ display: "block" }} title={item.originalName}>
                {item.originalName}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {item.width && item.height ? `${item.width} × ${item.height}` : item.mimeType}
              </Typography.Text>
            </Card>
          ))}
        </div>
      )}
      {list.data && list.data.total > PAGE_SIZE ? (
        <Pagination current={page} pageSize={PAGE_SIZE} total={list.data.total} showSizeChanger={false} onChange={setPage} />
      ) : null}
      {editing ? <AltModal media={editing} onClose={() => setEditing(null)} /> : null}
    </Space>
  );
}
