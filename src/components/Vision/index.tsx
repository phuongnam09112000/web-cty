import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { pick } from "../../cms/pick";
import { HEADING_SEPARATOR_NBSP, renderHeading } from "../../cms/headingParts";
import type { Lang, VisionData } from "../../cms/types";
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

type Props = { data?: VisionData; lang?: Lang };

const VisionMission = ({ data, lang = "vi" }: Props) => {
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
    return () => observer.disconnect();
  }, []);

  return (
    <Container ref={sectionRef} visible={isVisible}>
      <ImageContainer visible={isVisible}>
        <BackgroundImage src={data ? data.image?.url ?? "" : "/img/background/vision.jpg"} alt={(data && pick(data.image?.alt, lang)) || t("vision.image.alt")} />
      </ImageContainer>
      <ImageAccentLine visible={isVisible} />

      <TextContainerWrapper>
        <TextContainer visible={isVisible} textVisible={textVisible}>
          <Eyebrow visible={textVisible}>{data ? pick(data.eyebrow, lang) : t("vision.eyebrow")}</Eyebrow>

          <SectionTitle level={2} visible={textVisible}>
            {data ? renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_NBSP }) : <>{t("vision.heading.part1")}&nbsp;<em>{t("vision.heading.em")}</em></>}
          </SectionTitle>

          <TitleDivider visible={textVisible} />

          <VisionText visible={textVisible}>
            {data ? pick(data.body, lang) : t("vision.body")}
          </VisionText>

          <CornerBracket />
        </TextContainer>
      </TextContainerWrapper>
    </Container>
  );
};

export default VisionMission;