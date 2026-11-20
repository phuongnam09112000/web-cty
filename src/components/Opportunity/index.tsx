import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import {
  ContentWrapper,
  Description,
  ImageWrapper,
  InnerContainer,
  OuterContainer,
  Subtitle,
  Title,
  TitleDivider,
  StatStrip,
  StatItem,
  StatNumber,
  StatLabel,
} from "./styles";
import { OpportunityProps } from "./types";
import { pick } from "../../cms/pick";
import type { Lang, OpportunityData } from "../../cms/types";

const stats = [
  { number: "20+",  label: "Years Active" },
  { number: "20+", label: "Partners" },
];

type Props = Partial<OpportunityProps> & { data?: OpportunityData; lang?: Lang };

const Opportunity = ({ data, lang = "vi", subtitle = "", title = "", imageSrc = "" }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { root: null, threshold: 0.18, rootMargin: "0px" }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const vis = isVisible ? "visible" : "";

  return (
    <OuterContainer ref={sectionRef}>
      <InnerContainer>
        <Row gutter={[64, 48]} align="middle">
          {/* Image */}
          <Col xs={24} md={10}>
            <ImageWrapper className={vis}>
              <img
                src={data ? data.image?.url ?? "" : imageSrc}
                alt={data ? (data.image && pick(data.image.alt, lang)) || "ISTT Services" : "ISTT Services"}
              />
            </ImageWrapper>
          </Col>

          {/* Content */}
          <Col xs={24} md={14}>
            <ContentWrapper>
              <Subtitle className={vis}>{data ? pick(data.subtitle, lang) : t(subtitle)}</Subtitle>

              <Title className={vis}>
                {data ? pick(data.title, lang) : t(title)}
              </Title>

              <TitleDivider className={vis} />

              <Description className={vis}>
                {data
                  ? pick(data.description, lang)
                  : t(
                      "ISTT focuses its investment on researching and seeking advanced technology services that are suitable for the practical needs of Vietnam, while also meeting international standards. The services provided by ISTT have been deployed in numerous Ministries, Departments, and large enterprises and organizations both domestically and internationally, delivering high efficiency for customers."
                    )}
              </Description>

              <StatStrip className={vis}>
                {(data
                  ? data.stats.map((s) => ({ number: s.value, label: pick(s.label, lang) }))
                  : stats.map((s) => ({ number: s.number, label: t(s.label) }))
                ).map((s, i) => (
                  <StatItem key={data ? i : s.label}>
                    <StatNumber>{s.number}</StatNumber>
                    <StatLabel>{s.label}</StatLabel>
                  </StatItem>
                ))}
              </StatStrip>
            </ContentWrapper>
          </Col>
        </Row>
      </InnerContainer>
    </OuterContainer>
  );
};

export default Opportunity;