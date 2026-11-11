import { z } from "zod";
import { localizedText, mediaRef } from "../localized.js";

export const aboutBannerSchema = z.strictObject({
  image: mediaRef,
  title: localizedText,
  subtitle: localizedText,
  eyebrow: localizedText,
  headingLevel: z.union([z.literal(1), z.literal(2)]),
});
