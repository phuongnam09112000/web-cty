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

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

export type RoleRef = { id: number; name: string; isSystem: boolean };

export type UserDto = {
  id: number;
  email: string;
  fullName: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: RoleRef;
};

export type RoleDto = {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: PermissionKey[];
};

export type PermissionModule = { module: string; permissions: { key: PermissionKey; label: string }[] };

export type PermissionCatalog = { modules: PermissionModule[] };
