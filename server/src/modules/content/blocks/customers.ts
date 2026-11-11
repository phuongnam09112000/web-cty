import { z } from "zod";
import { localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const customersSchema = z.strictObject({
  eyebrow: localizedText,
  heading: localizedText,
  intro: localizedParagraph,
  items: z.array(z.strictObject({ name: localizedText, logo: mediaRef })).min(1).max(80),
});
