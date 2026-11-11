import { z } from "zod";
import { heading, localizedParagraph, localizedText } from "../localized.js";

export const homeValuesSchema = z.strictObject({
  eyebrow: localizedText,
  heading,
  philosophy: localizedParagraph,
  items: z.array(z.strictObject({ name: localizedText, description: localizedParagraph })).min(1).max(6),
});
