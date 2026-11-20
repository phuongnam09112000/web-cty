import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { renderHeading, HEADING_SEPARATOR_SPACE } from "../../cms/headingParts";
import { pick } from "../../cms/pick";
import type { BlockProps } from "../../cms/BlockRenderer";
import { ArrowLink, Eyebrow, SectionHeading, SectionInner } from "../../styles/section";
import {
  AboutSection,
  Badge,
  Content,
  Figure,
  Layout,
  Lead,
  Photo,
  Stat,
  Stats,
} from "./styles";

// True once the page's load event has fired, i.e. after the hero image
const usePageLoaded = () => {
  const [loaded, setLoaded] = useState(() => document.readyState === "complete");
  useEffect(() => {
    if (loaded) return;
    const onLoad = () => setLoaded(true);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, [loaded]);
  return loaded;
};

/* Company overview: ISTT's office photograph beside the introduction. */
const Section = ({ data, lang }: BlockProps<"home-about">) => {
  const { t } = useTranslation();
  // The section sits right below the hero, so the photo waits for the hero
  // image instead of downloading alongside it; the frame keeps its size.
  const pageLoaded = usePageLoaded();

  return (
    <AboutSection aria-labelledby="about-title">
      <SectionInner>
        <Layout>
          <Figure>
            <Photo>
              {pageLoaded && data.image && (
                <img
                  src={data.image.url}
                  alt={pick(data.image.alt, lang) || t("home.about.photo")}
                  loading="lazy"
                  decoding="async"
                  width={data.image.width}
                  height={data.image.height}
                />
              )}
            </Photo>
            <Badge>
              <span>{pick(data.foundedLabel, lang)}</span>
              <strong>{data.foundedYear}</strong>
            </Badge>
          </Figure>

          <Content>
            <Eyebrow>{pick(data.eyebrow, lang)}</Eyebrow>
            <SectionHeading id="about-title">
              {renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_SPACE })}
            </SectionHeading>
            <Lead>{pick(data.lead, lang)}</Lead>
            <Stats>
              {data.stats.map((s, index) => (
                <Stat key={index}>
                  <dt>{pick(s.label, lang)}</dt>
                  <dd>{s.value}</dd>
                </Stat>
              ))}
            </Stats>
            <ArrowLink to={data.cta.href}>
              {pick(data.cta.label, lang)} <span aria-hidden="true">→</span>
            </ArrowLink>
          </Content>
        </Layout>
      </SectionInner>
    </AboutSection>
  );
};

export default Section;
