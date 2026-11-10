export type PermissionKey = "users.view" | "users.manage" | "roles.manage" | "audit.view";

export const SYSTEM_ROLE_NAME = "Quản trị viên";
export const EDITOR_ROLE_NAME = "Biên tập viên";

export const PERMISSIONS: readonly { key: PermissionKey; module: string; label: string }[] = [
  { key: "users.view", module: "Người dùng", label: "Xem danh sách người dùng" },
  {
    key: "users.manage",
    module: "Người dùng",
    label: "Thêm, sửa, vô hiệu hóa, đặt lại mật khẩu",
  },
  { key: "roles.manage", module: "Vai trò", label: "Quản lý vai trò và quyền" },
  { key: "audit.view", module: "Nhật ký", label: "Xem nhật ký hoạt động" },
];
