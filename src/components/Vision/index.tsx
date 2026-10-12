import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackgroundImage,
  Container,
  CornerBracket,
  Eyebrow,
  ImageAccentLine,
  ImageContainer,
  SectionTitle,
  TextContainer,
  TextContainerWrapper,
  TitleDivider,
  VisionText,
} from "./styles";

const VisionMission: React.FC = () => {
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
      { root: null, rootMargin: "0px", threshold: 0.18 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  return (
    <Container ref={sectionRef} visible={isVisible}>
      <ImageContainer visible={isVisible}>
        <BackgroundImage src="/img/background/vision.jpg" alt={t("vision.image.alt")} />
      </ImageContainer>
      <ImageAccentLine visible={isVisible} />

      <TextContainerWrapper>
        <TextContainer visible={isVisible} textVisible={textVisible}>
          <Eyebrow visible={textVisible}>{t("vision.eyebrow")}</Eyebrow>

          <SectionTitle level={2} visible={textVisible}>
            {t("vision.heading.part1")}&nbsp;<em>{t("vision.heading.em")}</em>
          </SectionTitle>

          <TitleDivider visible={textVisible} />

          <VisionText visible={textVisible}>
            {t("vision.body")}
          </VisionText>

          <CornerBracket />
        </TextContainer>
      </TextContainerWrapper>
    </Container>
  );
};

export default VisionMission;