import styled, { keyframes, css } from "styled-components";
import { Typography, Row, Col } from "antd";

import { type, typeImportant } from "../../styles/typography";
const { Title, Paragraph } = Typography;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeRight = keyframes`
  from { opacity: 0; transform: translateX(-32px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const fadeLeft = keyframes`
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
`;

export const AboutContainer = styled.div`
  width: 100%;
  max-width: 1300px;
  margin: 80px auto;
  padding: 0 40px;

  @media (max-width: 991px) { margin: 60px auto; padding: 0 24px; }
  @media (max-width: 767px) { margin: 48px auto; padding: 0 16px; }
`;

export const AboutContentWrapper = styled(Row)`
  align-items: flex-start;
  gap: 0;
`;

/* ─── LEFT: Text column ─────────────────────── */
export const TextColumn = styled(Col).withConfig({
  shouldForwardProp: (prop: PropertyKey) => prop !== "isVisible",
})<{ isVisible: boolean }>`
  padding-right: 60px !important;
  box-sizing: border-box;

  ${({ isVisible }) =>
    isVisible &&
    css`animation: ${fadeRight} 0.7s cubic-bezier(0.4, 0, 0.2, 1) both;`}

  @media (max-width: 991px) { padding-right: 32px !important; }
  @media (max-width: 767px) { padding-right: 0 !important; margin-bottom: 40px; }
`;

export const Eyebrow = styled.span`
  ${type.label}
  text-transform: uppercase;
  color: #0e5d95;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;

  &::before {
    content: '';
    display: inline-block;
    width: 28px; height: 1px;
    background: #0e5d95;
  }
`;

export const IntroTitle = styled(Title)`
  ${typeImportant.h2}
  color: #0d1b2a !important;
  margin-bottom: 48px !important;

  em {
    font-style: normal;
    color: #0e5d95;
  }

  @media (max-width: 991px) { margin-bottom: 36px !important; }
  @media (max-width: 767px)  { margin-bottom: 28px !important; }
`;

/* ─── Timeline list ──────────────────────────── */
export const TimelineWrapper = styled.div`
  position: relative;
  padding-left: 28px;

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 8px; bottom: 8px;
    width: 1px;
    background: #d0dfe9;
    transform-origin: top;
  }
`;

export const IntroItem = styled.div<{ isVisible: boolean; delay: number }>`
  position: relative;
  margin-bottom: 32px;
  opacity: 0;

  ${({ isVisible, delay }) =>
    isVisible &&
    css`animation: ${fadeUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s both;`}

  &:last-child { margin-bottom: 0; }

  &::before {
    content: '';
    position: absolute;
    left: -32px; top: 6px;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #0e5d95;
    transition: background 0.3s ease;
  }

  &:hover::before { background: #0e5d95; }

  @media (max-width: 767px) { margin-bottom: 24px; }
`;

export const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
`;

export const IconWrapper = styled.div`
  width: 30px; height: 30px;
  border-radius: 8px;
  background: #eaf3fb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;

  ${IntroItem}:hover & {
    background: #0e5d95;
    transform: rotate(-8deg);
    .anticon { color: #fff !important; }
  }
`;

export const StyledIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const IntroText = styled(Paragraph)`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif !important;
  font-size: 15px !important;
  line-height: 1.75 !important;
  color: #4a6070 !important;
  margin: 0 !important;
`;

/* ─── RIGHT: Images column ───────────────────── */
export const ImagesContainer = styled.div<{ isVisible: boolean }>`
  position: relative;
  width: 100%;
  height: 520px;

  ${({ isVisible }) =>
    isVisible &&
    css`animation: ${fadeLeft} 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;`}

  @media (max-width: 991px) {
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

export const ImageWrapper = styled.div<{ index: number; isVisible: boolean; delay: number }>`
  position: absolute;
  overflow: hidden;
  border-radius: 4px;
  opacity: 0;

  ${({ isVisible, delay }) =>
    isVisible &&
    css`animation: ${fadeUp} 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s both;`}

  ${({ index }) => index === 0 && css`top: 0; right: 0; width: 68%; height: 300px;`}
  ${({ index }) => index === 1 && css`
    top: 160px; left: 0; width: 56%; height: 280px;
    padding: 8px; background: #fff;
    box-shadow: 0 4px 24px rgba(14,93,149,0.10);
    z-index: 2;
  `}
  ${({ index }) => index === 2 && css`bottom: 0; right: 0; width: 40%; height: 220px; z-index: 1;`}

  @media (max-width: 991px) {
    position: relative !important;
    width: 100% !important; height: 220px !important;
    top: unset !important; left: unset !important;
    right: unset !important; bottom: unset !important;
    padding: 0 !important; box-shadow: none !important;
  }
  @media (max-width: 767px) { height: 190px !important; }
`;

export const Image = styled.img`
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  ${ImageWrapper}:hover & { transform: scale(1.05); }
`;

export const BorderImage = styled.div`
  width: 100%; height: 100%;
  overflow: hidden;
`;

export const AccentBlock = styled.div`
  position: absolute;
  top: 60px; right: -16px;
  width: 80px; height: 80px;
  border: 2px solid #0e5d95;
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;

  @media (max-width: 991px) { display: none; }
`;

export const YearBadge = styled.div`
  ${type.label}
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #0e5d95;
  color: #fff;
  padding: 8px 18px;
  white-space: nowrap;
  z-index: 3;

  @media (max-width: 991px) { display: none; }
`;