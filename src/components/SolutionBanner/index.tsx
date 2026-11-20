import React, { useEffect, useState } from "react";
import { SolutionBannerProps } from "./types";
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

type Props = Partial<SolutionBannerProps> & { data?: SolutionBannerData; lang?: Lang };

const SolutionBanner = ({ data, lang = "vi", ...legacy }: Props) => {
  const backgroundImage = data ? data.image?.url ?? "" : legacy.backgroundImage ?? "";
  const title = data ? pick(data.title, lang) : legacy.title;
  const subtitle = data ? pick(data.subtitle, lang) : legacy.subtitle;
  const buttonText = data ? pick(data.buttonLabel, lang) : legacy.buttonText;
  const eyebrow = data ? pick(data.eyebrow, lang) : "ISTT Solutions";
  const onButtonClick = data
    ? () => {
        document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    : legacy.onButtonClick;
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