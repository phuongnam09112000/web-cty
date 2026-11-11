import { z } from "zod";

export const saveDraftSchema = z.strictObject({
  content: z.unknown(),
  revision: z.number().int().min(1).max(2147483647),
});

export const publishSchema = z.strictObject({
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").optional(),
});

