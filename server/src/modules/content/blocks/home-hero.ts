import { z } from "zod";
import { link, localizedText, mediaRef } from "../localized.js";

export const homeHeroSchema = z.strictObject({
  eyebrow: localizedText,
  title: localizedText,
  slides: z.array(z.strictObject({ image: mediaRef, tagline: localizedText })).min(1).max(6),
  primaryCta: link,
  secondaryCta: link,
});
