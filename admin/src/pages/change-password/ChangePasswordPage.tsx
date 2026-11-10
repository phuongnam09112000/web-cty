import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiFetch } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";

type Values = { currentPassword: string; newPassword: string; confirmPassword: string };

export function ChangePasswordPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm<Values>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: Values) => {
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: { currentPassword: values.currentPassword, newPassword: values.newPassword },
      });
      await refresh();
      navigate("/", { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        form.setFields(
          Object.entries(e.fields).map(([name, message]) => ({ name: name as keyof Values, errors: [message] })),
        );
      } else {
        setError(e instanceof ApiError ? e.message : "Không thể kết nối tới máy chủ");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "#f5f7fa" }}>
      <Card style={{ width: 440 }}>
        <Typography.Title level={3} style={{ textAlign: "center" }}>
          Đổi mật khẩu
        </Typography.Title>
        {user?.mustChangePassword && (
          <Alert
            type="info"
            showIcon
            message="Bạn cần đổi mật khẩu trước khi tiếp tục sử dụng hệ thống."
            style={{ marginBottom: 16 }}
          />
        )}
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 10, message: "Mật khẩu phải có ít nhất 10 ký tự" },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            label="Nhập lại mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error("Mật khẩu nhập lại không khớp"));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Đổi mật khẩu
          </Button>
        </Form>
      </Card>
    </div>
  );
}
