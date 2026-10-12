import React, { useEffect, useState } from "react";
import { SolutionBannerProps } from "./types";
import {
  BannerContainer,
  BannerEyebrow,
  Title,
  TitleDivider,
  Subtitle,
  Button,
} from "./styles";

const SolutionBanner: React.FC<SolutionBannerProps> = ({
  backgroundImage,
  title,
  subtitle,
  buttonText,
  onButtonClick,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // small tick to trigger CSS animations after mount
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const vis = visible ? "visible" : "";

  return (
    <BannerContainer backgroundImage={backgroundImage}>
      <div className="content-wrapper">
        <BannerEyebrow className={vis}>ISTT Solutions</BannerEyebrow>

        <Title className={vis}>{title}</Title>

        <TitleDivider className={vis} />

        {subtitle && <Subtitle className={vis}>{subtitle}</Subtitle>}

        {buttonText && (
          <Button className={vis} onClick={onButtonClick}>
            <span>{buttonText}</span>
          </Button>
        )}
      </div>
    </BannerContainer>
  );
};

export default SolutionBanner;