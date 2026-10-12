import styled, { keyframes, css } from 'styled-components';

/* ─── Keyframes ─────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const revealScale = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

/* ─── Header ─────────────────────────────────── */
export const HeaderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 680px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1024px) { height: 560px; }
  @media (max-width: 768px)  { height: 460px; }
  @media (max-width: 480px)  { height: 380px; }
`;

export const WaveBackground = styled.div`
  position: absolute;
  inset: 0;
  background: url('/img/background/services.jpg') no-repeat center / cover;
  opacity: 0;
  transform: scale(1.04);
  transition: transform 8s ease;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(7, 22, 40, 0.55) 0%,
      rgba(8, 75, 122, 0.45) 60%,
      rgba(7, 22, 40, 0.72) 100%
    );
  }

  &.visible {
    animation: ${fadeIn} 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform: scale(1);
  }
`;

export const HeaderContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
  padding: 0 24px;
`;

export const Subtitle = styled.p`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 20px 0;
  opacity: 0;

  &::before,
  &::after {
    content: '';
    display: inline-block;
    width: 40px;
    height: 1px;
    background: rgba(255, 255, 255, 0.4);
  }

  &.visible {
    animation: ${fadeUp} 0.7s ease 0.5s both;
  }
`;

export const Title = styled.h1`
  font-family: 'Lora', 'Georgia', serif;
  font-size: 62px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0 0 32px 0;
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
    animation: ${fadeUp} 0.7s ease 0.65s both;
  }

  @media (max-width: 1024px) { font-size: 48px; }
  @media (max-width: 768px)  { font-size: 36px; margin-bottom: 24px; }
  @media (max-width: 480px)  { font-size: 28px; margin-bottom: 20px; }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  color: #fff;
  padding: 14px 32px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transition: border-color 0.3s ease, gap 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #fff;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  span, &::after { position: relative; z-index: 1; }

  &::after {
    content: '→';
    font-size: 14px;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #0e5d95;
    border-color: #fff;
    &::before { transform: scaleX(1); }
    &::after  { transform: translateX(4px); }
  }

  &.visible {
    animation: ${fadeUp} 0.7s ease 0.8s both;
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 10px;
  }
`;

/* ─── Cards wrapper ──────────────────────────── */
export const CardsContainerWrapper = styled.div`
  background: #f5f8fb;
  padding-bottom: 80px;

  @media (max-width: 768px) { padding-bottom: 56px; }
`;

export const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  max-width: 1300px;
  margin: 0 auto;
  position: relative;
  top: -100px;
  padding: 0 40px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    top: -72px;
    padding: 0 24px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    top: -56px;
    padding: 0 16px;
  }
`;

/* ─── Individual card ────────────────────────── */
export const CardWrapper = styled.div`
  position: relative;
  opacity: 0;
  border: 1px solid #e0e8f0;
  background: #fff;
  cursor: pointer;
  overflow: hidden;
  transition: z-index 0s;

  /* stagger */
  &.visible-1 { animation: ${fadeIn} 0.6s ease 0.3s both; }
  &.visible-2 { animation: ${fadeIn} 0.6s ease 0.45s both; }
  &.visible-3 { animation: ${fadeIn} 0.6s ease 0.6s both; }
  &.visible-4 { animation: ${fadeIn} 0.6s ease 0.75s both; }
  &.visible-5 { animation: ${fadeIn} 0.6s ease 0.9s both; }
  &.visible-6 { animation: ${fadeIn} 0.6s ease 1.05s both; }

  /* top border reveal on hover */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 3px;
    background: #0e5d95;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
  }

  &:hover::before { transform: scaleX(1); }
  &:hover { z-index: 2; }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 36px 40px;
  height: 100%;
  transition: opacity 0.4s ease, transform 0.4s ease;

  ${CardWrapper}:hover & {
    opacity: 0;
    transform: translateY(-8px);
    pointer-events: none;
  }

  @media (max-width: 768px) { padding: 36px 24px 32px; }
`;

export const ImageContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #eaf3fb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  ${CardWrapper}:hover & {
    transform: rotate(-8deg) scale(1.1);
    background: #0e5d95;
  }

  @media (max-width: 768px) {
    width: 64px; height: 64px;
    margin-bottom: 20px;
  }
`;

export const CardIcon = styled.img`
  width: 40px; height: 40px;
  object-fit: contain;
  transition: filter 0.35s ease;

  ${CardWrapper}:hover & { filter: brightness(0) invert(1); }

  @media (max-width: 768px) { width: 32px; height: 32px; }
`;

export const CardTitle = styled.h3`
  font-family: 'Lora', 'Georgia', serif;
  font-size: 20px;
  font-weight: 700;
  color: #0d1b2a;
  margin: 0 0 14px 0;
  text-align: center;
  position: relative;
  padding-bottom: 16px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0; left: 50%;
    transform: translateX(-50%);
    width: 36px; height: 2px;
    background: #c8dce9;
    transition: width 0.3s ease, background 0.3s ease;
    transform-origin: center;
  }

  ${CardWrapper}:hover & {
    &::after { width: 56px; background: #0e5d95; }
  }

  @media (max-width: 768px) { font-size: 18px; }
`;

export const CardDescription = styled.p`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.75;
  color: #5a7080;
  text-align: center;
  margin: 0;

  @media (max-width: 768px) { font-size: 13px; }
`;

/* ─── Hover overlay ──────────────────────────── */
export const DetailsOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: #0d1b2a;
  color: #fff;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  overflow-y: auto;
  z-index: 5;

  /* card title inside overlay */
  > h3 {
    font-family: 'Lora', 'Georgia', serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 6px 0;
    padding-bottom: 14px;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0;
      width: 36px; height: 2px;
      background: #4da3e0;
    }
  }

  ${CardWrapper}:hover & {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 768px) { padding: 28px 24px; }
`;

export const DetailsList = styled.ul`
  list-style: none;
  padding: 0; margin: 0;
  width: 100%;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s;

  ${CardWrapper}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const DetailCategory = styled.div`
  margin-bottom: 16px;

  &:last-child { margin-bottom: 0; }
`;

export const CategoryTitle = styled.h4`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4da3e0;
  margin: 0 0 8px 0;
`;

export const DetailItem = styled.li`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.78);
  padding-left: 14px;
  position: relative;
  margin-bottom: 6px;

  &::before {
    content: '—';
    position: absolute;
    left: 0;
    color: #4da3e0;
    font-size: 10px;
    top: 3px;
  }

  &:last-child { margin-bottom: 0; }
`;

export const TouchIndicator = styled.div`
  display: none;
  position: absolute;
  bottom: 12px; right: 12px;
  width: 26px; height: 26px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.4);
  color: rgba(255,255,255,0.7);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  align-items: center;
  justify-content: center;

  @media (max-width: 1024px) { display: flex; }
`;