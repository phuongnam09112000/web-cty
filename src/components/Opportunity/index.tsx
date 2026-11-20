import React, { useEffect, useRef, useState } from "react";
import { Row, Col } from "antd";
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
import { pick } from "../../cms/pick";
import type { Lang, OpportunityData } from "../../cms/types";

type Props = { data: OpportunityData; lang: Lang };

const Opportunity = ({ data, lang }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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
                src={data.image?.url ?? ""}
                alt={(data.image && pick(data.image.alt, lang)) || "ISTT Services"}
              />
            </ImageWrapper>
          </Col>

          {/* Content */}
          <Col xs={24} md={14}>
            <ContentWrapper>
              <Subtitle className={vis}>{pick(data.subtitle, lang)}</Subtitle>

              <Title className={vis}>
                {pick(data.title, lang)}
              </Title>

              <TitleDivider className={vis} />

              <Description className={vis}>
                {pick(data.description, lang)}
              </Description>

              <StatStrip className={vis}>
                {data.stats.map((s, i) => (
                  <StatItem key={i}>
                    <StatNumber>{s.value}</StatNumber>
                    <StatLabel>{pick(s.label, lang)}</StatLabel>
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