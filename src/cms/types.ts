export type Lang = "vi" | "en";

export type LocalizedText = { vi: string; en: string };

export type Heading = { lead: LocalizedText; emphasis: LocalizedText; trail?: LocalizedText };

export type ResolvedImage = {
  url: string;
  width: number;
  height: number;
  alt: LocalizedText;
  sourcePath: string | null;
};

export type Media = ResolvedImage | null;

export type Link = { label: LocalizedText; href: string };

export type HomeHeroData = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  slides: { image: Media; tagline: LocalizedText }[];
  primaryCta: Link;
  secondaryCta: Link;
};

export type SolutionBannerData = {
  image: Media;
  eyebrow: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  buttonLabel: LocalizedText;
};

export type AboutBannerData = {
  image: Media;
  title: LocalizedText;
  subtitle: LocalizedText;
  eyebrow: LocalizedText;
  headingLevel: 1 | 2;
};

export type HomeAboutData = {
  image: Media;
  foundedLabel: LocalizedText;
  foundedYear: string;
  eyebrow: LocalizedText;
  heading: Heading;
  lead: LocalizedText;
  stats: { value: string; label: LocalizedText }[];
  cta: Link;
};

export type BusinessAreasData = {
  eyebrow: LocalizedText;
  heading: Heading;
  buttonLabel: LocalizedText;
  areas: {
    title: LocalizedText;
    description: LocalizedText;
    href: string;
    image: Media;
    imagePosition: string;
  }[];
};

export type HomeServicesData = {
  eyebrow: LocalizedText;
  heading: Heading;
  allLink: Link;
  items: { title: LocalizedText; description: LocalizedText; href: string; image: Media }[];
};

export type HomeValuesData = {
  eyebrow: LocalizedText;
  heading: Heading;
  philosophy: LocalizedText;
  items: { name: LocalizedText; description: LocalizedText }[];
};

export type PartnersData = {
  eyebrow: LocalizedText;
  heading: LocalizedText;
  intro: LocalizedText;
  initialCount: number;
  items: { name: string; logo: Media }[];
};

export type CustomersData = {
  eyebrow: LocalizedText;
  heading: LocalizedText;
  intro: LocalizedText;
  items: { name: LocalizedText; logo: Media }[];
};

export type HomeContactData = {
  eyebrow: LocalizedText;
  heading: Heading;
  cta: Link;
};

export type OverviewData = {
  eyebrow: LocalizedText;
  heading: Heading;
  images: Media[];
  paragraphs: LocalizedText[];
  yearBadge: LocalizedText;
};

export type MissionData = {
  image: Media;
  eyebrow: LocalizedText;
  heading: Heading;
  points: LocalizedText[];
};

export type VisionData = {
  image: Media;
  eyebrow: LocalizedText;
  heading: Heading;
  body: LocalizedText;
};

export type CoreValuesData = {
  eyebrow: LocalizedText;
  heading: Heading;
  items: { icon: Media; title: LocalizedText; description: LocalizedText }[];
};

export type CoreValuesSystemData = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  items: { title: LocalizedText; bullets: LocalizedText[]; image: Media; icon: Media }[];
};

export type ServicesListData = {
  pageTitle: LocalizedText;
  sectionTitle: LocalizedText;
  text: LocalizedText;
  image: Media;
};

export type OurServicesData = {
  eyebrow: LocalizedText;
  heading: Heading;
  buttonLabel: LocalizedText;
  items: {
    title: LocalizedText;
    description: LocalizedText;
    icon: Media;
    href: string;
    categories: { name: LocalizedText; bullets: LocalizedText[] }[];
  }[];
};

export type OpportunityData = {
  image: Media;
  subtitle: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  stats: { value: string; label: LocalizedText }[];
};

export type OfficeMapData = {
  offices: { name: LocalizedText; shortName: LocalizedText }[];
};

export type ContactFormData = {
  variant: "page" | "inline";
  eyebrow: LocalizedText;
  heading: Heading;
  tagline: LocalizedText;
  formEyebrow: LocalizedText;
  formHeading: Heading;
};

export type BlockDataMap = {
  "home-hero": HomeHeroData;
  "solution-banner": SolutionBannerData;
  "about-banner": AboutBannerData;
  "home-about": HomeAboutData;
  "business-areas": BusinessAreasData;
  "home-services": HomeServicesData;
  "home-values": HomeValuesData;
  partners: PartnersData;
  customers: CustomersData;
  "home-contact": HomeContactData;
  overview: OverviewData;
  mission: MissionData;
  vision: VisionData;
  "core-values": CoreValuesData;
  "core-values-system": CoreValuesSystemData;
  "services-list": ServicesListData;
  "our-services": OurServicesData;
  opportunity: OpportunityData;
  "office-map": OfficeMapData;
  "contact-form": ContactFormData;
};

export type BlockType = keyof BlockDataMap;

export type CmsBlock = {
  [K in BlockType]: { id: string; type: K; hidden: boolean; data: BlockDataMap[K] };
}[BlockType];

export type CmsSeo = { title: LocalizedText; description: LocalizedText; image: Media };

export type CmsContent = { seo: CmsSeo; blocks: CmsBlock[] };
