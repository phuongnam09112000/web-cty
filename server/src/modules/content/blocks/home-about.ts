import { z } from "zod";
import { heading, link, localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const homeAboutSchema = z.strictObject({
  image: mediaRef,
  foundedLabel: localizedText,
  foundedYear: z.string().trim().min(1).max(10),
  eyebrow: localizedText,
  heading,
  lead: localizedParagraph,
  stats: z.array(z.strictObject({ value: z.string().trim().min(1).max(10), label: localizedText })).max(4),
  cta: link,
});
