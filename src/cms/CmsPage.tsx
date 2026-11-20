import { lazy, useEffect } from "react";
import BlockRenderer from "./BlockRenderer";
import PreviewBanner from "./PreviewBanner";
import { pick, useLang } from "./pick";
import { useCmsPage } from "./useCmsPage";

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

  return (
    <>
      {isPreview && <PreviewBanner />}
      <Container>
        {content.blocks
          .filter((block) => !block.hidden)
          .map((block) => (
            <BlockRenderer key={block.id} block={block} lang={lang} />
          ))}
      </Container>
    </>
  );
};

export default CmsPage;
