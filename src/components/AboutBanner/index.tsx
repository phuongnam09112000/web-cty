import React from "react";
import { AboutBannerProps } from "./types";
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

type Props = Partial<AboutBannerProps> & { data?: AboutBannerData; lang?: Lang };

const AboutBanner = ({ data, lang = "vi", ...legacy }: Props) => {
  const backgroundImage = data ? data.image?.url ?? "" : legacy.backgroundImage ?? "";
  const title = data ? pick(data.title, lang) : legacy.title;
  const subtitle = data ? pick(data.subtitle, lang) : legacy.subtitle;
  const eyebrow = data ? pick(data.eyebrow, lang) : legacy.eyebrow;
  const headingLevel = data ? data.headingLevel : legacy.headingLevel ?? 1;
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