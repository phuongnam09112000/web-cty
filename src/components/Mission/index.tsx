import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { pick } from "../../cms/pick";
import { HEADING_SEPARATOR_NBSP, renderHeading } from "../../cms/headingParts";
import type { Lang, MissionData } from "../../cms/types";
import {
  BackgroundImage,
  Container,
  CornerBracket,
  Eyebrow,
  ImageAccentLine,
  ImageContainer,
  MissionItem,
  MissionList,
  MissionNumber,
  MissionText,
  SectionTitle,
  TextContainer,
  TextContainerWrapper,
  TitleDivider,
} from "./styles";

type Props = { data: MissionData; lang: Lang };

const Mission = ({ data, lang }: Props) => {
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
        <BackgroundImage src={data.image?.url ?? ""} alt={pick(data.image?.alt, lang) || t("mission.image.alt")} />
      </ImageContainer>
      <ImageAccentLine visible={isVisible} />

      <TextContainerWrapper>
        <TextContainer visible={isVisible} textVisible={textVisible}>
          <Eyebrow visible={textVisible}>{pick(data.eyebrow, lang)}</Eyebrow>

          <SectionTitle level={2} visible={textVisible}>
            {renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_NBSP })}
          </SectionTitle>

          <TitleDivider visible={textVisible} />

          <MissionList>
            {data.points.map((point) => pick(point, lang)).map((text, index) => (
              <MissionItem
                key={index}
                visible={textVisible}
                delay={0.75 + index * 0.12}
              >
                <MissionNumber>
                  {String(index + 1).padStart(2, "0")}
                </MissionNumber>
                <MissionText>{text}</MissionText>
              </MissionItem>
            ))}
          </MissionList>

          <CornerBracket />
        </TextContainer>
      </TextContainerWrapper>
    </Container>
  );
};

export default Mission;