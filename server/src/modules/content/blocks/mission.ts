import { z } from "zod";
import { heading, localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const missionSchema = z.strictObject({
  image: mediaRef,
  eyebrow: localizedText,
  heading,
  points: z.array(localizedParagraph).min(1).max(6),
});
