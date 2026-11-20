import React from "react";
import { pick } from "../../cms/pick";
import type { AboutBannerData, Lang } from "../../cms/types";
import {
  BannerContainer,
  ContentWrapper,
  BannerEyebrow,
  Title,
  TitleDivider,
  Subtitle,
} from "./styles";

type Props = { data: AboutBannerData; lang: Lang };

const AboutBanner = ({ data, lang }: Props) => {
  const backgroundImage = data.image?.url ?? "";
  const title = pick(data.title, lang);
  const subtitle = pick(data.subtitle, lang);
  const eyebrow = pick(data.eyebrow, lang);
  const headingLevel = data.headingLevel;
  return (
    <BannerContainer backgroundImage={backgroundImage}>
      <ContentWrapper>
        {eyebrow && <BannerEyebrow>{eyebrow}</BannerEyebrow>}
        <Title as={headingLevel === 2 ? "h2" : "h1"}>{title}</Title>
        <TitleDivider />
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </ContentWrapper>
    </BannerContainer>
  );
};

export default AboutBanner;