import type { ComponentType } from "react";
import AboutBanner from "../components/AboutBanner";
import CoreValues from "../components/CoreValues";
import MapBanner from "../components/Contact";
import Mission from "../components/Mission";
import OverviewSection from "../components/OverviewSection";
import Vision from "../components/Vision";
import ContactFormBlock from "./blocks/ContactFormBlock";
import type { BlockDataMap, BlockType, CmsBlock, Lang } from "./types";

export type BlockProps<K extends BlockType> = { data: BlockDataMap[K]; lang: Lang };

export const BLOCK_COMPONENTS: { [K in BlockType]?: ComponentType<BlockProps<K>> } = {
  "about-banner": AboutBanner,
  overview: OverviewSection,
  vision: Vision,
  mission: Mission,
  "core-values": CoreValues,
  "office-map": MapBanner,
  "contact-form": ContactFormBlock,
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
