import { z } from "zod";
import { localizedParagraph, localizedText, mediaRef } from "../localized.js";

export const servicesListSchema = z.strictObject({
  pageTitle: localizedText,
  sectionTitle: localizedText,
  text: localizedParagraph,
  image: mediaRef,
});
