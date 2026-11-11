import { z } from "zod";
import { heading, localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const coreValuesSchema = z.strictObject({
  eyebrow: localizedText,
  heading,
  items: z
    .array(z.strictObject({ icon: mediaRef, title: localizedText, description: localizedParagraph }))
    .min(1)
    .max(6),
});
