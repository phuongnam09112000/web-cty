import React from "react";
import { useTranslation } from "react-i18next";
import { Eyebrow, SectionHeading, SectionInner } from "../../styles/section";
import {
  Body,
  Description,
  Intro,
  Name,
  Numeral,
  Panel,
  Panels,
  Philosophy,
  ValuesSection,
} from "./styles";

// The values and wording previously shown in the homepage values slider
const values = [
  { name: "Commitment", description: "Our unwavering commitment to excellence." },
  { name: "Quality", description: "Delivering the highest quality in everything we do." },
  { name: "Collaboration", description: "Working together to achieve greatness." },
];

const pad = (n: number) => String(n).padStart(2, "0");

/* Homepage values: the company philosophy introduces three value panels,
 * each fully visible (no carousel, no hover). */
const HomeValues: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ValuesSection aria-labelledby="values-title">
      <SectionInner>
        <Intro>
          <div>
            <Eyebrow>{t("corevalues.eyebrow")}</Eyebrow>
            <SectionHeading id="values-title">
              {t("corevalues.heading.part1")} <em>{t("corevalues.heading.em")}</em>
            </SectionHeading>
          </div>
          <Philosophy>
            {t(
              "Guided by our philosophy, “United Efforts - Shared Success”, we build lasting partnerships and drive progress across industries."
            )}
          </Philosophy>
        </Intro>

        <Panels>
          {values.map((value, index) => (
            <Panel key={value.name} $index={index}>
              <Numeral aria-hidden="true">{pad(index + 1)}</Numeral>
              <Body>
                <Name>{t(value.name)}</Name>
                <Description>{t(value.description)}</Description>
              </Body>
            </Panel>
          ))}
        </Panels>
      </SectionInner>
    </ValuesSection>
  );
};

export default HomeValues;
