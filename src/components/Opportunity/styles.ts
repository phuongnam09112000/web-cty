import styled, { keyframes } from "styled-components";

import { type } from "../../styles/typography";
import { theme } from "../../styles/theme";
/* ─── Keyframes ─────────────────────────────── */
const fadeRight = keyframes`
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
`;


const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const revealWidth = keyframes`
  from { width: 0; }
  to   { width: 56px; }
`;

const floatY = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
`;

/* ─── Outer / Inner ──────────────────────────── */
export const OuterContainer = styled.div`
  width: 100%;
  background: #f5f8fb;
  padding: 100px 0;
  overflow: hidden;
  position: relative;

  /* subtle dot-grid background */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#d0dfe9 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.45;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 72px 0;
  }
`;

export const InnerContainer = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;

  @media (max-width: 768px) { padding: 0 24px; }
  @media (max-width: 480px) { padding: 0 16px; }
`;

/* ─── Image side ─────────────────────────────── */
export const ImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  img {
    max-width: 380px;
    width: 100%;
    height: auto;
    opacity: 0;
    filter: drop-shadow(0 24px 48px rgba(14, 93, 149, 0.14));
    position: relative;
    z-index: 1;
  }

  &.visible img {
    animation:
      ${fadeRight} 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both,
      ${floatY} 6s ease-in-out 1s infinite;
  }

  /* decorative blob behind image */
  &::before {
    content: '';
    position: absolute;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(14,93,149,0.08) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
  }

  @media (max-width: 768px) {
    img { max-width: 260px; }
  }
`;

/* ─── Content side ───────────────────────────── */
export const ContentWrapper = styled.div`
  padding: 0 12px 0 24px;

  @media (max-width: 768px) { padding: 0; }
`;

export const Subtitle = styled.div`
  ${type.label}
  text-transform: uppercase;
  color: #0e5d95;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  opacity: 0;

  &::before {
    content: '';
    display: inline-block;
    width: 28px;
    height: 1px;
    background: #0e5d95;
    flex-shrink: 0;
  }

  &.visible {
    animation: ${fadeUp} 0.5s ease 0.2s both;
  }
`;

export const Title = styled.h2`
  ${type.h2}
  color: #0d1b2a;
  margin: 0 0 12px 0;
  opacity: 0;

  em {
    font-style: normal;
    color: #0e5d95;
  }

  &.visible {
    animation: ${fadeUp} 0.6s ease 0.32s both;
  }

`;

export const TitleDivider = styled.div`
  height: 3px;
  background: linear-gradient(90deg, #0e5d95, #4da3e0, #0e5d95);
  background-size: 200% auto;
  border-radius: 2px;
  margin-bottom: 28px;
  max-width: 56px;
  width: 0;
  opacity: 0;
  transition: opacity 0s;

  &.visible {
    opacity: 1;
    animation:
      ${revealWidth} 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.48s forwards,
      ${shimmer} 3s linear 1s infinite;
  }
`;

export const Description = styled.div`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 15px;
  line-height: 1.85;
  color: #4a6070;
  opacity: 0;

  &.visible {
    animation: ${fadeUp} 0.6s ease 0.52s both;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 1.75;
  }
`;

/* stat strip */
export const StatStrip = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid #d8e8f2;
  opacity: 0;

  &.visible {
    animation: ${fadeUp} 0.6s ease 0.68s both;
  }

  @media (max-width: 480px) { gap: 20px; flex-wrap: wrap; }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// Deliberately larger than body text: a figure, not a heading
export const StatNumber = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 28px;
  font-weight: 700;
  color: #0e5d95;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

export const StatLabel = styled.span`
  ${type.label}
  text-transform: uppercase;
  color: #5a7080; /* ≥ 4.5:1 on white and the light section backgrounds */
`;

export const Bold = styled.span`
  font-weight: 700;
  color: #0d1b2a;
`;