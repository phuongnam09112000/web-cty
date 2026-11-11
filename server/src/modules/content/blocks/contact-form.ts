import { z } from "zod";
import { heading, localizedText } from "../localized.js";

export const contactFormSchema = z.strictObject({
  variant: z.enum(["page", "inline"]),
  eyebrow: localizedText,
  heading,
  tagline: localizedText,
  formEyebrow: localizedText,
  formHeading: heading,
});
