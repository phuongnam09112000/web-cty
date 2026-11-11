import { z } from "zod";
import { heading, href, localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const businessAreasSchema = z.strictObject({
  eyebrow: localizedText,
  heading,
  buttonLabel: localizedText,
  areas: z
    .array(
      z.strictObject({
        title: localizedText,
        description: localizedParagraph,
        href,
        image: mediaRef,
        imagePosition: z.string().trim().max(30),
      }),
    )
    .min(1)
    .max(6),
});
