import { z } from "zod";
import { heading, link, localizedText } from "../localized.js";

export const homeContactSchema = z.strictObject({
  eyebrow: localizedText,
  heading,
  cta: link,
});
