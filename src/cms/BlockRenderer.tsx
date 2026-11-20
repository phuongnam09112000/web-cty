import type { ComponentType } from "react";
import ContactFormBlock from "./blocks/ContactFormBlock";
import type { BlockDataMap, BlockType, CmsBlock, Lang } from "./types";

export type BlockProps<K extends BlockType> = { data: BlockDataMap[K]; lang: Lang };

export const BLOCK_COMPONENTS: { [K in BlockType]?: ComponentType<BlockProps<K>> } = {
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
