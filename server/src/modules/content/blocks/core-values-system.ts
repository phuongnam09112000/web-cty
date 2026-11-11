import { z } from "zod";
import { localizedText, mediaRef } from "../localized.js";

export const coreValuesSystemSchema = z.strictObject({
  eyebrow: localizedText,
  title: localizedText,
  items: z
    .array(
      z.strictObject({
        title: localizedText,
        bullets: z.array(localizedText).min(1).max(6),
        image: mediaRef,
        icon: mediaRef.nullable(),
      }),
    )
    .min(1)
    .max(8),
});
