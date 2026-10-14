import styled from "styled-components";
import { theme } from "../../styles/theme";
import { sectionPadding, stackedMedia, mobileMedia } from "../../styles/section";

import { type } from "../../styles/typography";
const { colors, fonts } = theme;

/* ─── Section ────────────────────────────────────────────────────────────── */
// Light surface between the navy services and the white partner field
export const ValuesSection = styled.section`
  ${sectionPadding}
  background: ${colors.surfaceSubtle};
`;

/* ─── Intro: heading beside the company philosophy ───────────────────────── */
export const Intro = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 72px;
  align-items: end;
  margin-bottom: 64px;

  ${stackedMedia} {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
    margin-bottom: 48px;
  }

  ${mobileMedia} { margin-bottom: 36px; }
`;

export const Philosophy = styled.p`
  ${type.lead}
  position: relative;
  margin: 0;
  padding-left: 32px;
  border-left: 3px solid ${colors.primary};
  color: ${colors.navy};

  ${mobileMedia} {
    padding-left: 20px;
    font-size: 18px;
  }
`;

/* ─── Three panels on one white band, divided by hairlines ───────────────── */
export const Panels = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  background: ${colors.surface};
  box-shadow: 0 1px 2px rgba(13, 27, 42, 0.05);

  ${stackedMedia} { grid-template-columns: minmax(0, 1fr); }
`;

// Accent colours step through the brand blues: a rhythm, not a ranking
const accents = [colors.secondary, colors.primary, colors.navy];

export const Panel = styled.li<{ $index: number }>`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  padding: 44px 40px 48px;

  & + & { border-left: 1px solid ${colors.border}; }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${p => accents[p.$index % accents.length]};
  }

  ${stackedMedia} {
    display: grid;
    grid-template-columns: 96px minmax(0, 4fr) minmax(0, 5fr);
    gap: 0 32px;
    align-items: start;
    min-height: 0;
    padding: 40px 36px;

    & + & {
      border-left: 0;
      border-top: 1px solid ${colors.border};
    }

    &::before {
      top: 0;
      bottom: 0;
      right: auto;
      width: 4px;
      height: auto;
    }
  }

  ${mobileMedia} {
    display: flex;
    padding: 32px 24px 36px 28px;
  }
`;

export const Numeral = styled.span`
  display: block;
  font-family: ${fonts.display};
  font-size: 88px;
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: ${colors.primary};
  font-variant-numeric: tabular-nums;

  ${stackedMedia} { font-size: 64px; }
  ${mobileMedia} { font-size: 48px; margin-bottom: 20px; }
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: 72px;

  ${stackedMedia} {
    grid-column: 2 / 4;
    display: grid;
    grid-template-columns: minmax(0, 4fr) minmax(0, 5fr);
    gap: 32px;
    margin-top: 0;
  }

  ${mobileMedia} {
    display: block;
  }
`;

export const Name = styled.h3`
  ${type.h2}
  margin: 0;
  color: ${colors.navy};
  overflow-wrap: break-word;

  /* short rule under the name */
  &::after {
    content: "";
    display: block;
    width: 40px;
    height: 2px;
    margin: 20px 0 18px;
    background: ${colors.primary};
  }

  ${stackedMedia} {
    font-size: 32px;
    &::after { margin-bottom: 0; }
  }

  ${mobileMedia} {
    font-size: 28px;
    &::after { margin: 16px 0 14px; }
  }
`;

export const Description = styled.p`
  margin: 0;
  font-family: ${fonts.display};
  font-size: 17px;
  line-height: 1.7;
  letter-spacing: 0;
  color: ${colors.textBody};

  ${stackedMedia} { padding-top: 6px; }
  ${mobileMedia} { font-size: 16px; padding-top: 0; }
`;
