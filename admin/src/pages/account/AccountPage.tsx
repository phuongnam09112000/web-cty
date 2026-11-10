import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { ApiError, apiFetch } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";

type ProfileValues = { fullName: string };
type PasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : "Đã xảy ra lỗi, vui lòng thử lại";
}

export function AccountPage() {
  const { user, refresh } = useAuth();
  const [profileForm] = Form.useForm<ProfileValues>();
  const [passwordForm] = Form.useForm<PasswordValues>();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) profileForm.setFieldsValue({ fullName: user.fullName });
  }, [user, profileForm]);

  const onProfile = async (values: ProfileValues) => {
    setSavingProfile(true);
    try {
      await apiFetch("/auth/me", { method: "PATCH", body: { fullName: values.fullName.trim() } });
      await refresh();
      void message.success("Đã cập nhật thông tin");
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        profileForm.setFields(
          Object.entries(error.fields).map(([name, text]) => ({ name: name as keyof ProfileValues, errors: [text] })),
        );
      } else {
        void message.error(errorText(error));
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const onPassword = async (values: PasswordValues) => {
    setSavingPassword(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: { currentPassword: values.currentPassword, newPassword: values.newPassword },
      });
      passwordForm.resetFields();
      void message.success("Đổi mật khẩu thành công");
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        passwordForm.setFields(
          Object.entries(error.fields).map(([name, text]) => ({ name: name as keyof PasswordValues, errors: [text] })),
        );
      } else {
        void message.error(errorText(error));
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: 560 }}>
      <Card title="Thông tin cá nhân">
        <Space direction="vertical" style={{ marginBottom: 16 }}>
          <Typography.Text>Email: {user?.email}</Typography.Text>
          <Typography.Text>Vai trò: {user?.role.name}</Typography.Text>
        </Space>
        <Form form={profileForm} layout="vertical" onFinish={onProfile} requiredMark={false}>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[
              { required: true, whitespace: true, message: "Vui lòng nhập họ tên" },
              { max: 191, message: "Họ tên tối đa 191 ký tự" },
            ]}
          >
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={savingProfile}>
            Lưu thay đổi
          </Button>
        </Form>
      </Card>
      <Card title="Đổi mật khẩu">
        <Form form={passwordForm} layout="vertical" onFinish={onPassword} requiredMark={false}>
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
          <Button type="primary" htmlType="submit" loading={savingPassword}>
            Đổi mật khẩu
          </Button>
        </Form>
      </Card>
    </Space>
  );
}
