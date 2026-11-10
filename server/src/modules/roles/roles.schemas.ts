import { z } from "zod";
import { PERMISSIONS, type PermissionKey } from "../permissions/catalog.js";

const name = z.string().trim().min(1, "Vui lòng nhập tên vai trò").max(100, "Tên vai trò quá dài");
const description = z
  .string()
  .trim()
  .max(255, "Mô tả quá dài")
  .transform((value) => (value === "" ? null : value))
  .nullable();

const catalogKeys = new Set<string>(PERMISSIONS.map((permission) => permission.key));

export const createRoleSchema = z.object({ name, description: description.optional() });

export const updateRoleSchema = z
  .object({ name: name.optional(), description: description.optional() })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "Không có thay đổi nào",
  });

export const setPermissionsSchema = z.object({
  permissions: z
    .array(z.string(), "Danh sách quyền không hợp lệ")
    .refine((keys) => keys.every((key) => catalogKeys.has(key)), "Quyền không hợp lệ")
    .transform((keys) => [...new Set(keys)] as PermissionKey[]),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
