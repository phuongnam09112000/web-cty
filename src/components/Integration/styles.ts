import styled, { keyframes, css } from "styled-components";
import { Typography } from "antd";
import { AnimatedProps } from "./types";

const { Title, Paragraph } = Typography;

/* ─── Keyframes ─────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeRight = keyframes`
  from { opacity: 0; transform: translateX(48px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const fadeLeft = keyframes`
  from { opacity: 0; transform: translateX(-48px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const revealWidth = keyframes`
  from { width: 0; }
  to   { width: 56px; }
`;

const scaleIn = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

/* ─── Page wrapper ───────────────────────────── */
export const Container = styled.div<AnimatedProps>`
  position: relative;
  width: 100%;
  max-width: 1300px;
  margin: 80px auto;
  padding: 0 40px;

  @media (max-width: 768px) {
    margin: 56px auto;
    padding: 0 24px;
  }

  @media (max-width: 480px) {
    margin: 40px auto;
    padding: 0 16px;
  }
`;

/* ─── Page title block ───────────────────────── */
export const TitleBlock = styled.div`
  text-align: center;
  margin-bottom: 72px;

  @media (max-width: 768px) { margin-bottom: 52px; }
  @media (max-width: 480px) { margin-bottom: 40px; }
`;

export const TitleEyebrow = styled.span<AnimatedProps>`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #0e5d95;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  opacity: 0;

  &::before, &::after {
    content: '';
    display: inline-block;
    width: 28px;
    height: 1px;
    background: #0e5d95;
  }

  ${({ visible }) =>
    visible &&
    css`animation: ${fadeUp} 0.5s ease 0.1s both;`}
`;

export const PageTitle = styled(Title)<AnimatedProps>`
  font-family: 'Lora', 'Georgia', serif !important;
  font-size: 48px !important;
  font-weight: 800 !important;
  line-height: 1.15 !important;
  letter-spacing: -0.025em !important;
  color: #0d1b2a !important;
  margin: 0 0 16px 0 !important;
  opacity: 0;

  em {
    font-style: italic;
    color: #0e5d95;
  }

  ${({ visible }) =>
    visible &&
    css`animation: ${fadeUp} 0.6s ease 0.2s both;`}

  @media (max-width: 768px) { font-size: 34px !important; }
  @media (max-width: 480px) { font-size: 26px !important; }
`;

export const PageTitleDivider = styled.div<AnimatedProps>`
  height: 3px;
  background: linear-gradient(90deg, #0e5d95, #4da3e0, #0e5d95);
  background-size: 200% auto;
  border-radius: 2px;
  max-width: 56px;
  width: 0;
  margin: 0 auto;
  opacity: 0;

  ${({ visible }) =>
    visible &&
    css`
      opacity: 1;
      animation:
        ${revealWidth} 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.38s forwards,
        ${shimmer} 3s linear 0.9s infinite;
    `}
`;

/* ─── Content section ────────────────────────── */
export const ContentSection = styled.div`
  position: relative;
  min-height: 500px;
  display: flex;
  align-items: center;

  @media (max-width: 900px) {
    flex-direction: column;
    min-height: unset;
    gap: 0;
  }
`;

/* ─── Image — right side ─────────────────────── */
export const ImageContainer = styled.div<AnimatedProps>`
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
  min-height: 500px;
  overflow: hidden;
  opacity: 0;

  ${({ visible }) =>
    visible &&
    css`animation: ${fadeRight} 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.15s both;`}

  /* vignette on left edge */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(13,27,42,0.30) 0%, transparent 45%);
    z-index: 1;
    pointer-events: none;
  }

  @media (max-width: 900px) {
    position: relative;
    right: unset;
    width: 100%;
    min-height: 300px;
    height: 300px;

    &::before {
      background: linear-gradient(to top, rgba(13,27,42,0.50) 0%, transparent 55%);
    }
  }

  @media (max-width: 480px) {
    height: 230px;
    min-height: 230px;
  }
`;

export const BackgroundImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  ${ImageContainer}:hover & {
    transform: scale(1.04);
  }
`;

/* thin accent line on right edge */
export const ImageAccent = styled.div<AnimatedProps>`
  position: absolute;
  top: 10%;
  right: 0;
  width: 3px;
  height: 80%;
  background: linear-gradient(to bottom, transparent, #0e5d95, transparent);
  z-index: 2;
  opacity: 0;

  ${({ visible }) =>
    visible &&
    css`animation: ${fadeUp} 0.6s ease 0.75s both;`}

  @media (max-width: 900px) { display: none; }
`;

/* ─── Text card — left side ──────────────────── */
export const TextContainerWrapper = styled.div`
  position: relative;
  z-index: 5;
  width: 52%;
  flex-shrink: 0;

  @media (max-width: 900px) {
    width: calc(100% - 32px);
    margin: -72px auto 0;
  }

  @media (max-width: 480px) {
    width: calc(100% - 24px);
    margin-top: -56px;
  }
`;

export const TextContainer = styled.div<AnimatedProps & { textVisible: boolean }>`
  background: #fff;
  padding: 48px 44px;
  position: relative;
  opacity: 0;
  box-shadow:
    0 2px 8px rgba(14, 93, 149, 0.06),
    0 16px 48px rgba(14, 93, 149, 0.10);

  /* left accent bar */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px;
    height: 100%;
    background: #0e5d95;
  }

  ${({ textVisible }) =>
    textVisible &&
    css`animation: ${fadeLeft} 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;`}

  @media (max-width: 768px) { padding: 36px 32px; }
  @media (max-width: 480px) { padding: 28px 20px; }
`;

export const CardEyebrow = styled.span<AnimatedProps>`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #0e5d95;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  opacity: 0;

  &::before {
    content: '';
    display: inline-block;
    width: 28px;
    height: 1px;
    background: #0e5d95;
  }

  ${({ visible }) =>
    visible &&
    css`animation: ${fadeUp} 0.5s ease 0.5s both;`}
`;

export const SectionTitle = styled(Title)<AnimatedProps>`
  font-family: 'Lora', 'Georgia', serif !important;
  font-size: 30px !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
  letter-spacing: -0.02em !important;
  color: #0d1b2a !important;
  margin: 0 0 12px 0 !important;
  opacity: 0;

  em {
    font-style: italic;
    color: #0e5d95;
  }

  ${({ visible }) =>
    visible &&
    css`animation: ${fadeUp} 0.55s ease 0.55s both;`}

  @media (max-width: 768px) { font-size: 24px !important; }
`;

export const CardDivider = styled.div<AnimatedProps>`
  height: 3px;
  background: linear-gradient(90deg, #0e5d95, #4da3e0, #0e5d95);
  background-size: 200% auto;
  border-radius: 2px;
  margin-bottom: 22px;
  max-width: 44px;
  transform-origin: left;
  transform: scaleX(0);
  opacity: 0;

  ${({ visible }) =>
    visible &&
    css`
      opacity: 1;
      animation:
        ${scaleIn} 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.68s forwards,
        ${shimmer} 3s linear 1.1s infinite;
    `}
`;

export const ServiceText = styled(Paragraph)<AnimatedProps>`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif !important;
  font-size: 15px !important;
  line-height: 1.85 !important;
  color: #4a6070 !important;
  font-style: italic;
  margin: 0 !important;
  opacity: 0;

  ${({ visible }) =>
    visible &&
    css`animation: ${fadeUp} 0.6s ease 0.72s both;`}

  @media (max-width: 480px) {
    font-size: 14px !important;
    line-height: 1.75 !important;
  }
`;

/* corner bracket decoration */
export const CornerBracket = styled.div`
  position: absolute;
  bottom: -14px;
  right: -14px;
  width: 48px;
  height: 48px;
  border-right: 2px solid #c8dce9;
  border-bottom: 2px solid #c8dce9;
  pointer-events: none;

  @media (max-width: 480px) { display: none; }
`;