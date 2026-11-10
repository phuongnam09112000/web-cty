export type PermissionKey = "users.view" | "users.manage" | "roles.manage" | "audit.view";

export type Me = {
  id: number;
  email: string;
  fullName: string;
  mustChangePassword: boolean;
  role: { id: number; name: string; isSystem: boolean };
  permissions: PermissionKey[];
};

export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string>; requestId?: string };
};
