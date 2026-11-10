import { z } from "zod";
import { paginationSchema } from "../../http/pagination.js";
import { AUDIT_ACTIONS } from "./audit.service.js";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ")
  .transform((value, ctx) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      ctx.addIssue({ code: "custom", message: "Ngày không hợp lệ" });
      return z.NEVER;
    }
    return date;
  });

export const listAuditLogsSchema = paginationSchema.extend({
  actorUserId: z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
  action: z.enum(AUDIT_ACTIONS, "Hành động không hợp lệ").optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
});
