import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, Modal, Select, message } from "antd";
import { useEffect } from "react";
import { ApiError, apiFetch } from "../../api/client";
import type { RoleDto, UserDto } from "../../api/types";

type CreatedUser = { user: UserDto; temporaryPassword: string };

type Values = { fullName: string; email: string; roleId: number };

type Props = {
  open: boolean;
  user: UserDto | null;
  roles: RoleDto[];
  onClose: () => void;
  onCreated: (temporaryPassword: string) => void;
};

export function UserFormModal({ open, user, roles, onClose, onCreated }: Props) {
  const [form] = Form.useForm<Values>();
  const queryClient = useQueryClient();
  const editing = user !== null;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (user) form.setFieldsValue({ fullName: user.fullName, email: user.email, roleId: user.role.id });
  }, [open, user, form]);

  const mutation = useMutation<UserDto | CreatedUser, Error, Values>({
    mutationFn: (values) =>
      editing
        ? apiFetch<UserDto>(`/users/${user.id}`, { method: "PATCH", body: values })
        : apiFetch<CreatedUser>("/users", { method: "POST", body: values }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
      if ("temporaryPassword" in result) onCreated(result.temporaryPassword);
      else void message.success("Đã cập nhật người dùng");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.fields && Object.keys(error.fields).length > 0) {
        form.setFields(Object.entries(error.fields).map(([name, text]) => ({ name: name as keyof Values, errors: [String(text)] })));
        return;
      }
      void message.error(error instanceof ApiError ? error.message : "Đã xảy ra lỗi, vui lòng thử lại");
    },
  });

  return (
    <Modal
      open={open}
      title={editing ? "Sửa người dùng" : "Thêm người dùng"}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={mutation.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={(values) => mutation.mutate(values)}>
        <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập họ tên" }]}>
          <Input maxLength={150} />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="roleId" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
          <Select virtual={false} options={roles.map((role) => ({ value: role.id, label: role.name }))} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
