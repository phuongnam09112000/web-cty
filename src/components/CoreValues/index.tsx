import React from "react";
import { useTranslation } from "react-i18next";
import { Fade } from "react-awesome-reveal";
import {
  Container,
  HeaderWrapper,
  Eyebrow,
  SectionTitle,
  TitleUnderline,
  ValuesContainer,
  ValueCard,
  CardNumber,
  IconContainer,
  IconImage,
  ValueTitle,
  Divider,
  ValueDescription,
  ArrowIcon,
} from "./styles";
import { valuesData } from "./data";

const ArrowSvg = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2.5 11.5L11.5 2.5M11.5 2.5H5.5M11.5 2.5V8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CoreValues: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      {/* Header */}
      <Fade direction="up" triggerOnce duration={700}>
        <HeaderWrapper>
          <Eyebrow>{t("corevalues.eyebrow")}</Eyebrow>
          <SectionTitle level={2}>
            {t("corevalues.heading.part1")}&nbsp;<em>{t("corevalues.heading.em")}</em>
          </SectionTitle>
          <TitleUnderline />
        </HeaderWrapper>
      </Fade>

      {/* Cards Grid */}
      <ValuesContainer>
        {valuesData.map((value, index) => (
          <Fade
            key={index}
            direction="up"
            triggerOnce
            duration={600}
            delay={index * 120}
          >
            <ValueCard>
              <CardNumber>
                {String(index + 1).padStart(2, "0")} —{" "}
                {String(valuesData.length).padStart(2, "0")}
              </CardNumber>

              <IconContainer>
                <IconImage src={value.iconSrc} alt={t(value.title)} />
              </IconContainer>

              <ValueTitle level={3}>{t(value.title)}</ValueTitle>
              <Divider />
              <ValueDescription>{t(value.description)}</ValueDescription>

              <ArrowIcon>
                <ArrowSvg />
              </ArrowIcon>
            </ValueCard>
          </Fade>
        ))}
      </ValuesContainer>
    </Container>
  );
};

export default CoreValues;