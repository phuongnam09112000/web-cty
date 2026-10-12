import styled, { keyframes } from "styled-components";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

export const Container = styled.div`
  width: 100%;
  max-width: 1300px;
  margin: 100px auto;
  padding: 0 40px;

  @media (max-width: 768px) {
    margin: 70px auto;
    padding: 0 20px;
  }
`;

export const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 100px;
  position: relative;

  @media (max-width: 768px) {
    margin-bottom: 64px;
  }

  @media (max-width: 576px) {
    margin-bottom: 48px;
  }
`;

export const Eyebrow = styled.span`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #0e5d95;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  &::before {
    content: '';
    display: inline-block;
    width: 32px;
    height: 1px;
    background: #0e5d95;
  }
`;

export const SectionTitle = styled(Title)`
  font-family: 'Lora', 'Georgia', serif !important;
  font-size: 52px !important;
  font-weight: 800 !important;
  line-height: 1.1 !important;
  margin: 0 !important;
  color: #0d1b2a !important;
  letter-spacing: -0.02em;

  em {
    font-style: italic;
    color: #0e5d95;
  }

  @media (max-width: 768px) {
    font-size: 36px !important;
  }

  @media (max-width: 576px) {
    font-size: 28px !important;
  }
`;

export const TitleUnderline = styled.div`
  margin-top: 20px;
  height: 3px;
  width: 80px;
  background: linear-gradient(90deg, #0e5d95, #4da3e0, #0e5d95);
  background-size: 200% auto;
  animation: ${shimmer} 3s linear infinite;
  border-radius: 2px;
`;

export const ValuesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: #e0e8f0;
  border: 2px solid #e0e8f0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const ValueCard = styled.div`
  position: relative;
  padding: 52px 44px;
  background: #fff;
  overflow: hidden;
  transition: background 0.4s ease;
  cursor: default;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #0e5d95;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: #f5f9fd;

    &::before {
      transform: scaleX(1);
    }
  }

  @media (max-width: 768px) {
    padding: 40px 28px;
  }
`;

export const CardNumber = styled.span`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  color: #b0c4d8;
  display: block;
  margin-bottom: 32px;
`;

export const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #e8f2fb 0%, #cfe0f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  ${ValueCard}:hover & {
    transform: rotate(-6deg) scale(1.08);
    background: linear-gradient(135deg, #0e5d95 0%, #1a7abf 100%);
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
    margin-bottom: 22px;
  }
`;

export const IconImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  transition: filter 0.4s ease;

  ${ValueCard}:hover & {
    filter: brightness(0) invert(1);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

export const ValueTitle = styled(Title)`
  font-family: 'Lora', 'Georgia', serif !important;
  font-size: 22px !important;
  font-weight: 700 !important;
  color: #0d1b2a !important;
  margin-bottom: 16px !important;
  line-height: 1.3 !important;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 20px !important;
  }
`;

export const Divider = styled.div`
  width: 36px;
  height: 2px;
  background: #c8dce9;
  margin-bottom: 18px;
  transition: all 0.4s ease;

  ${ValueCard}:hover & {
    width: 56px;
    background: #0e5d95;
  }
`;

export const ValueDescription = styled(Paragraph)`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif !important;
  font-size: 15px !important;
  line-height: 1.75 !important;
  color: #5a7080 !important;
  margin: 0 !important;
`;

export const ArrowIcon = styled.div`
  position: absolute;
  bottom: 36px;
  right: 36px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid #d0dfe9;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translate(6px, 6px);
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: #0e5d95;

  ${ValueCard}:hover & {
    opacity: 1;
    transform: translate(0, 0);
    border-color: #0e5d95;
    background: #0e5d95;
    color: #fff;
  }
`;