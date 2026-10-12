import React from "react";
import { AboutBannerProps } from "./types";
import {
  BannerContainer,
  ContentWrapper,
  BannerEyebrow,
  Title,
  TitleDivider,
  Subtitle,
} from "./styles";

const AboutBanner: React.FC<AboutBannerProps> = ({
  backgroundImage,
  title,
  subtitle,
  eyebrow,
}) => {
  return (
    <BannerContainer backgroundImage={backgroundImage}>
      <ContentWrapper>
        {eyebrow && <BannerEyebrow>{eyebrow}</BannerEyebrow>}
        <Title>{title}</Title>
        <TitleDivider />
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </ContentWrapper>
    </BannerContainer>
  );
};

export default AboutBanner;