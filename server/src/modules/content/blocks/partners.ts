import { z } from "zod";
import { localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const partnersSchema = z.strictObject({
  eyebrow: localizedText,
  heading: localizedText,
  intro: localizedParagraph,
  initialCount: z.number().int().min(1).max(50),
  items: z.array(z.strictObject({ name: z.string().trim().min(1).max(100), logo: mediaRef })).min(1).max(80),
});
