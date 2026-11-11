import { z } from "zod";
import { heading, localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const overviewSchema = z.strictObject({
  eyebrow: localizedText,
  heading,
  images: z.array(mediaRef).min(1).max(3),
  paragraphs: z.array(localizedParagraph).min(1).max(6),
  yearBadge: localizedText,
});
