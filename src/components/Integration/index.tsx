import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackgroundImage,
  CardDivider,
  CardEyebrow,
  Container,
  ContentSection,
  CornerBracket,
  ImageAccent,
  ImageContainer,
  PageTitle,
  PageTitleDivider,
  SectionTitle,
  ServiceText,
  TextContainer,
  TextContainerWrapper,
  TitleBlock,
  TitleEyebrow,
} from "./styles";

interface ServicesPageProps {
  pageTitle: string;
  sectionTitle: string;
  serviceText: string;
  imagePath: string;
}

const ServicesPage: React.FC<ServicesPageProps> = ({
  pageTitle,
  sectionTitle,
  serviceText,
  imagePath,
}) => {
  const { t } = useTranslation();
  const [isVisible,   setIsVisible]   = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => setTextVisible(true), 350);
          observer.unobserve(entry.target);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Container ref={sectionRef} visible={isVisible}>
      {/* ── Page title ── */}
      <TitleBlock>
        <TitleEyebrow visible={isVisible}>{t("servicespage.eyebrow")}</TitleEyebrow>
        <PageTitle level={1} visible={isVisible}>
          {t(pageTitle)}
        </PageTitle>
        <PageTitleDivider visible={isVisible} />
      </TitleBlock>

      {/* ── Split layout ── */}
      <ContentSection>
        {/* Right: image */}
        <ImageContainer visible={isVisible}>
          <BackgroundImage src={imagePath} alt={t("servicespage.image.alt")} />
        </ImageContainer>
        <ImageAccent visible={isVisible} />

        {/* Left: text card */}
        <TextContainerWrapper>
          <TextContainer visible={isVisible} textVisible={textVisible}>
            <CardEyebrow visible={textVisible}>
              {t("servicespage.card.eyebrow")}
            </CardEyebrow>

            <SectionTitle level={2} visible={textVisible}>
              {t(sectionTitle)}
            </SectionTitle>

            <CardDivider visible={textVisible} />

            <ServiceText visible={textVisible}>
              {t(serviceText)}
            </ServiceText>

            <CornerBracket />
          </TextContainer>
        </TextContainerWrapper>
      </ContentSection>
    </Container>
  );
};

export default ServicesPage;