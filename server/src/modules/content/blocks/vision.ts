import { z } from "zod";
import { heading, localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const visionSchema = z.strictObject({
  image: mediaRef,
  eyebrow: localizedText,
  heading,
  body: localizedParagraph,
});
