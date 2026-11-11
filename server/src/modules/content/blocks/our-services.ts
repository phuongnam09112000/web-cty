import { z } from "zod";
import { heading, href, localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const ourServicesSchema = z.strictObject({
  eyebrow: localizedText,
  heading,
  buttonLabel: localizedText,
  items: z
    .array(
      z.strictObject({
        title: localizedText,
        description: localizedParagraph,
        icon: mediaRef,
        href,
        categories: z
          .array(z.strictObject({ name: localizedText, bullets: z.array(localizedText).min(1).max(6) }))
          .min(1)
          .max(6),
      }),
    )
    .min(1)
    .max(6),
});
