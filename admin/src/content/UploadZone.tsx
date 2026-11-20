import { InboxOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, Space, Upload } from "antd";
import { useState } from "react";
import { uploadMedia } from "../api/content";
import { ApiError } from "../api/client";
import type { MediaDto } from "../api/types";

type Failure = { key: number; name: string; message: string };

let failureCounter = 0;

export function UploadZone({ onUploaded, compact = false }: { onUploaded?: (media: MediaDto) => void; compact?: boolean }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState<Failure[]>([]);

  const run = async (files: File[]) => {
    setBusy(true);
    try {
      for (const file of files) {
        try {
          const media = await uploadMedia(file);
          await queryClient.invalidateQueries({ queryKey: ["media"] });
          onUploaded?.(media);
        } catch (error) {
          const message = error instanceof ApiError ? error.message : "Không thể kết nối tới máy chủ";
          failureCounter += 1;
          setFailures((current) => [...current, { key: failureCounter, name: file.name, message }]);
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Space direction="vertical" size="small" style={{ width: "100%", marginBottom: 12 }}>
      <Upload.Dragger
        multiple
        showUploadList={false}
        disabled={busy}
        height={compact ? 80 : undefined}
        beforeUpload={(file, list) => {
          if (file === list[0]) void run(list);
          return Upload.LIST_IGNORE;
        }}
      >
        <p className="ant-upload-drag-icon" style={compact ? { margin: 0 } : undefined}>
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{busy ? "Đang tải ảnh lên..." : "Kéo thả ảnh vào đây hoặc bấm để chọn ảnh"}</p>
      </Upload.Dragger>
      {failures.map((failure) => (
        <Alert
          key={failure.key}
          type="error"
          showIcon
          closable
          message={`${failure.name}: ${failure.message}`}
          onClose={() => setFailures((current) => current.filter((item) => item.key !== failure.key))}
        />
      ))}
    </Space>
  );
}
