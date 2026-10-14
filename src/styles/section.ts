/* Shared building blocks for the redesigned homepage sections: content
 * column, eyebrow label, section heading and arrow link. Keeping them in one
 * place keeps widths, type and link styles identical from section to section. */
import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import { theme } from "./theme";

import { type } from "./typography";
const { colors, layout, breakpoints, homeScale } = theme;

export const stackedMedia = `@media (max-width: ${breakpoints.lg}px)`;
export const mobileMedia = `@media (max-width: ${breakpoints.md}px)`;

/* Vertical rhythm shared by every section (desktop / tablet / mobile) */
export const sectionPadding = css`
  padding: 112px 0;

  ${stackedMedia} { padding: 88px 0; }
  ${mobileMedia} { padding: 64px 0; }
`;

export const SectionInner = styled.div`
  max-width: ${layout.contentMaxWidth};
  margin: 0 auto;
  padding: 0 ${layout.pagePadding.desktop};

  ${stackedMedia} { padding: 0 ${layout.pagePadding.tablet}; }
  ${mobileMedia} { padding: 0 ${layout.pagePadding.mobile}; }
`;

export const Eyebrow = styled.p<{ $onDark?: boolean }>`
  ${type.label}
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px;
  text-transform: uppercase;
  color: ${p => (p.$onDark ? colors.secondaryLight : colors.primary)};

  &::before {
    content: "";
    flex: 0 0 32px;
    height: 2px;
    background: currentColor;
  }
`;

export const SectionHeading = styled.h2<{ $onDark?: boolean }>`
  ${type.h2}
  margin: 0;
  color: ${p => (p.$onDark ? colors.white : colors.navy)};
  text-wrap: balance;

  em {
    font-style: normal;
    color: ${p => (p.$onDark ? colors.secondaryLight : colors.primary)};
  }

  /* Homepage section headings run larger than the shared h2 */
  font-size: ${homeScale.section.desktop};
  ${stackedMedia} { font-size: ${homeScale.section.tablet}; }
  ${mobileMedia} { font-size: ${homeScale.section.mobile}; }
`;

/* Text link with a trailing arrow ("Learn more →") */
export const ArrowLink = styled(Link)<{ $onDark?: boolean }>`
  ${type.button}
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  color: ${p => (p.$onDark ? colors.white : colors.primary)};
  text-decoration: none;

  span {
    display: inline-block;
    color: inherit;
    transition: transform 0.2s ease;
  }

  &:hover,
  &:focus-visible {
    color: ${p => (p.$onDark ? colors.white : colors.primary)};
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  &:hover span,
  &:focus-visible span { transform: translateX(4px); }
`;
