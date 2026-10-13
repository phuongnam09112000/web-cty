import styled from "styled-components";
import { Link } from "react-router-dom";
import { theme } from "../../styles/theme";

const { colors, fonts, typeScale, layout, breakpoints } = theme;

// Split panel above this width; stacked rows at and below it
const stacked = `@media (max-width: ${breakpoints.lg}px)`;
const mobile = `@media (max-width: ${breakpoints.md}px)`;

/* ─── Section ────────────────────────────────────────────────────────────── */
// Light surface between the dark hero and the dark partner slider
export const Section = styled.section`
  background: ${colors.surfaceSubtle};
  padding: 104px 0;

  ${stacked} { padding: 88px 0; }
  ${mobile} { padding: 64px 0; }
`;

export const Inner = styled.div`
  max-width: ${layout.contentMaxWidth};
  margin: 0 auto;
  padding: 0 ${layout.pagePadding.desktop};

  ${stacked} { padding: 0 ${layout.pagePadding.tablet}; }
  ${mobile} { padding: 0 ${layout.pagePadding.mobile}; }
`;

/* ─── Heading ────────────────────────────────────────────────────────────── */
export const Header = styled.div`
  max-width: 760px;
  margin-bottom: 48px;

  ${mobile} { margin-bottom: 36px; }
`;

export const Eyebrow = styled.p`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px;
  font-family: ${fonts.display};
  font-size: ${typeScale.label.size};
  font-weight: ${typeScale.label.weight};
  letter-spacing: ${typeScale.label.tracking};
  line-height: 1.5;
  text-transform: uppercase;
  color: ${colors.primary};

  &::before {
    content: "";
    flex: 0 0 32px;
    height: 2px;
    background: ${colors.primary};
  }
`;

export const Heading = styled.h2`
  margin: 0;
  font-family: ${fonts.display};
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: ${colors.navy};
  text-wrap: balance;

  em {
    font-style: normal;
    color: ${colors.primary};
  }

  ${stacked} { font-size: 36px; }
  ${mobile} { font-size: 28px; }
`;

/* ─── Layout ─────────────────────────────────────────────────────────────── */
export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  gap: 56px;
  align-items: stretch;

  ${stacked} {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
`;

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border-bottom: 1px solid ${colors.border};

  ${stacked} {
    display: grid;
    gap: 24px;
    border-bottom: 0;
  }
`;

/* ─── One business area ──────────────────────────────────────────────────── */
// The whole row is the link: a large target on every screen size
export const AreaLink = styled(Link)<{ $active: boolean }>`
  position: relative;
  display: block;
  padding: 28px 32px 28px 36px;
  border-top: 1px solid ${colors.border};
  background: ${p => (p.$active ? colors.surface : "transparent")};
  color: inherit;
  text-decoration: none;
  transition: background 0.25s ease;

  /* Accent bar marks the row whose photograph is shown */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: -1px;
    bottom: 0;
    width: 3px;
    background: ${colors.primary};
    transform: scaleY(${p => (p.$active ? 1 : 0)});
    transform-origin: top;
    transition: transform 0.3s ease;
  }

  &:hover { color: inherit; }

  ${stacked} {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    align-items: center;
    gap: 32px;
    padding: 0;
    border-top: 0;
    background: ${colors.surface};
    box-shadow: 0 1px 2px rgba(13, 27, 42, 0.06);

    &::before { display: none; }
  }

  ${mobile} {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }
`;

export const AreaImage = styled.div`
  display: none;

  ${stacked} {
    display: block;
    position: relative;
    height: 100%;
    min-height: 260px;
    overflow: hidden;
    background: ${colors.navyDeep};

    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  ${mobile} {
    height: auto;
    min-height: 0;
    aspect-ratio: 16 / 9;
  }
`;

export const AreaBody = styled.div`
  ${stacked} { padding: 32px 32px 32px 0; }
  ${mobile} { padding: 24px 20px 28px; }
`;

export const Index = styled.span`
  display: block;
  margin-bottom: 12px;
  font-family: ${fonts.display};
  font-size: ${typeScale.label.size};
  font-weight: ${typeScale.label.weight};
  letter-spacing: ${typeScale.label.tracking};
  line-height: 1;
  color: ${colors.primary};
  font-variant-numeric: tabular-nums;
`;

export const AreaTitle = styled.h3`
  margin: 0 0 12px;
  font-family: ${fonts.display};
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: ${colors.navy};

  ${mobile} { font-size: 21px; }
`;

export const AreaDescription = styled.p`
  max-width: 46ch;
  margin: 0 0 16px;
  font-family: ${fonts.display};
  font-size: 16px;
  line-height: 1.7;
  letter-spacing: 0;
  color: ${colors.textBody};

  ${stacked} { max-width: none; }
  ${mobile} { font-size: 15px; }
`;

export const AreaCta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: ${fonts.display};
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: ${colors.primary};

  span {
    display: inline-block; /* lets the arrow move; keeps it out of the underline */
    color: inherit;
    transition: transform 0.2s ease;
  }

  ${AreaLink}:hover &,
  ${AreaLink}:focus-visible & {
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  ${AreaLink}:hover & span,
  ${AreaLink}:focus-visible & span {
    transform: translateX(4px);
  }
`;

/* ─── Desktop photograph panel ───────────────────────────────────────────── */
export const Panel = styled.div`
  position: relative;
  min-height: 560px;
  overflow: hidden;
  background: ${colors.navyDeep};

  ${stacked} { display: none; }
`;

export const PanelImage = styled.img<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${p => (p.$active ? 1 : 0)};
  transition: opacity 0.6s ease;
`;

export const PanelCaption = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 120px 40px 36px;
  background: linear-gradient(0deg, rgba(11, 23, 40, 0.88) 0%, rgba(11, 23, 40, 0) 100%);
  color: #fff;

  span {
    display: block;
    margin-bottom: 10px;
    font-family: ${fonts.display};
    font-size: ${typeScale.label.size};
    font-weight: ${typeScale.label.weight};
    letter-spacing: ${typeScale.label.tracking};
    color: ${colors.secondaryLight};
  }

  strong {
    display: block;
    max-width: 520px;
    font-family: ${fonts.display};
    font-size: 28px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: #fff;
  }
`;
