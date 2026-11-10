import { CopyOutlined } from "@ant-design/icons";
import { Alert, Button, Modal, Typography, message } from "antd";

type Props = { password: string | null; onClose: () => void };

export function TemporaryPasswordModal({ password, onClose }: Props) {
  const [messageApi, holder] = message.useMessage();

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      void messageApi.success("Đã sao chép mật khẩu");
    } catch {
      void messageApi.error("Không thể sao chép, hãy chọn và sao chép thủ công");
    }
  };

  return (
    <Modal
      open={password !== null}
      title="Mật khẩu tạm thời"
      onCancel={onClose}
      footer={<Button type="primary" onClick={onClose}>Đóng</Button>}
      destroyOnClose
    >
      {holder}
      <Alert type="warning" showIcon message="Mật khẩu này chỉ hiển thị một lần" style={{ marginBottom: 16 }} />
      <Typography.Text code data-testid="temporary-password" style={{ fontSize: 18 }}>
        {password}
      </Typography.Text>
      <Button icon={<CopyOutlined />} onClick={copy} style={{ marginLeft: 12 }}>
        Sao chép
      </Button>
    </Modal>
  );
}
