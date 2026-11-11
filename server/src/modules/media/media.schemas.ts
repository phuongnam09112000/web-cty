import { z } from "zod";
import { paginationSchema } from "../../http/pagination.js";

const altText = z.string().trim().max(300);

export const altSchema = z.strictObject({ vi: altText, en: altText });

export const updateMediaSchema = z.strictObject({ alt: altSchema });

export const listMediaSchema = paginationSchema.extend({
  q: z.string().trim().max(191).optional(),
});
