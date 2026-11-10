import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 10;

export const loginSchema = z.object({
  email: z.string().max(191),
  password: z.string().min(1).max(1024),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại").max(1024),
  newPassword: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`)
    .max(1024),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(191),
});
