import React, { useEffect, useRef, useState } from "react";
import {
  TeamOutlined,
  GlobalOutlined,
  SolutionOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { Col } from "antd";
import {
  AboutContainer,
  AboutContentWrapper,
  BorderImage,
  IconWrapper,
  Image,
  ImagesContainer,
  ImageWrapper,
  IntroItem,
  ItemHeader,
  IntroText,
  IntroTitle,
  StyledIcon,
  TextColumn,
  TimelineWrapper,
  Eyebrow,
  AccentBlock,
  YearBadge,
} from "./styles";
import { useTranslation } from "react-i18next";

interface IntroItemType {
  icon: React.ReactNode;
  textKey: string;
}

interface TMAAboutProps {
  images: string[];
}

const OverviewSection: React.FC<TMAAboutProps> = ({ images }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 767);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  const introItems: IntroItemType[] = [
    {
      icon: <SolutionOutlined style={{ fontSize: isMobile ? "16px" : "18px", color: "#0e5d95" }} />,
      textKey: "overview.item.1",
    },
    {
      icon: <CodeOutlined style={{ fontSize: isMobile ? "16px" : "18px", color: "#0e5d95" }} />,
      textKey: "overview.item.2",
    },
    {
      icon: <TeamOutlined style={{ fontSize: isMobile ? "16px" : "18px", color: "#0e5d95" }} />,
      textKey: "overview.item.3",
    },
    {
      icon: <GlobalOutlined style={{ fontSize: isMobile ? "16px" : "18px", color: "#0e5d95" }} />,
      textKey: "overview.item.4",
    },
  ];

  const visibleImages = isMobile ? images.slice(0, 1) : images;

  return (
    <AboutContainer ref={sectionRef}>
      <AboutContentWrapper gutter={[0, 48]}>

        {/* LEFT: Text */}
        <TextColumn xs={24} md={12} lg={11} isVisible={isVisible}>
          <Eyebrow>{t("overview.eyebrow")}</Eyebrow>

          <IntroTitle level={2}>
            {t("overview.heading.part1")}&nbsp;<em>{t("overview.heading.em")}</em>
          </IntroTitle>

          <TimelineWrapper>
            {introItems.map((item, index) => (
              <IntroItem key={index} isVisible={isVisible} delay={0.15 + index * 0.1}>
                <ItemHeader>
                  <IconWrapper>
                    <StyledIcon>{item.icon}</StyledIcon>
                  </IconWrapper>
                </ItemHeader>
                <IntroText>{t(item.textKey)}</IntroText>
              </IntroItem>
            ))}
          </TimelineWrapper>
        </TextColumn>

        {/* RIGHT: Images */}
        <Col xs={24} md={12} lg={13} style={{ padding: 0 }}>
          <ImagesContainer isVisible={isVisible}>
            <AccentBlock />
            {visibleImages.map((src, index) => (
              <ImageWrapper
                key={index}
                index={index}
                isVisible={isVisible}
                delay={0.3 + index * 0.18}
              >
                {index === 1 ? (
                  <BorderImage>
                    <Image src={src} alt={`ISTT image ${index + 1}`} />
                  </BorderImage>
                ) : (
                  <Image src={src} alt={`ISTT image ${index + 1}`} />
                )}
              </ImageWrapper>
            ))}
            <YearBadge>{t("overview.year_badge")}</YearBadge>
          </ImagesContainer>
        </Col>

      </AboutContentWrapper>
    </AboutContainer>
  );
};

export default OverviewSection;