import { lazy, useEffect } from "react";
import BlockBoundary from "./BlockBoundary";
import BlockRenderer from "./BlockRenderer";
import PreviewBanner from "./PreviewBanner";
import { pick, useLang } from "./pick";
import { clearStored, useCmsPage } from "./useCmsPage";

const Container = lazy(() => import("../common/Container"));

type Props = { path: string };

const CmsPage = ({ path }: Props) => {
  const { content, isPreview } = useCmsPage(path);
  const lang = useLang();
  const title = pick(content.seo.title, lang);
  const description = pick(content.seo.description, lang);

  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);

  useEffect(() => {
    if (!isPreview) return;
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const meta = existing ?? document.createElement("meta");
    const previous = existing ? existing.content : null;
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    if (!existing) document.head.appendChild(meta);
    return () => {
      if (previous === null) meta.remove();
      else meta.content = previous;
    };
  }, [isPreview]);

  return (
    <>
      {isPreview && <PreviewBanner />}
      <Container>
        {content.blocks
          .filter((block) => !block.hidden)
          .map((block) => (
            <BlockBoundary
              key={block.id}
              type={block.type}
              onError={() => {
                if (!isPreview) clearStored(path);
              }}
            >
              <BlockRenderer block={block} lang={lang} />
            </BlockBoundary>
          ))}
      </Container>
    </>
  );
};

export default CmsPage;
