import React, { useRef, useState } from "react";
import LazySectionComponent from "../../pages/Lazy";
import { renderHeading, HEADING_SEPARATOR_SPACE } from "../../cms/headingParts";
import { pick } from "../../cms/pick";
import type { BlockProps } from "../../cms/BlockRenderer";
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
  SolutionsAnchor,
} from "./styles";

const pad = (n: number) => String(n).padStart(2, "0");

/* Homepage business areas. Desktop: a list of the three areas beside one
 * large photograph that follows the hovered / focused row. Tablet and mobile:
 * stacked rows, each with its own photograph. Every title, description and
 * link stays visible without hover. */
export const SolutionCards = ({ data, lang }: BlockProps<"business-areas">) => {
  const areas = data.areas;
  const [active, setActive] = useState(0);
  // Photographs are only rendered once the section is close to the viewport,
  // so they never compete with the hero image for bandwidth on page load.
  const sectionRef = useRef<HTMLElement>(null);
  const near = useNearViewport(sectionRef);

  return (
    <SolutionsAnchor id="solutions" tabIndex={-1}>
      <LazySectionComponent>
    <Section ref={sectionRef} aria-labelledby="business-areas-title">
      <Inner>
        <Header>
          <Eyebrow>{pick(data.eyebrow, lang)}</Eyebrow>
          <Heading id="business-areas-title">
            {renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_SPACE })}
          </Heading>
        </Header>

        <Layout>
          <List>
            {areas.map((area, index) => (
              <li key={index}>
                <AreaLink
                  to={area.href}
                  $active={index === active}
                  aria-labelledby={`area-${index}-title area-${index}-cta`}
                  aria-describedby={`area-${index}-desc`}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  {/* Stacked layouts only; hidden on desktop */}
                  <AreaImage>
                    {near && area.image && (
                      <img
                        src={area.image.url}
                        alt={pick(area.image.alt, lang)}
                        loading="lazy"
                        decoding="async"
                        style={{ objectPosition: area.imagePosition || undefined }}
                      />
                    )}
                  </AreaImage>
                  <AreaBody>
                    <Index aria-hidden="true">{pad(index + 1)}</Index>
                    <AreaTitle id={`area-${index}-title`}>{pick(area.title, lang)}</AreaTitle>
                    <AreaDescription id={`area-${index}-desc`}>
                      {pick(area.description, lang)}
                    </AreaDescription>
                    <AreaCta id={`area-${index}-cta`}>
                      {pick(data.buttonLabel, lang)} <span aria-hidden="true">→</span>
                    </AreaCta>
                  </AreaBody>
                </AreaLink>
              </li>
            ))}
          </List>

          <Panel aria-hidden="true">
            {near && areas.map((area, index) => area.image && (
              <PanelImage
                key={index}
                src={area.image.url}
                alt={pick(area.image.alt, lang)}
                loading="lazy"
                decoding="async"
                $active={index === active}
                style={{ objectPosition: area.imagePosition || undefined }}
              />
            ))}
            <PanelCaption>
              <span>{pad(active + 1)} / {pad(areas.length)}</span>
              <strong>{areas[active] ? pick(areas[active].title, lang) : ""}</strong>
            </PanelCaption>
          </Panel>
        </Layout>
      </Inner>
    </Section>
      </LazySectionComponent>
    </SolutionsAnchor>
  );
};

export default SolutionCards;
