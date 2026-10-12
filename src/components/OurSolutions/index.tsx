import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

import {
  CardContent,
  CardImage,
  CardsContainer,
  Description,
  DescriptionContainer,
  DesktopCardsGrid,
  DesktopCardWrapper,
  Divider,
  IconWrapper,
  LearnMoreButton,
  SectionSubtitle,
  SectionTitle,
  SolutionSection,
  StyledCard,
  SwiperContainer,
  Title,
} from "./styles";
import type { SolutionCardProps } from "./types";

/* ─── Hook ───────────────────────────────────── */
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
};

const BRAND_MID = "#0e5d95";

/* ─── Component ──────────────────────────────── */
export const SolutionCards: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (expandedCard === null || !cardsContainerRef.current) return;
      const target = e.target as HTMLElement;
      if (target.closest(".modern-slider") || target.closest(".swiper")) return;
      const clickedOutside = !cardRefs.current.some(
        (ref) => ref && ref.contains(e.target as Node)
      );
      if (clickedOutside) setExpandedCard(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedCard]);

  const handleCardClick = (index: number, link: string) => {
    if (isMobile) {
      setExpandedCard(expandedCard === index ? null : index);
    } else {
      history.push(link);
    }
  };

  // Dùng key i18n thay vì hardcode string
  const solutions: SolutionCardProps[] = [
    {
      icon: "/img/icons/ict.png",
      titleKey: "solutions.card.ict.title",
      descriptionKey: "solutions.card.ict.description",
      link: "/information-communication-technology",
      image: "/img/card/ict.jpg",
      iconBgColor: BRAND_MID,
    },
    {
      icon: "/img/icons/secure.png",
      titleKey: "solutions.card.secure.title",
      descriptionKey: "solutions.card.secure.description",
      link: "/secure-defense",
      image: "/img/card/secure.jpg",
      iconBgColor: BRAND_MID,
    },
    {
      icon: "/img/icons/digital.png",
      titleKey: "solutions.card.digital.title",
      descriptionKey: "solutions.card.digital.description",
      link: "/digital-transformation",
      image: "/img/card/digital.jpg",
      iconBgColor: BRAND_MID,
    },
  ];

  /* ── Mobile card ── */
  const renderMobileCard = (solution: SolutionCardProps, index: number) => {
    const isActive = expandedCard === index;
    return (
      <SwiperSlide key={index}>
        <DesktopCardWrapper
          ref={(el) => (cardRefs.current[index] = el)}
          $isActive={isActive}
          onClick={() => handleCardClick(index, solution.link)}
        >
          <StyledCard $isActive={isActive}>
            <CardContent>
              <IconWrapper $bgColor={solution.iconBgColor} $isMobileActive={isActive}>
                <img src={solution.icon} alt={t(solution.titleKey)} />
              </IconWrapper>
              <Title $isActive={isActive}>{t(solution.titleKey)}</Title>
              {solution.image && (
                <CardImage
                  style={{
                    backgroundImage: `url(${solution.image})`,
                    opacity: isActive ? 0 : 1,
                    transform: isActive
                      ? "translateY(24px) scale(0.92)"
                      : "translateY(0) scale(1)",
                  }}
                />
              )}
              <DescriptionContainer $isActive={isActive} onClick={(e) => e.stopPropagation()}>
                <Divider />
                <Description>{t(solution.descriptionKey)}</Description>
                <LearnMoreButton
                  $isActive={isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    history.push(solution.link);
                  }}
                >
                  <span>{t("solutions.card.button")}</span>
                  <ArrowRightOutlined />
                </LearnMoreButton>
              </DescriptionContainer>
            </CardContent>
          </StyledCard>
        </DesktopCardWrapper>
      </SwiperSlide>
    );
  };

  /* ── Desktop card ── */
  const renderDesktopCard = (solution: SolutionCardProps, index: number) => {
    const isHov = hoveredIndex === index;
    return (
      <DesktopCardWrapper
        key={index}
        $isActive={isHov}
        onClick={() => handleCardClick(index, solution.link)}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <StyledCard $isActive={isHov}>
          <CardContent>
            <IconWrapper $bgColor={isHov ? "#fff" : solution.iconBgColor}>
              <img src={solution.icon} alt={t(solution.titleKey)} />
            </IconWrapper>
            <Title $isActive={isHov}>{t(solution.titleKey)}</Title>
            {solution.image && (
              <CardImage style={{ backgroundImage: `url(${solution.image})` }} />
            )}
            <DescriptionContainer $isActive={isHov}>
              <Divider />
              <Description>{t(solution.descriptionKey)}</Description>
              <LearnMoreButton $isActive={isHov}>
                <span>{t("solutions.card.button")}</span>
                <ArrowRightOutlined />
              </LearnMoreButton>
            </DescriptionContainer>
          </CardContent>
        </StyledCard>
      </DesktopCardWrapper>
    );
  };

  return (
    <SolutionSection>
      <SectionTitle>{t("solutions.eyebrow")}</SectionTitle>

      <SectionSubtitle
        dangerouslySetInnerHTML={{
          __html: t("solutions.subtitle", { interpolation: { escapeValue: false } }),
        }}
      />

      <CardsContainer ref={cardsContainerRef}>
        {isMobile ? (
          <SwiperContainer>
            <Swiper
              spaceBetween={16}
              slidesPerView={1}
              loop
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              className="solution-swiper"
              centeredSlides
              breakpoints={{
                480: { slidesPerView: 1.15 },
                640: { slidesPerView: 1.4 },
              }}
            >
              {solutions.map((s, i) => renderMobileCard(s, i))}
            </Swiper>
          </SwiperContainer>
        ) : (
          <DesktopCardsGrid>
            {solutions.map((s, i) => renderDesktopCard(s, i))}
          </DesktopCardsGrid>
        )}
      </CardsContainer>
    </SolutionSection>
  );
};

export default SolutionCards;