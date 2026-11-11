import { z } from "zod";
import { localizedText, mediaRef } from "../localized.js";
import { aboutBannerSchema } from "./about-banner.js";
import { businessAreasSchema } from "./business-areas.js";
import { contactFormSchema } from "./contact-form.js";
import { coreValuesSchema } from "./core-values.js";
import { coreValuesSystemSchema } from "./core-values-system.js";
import { customersSchema } from "./customers.js";
import { homeAboutSchema } from "./home-about.js";
import { homeContactSchema } from "./home-contact.js";
import { homeHeroSchema } from "./home-hero.js";
import { homeServicesSchema } from "./home-services.js";
import { homeValuesSchema } from "./home-values.js";
import { missionSchema } from "./mission.js";
import { officeMapSchema } from "./office-map.js";
import { opportunitySchema } from "./opportunity.js";
import { ourServicesSchema } from "./our-services.js";
import { overviewSchema } from "./overview.js";
import { partnersSchema } from "./partners.js";
import { servicesListSchema } from "./services-list.js";
import { solutionBannerSchema } from "./solution-banner.js";
import { visionSchema } from "./vision.js";

export const BLOCK_TYPES = [
  "home-hero",
  "solution-banner",
  "about-banner",
  "home-about",
  "business-areas",
  "home-services",
  "home-values",
  "partners",
  "customers",
  "home-contact",
  "overview",
  "mission",
  "vision",
  "core-values",
  "core-values-system",
  "services-list",
  "our-services",
  "opportunity",
  "office-map",
  "contact-form",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const BLOCK_SCHEMAS: Record<BlockType, z.ZodType> = {
  "home-hero": homeHeroSchema,
  "solution-banner": solutionBannerSchema,
  "about-banner": aboutBannerSchema,
  "home-about": homeAboutSchema,
  "business-areas": businessAreasSchema,
  "home-services": homeServicesSchema,
  "home-values": homeValuesSchema,
  partners: partnersSchema,
  customers: customersSchema,
  "home-contact": homeContactSchema,
  overview: overviewSchema,
  mission: missionSchema,
  vision: visionSchema,
  "core-values": coreValuesSchema,
  "core-values-system": coreValuesSystemSchema,
  "services-list": servicesListSchema,
  "our-services": ourServicesSchema,
  opportunity: opportunitySchema,
  "office-map": officeMapSchema,
  "contact-form": contactFormSchema,
};

const blockId = z.string().regex(/^[a-z0-9]{6,32}$/);

const variants = BLOCK_TYPES.map((type) =>
  z.strictObject({
    id: blockId,
    type: z.literal(type),
    hidden: z.boolean(),
    data: BLOCK_SCHEMAS[type],
  }),
) as unknown as [
  z.ZodObject<{ id: z.ZodString; type: z.ZodLiteral<BlockType>; hidden: z.ZodBoolean; data: z.ZodType }>,
  ...z.ZodObject<{ id: z.ZodString; type: z.ZodLiteral<BlockType>; hidden: z.ZodBoolean; data: z.ZodType }>[],
];

export const blockSchema = z.discriminatedUnion("type", variants);

export const pageContentSchema = z
  .strictObject({
    seo: z.strictObject({
      title: localizedText,
      description: localizedText,
      image: mediaRef.nullable(),
    }),
    blocks: z.array(blockSchema).max(40),
  })
  .refine((content) => new Set(content.blocks.map((block) => block.id)).size === content.blocks.length, {
    path: ["blocks"],
    message: "Mã khối bị trùng trong trang",
  });

export type Block = z.infer<typeof blockSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;

