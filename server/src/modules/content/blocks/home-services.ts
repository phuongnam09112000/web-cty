import { z } from "zod";
import { heading, href, link, localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const homeServicesSchema = z.strictObject({
  eyebrow: localizedText,
  heading,
  allLink: link,
  items: z
    .array(z.strictObject({ title: localizedText, description: localizedParagraph, href, image: mediaRef }))
    .min(1)
    .max(6),
});
