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
import { pick } from "../../cms/pick";
import { HEADING_SEPARATOR_NBSP, renderHeading } from "../../cms/headingParts";
import type { Lang, CoreValuesData } from "../../cms/types";


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

type Props = { data?: CoreValuesData; lang?: Lang };

const CoreValues = ({ data, lang = "vi" }: Props) => {
  const { t } = useTranslation();
  const values = data
    ? data.items.map((item) => ({
        iconSrc: item.icon?.url ?? "",
        iconAlt: pick(item.icon?.alt, lang),
        title: pick(item.title, lang),
        description: pick(item.description, lang),
      }))
    : valuesData.map((value) => ({
        iconSrc: value.iconSrc,
        iconAlt: "",
        title: t(value.title),
        description: t(value.description),
      }));

  return (
    <Container>
      {/* Header */}
      <Fade direction="up" triggerOnce duration={700}>
        <HeaderWrapper>
          <Eyebrow>{data ? pick(data.eyebrow, lang) : t("corevalues.eyebrow")}</Eyebrow>
          <SectionTitle level={2}>
            {data ? renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_NBSP }) : <>{t("corevalues.heading.part1")}&nbsp;<em>{t("corevalues.heading.em")}</em></>}
          </SectionTitle>
          <TitleUnderline />
        </HeaderWrapper>
      </Fade>

      {/* Cards Grid */}
      <ValuesContainer>
        {values.map((value, index) => (
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
                {String(values.length).padStart(2, "0")}
              </CardNumber>

              <IconContainer>
                <IconImage src={value.iconSrc} alt={value.iconAlt || value.title} />
              </IconContainer>

              <ValueTitle level={3}>{value.title}</ValueTitle>
              <Divider />
              <ValueDescription>{value.description}</ValueDescription>

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