import { z } from "zod";
import { localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const opportunitySchema = z.strictObject({
  image: mediaRef,
  subtitle: localizedText,
  title: localizedText,
  description: localizedParagraph,
  stats: z.array(z.strictObject({ value: z.string().trim().min(1).max(30), label: localizedText })).max(4),
});
