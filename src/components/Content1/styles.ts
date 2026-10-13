import styled, { css, keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { theme } from "../../styles/theme";

const { colors, fonts, typeScale, overlays, layout, breakpoints } = theme;

const tablet = `@media (max-width: ${breakpoints.lg}px)`;
const mobile = `@media (max-width: ${breakpoints.md}px)`;
const small = `@media (max-width: ${breakpoints.xs}px)`;

/* ─── Section ────────────────────────────────────────────────────────────── */
// Full-bleed hero that runs underneath the (transparent) fixed header.
export const HeroSection = styled.section`
  position: relative;
  width: 100%;
  height: clamp(640px, 88vh, 880px);
  overflow: hidden;
  background: ${colors.navyDeep};
  color: #fff;

  ${tablet} { height: clamp(580px, 80vh, 760px); }
  ${mobile} { height: clamp(560px, 88vh, 720px); }

  /* Slides fill the section; Swiper's own container gets the full height */
  .swiper { width: 100%; height: 100%; }
`;

/* ─── Slides ─────────────────────────────────────────────────────────────── */
export const Slides = styled.div`
  position: absolute;
  inset: 0;
`;

// Decorative photograph. The active slide drifts slowly (disabled for
// reduced motion).
export const SlideImage = styled.img<{ $active: boolean }>`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(${p => (p.$active ? 1.06 : 1)});
  transition: transform 7s linear;

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    transition: none;
  }
`;

// Dark gradients that keep the white text, header and controls legible
export const Scrim = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: ${overlays.headerScrim} top / 100% 180px no-repeat, ${overlays.heroSide};

  ${mobile} {
    background: ${overlays.headerScrim} top / 100% 160px no-repeat, ${overlays.heroBottom};
  }
`;

/* ─── Text block ─────────────────────────────────────────────────────────── */
export const Inner = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  max-width: ${layout.contentMaxWidth};
  margin: 0 auto;
  padding: ${layout.headerHeight} ${layout.pagePadding.desktop} 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  ${tablet} { padding: ${layout.headerHeight} ${layout.pagePadding.tablet} 132px; }
  ${mobile} {
    padding: ${layout.headerHeightMobile} ${layout.pagePadding.mobile} 120px;
    justify-content: flex-end;
  }
`;

export const Content = styled.div`
  max-width: 840px;
`;

export const Eyebrow = styled.p`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px;
  font-family: ${fonts.display};
  font-size: ${typeScale.label.size};
  font-weight: ${typeScale.label.weight};
  letter-spacing: ${typeScale.label.tracking};
  line-height: 1.5;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);

  &::before {
    content: "";
    flex: 0 0 32px;
    height: 2px;
    background: ${colors.secondary};
  }

  ${small} { font-size: 12px; }
`;

export const Title = styled.h1`
  margin: 0 0 24px;
  font-family: ${fonts.display};
  font-size: ${typeScale.display.desktop};
  font-weight: ${typeScale.display.weight};
  line-height: ${typeScale.display.lineHeight};
  letter-spacing: ${typeScale.display.tracking};
  color: #fff;
  text-transform: none;
  overflow-wrap: break-word;
  /* Even line lengths; Vietnamese headlines run ~10% longer than English */
  text-wrap: balance;

  ${tablet} { font-size: ${typeScale.display.tablet}; }
  ${mobile} { font-size: ${typeScale.display.mobile}; margin-bottom: 16px; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// Supporting line: the existing tagline of the current slide
export const Tagline = styled.p`
  min-height: calc(2 * ${typeScale.lead.lineHeight}em);
  max-width: 620px;
  margin: 0 0 40px;
  font-family: ${fonts.display};
  font-size: ${typeScale.lead.desktop};
  font-weight: 400;
  line-height: ${typeScale.lead.lineHeight};
  letter-spacing: 0;
  color: rgba(255, 255, 255, 0.9);
  animation: ${fadeIn} 0.5s ease both;

  ${tablet} { font-size: ${typeScale.lead.tablet}; }
  ${mobile} { font-size: ${typeScale.lead.mobile}; margin-bottom: 28px; }
`;

/* ─── Calls to action ────────────────────────────────────────────────────── */
export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  ${small} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const actionBase = css<{ $variant: "primary" | "secondary" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 28px;
  border-radius: 2px;
  font-family: ${fonts.display};
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  ${p =>
    p.$variant === "primary"
      ? css`
          background: ${colors.primary};
          border: 1px solid ${colors.primary};
          color: #fff;
          &:hover { background: ${colors.primaryDark}; border-color: ${colors.primaryDark}; color: #fff; }
        `
      : css`
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.85);
          color: #fff;
          &:hover { background: #fff; border-color: #fff; color: ${colors.navy}; }
        `}

  span[aria-hidden] { transition: transform 0.2s ease; }
  &:hover span[aria-hidden] { transform: translateX(3px); }

  ${mobile} { min-height: 48px; padding: 0 22px; font-size: 14px; }
`;

export const ActionLink = styled(Link)<{ $variant: "primary" | "secondary" }>`
  ${actionBase}
`;

export const ActionAnchor = styled.a<{ $variant: "primary" | "secondary" }>`
  ${actionBase}
`;

/* ─── Slideshow controls ─────────────────────────────────────────────────── */
export const Controls = styled.div`
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  bottom: 40px;
  max-width: ${layout.contentMaxWidth};
  margin: 0 auto;
  padding: 0 ${layout.pagePadding.desktop};
  display: flex;
  align-items: center;
  gap: 20px;
  color: #fff;

  ${tablet} { padding: 0 ${layout.pagePadding.tablet}; }
  ${mobile} { padding: 0 ${layout.pagePadding.mobile}; bottom: 28px; gap: 14px; }
`;

export const Counter = styled.p`
  margin: 0;
  min-width: 64px;
  font-family: ${fonts.display};
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.08em;
  line-height: 1;
  color: rgba(255, 255, 255, 0.75);
  font-variant-numeric: tabular-nums;

  strong { color: #fff; font-weight: 700; }
`;

export const Segments = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const fill = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

// Each segment is a 44×32 hit area around a 2px progress line
export const Segment = styled.button<{ $active: boolean; $running: boolean; $duration: number }>`
  appearance: none;
  border: 0;
  margin: 0;
  padding: 15px 0;
  width: 44px;
  background: none;
  cursor: pointer;

  ${mobile} { width: 32px; }

  span {
    position: relative;
    display: block;
    height: 2px;
    background: rgba(255, 255, 255, 0.35);
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: #fff;
      transform-origin: left center;
      transform: scaleX(${p => (p.$active ? 1 : 0)});
      ${p =>
        p.$active &&
        p.$running &&
        css`
          animation: ${fill} ${p.$duration}ms linear both;
        `}
    }
  }

  &:hover span { background: rgba(255, 255, 255, 0.6); }
`;

export const PauseButton = styled.button`
  appearance: none;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 2px;
  background: rgba(11, 23, 40, 0.25);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover { background: rgba(255, 255, 255, 0.16); border-color: #fff; }

  svg { width: 14px; height: 14px; fill: currentColor; }
`;
