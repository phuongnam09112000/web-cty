import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

// Existing figures shown on the homepage
const stats = [
  { number: "20+", label: "Years Active" },
  { number: "20+", label: "Partners" },
];

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
const Section: React.FC = () => {
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
              {pageLoaded && (
                <img
                  src="/img/background/istt.jpg"
                  alt={t("home.about.photo")}
                  loading="lazy"
                  decoding="async"
                  width={2048}
                  height={1365}
                />
              )}
            </Photo>
            <Badge>
              <span>{t("home.about.founded")}</span>
              <strong>2001</strong>
            </Badge>
          </Figure>

          <Content>
            <Eyebrow>{t("About us")}</Eyebrow>
            <SectionHeading id="about-title">
              {t("Information Services")} &amp; <em>{t("Technology Transfer")}</em>
            </SectionHeading>
            <Lead>
              {t(
                "Founded in 2001, ISTT has grown into a leading provider of integrated ICT and telecommunication solutions in Vietnam. With a customer-centric approach, we connect global partners and deliver cutting-edge technology to empower businesses and communities throughout the country and region."
              )}
            </Lead>
            <Stats>
              {stats.map((s) => (
                <Stat key={s.label}>
                  <dt>{t(s.label)}</dt>
                  <dd>{s.number}</dd>
                </Stat>
              ))}
            </Stats>
            <ArrowLink to="/about">
              {t("home.about.cta")} <span aria-hidden="true">→</span>
            </ArrowLink>
          </Content>
        </Layout>
      </SectionInner>
    </AboutSection>
  );
};

export default Section;
