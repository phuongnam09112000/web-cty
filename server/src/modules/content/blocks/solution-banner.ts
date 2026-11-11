import { z } from "zod";
import { localizedText, mediaRef } from "../localized.js";

export const solutionBannerSchema = z.strictObject({
  image: mediaRef,
  eyebrow: localizedText,
  title: localizedText,
  subtitle: localizedText,
  buttonLabel: localizedText,
});
