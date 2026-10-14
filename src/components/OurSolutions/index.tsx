import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useNearViewport from "../../common/utils/useNearViewport";
import { Eyebrow, SectionHeading as Heading, SectionInner as Inner } from "../../styles/section";

import {
  AreaBody,
  AreaCta,
  AreaDescription,
  AreaImage,
  AreaLink,
  AreaTitle,
  Header,
  Index,
  Layout,
  List,
  Panel,
  PanelCaption,
  PanelImage,
  Section,
} from "./styles";
import type { BusinessArea } from "./types";

// Photographs are the ones each area's own page already uses
const areas: BusinessArea[] = [
  {
    id: "ict",
    titleKey: "solutions.card.ict.title",
    descriptionKey: "solutions.card.ict.description",
    link: "/information-communication-technology",
    image: "/img/background/ict_2.jpg",
  },
  {
    id: "secure",
    titleKey: "solutions.card.secure.title",
    descriptionKey: "solutions.card.secure.description",
    link: "/secure-defense",
    image: "/img/background/defense_solution.jpg",
    imagePosition: "65% center",
  },
  {
    id: "digital",
    titleKey: "solutions.card.digital.title",
    descriptionKey: "solutions.card.digital.description",
    link: "/digital-transformation",
    image: "/img/background/digital_smartcity.jpg",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/* Homepage business areas. Desktop: a list of the three areas beside one
 * large photograph that follows the hovered / focused row. Tablet and mobile:
 * stacked rows, each with its own photograph. Every title, description and
 * link stays visible without hover. */
export const SolutionCards: React.FC = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  // Photographs are only rendered once the section is close to the viewport,
  // so they never compete with the hero image for bandwidth on page load.
  const sectionRef = useRef<HTMLElement>(null);
  const near = useNearViewport(sectionRef);

  return (
    <Section ref={sectionRef} aria-labelledby="business-areas-title">
      <Inner>
        <Header>
          <Eyebrow>{t("solutions.eyebrow")}</Eyebrow>
          <Heading
            id="business-areas-title"
            dangerouslySetInnerHTML={{
              __html: t("solutions.subtitle", { interpolation: { escapeValue: false } }),
            }}
          />
        </Header>

        <Layout>
          <List>
            {areas.map((area, index) => (
              <li key={area.id}>
                <AreaLink
                  to={area.link}
                  $active={index === active}
                  aria-labelledby={`area-${area.id}-title area-${area.id}-cta`}
                  aria-describedby={`area-${area.id}-desc`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  {/* Stacked layouts only; hidden on desktop */}
                  <AreaImage>
                    {near && (
                      <img
                        src={area.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: area.imagePosition }}
                      />
                    )}
                  </AreaImage>
                  <AreaBody>
                    <Index aria-hidden="true">{pad(index + 1)}</Index>
                    <AreaTitle id={`area-${area.id}-title`}>{t(area.titleKey)}</AreaTitle>
                    <AreaDescription id={`area-${area.id}-desc`}>
                      {t(area.descriptionKey)}
                    </AreaDescription>
                    <AreaCta id={`area-${area.id}-cta`}>
                      {t("solutions.card.button")} <span aria-hidden="true">→</span>
                    </AreaCta>
                  </AreaBody>
                </AreaLink>
              </li>
            ))}
          </List>

          <Panel aria-hidden="true">
            {near && areas.map((area, index) => (
              <PanelImage
                key={area.id}
                src={area.image}
                alt=""
                loading="lazy"
                decoding="async"
                $active={index === active}
                style={{ objectPosition: area.imagePosition }}
              />
            ))}
            <PanelCaption>
              <span>{pad(active + 1)} / {pad(areas.length)}</span>
              <strong>{t(areas[active].titleKey)}</strong>
            </PanelCaption>
          </Panel>
        </Layout>
      </Inner>
    </Section>
  );
};

export default SolutionCards;
