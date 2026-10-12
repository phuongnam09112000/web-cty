import styled, { keyframes } from "styled-components";

/* ─── Keyframes ─────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const revealWidth = keyframes`
  from { width: 0; }
  to   { width: 72px; }
`;

const slowZoom = keyframes`
  from { transform: scale(1.06); }
  to   { transform: scale(1); }
`;

/* ─── Banner container ───────────────────────── */
export const BannerContainer = styled.div<{ backgroundImage: string }>`
  width: 100%;
  height: 680px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  /* bg image layer — slow zoom on load */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url(${({ backgroundImage }) => backgroundImage}) center / cover
      no-repeat;
    animation: ${slowZoom} 1.8s cubic-bezier(0.4, 0, 0.2, 1) both;
    z-index: 0;
  }

  /* gradient overlay */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(7, 22, 40, 0.42) 0%,
      rgba(8, 55, 100, 0.52) 50%,
      rgba(7, 22, 40, 0.7) 100%
    );
    z-index: 1;
  }

  .content-wrapper {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 900px;
    width: 100%;
    padding: 0 32px;
    text-align: center;
  }

  @media (max-width: 1024px) {
    height: 540px;
  }
  @media (max-width: 768px) {
    height: 440px;
  }
  @media (max-width: 480px) {
    height: 380px;
  }
`;

/* ─── Eyebrow above title ────────────────────── */
export const BannerEyebrow = styled.span`
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  opacity: 0;

  &::before,
  &::after {
    content: "";
    display: inline-block;
    width: 36px;
    height: 1px;
    background: rgba(255, 255, 255, 0.35);
  }

  &.visible {
    animation: ${fadeUp} 0.6s ease 0.2s both;
  }
`;

/* ─── Title ──────────────────────────────────── */
export const Title = styled.h1`
  font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
  font-size: 60px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0 0 10px 0;
  opacity: 0;

  em {
    font-style: italic;
    background: linear-gradient(90deg, #7ec8f4, #fff, #7ec8f4);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 4s linear infinite;
  }

  &.visible {
    animation: ${fadeUp} 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.35s both;
  }

  @media (max-width: 1024px) {
    font-size: 46px;
  }
  @media (max-width: 768px) {
    font-size: 34px;
  }
  @media (max-width: 480px) {
    font-size: 26px;
  }
`;

/* thin shimmer line under title */
export const TitleDivider = styled.div`
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(126, 200, 244, 0.8),
    transparent
  );
  background-size: 200% auto;
  border-radius: 2px;
  margin-bottom: 24px;
  max-width: 72px;
  width: 0;
  opacity: 0;

  &.visible {
    opacity: 1;
    animation:
      ${revealWidth} 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards,
      ${shimmer} 3s linear 1.1s infinite;
  }
`;

/* ─── Subtitle ───────────────────────────────── */
export const Subtitle = styled.p`
  font-family: "Be Vietnam Pro", "Segoe UI", sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.78);
  max-width: 700px;
  margin: 0 0 36px 0;
  opacity: 0;

  &.visible {
    animation: ${fadeUp} 0.7s ease 0.55s both;
  }

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 28px;
  }
`;

/* ─── Button ─────────────────────────────────── */
export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  color: #fff;
  padding: 14px 32px;
  font-family: "JetBrains Mono", "Courier New", monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transition: border-color 0.3s ease;

  /* ink-fill on hover */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: #fff;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  span {
    position: relative;
    z-index: 1;
  }

  &::after {
    content: "→";
    font-size: 14px;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #0e5d95;
    border-color: #fff;
    &::before {
      transform: scaleX(1);
    }
    &::after {
      transform: translateX(4px);
    }
  }

  &.visible {
    animation: ${fadeUp} 0.7s ease 0.72s both;
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 10px;
  }
`;
