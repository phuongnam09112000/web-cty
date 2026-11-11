export type PermissionKey = "users.view" | "users.manage" | "roles.manage" | "audit.view"
  | "content.view"
  | "content.edit"
  | "content.publish"
  | "media.manage";

export const SYSTEM_ROLE_NAME = "Quản trị viên";
export const EDITOR_ROLE_NAME = "Biên tập viên";

export type PermissionDefinition = {
  key: PermissionKey;
  module: string;
  label: string;
  defaultRoles?: string[];
};

export const PERMISSIONS: readonly PermissionDefinition[] = [
  { key: "users.view", module: "Người dùng", label: "Xem danh sách người dùng" },
  {
    key: "users.manage",
    module: "Người dùng",
    label: "Thêm, sửa, vô hiệu hóa, đặt lại mật khẩu",
  },
  { key: "roles.manage", module: "Vai trò", label: "Quản lý vai trò và quyền" },
  { key: "audit.view", module: "Nhật ký", label: "Xem nhật ký hoạt động" },
  {
    key: "content.view",
    module: "Nội dung",
    label: "Xem trang, bản nháp và lịch sử",
    defaultRoles: [EDITOR_ROLE_NAME],
  },
  {
    key: "content.edit",
    module: "Nội dung",
    label: "Sửa bản nháp",
    defaultRoles: [EDITOR_ROLE_NAME],
  },
  {
    key: "content.publish",
    module: "Nội dung",
    label: "Xuất bản và khôi phục phiên bản",
    defaultRoles: [EDITOR_ROLE_NAME],
  },
  {
    key: "media.manage",
    module: "Thư viện ảnh",
    label: "Upload, sửa và xóa ảnh",
    defaultRoles: [EDITOR_ROLE_NAME],
  },
];
