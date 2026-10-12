import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionProps } from "./types";
import {
  AboutSectionContainer,
  Button,
  ContentContainer,
  Description,
  Image,
  ImageContainer,
  ImageFrame,
  CornerAccent,
  FoundedBadge,
  SectionLabel,
  Title,
  TitleDivider,
  StatStrip,
  StatItem,
  StatNumber,
  StatLabel,
} from "./styles";

const stats = [
  { number: "20+", label: "Years Active" },
  // { number: "500+", label: "Projects Done" },
  { number: "20+", label: "Partners" },
];

const Section: React.FC<SectionProps> = () => {
  const [isImageVisible,  setIsImageVisible]  = useState(false);
  const [isLabelVisible,  setIsLabelVisible]  = useState(false);
  const [isTitleVisible,  setIsTitleVisible]  = useState(false);
  const [isDividerVisible, setIsDividerVisible] = useState(false);
  const [isStatsVisible,  setIsStatsVisible]  = useState(false);
  const [isDescVisible,   setIsDescVisible]   = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const navigate = useHistory();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsImageVisible(true),  100);
          setTimeout(() => setIsLabelVisible(true),  200);
          setTimeout(() => setIsTitleVisible(true),  320);
          setTimeout(() => setIsDividerVisible(true), 440);
          setTimeout(() => setIsStatsVisible(true),  480);
          setTimeout(() => setIsDescVisible(true),   560);
          setTimeout(() => setIsButtonVisible(true), 700);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.disconnect(); };
  }, []);

  const handleLearnMore = () => {
    navigate.push("/about");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AboutSectionContainer ref={sectionRef}>
      {/* ── Left: image ── */}
      <ImageContainer isVisible={isImageVisible}>
        <FoundedBadge>Est. 2001</FoundedBadge>
        <ImageFrame>
          <Image
            src="/img/background/istt.jpg"
            alt="ISTT Company"
            loading="lazy"
          />
        </ImageFrame>
        <CornerAccent />
      </ImageContainer>

      {/* ── Right: content ── */}
      <ContentContainer isVisible={true}>
        <SectionLabel isVisible={isLabelVisible}>
          {t("About us")}
        </SectionLabel>

        <Title isVisible={isTitleVisible}>
          {t("Information Services")}&nbsp;&amp;<br />
          <em>{t("Technology Transfer")}</em>
        </Title>

        <TitleDivider isVisible={isDividerVisible} />

        {/* Stats row */}
        <StatStrip isVisible={isStatsVisible}>
          {stats.map((s) => (
            <StatItem key={s.label}>
              <StatNumber>{s.number}</StatNumber>
              <StatLabel>{t(s.label)}</StatLabel>
            </StatItem>
          ))}
        </StatStrip>

        <Description isVisible={isDescVisible}>
          {t(
            "Founded in 2001, ISTT has grown into a leading provider of integrated ICT and telecommunication solutions in Vietnam. With a customer-centric approach, we connect global partners and deliver cutting-edge technology to empower businesses and communities throughout the country and region."
          )}
        </Description>

        <Button isVisible={isButtonVisible} onClick={handleLearnMore}>
          <span style={{ color: "#fff" }}>{t("Learn more")}</span>
        </Button>
      </ContentContainer>
    </AboutSectionContainer>
  );
};

export default Section;