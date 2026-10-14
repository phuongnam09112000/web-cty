import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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

const Mission: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible,   setIsVisible]   = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const missionPoints = [
    "mission.point.1",
    "mission.point.2",
    "mission.point.3",
  ];

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
        <BackgroundImage src="/img/background/mission.jpg" alt={t("mission.image.alt")} />
      </ImageContainer>
      <ImageAccentLine visible={isVisible} />

      <TextContainerWrapper>
        <TextContainer visible={isVisible} textVisible={textVisible}>
          <Eyebrow visible={textVisible}>{t("mission.eyebrow")}</Eyebrow>

          <SectionTitle level={2} visible={textVisible}>
            {t("mission.heading.part1")}&nbsp;<em>{t("mission.heading.em")}</em>
          </SectionTitle>

          <TitleDivider visible={textVisible} />

          <MissionList>
            {missionPoints.map((key, index) => (
              <MissionItem
                key={index}
                visible={textVisible}
                delay={0.75 + index * 0.12}
              >
                <MissionNumber>
                  {String(index + 1).padStart(2, "0")}
                </MissionNumber>
                <MissionText>{t(key)}</MissionText>
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