import React, { useEffect, useState } from "react";
import { pick } from "../../cms/pick";
import type { Lang, SolutionBannerData } from "../../cms/types";
import {
  BannerContainer,
  BannerEyebrow,
  Title,
  TitleDivider,
  Subtitle,
  Button,
} from "./styles";

type Props = { data: SolutionBannerData; lang: Lang };

const SolutionBanner = ({ data, lang }: Props) => {
  const backgroundImage = data.image?.url ?? "";
  const title = pick(data.title, lang);
  const subtitle = pick(data.subtitle, lang);
  const buttonText = pick(data.buttonLabel, lang);
  const eyebrow = pick(data.eyebrow, lang);
  const onButtonClick = () => {
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
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
        <BannerEyebrow className={vis}>{eyebrow}</BannerEyebrow>

        <Title as="h2" className={vis}>{title}</Title>

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