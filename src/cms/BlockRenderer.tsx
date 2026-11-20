import type { ComponentType } from "react";
import AboutBanner from "../components/AboutBanner";
import CoreValuesSystem from "../components/CoreValuesSystem";
import ServicesPage from "../components/Integration";
import Opportunity from "../components/Opportunity";
import OurServices from "../components/OurServices";
import SolutionBanner from "../components/SolutionBanner";
import CoreValues from "../components/CoreValues";
import MapBanner from "../components/Contact";
import Mission from "../components/Mission";
import OverviewSection from "../components/OverviewSection";
import Vision from "../components/Vision";
import Content1 from "../components/Content1";
import Content2 from "../components/Content2";
import OurSolutions from "../components/OurSolutions";
import HomeServices from "../components/HomeServices";
import HomeValues from "../components/HomeValues";
import Partners, { Customers } from "../components/Partner";
import HomeContact from "../components/HomeContact";
import ContactFormBlock from "./blocks/ContactFormBlock";
import type { BlockDataMap, BlockType, CmsBlock, Lang } from "./types";

export type BlockProps<K extends BlockType> = { data: BlockDataMap[K]; lang: Lang };

export const BLOCK_COMPONENTS: { [K in BlockType]?: ComponentType<BlockProps<K>> } = {
  "home-hero": Content1,
  "home-about": Content2,
  "business-areas": OurSolutions,
  "home-services": HomeServices,
  "home-values": HomeValues,
  partners: Partners,
  customers: Customers,
  "home-contact": HomeContact,
  "about-banner": AboutBanner,
  overview: OverviewSection,
  vision: Vision,
  mission: Mission,
  "core-values": CoreValues,
  "office-map": MapBanner,
  "contact-form": ContactFormBlock,
  "our-services": OurServices,
  opportunity: Opportunity,
  "services-list": ServicesPage,
  "core-values-system": CoreValuesSystem,
  "solution-banner": SolutionBanner,
};

const warned = new Set<string>();

type Props = { block: CmsBlock; lang: Lang };

const BlockRenderer = ({ block, lang }: Props) => {
  const Component = BLOCK_COMPONENTS[block.type] as ComponentType<{ data: unknown; lang: Lang }> | undefined;
  if (!Component) {
    if (process.env.NODE_ENV !== "production" && !warned.has(block.type)) {
      warned.add(block.type);
      console.warn(`Chưa có component cho khối "${block.type}"`);
    }
    return null;
  }
  return <Component data={block.data} lang={lang} />;
};

export default BlockRenderer;
