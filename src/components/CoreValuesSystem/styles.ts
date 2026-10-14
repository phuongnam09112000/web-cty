import styled, { keyframes, css } from "styled-components";
import { Typography } from "antd";
import { IconContainerProps, ProgressDotProps } from "./types";

import { type, typeImportant } from "../../styles/typography";
const { Title } = Typography;

/* ─── Tokens ─────────────────────────────────── */
const blue      = "#0e5d95";
const blueDeep  = "#0d1b2a";
const bluePale  = "rgba(14, 93, 149, 0.07)";

/* ─── Keyframes ─────────────────────────────── */

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;


/* ─── Container ──────────────────────────────── */
export const Container = styled.div<{ backgroundColor?: string }>`
  width: 100%;
  max-width: 1300px;
  margin: 80px auto;
  padding: 0 40px 64px;
  background-color: ${(p) => p.backgroundColor || "transparent"};

  @media (max-width: 768px) { padding: 0 24px 48px; margin: 56px auto; }
  @media (max-width: 480px) { padding: 0 16px 36px; }
`;

/* ─── Page title block ───────────────────────── */
export const TitleBlock = styled.div`
  text-align: center;
  margin-bottom: 64px;

  @media (max-width: 768px) { margin-bottom: 44px; }
`;

export const TitleEyebrow = styled.span`
  ${type.label}
  text-transform: uppercase;
  color: ${blue};
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  &::before, &::after {
    content: '';
    display: inline-block;
    width: 28px;
    height: 1px;
    background: ${blue};
  }
`;

export const PageTitle = styled(Title)`
  ${typeImportant.h1}
  color: ${blueDeep} !important;
  margin: 0 0 14px 0 !important;

  em {
    font-style: normal;
    color: ${blue};
  }

`;

export const TitleDivider = styled.div`
  height: 3px;
  background: linear-gradient(90deg, ${blue}, #4da3e0, ${blue});
  background-size: 200% auto;
  border-radius: 2px;
  max-width: 56px;
  width: 56px;
  margin: 0 auto;
  animation: ${shimmer} 3s linear infinite;
`;

/* ─── Layout ─────────────────────────────────── */
export const ContentLayout = styled.div`
  display: flex;
  gap: 32px;
  align-items: stretch;

  @media (max-width: 1024px) { gap: 24px; }
  @media (max-width: 768px)  { flex-direction: column; gap: 24px; }
`;

/* ─── Image side ─────────────────────────────── */
export const ImageSide = styled.div`
  flex: 0 0 48%;
  align-self: stretch;
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) { flex: 0 0 44%; }
  @media (max-width: 768px)  { width: 100%; flex: unset; }
`;

export const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 300px;
  overflow: hidden;
  background: #dce8f2;
  box-shadow:
    0 2px 8px rgba(14, 93, 149, 0.06),
    0 16px 48px rgba(14, 93, 149, 0.12);

  /* top accent bar */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 3px;
    background: linear-gradient(90deg, ${blue}, #4da3e0);
    z-index: 5;
  }

  /* corner bracket */
  &::after {
    content: '';
    position: absolute;
    bottom: -12px; right: -12px;
    width: 44px; height: 44px;
    border-right: 2px solid #c8dce9;
    border-bottom: 2px solid #c8dce9;
    z-index: 0;
    pointer-events: none;
  }
`;


export const ImageLayer = styled.div<{ active: boolean }>`
  position: absolute;
  inset: 0;
  opacity: ${(p) => (p.active ? 1 : 0)};
  transition: opacity 0.5s ease;
  will-change: opacity;

  img {
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
`;

export const ImageControls = styled.div`
  position: absolute;
  bottom: 0; inset-inline: 0;
  padding: 32px 20px 18px;
  background: linear-gradient(to top, rgba(7,22,40,0.42) 0%, transparent 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  pointer-events: none;
`;

export const ProgressIndicators = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  pointer-events: auto;
`;

export const ProgressDotShell = styled.button`
  width: 28px; height: 6px;
  padding: 0; border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
`;

export const ProgressDotInner = styled.div<ProgressDotProps>`
  height: 6px; width: 100%;
  border-radius: 3px;
  background: ${(p) => (p.active ? "#fff" : "rgba(255,255,255,0.35)")};
  transform: ${(p) => (p.active ? "scaleX(1)" : "scaleX(0.3)")};
  transform-origin: left;
  will-change: transform, background-color;
  transition: transform 0.35s ease, background-color 0.2s ease;
`;

export const ProgressDot = ProgressDotShell;

/* ─── Cards list ─────────────────────────────── */
export const SolutionsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  /* left border rail */
  border-left: 2px solid #e0eaf3;
`;

export const SolutionCard = styled.div<{ isSelected: boolean }>`
  position: relative;
  padding: 22px 24px 22px 28px;
  display: flex;
  gap: 18px;
  cursor: pointer;
  background: #fff;
  transition: background 0.25s ease;

  /* active left bar */
  &::before {
    content: '';
    position: absolute;
    left: -2px; top: 0;
    width: 3px; height: 100%;
    background: ${blue};
    transform: scaleY(${(p) => (p.isSelected ? 1 : 0)});
    transform-origin: top;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* hover bg */
  &:hover {
    background: ${(p) => (p.isSelected ? bluePale : "rgba(14,93,149,0.03)")};
  }

  ${(p) => p.isSelected && css`background: ${bluePale};`}

  @media (max-width: 768px) { padding: 18px 18px 18px 22px; gap: 14px; }
  @media (max-width: 480px) { padding: 14px 14px 14px 18px; gap: 12px; }
`;

export const IconContainer = styled.div<IconContainerProps>`
  width: 44px; height: 44px;
  border-radius: 10px;
  background: ${(p) => (p.isActive ? "rgba(14,93,149,0.12)" : "#edf3fa")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: background-color 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  transform: ${(p) => (p.isActive ? "rotate(-6deg) scale(1.08)" : "none")};

  @media (max-width: 480px) { width: 38px; height: 38px; border-radius: 9px; }
`;

export const CustomIcon = styled.img`
  width: 24px; height: 24px;
  object-fit: contain;
  transition: filter 0.25s ease;

  /* darken icon slightly when card is active */
  ${SolutionCard}:not([class]) & { filter: none; }

  @media (max-width: 480px) { width: 20px; height: 20px; }
`;

export const SolutionContent = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
`;

export const SolutionTitle = styled(Title)`
  ${typeImportant.h4}
  margin-bottom: 8px !important;
  color: ${blueDeep} !important;

`;

export const ContentList = styled.ul`
  list-style: none;
  padding: 0; margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ContentItem = styled.li`
  ${type.small}
  position: relative;
  padding-left: 14px;
  color: #5a7080;

  &::before {
    content: '—';
    position: absolute;
    left: 0; top: 1px;
    color: ${blue};
    font-size: 10px;
    opacity: 0.6;
  }

`;

/* ─── Legacy exports ─────────────────────────── */
export const PreloadedImagesContainer = styled.div`display:none;`;
export const ImageWrapper             = styled.div``;
export const ImageSideAnimated        = ImageSide;
export const themeColor               = blue;
export const themePale                = bluePale;