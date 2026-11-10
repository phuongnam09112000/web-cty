import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Input, Modal, message } from "antd";
import { useEffect } from "react";
import { ApiError, apiFetch } from "../../api/client";
import type { RoleDto } from "../../api/types";

type Values = { name: string; description?: string };

type Props = {
  open: boolean;
  role: RoleDto | null;
  onClose: () => void;
};

export function RoleFormModal({ open, role, onClose }: Props) {
  const [form] = Form.useForm<Values>();
  const queryClient = useQueryClient();
  const editing = role !== null;

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (role) form.setFieldsValue({ name: role.name, description: role.description ?? "" });
  }, [open, role, form]);

  const mutation = useMutation<RoleDto, Error, Values>({
    mutationFn: (values) => {
      const body = { name: values.name, description: values.description ?? "" };
      return editing
        ? apiFetch<RoleDto>(`/roles/${role.id}`, { method: "PATCH", body })
        : apiFetch<RoleDto>("/roles", { method: "POST", body });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      onClose();
      void message.success(editing ? "Đã cập nhật vai trò" : "Đã thêm vai trò");
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
      title={editing ? "Sửa vai trò" : "Thêm vai trò"}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={mutation.isPending}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={(values) => mutation.mutate(values)}>
        <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên vai trò" }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea maxLength={255} rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
