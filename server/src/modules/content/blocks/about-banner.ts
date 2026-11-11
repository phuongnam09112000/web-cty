import { z } from "zod";
import { localizedText, mediaRef } from "../localized.js";

const optionalText = z.strictObject({
  vi: z.string().trim().max(300),
  en: z.string().trim().max(300),
});

export const aboutBannerSchema = z.strictObject({
  image: mediaRef,
  title: localizedText,
  subtitle: optionalText,
  eyebrow: optionalText,
  headingLevel: z.union([z.literal(1), z.literal(2)]),
});
