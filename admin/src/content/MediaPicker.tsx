import { PictureOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Empty, Input, Modal, Space, Spin, Typography } from "antd";
import { useMemo, useState } from "react";
import { fetchAllMedia } from "../api/content";
import type { MediaDto } from "../api/types";

export type MediaValue = { mediaId: number } | null;

export function useMediaLibrary() {
  const query = useQuery({ queryKey: ["media", "all"], queryFn: fetchAllMedia, staleTime: 60_000 });
  const byId = useMemo(() => new Map((query.data ?? []).map((item) => [item.id, item])), [query.data]);
  return { items: query.data ?? [], byId, isLoading: query.isLoading, isError: query.isError };
}

type Props = {
  label: string;
  value: MediaValue;
  onChange: (value: MediaValue) => void;
  path: string;
  nullable?: boolean;
  readOnly?: boolean;
  error?: string;
};

function Thumb({ media, size }: { media: MediaDto | undefined; size: number }) {
  const box = {
    width: size,
    height: size,
    objectFit: "cover" as const,
    background: "#f0f0f0",
    borderRadius: 4,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "none",
  };
  if (!media) {
    return (
      <span style={box}>
        <PictureOutlined />
      </span>
    );
  }
  return <img src={media.url} alt={media.alt.vi || media.originalName} style={box} />;
}

export function MediaPicker({ label, value, onChange, path, nullable = false, readOnly = false, error }: Props) {
  const library = useMediaLibrary();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = value ? library.byId.get(value.mediaId) : undefined;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return library.items;
    return library.items.filter((item) => `${item.originalName} ${item.alt.vi} ${item.alt.en}`.toLowerCase().includes(needle));
  }, [library.items, q]);

  return (
    <div data-testid={path} data-invalid={error ? "true" : undefined} style={{ marginBottom: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <Typography.Text strong>{label}</Typography.Text>
      </div>
      <Space align="center" wrap>
        <Thumb media={current} size={64} />
        <div style={{ minWidth: 120 }}>
          {value ? (
            <Typography.Text>{current ? current.originalName : `Ảnh #${value.mediaId}`}</Typography.Text>
          ) : (
            <Typography.Text type="secondary">Chưa chọn ảnh</Typography.Text>
          )}
        </div>
        {readOnly ? null : (
          <>
            <Button aria-label={`${value ? "Đổi ảnh" : "Chọn ảnh"}: ${label}`} onClick={() => setOpen(true)}>
              {value ? "Đổi ảnh" : "Chọn ảnh"}
            </Button>
            {nullable && value ? (
              <Button aria-label={`Bỏ ảnh: ${label}`} onClick={() => onChange(null)}>
                Bỏ ảnh
              </Button>
            ) : null}
          </>
        )}
      </Space>
      {error ? (
        <div>
          <Typography.Text type="danger" style={{ fontSize: 12 }}>
            {error}
          </Typography.Text>
        </div>
      ) : null}
      <Modal title="Chọn ảnh" open={open} onCancel={() => setOpen(false)} footer={null} width={720} destroyOnClose>
        <Input.Search
          allowClear
          placeholder="Tìm theo tên hoặc mô tả ảnh"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          style={{ marginBottom: 12 }}
        />
        {library.isLoading ? (
          <Spin />
        ) : library.isError ? (
          <Typography.Text type="danger">Không tải được thư viện ảnh</Typography.Text>
        ) : filtered.length === 0 ? (
          <Empty description="Chưa có ảnh nào" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12, maxHeight: 420, overflowY: "auto" }}>
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Chọn ${item.originalName}`}
                onClick={() => {
                  onChange({ mediaId: item.id });
                  setOpen(false);
                }}
                style={{
                  border: value?.mediaId === item.id ? "2px solid #0E5D95" : "1px solid #d9d9d9",
                  borderRadius: 6,
                  background: "#fff",
                  padding: 6,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <img src={item.url} alt="" style={{ width: "100%", height: 80, objectFit: "contain", background: "#fafafa" }} />
                <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.originalName}</div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
