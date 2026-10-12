import styled, { keyframes, css } from "styled-components";
import { Typography } from "antd";
import { AnimatedProps, TextContainerProps } from "./types";

const { Title, Paragraph } = Typography;

/* ─── Keyframes ─────────────────────────────── */
const fadeLeft = keyframes`
  from { opacity: 0; transform: translateX(48px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const fadeRight = keyframes`
  from { opacity: 0; transform: translateX(-48px); }
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

const countUp = keyframes`
  from { transform: translateY(8px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
`;

/* ─── Outer wrapper ──────────────────────────── */
export const Container = styled.div<AnimatedProps>`
  position: relative;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto 100px;
  padding: 0 40px;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 992px) {
    flex-direction: column;
    justify-content: flex-start;
    padding: 0 24px;
    margin-bottom: 70px;
    min-height: unset;
  }

  @media (max-width: 576px) {
    padding: 0 16px;
    margin-bottom: 48px;
  }
`;

/* ─── Image — left side ──────────────────────── */
export const ImageContainer = styled.div<AnimatedProps>`
  position: absolute;
  top: 0;
  left: 40px;
  width: 58%;
  height: 100%;
  min-height: 520px;
  overflow: hidden;
  opacity: 0;

  ${({ visible }) =>
    visible &&
    css`
      animation: ${fadeRight} 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
    `}

  /* vignette on right edge for card overlap */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to left, rgba(13,27,42,0.32) 0%, transparent 45%);
    z-index: 1;
    pointer-events: none;
  }

  @media (max-width: 992px) {
    position: relative;
    left: unset;
    width: 100%;
    min-height: 320px;
    height: 320px;

    &::before {
      background: linear-gradient(to top, rgba(13,27,42,0.55) 0%, transparent 55%);
    }
  }

  @media (max-width: 576px) {
    height: 240px;
    min-height: 240px;
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

/* thin accent line on left edge */
export const ImageAccentLine = styled.div<AnimatedProps>`
  position: absolute;
  top: 10%;
  left: 40px;
  width: 3px;
  height: 80%;
  background: linear-gradient(to bottom, transparent, #0e5d95, transparent);
  z-index: 2;
  opacity: 0;

  ${({ visible }) =>
    visible &&
    css`
      animation: ${fadeUp} 0.6s ease 0.7s both;
    `}

  @media (max-width: 992px) {
    display: none;
  }
`;

/* ─── Text card — right side ─────────────────── */
export const TextContainerWrapper = styled.div`
  position: relative;
  z-index: 5;
  width: 52%;
  flex-shrink: 0;

  @media (max-width: 992px) {
    width: calc(100% - 32px);
    margin: -80px auto 0;
  }

  @media (max-width: 576px) {
    width: calc(100% - 24px);
    margin-top: -60px;
  }
`;

export const TextContainer = styled.div<TextContainerProps>`
  background: #fff;
  padding: 48px 44px;
  position: relative;
  opacity: 0;
  box-shadow:
    0 2px 8px rgba(14, 93, 149, 0.06),
    0 16px 48px rgba(14, 93, 149, 0.10);

  /* right accent bar (mirrored từ Vision) */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    background: #0e5d95;
  }

  ${({ textVisible }) =>
    textVisible &&
    css`
      animation: ${fadeLeft} 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
    `}

  @media (max-width: 992px) {
    padding: 36px 32px;
  }

  @media (max-width: 576px) {
    padding: 28px 20px;
  }
`;

/* ─── Eyebrow ─────────────────────────────────── */
export const Eyebrow = styled.span<AnimatedProps>`
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
    css`
      animation: ${fadeUp} 0.5s ease 0.5s both;
    `}
`;

/* ─── Title ──────────────────────────────────── */
export const SectionTitle = styled(Title)<AnimatedProps>`
  font-family: 'Lora', 'Georgia', serif !important;
  font-size: 38px !important;
  font-weight: 800 !important;
  line-height: 1.15 !important;
  letter-spacing: -0.025em !important;
  color: #0d1b2a !important;
  margin: 0 0 12px 0 !important;
  opacity: 0;

  em {
    font-style: italic;
    color: #0e5d95;
  }

  ${({ visible }: AnimatedProps) =>
    visible &&
    css`
      animation: ${fadeUp} 0.55s ease 0.55s both;
    `}

  @media (max-width: 992px) {
    font-size: 30px !important;
  }

  @media (max-width: 576px) {
    font-size: 24px !important;
  }
`;

export const TitleDivider = styled.div<AnimatedProps>`
  height: 3px;
  background: linear-gradient(90deg, #0e5d95, #4da3e0, #0e5d95);
  background-size: 200% auto;
  border-radius: 2px;
  margin-bottom: 28px;
  max-width: 56px;
  width: 0;
  opacity: 0;

  ${({ visible }) =>
    visible &&
    css`
      animation:
        ${revealWidth} 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.7s forwards,
        ${shimmer} 3s linear 1.2s infinite;
      opacity: 1;
    `}
`;

/* ─── Mission points ─────────────────────────── */
export const MissionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const MissionItem = styled.div<{ delay: number; visible: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 18px;
  opacity: 0;

  ${({ visible, delay }) =>
    visible &&
    css`
      animation: ${fadeUp} 0.55s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s both;
    `}

  /* hover: số nổi lên */
  &:hover > div:first-child {
    background: #0e5d95;
    color: #fff;
    transform: translateY(-3px);
  }
`;

export const MissionNumber = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #eaf3fb;
  color: #0e5d95;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: 2px;
`;

export const MissionText = styled(Paragraph)`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif !important;
  font-size: 15px !important;
  line-height: 1.75 !important;
  color: #4a6070 !important;
  margin: 0 !important;
  flex: 1;

  @media (max-width: 576px) {
    font-size: 14px !important;
    line-height: 1.7 !important;
  }
`;

/* ─── Corner bracket ─────────────────────────── */
export const CornerBracket = styled.div`
  position: absolute;
  bottom: -14px;
  left: -14px;
  width: 48px;
  height: 48px;
  border-left: 2px solid #c8dce9;
  border-bottom: 2px solid #c8dce9;
  pointer-events: none;

  @media (max-width: 576px) {
    display: none;
  }
`;