import React, { useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
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

// Same titles and descriptions as the Services page; photos are the ones each
// service's own page uses.
const services = [
  {
    id: "integration",
    title: "System Integration",
    description:
      "ISTT is a leading company in the field of System Integration (SI), helping businesses and organizations connect different technology platforms into a unified system, optimizing operational efficiency, security, and scalability.",
    path: "/integration",
    image: "/img/background/sy.jpg",
  },
  {
    id: "software",
    title: "Software Development",
    description:
      "Specializes in developing and integrating custom software solutions that align with diverse client requirements. By leveraging advanced technologies, we help businesses achieve greater efficiency, minimize risks, and reduce costs.",
    path: "/software",
    image: "/img/background/software.jpg",
  },
  {
    id: "support",
    title: "Technical Support",
    description:
      "We offers 24/7 technical support services designed to ensure system reliability and uptime. With a skilled support team and strategic on-site presence across Vietnam, we provide rapid issue resolution and consistent service quality.",
    path: "/support",
    image: "/img/background/support.jpg",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/* Homepage services: three columns on dark navy, each linking to its page. */
const HomeServices: React.FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const near = useNearViewport(sectionRef);

  return (
    <ServicesSection ref={sectionRef} aria-labelledby="services-title" className="istt-on-dark">
      <SectionInner>
        <Header>
          <div>
            <Eyebrow $onDark>{t("ourservices.eyebrow")}</Eyebrow>
            <SectionHeading id="services-title" $onDark>
              <Trans i18nKey="ourservices.title">
                Professional <em>Services</em>
              </Trans>
            </SectionHeading>
          </div>
          <ArrowLink to="/services" $onDark>
            {t("home.services.all")} <span aria-hidden="true">→</span>
          </ArrowLink>
        </Header>

        <List>
          {services.map((service, index) => (
            <li key={service.id}>
              <ServiceLink
                to={service.path}
                aria-labelledby={`service-${service.id}-title service-${service.id}-cta`}
                aria-describedby={`service-${service.id}-desc`}
              >
                <Photo>
                  {near && <img src={service.image} alt="" loading="lazy" decoding="async" />}
                </Photo>
                <Body>
                  <Index aria-hidden="true">{pad(index + 1)}</Index>
                  <Title id={`service-${service.id}-title`}>{t(service.title)}</Title>
                  <Description id={`service-${service.id}-desc`}>{t(service.description)}</Description>
                  <Cta id={`service-${service.id}-cta`}>
                    {t("Learn more")} <span aria-hidden="true">→</span>
                  </Cta>
                </Body>
              </ServiceLink>
            </li>
          ))}
        </List>
      </SectionInner>
    </ServicesSection>
  );
};

export default HomeServices;
