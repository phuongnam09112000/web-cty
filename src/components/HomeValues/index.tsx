import React from "react";
import LazySectionComponent from "../../pages/Lazy";
import { renderHeading, HEADING_SEPARATOR_SPACE } from "../../cms/headingParts";
import { pick } from "../../cms/pick";
import type { BlockProps } from "../../cms/BlockRenderer";
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

const pad = (n: number) => String(n).padStart(2, "0");

/* Homepage values: the company philosophy introduces three value panels,
 * each fully visible (no carousel, no hover). */
const HomeValues = ({ data, lang }: BlockProps<"home-values">) => {
  return (
    <LazySectionComponent>
    <ValuesSection aria-labelledby="values-title">
      <SectionInner>
        <Intro>
          <div>
            <Eyebrow>{pick(data.eyebrow, lang)}</Eyebrow>
            <SectionHeading id="values-title">
              {renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_SPACE })}
            </SectionHeading>
          </div>
          <Philosophy>{pick(data.philosophy, lang)}</Philosophy>
        </Intro>

        <Panels>
          {data.items.map((value, index) => (
            <Panel key={index} $index={index}>
              <Numeral aria-hidden="true">{pad(index + 1)}</Numeral>
              <Body>
                <Name>{pick(value.name, lang)}</Name>
                <Description>{pick(value.description, lang)}</Description>
              </Body>
            </Panel>
          ))}
        </Panels>
      </SectionInner>
    </ValuesSection>
    </LazySectionComponent>
  );
};

export default HomeValues;
