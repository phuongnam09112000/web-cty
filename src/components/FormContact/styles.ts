import styled, { keyframes, css } from "styled-components";

import { type } from "../../styles/typography";
/* ─── Keyframes ─────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const revealWidth = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;

/* ─── Tokens ─────────────────────────────────── */
const blue     = "#0e5d95";
const blueDeep = "#0d1b2a";
const bluePale = "#eaf3fb";

/* ─── Section wrapper ────────────────────────── */
export const ContactContainer = styled.div`
  width: 100%;
  background: #f5f8fb;
  padding: 100px 40px;
  position: relative;
  overflow: hidden;

  /* dot-grid background */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#d0dfe9 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.4;
    pointer-events: none;
  }

  @media (max-width: 768px) { padding: 72px 24px; }
  @media (max-width: 480px) { padding: 56px 16px; }
`;

export const ContentWrapper = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 2;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 48px;
  }
`;

/* ─── Left info panel ────────────────────────── */
export const InfoPanel = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 960px) { order: 2; }
`;

export const InfoEyebrow = styled.span`
  ${type.label}
  text-transform: uppercase;
  color: ${blue};
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  opacity: 0;

  &::before {
    content: '';
    display: inline-block;
    width: 28px; height: 1px;
    background: ${blue};
  }

  &.visible { animation: ${fadeUp} 0.5s ease 0.1s both; }
`;

export const InfoHeading = styled.h2`
  ${type.h2}
  color: ${blueDeep};
  margin: 0 0 12px 0;
  opacity: 0;

  em {
    font-style: normal;
    color: ${blue};
  }

  &.visible { animation: ${fadeUp} 0.6s ease 0.2s both; }

`;

export const InfoDivider = styled.div`
  height: 3px;
  background: linear-gradient(90deg, ${blue}, #4da3e0, ${blue});
  background-size: 200% auto;
  border-radius: 2px;
  max-width: 56px;
  transform-origin: left;
  transform: scaleX(0);
  margin-bottom: 24px;
  opacity: 0;

  &.visible {
    opacity: 1;
    animation:
      ${revealWidth} 0.5s cubic-bezier(0.4,0,0.2,1) 0.36s forwards,
      ${shimmer} 3s linear 0.9s infinite;
  }
`;

export const InfoTagline = styled.p`
  ${type.body}
  color: #4a6070;
  margin: 0 0 40px 0;
  opacity: 0;

  &.visible { animation: ${fadeUp} 0.6s ease 0.38s both; }
`;

/* contact info items */
export const InfoItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  opacity: 0;

  &.visible { animation: ${fadeUp} 0.6s ease 0.5s both; }
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

export const InfoIcon = styled.div`
  width: 36px; height: 36px;
  border-radius: 8px;
  background: ${bluePale};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${blue};
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);

  ${InfoItem}:hover & {
    background: ${blue};
    color: #fff;
    transform: rotate(-6deg) scale(1.1);
  }
`;

export const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const InfoLabel = styled.span`
  ${type.label}
  text-transform: uppercase;
  color: #5a7080; /* ≥ 4.5:1 on white and the light section backgrounds */
`;

export const InfoValue = styled.span`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 14px;
  color: ${blueDeep};
  font-weight: 500;
`;

/* ─── Form card ──────────────────────────────── */
export const FormContainer = styled.div`
  background: #fff;
  padding: 48px 44px;
  position: relative;
  box-shadow:
    0 2px 8px rgba(14,93,149,0.06),
    0 16px 48px rgba(14,93,149,0.10);
  opacity: 0;

  /* left accent bar */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px; height: 100%;
    background: ${blue};
  }

  &.visible { animation: ${fadeUp} 0.7s cubic-bezier(0.4,0,0.2,1) 0.15s both; }

  /* corner bracket */
  &::after {
    content: '';
    position: absolute;
    bottom: -14px; right: -14px;
    width: 48px; height: 48px;
    border-right: 2px solid #c8dce9;
    border-bottom: 2px solid #c8dce9;
    pointer-events: none;
  }

  @media (max-width: 768px) { padding: 36px 28px; }
  @media (max-width: 480px) { padding: 28px 20px; }
`;

export const FormTitle = styled.span`
  ${type.label}
  text-transform: uppercase;
  color: ${blue};
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  opacity: 0;

  &::before {
    content: '';
    display: inline-block;
    width: 28px; height: 1px;
    background: ${blue};
  }

  &.visible { animation: ${fadeUp} 0.5s ease 0.3s both; }
`;

export const FormHeading = styled.h3`
  ${type.h3}
  color: ${blueDeep};
  margin: 0 0 10px 0;
  opacity: 0;

  em { font-style: normal; color: ${blue}; }

  &.visible { animation: ${fadeUp} 0.55s ease 0.4s both; }

`;

export const FormDivider = styled.div`
  height: 3px;
  background: linear-gradient(90deg, ${blue}, #4da3e0, ${blue});
  background-size: 200% auto;
  border-radius: 2px;
  max-width: 44px;
  transform-origin: left;
  transform: scaleX(0);
  margin-bottom: 28px;
  opacity: 0;

  &.visible {
    opacity: 1;
    animation:
      ${revealWidth} 0.45s cubic-bezier(0.4,0,0.2,1) 0.52s forwards,
      ${shimmer} 3s linear 1s infinite;
  }
`;

export const TagLine = styled.p`
  display: none; /* shown in left panel instead */
`;

/* ─── Fields ─────────────────────────────────── */
export const FormField = styled.div`
  margin-bottom: 16px;
  opacity: 0;

  &.visible-1 { animation: ${fadeUp} 0.5s ease 0.55s both; }
  &.visible-2 { animation: ${fadeUp} 0.5s ease 0.65s both; }
  &.visible-3 { animation: ${fadeUp} 0.5s ease 0.75s both; }
  &.visible-4 { animation: ${fadeUp} 0.5s ease 0.85s both; }
`;

const fieldBase = css`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d8e8f2;
  background: #f5f9fc;
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 14px;
  color: ${blueDeep};
  border-radius: 0;
  transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
  outline: none;

  &::placeholder {
    color: #9ab0c2;
    font-style: normal;
  }

  &:focus {
    border-color: ${blue};
    background: #fff;
    box-shadow: 0 0 0 3px rgba(14,93,149,0.08);
  }
`;

export const Input = styled.input`
  ${fieldBase}
`;

export const TextArea = styled.textarea`
  ${fieldBase}
  min-height: 110px;
  resize: vertical;
`;

/* ─── Submit button ──────────────────────────── */
export const SubmitButton = styled.button`
  ${type.button}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: ${blue};
  color: #fff;
  border: none;
  padding: 14px 28px;
  text-transform: uppercase;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transition: background 0.3s ease;

  /* ink fill */
  &::before {
    content: '';
    position: absolute; inset: 0;
    background: ${blueDeep};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
    z-index: 0;
  }

  span { position: relative; z-index: 1; }

  &::after {
    content: '→';
    font-size: 14px;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
  }

  &:hover:not(:disabled) {
    &::before { transform: scaleX(1); }
    &::after  { transform: translateX(4px); }
  }

  &:disabled {
    background: #7baec8;
    cursor: not-allowed;
    &::before { display: none; }
    &::after  { display: none; }
  }

  &.visible { animation: ${fadeUp} 0.5s ease 0.95s both; }

  @media (max-width: 480px) { padding: 12px 20px; }
`;

/* ─── Status messages ────────────────────────── */
const StatusBase = styled.div`
  padding: 12px 16px;
  margin-bottom: 16px;
  ${type.small}
  animation: ${fadeIn} 0.3s ease both;
  border-left: 3px solid;
`;

export const SuccessMessage = styled(StatusBase)`
  background: #edf7f1;
  color: #1e6b3c;
  border-color: #2e9e5b;
`;

export const ErrorMessage = styled(StatusBase)`
  background: #fdf0f0;
  color: #a02020;
  border-color: #d64545;
`;

/* ─── Legacy / unused (keep imports working) ─── */
export const BackgroundShape = styled.div`display: none;`;
export const fadeInUp = fadeUp;