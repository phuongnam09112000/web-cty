import { Alert, Button } from "antd";
import { ApiError } from "../api/client";

export function ListError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const text = error instanceof ApiError ? error.message : "Không thể kết nối tới máy chủ";
  return (
    <Alert
      type="error"
      showIcon
      message={text}
      action={
        <Button size="small" onClick={onRetry}>
          Thử lại
        </Button>
      }
    />
  );
}
