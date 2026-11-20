import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import LazySectionComponent from "../../pages/Lazy";
import { renderHeading, HEADING_SEPARATOR_SPACE } from "../../cms/headingParts";
import { pick } from "../../cms/pick";
import type { BlockProps } from "../../cms/BlockRenderer";
import useNearViewport from "../../common/utils/useNearViewport";
import { ArrowLink, Eyebrow, SectionHeading, SectionInner } from "../../styles/section";
import {
  Body,
  Cta,
  Description,
  Header,
  Index,
  List,
  Photo,
  ServiceLink,
  ServicesSection,
  Title,
} from "./styles";

const pad = (n: number) => String(n).padStart(2, "0");

/* Homepage services: three columns on dark navy, each linking to its page. */
const HomeServices = ({ data, lang }: BlockProps<"home-services">) => {
  const { t } = useTranslation();
  const services = data.items;
  const sectionRef = useRef<HTMLElement>(null);
  const near = useNearViewport(sectionRef);

  return (
    <LazySectionComponent>
    <ServicesSection ref={sectionRef} aria-labelledby="services-title" className="istt-on-dark">
      <SectionInner>
        <Header>
          <div>
            <Eyebrow $onDark>{pick(data.eyebrow, lang)}</Eyebrow>
            <SectionHeading id="services-title" $onDark>
              {renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_SPACE })}
            </SectionHeading>
          </div>
          <ArrowLink to={data.allLink.href} $onDark>
            {pick(data.allLink.label, lang)} <span aria-hidden="true">→</span>
          </ArrowLink>
        </Header>

        <List>
          {services.map((service, index) => (
            <li key={index}>
              <ServiceLink
                to={service.href}
                aria-labelledby={`service-${index}-title service-${index}-cta`}
                aria-describedby={`service-${index}-desc`}
              >
                <Photo>
                  {near && service.image && (
                    <img src={service.image.url} alt={pick(service.image.alt, lang)} loading="lazy" decoding="async" />
                  )}
                </Photo>
                <Body>
                  <Index aria-hidden="true">{pad(index + 1)}</Index>
                  <Title id={`service-${index}-title`}>{pick(service.title, lang)}</Title>
                  <Description id={`service-${index}-desc`}>{pick(service.description, lang)}</Description>
                  <Cta id={`service-${index}-cta`}>
                    {t("Learn more")} <span aria-hidden="true">→</span>
                  </Cta>
                </Body>
              </ServiceLink>
            </li>
          ))}
        </List>
      </SectionInner>
    </ServicesSection>
    </LazySectionComponent>
  );
};

export default HomeServices;
