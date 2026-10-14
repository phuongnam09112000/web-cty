import styled, { keyframes } from "styled-components";

import { type } from "../../styles/typography";
/* ─── Keyframes ─────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const slowZoom = keyframes`
  from { transform: scale(1.06); }
  to   { transform: scale(1); }
`;

const revealWidth = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

/* ─── Container ──────────────────────────────── */
export const BannerContainer = styled.div<{ backgroundImage: string }>`
  width: 100%;
  height: 480px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  /* bg with slow zoom */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url(${({ backgroundImage }) => backgroundImage}) center / cover no-repeat;
    animation: ${slowZoom} 1.8s cubic-bezier(0.4, 0, 0.2, 1) both;
    z-index: 0;
  }

  /* gradient overlay */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(7, 22, 40, 0.38) 0%,
      rgba(8, 55, 100, 0.50) 50%,
      rgba(7, 22, 40, 0.65) 100%
    );
    z-index: 1;
  }

  @media (max-width: 1024px) { height: 360px; }
  @media (max-width: 768px)  { height: 280px; }
  @media (max-width: 480px)  { height: 220px; }
`;

export const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 24px;
`;

/* eyebrow breadcrumb line above title */
export const BannerEyebrow = styled.span`
  ${type.label}
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  animation: ${fadeUp} 0.5s ease 0.2s both;

  &::before, &::after {
    content: '';
    display: inline-block;
    width: 32px;
    height: 1px;
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const Title = styled.h1`
  ${type.h1}
  color: #fff;
  margin: 0 0 16px 0;
  animation: ${fadeUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.32s both;

  em {
    font-style: normal;
    background: linear-gradient(90deg, #7ec8f4, #fff, #7ec8f4);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 4s linear 1s infinite;
  }

`;

/* thin shimmer line under title */
export const TitleDivider = styled.div`
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(126, 200, 244, 0.8), transparent);
  background-size: 200% auto;
  border-radius: 2px;
  max-width: 64px;
  width: 64px;
  transform-origin: center;
  animation:
    ${revealWidth} 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.58s both,
    ${shimmer} 3s linear 1s infinite;
`;

export const Subtitle = styled.p`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.72);
  max-width: 600px;
  margin: 16px 0 0 0;
  animation: ${fadeUp} 0.6s ease 0.52s both;

  @media (max-width: 768px) { font-size: 14px; }
`;