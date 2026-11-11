import { z } from "zod";
import { localizedText } from "../localized.js";

export const officeMapSchema = z.strictObject({
  offices: z.array(z.strictObject({ name: localizedText, shortName: localizedText })).length(2),
});
