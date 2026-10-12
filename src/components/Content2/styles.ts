import styled, { keyframes, css } from "styled-components";

/* ─── Keyframes ─────────────────────────────── */
const fadeRight = keyframes`
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const fadeLeft = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const scaleIn = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

/* ─── Layout ─────────────────────────────────── */
export const AboutSectionContainer = styled.div`
  display: flex;
  max-width: 1300px;
  margin: 80px auto;
  padding: 0 40px;
  gap: 80px;
  align-items: center;

  @media (max-width: 1024px) {
    gap: 52px;
    padding: 0 28px;
    margin: 60px auto;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 40px;
    padding: 0 16px;
    margin: 48px auto;
  }
`;

/* ─── Image side ─────────────────────────────── */
export const ImageContainer = styled.div<{ isVisible: boolean }>`
  flex: 1.1;
  position: relative;
  flex-shrink: 0;

  ${({ isVisible }) =>
    isVisible &&
    css`
      animation: ${fadeRight} 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
    `}

  @media (max-width: 768px) {
    width: 100%;
    flex: unset;
  }
`;

export const ImageFrame = styled.div`
  position: relative;
  border-radius: 2px;
  overflow: hidden;

  /* subtle border accent */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(14, 93, 149, 0.08);
    pointer-events: none;
    border-radius: 2px;
  }
`;

export const Image = styled.img`
  width: 100%;
  height: 480px;
  object-fit: cover;
  display: block;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);

  ${ImageFrame}:hover & {
    transform: scale(1.04);
  }

  @media (max-width: 1024px) {
    height: 400px;
  }

  @media (max-width: 768px) {
    height: 260px;
  }
`;

/* decorative corner bracket */
export const CornerAccent = styled.div`
  position: absolute;
  bottom: -14px;
  right: -14px;
  width: 72px;
  height: 72px;
  border-right: 2px solid #0e5d95;
  border-bottom: 2px solid #0e5d95;
  pointer-events: none;
  z-index: 1;

  @media (max-width: 768px) {
    width: 48px;
    height: 48px;
    bottom: -10px;
    right: -10px;
  }
`;

/* founded year badge */
export const FoundedBadge = styled.div`
  position: absolute;
  top: 24px;
  left: -20px;
  background: #0e5d95;
  color: #fff;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 10px 16px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  line-height: 1;
  z-index: 2;

  @media (max-width: 768px) {
    display: none;
  }
`;

/* ─── Content side ───────────────────────────── */
export const ContentContainer = styled.div<{ isVisible: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const SectionLabel = styled.p<{ isVisible: boolean }>`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #0e5d95;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 18px 0;
  opacity: 0;

  &::before {
    content: '';
    display: inline-block;
    width: 28px;
    height: 1px;
    background: #0e5d95;
    flex-shrink: 0;
  }

  ${({ isVisible }) =>
    isVisible &&
    css`
      animation: ${fadeUp} 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
    `}
`;

export const Title = styled.h1<{ isVisible: boolean }>`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 42px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: #0d1b2a;
  margin: 0 0 12px 0;
  opacity: 0;

  em {
    font-style: italic;
    color: #0e5d95;
  }

  ${({ isVisible }) =>
    isVisible &&
    css`
      animation: ${fadeUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
    `}

  @media (max-width: 1024px) {
    font-size: 34px;
  }

  @media (max-width: 768px) {
    font-size: 26px;
  }
`;

export const TitleDivider = styled.div<{ isVisible: boolean }>`
  height: 3px;
  width: 64px;
  margin: 0 0 28px 0;
  background: linear-gradient(90deg, #0e5d95, #4da3e0, #0e5d95);
  background-size: 200% auto;
  border-radius: 2px;
  transform-origin: left;
  opacity: 0;

  ${({ isVisible }) =>
    isVisible &&
    css`
      animation:
        ${scaleIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.35s both,
        ${shimmer} 3s linear 0.9s infinite;
    `}
`;

export const Description = styled.p<{ isVisible: boolean }>`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #4a6070;
  margin: 0 0 36px 0;
  opacity: 0;

  ${({ isVisible }) =>
    isVisible &&
    css`
      animation: ${fadeUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.45s both;
    `}

  @media (max-width: 768px) {
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 28px;
  }
`;

export const Button = styled.button<{ isVisible: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  align-self: flex-start;
  background: #0e5d95;
  color: #fff;
  border: none;
  padding: 14px 28px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transition: background 0.3s ease, gap 0.3s ease;

  /* arrow */
  &::after {
    content: '→';
    font-size: 14px;
    transition: transform 0.3s ease;
    font-family: inherit;
  }

  /* ink fill on hover */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #0d1b2a;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  span {
    position: relative;
    z-index: 1;
  }

  &:hover::before { transform: scaleX(1); }
  &:hover::after  { transform: translateX(4px); }

  ${({ isVisible }) =>
    isVisible &&
    css`
      animation: ${fadeUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both;
    `}

  @media (max-width: 768px) {
    align-self: stretch;
    justify-content: center;
  }
`;

/* stat strip */
export const StatStrip = styled.div<{ isVisible: boolean }>`
  display: flex;
  gap: 32px;
  margin-bottom: 36px;
  padding: 20px 0;
  border-top: 1px solid #e4edf5;
  border-bottom: 1px solid #e4edf5;
  opacity: 0;

  ${({ isVisible }) =>
    isVisible &&
    css`
      animation: ${fadeUp} 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.38s both;
    `}

  @media (max-width: 480px) {
    gap: 20px;
  }
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StatNumber = styled.span`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 28px;
  font-weight: 800;
  color: #0e5d95;
  line-height: 1;
  letter-spacing: -0.02em;

  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

export const StatLabel = styled.span`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8aa3b5;
`;