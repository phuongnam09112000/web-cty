import { z } from "zod";
import { paginationSchema } from "../../http/pagination.js";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Vui lòng nhập email")
  .max(191)
  .email("Email không hợp lệ");
const fullName = z.string().trim().min(1, "Vui lòng nhập họ tên").max(191);
const roleId = z
  .number("Vai trò không hợp lệ")
  .int("Vai trò không hợp lệ")
  .positive("Vai trò không hợp lệ")
  .max(Number.MAX_SAFE_INTEGER, "Vai trò không hợp lệ");

export const listUsersSchema = paginationSchema.extend({
  q: z.string().trim().max(191).optional(),
  roleId: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export const createUserSchema = z.object({ email, fullName, roleId });

export const updateUserSchema = z
  .object({
    email: email.optional(),
    fullName: fullName.optional(),
    roleId: roleId.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "Không có thay đổi nào",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
