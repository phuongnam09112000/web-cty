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
import { pick } from "../../cms/pick";
import { HEADING_SEPARATOR_NBSP, renderHeading } from "../../cms/headingParts";
import type { Lang, OverviewData } from "../../cms/types";

interface IntroItemType {
  icon: React.ReactNode;
  textKey: string;
}

interface TMAAboutProps {
  images?: string[];
  data?: OverviewData;
  lang?: Lang;
}

const OverviewSection = ({ images: legacyImages = [], data, lang = "vi" }: TMAAboutProps) => {
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
    return () => observer.disconnect();
  }, []);

  const images = data
    ? data.images.flatMap((image) => (image ? [{ src: image.url, alt: pick(image.alt, lang) }] : []))
    : legacyImages.map((src) => ({ src, alt: "" }));

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
          <Eyebrow>{data ? pick(data.eyebrow, lang) : t("overview.eyebrow")}</Eyebrow>

          <IntroTitle level={2}>
            {data ? renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_NBSP }) : <>{t("overview.heading.part1")}&nbsp;<em>{t("overview.heading.em")}</em></>}
          </IntroTitle>

          <TimelineWrapper>
            {(data ? data.paragraphs.map((_, index) => introItems[index % introItems.length]) : introItems).map((item, index) => (
              <IntroItem key={index} isVisible={isVisible} delay={0.15 + index * 0.1}>
                <ItemHeader>
                  <IconWrapper>
                    <StyledIcon>{item.icon}</StyledIcon>
                  </IconWrapper>
                </ItemHeader>
                <IntroText>{data ? pick(data.paragraphs[index], lang) : t(item.textKey)}</IntroText>
              </IntroItem>
            ))}
          </TimelineWrapper>
        </TextColumn>

        {/* RIGHT: Images */}
        <Col
          xs={24}
          md={12}
          lg={13}
          style={{ paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 }}
        >
          <ImagesContainer isVisible={isVisible}>
            <AccentBlock />
            {visibleImages.map(({ src, alt }, index) => (
              <ImageWrapper
                key={index}
                index={index}
                isVisible={isVisible}
                delay={0.3 + index * 0.18}
              >
                {index === 1 ? (
                  <BorderImage>
                    <Image src={src} alt={alt || `ISTT image ${index + 1}`} />
                  </BorderImage>
                ) : (
                  <Image src={src} alt={alt || `ISTT image ${index + 1}`} />
                )}
              </ImageWrapper>
            ))}
            <YearBadge>{data ? pick(data.yearBadge, lang) : t("overview.year_badge")}</YearBadge>
          </ImagesContainer>
        </Col>

      </AboutContentWrapper>
    </AboutContainer>
  );
};

export default OverviewSection;