import styled, { keyframes, css } from "styled-components";
import { Card } from "antd";
import { StyledProps, CardWrapperProps, IconWrapperProps } from "./types";

/* ─── Tokens ─────────────────────────────────── */
const blue     = "#4da3e0";
const blueDeep = "#0e5d95";
const BRAND     = blueDeep;
const BRAND_MID = blue;
const BRAND_LIGHT = "rgba(14,93,149,0.08)";
const CARD_HEIGHT = "480px";
const CARD_HEIGHT_TABLET = "420px";

/* ─── Keyframes ─────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const scanLine = keyframes`
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulseRing = keyframes`
  0%   { transform: scale(1);   opacity: 0.5; }
  70%  { transform: scale(1.9); opacity: 0; }
  100% { transform: scale(1.9); opacity: 0; }
`;

const revealWidth = keyframes`
  from { width: 0; }
  to   { width: 56px; }
`;

/* ─── Section ────────────────────────────────── */
export const SolutionSection = styled.section`
  text-align: center;
  padding: 0 0 100px;
  background: #f5f8fb;
  position: relative;
  overflow: hidden;

  /* dot-grid texture */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(#d0dfe9 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.4;
    pointer-events: none;
  }

  @media (max-width: 1024px) { padding-bottom: 72px; }
  @media (max-width: 768px)  { padding-bottom: 56px; }
`;

/* ─── Section header ─────────────────────────── */
export const SectionTitle = styled.h2`
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: ${blue};
  margin: 0 0 16px;
  padding-top: 80px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
  animation: ${fadeUp} 0.6s ease 0.1s both;

  &::before, &::after {
    content: '';
    display: inline-block;
    width: 36px;
    height: 1px;
    background: ${blue};
    opacity: 0.5;
  }

  @media (max-width: 1024px) { padding-top: 56px; }
  @media (max-width: 768px)  { padding-top: 40px; }
`;

export const SectionSubtitle = styled.p`
  font-family: 'Lora', 'Georgia', serif;
  font-size: 42px;
  font-weight: 800;
  color: ${blueDeep};
  margin: 0 auto 0;
  max-width: 640px;
  line-height: 1.15;
  letter-spacing: -0.025em;
  position: relative;
  z-index: 1;
  animation: ${fadeUp} 0.6s ease 0.2s both;

  em {
    font-style: italic;
    color: ${blue};
  }

  /* shimmer divider below subtitle */
  &::after {
    content: '';
    display: block;
    height: 3px;
    background: linear-gradient(90deg, ${blue}, #4da3e0, ${blue});
    background-size: 200% auto;
    border-radius: 2px;
    max-width: 56px;
    margin: 18px auto 0;
    animation: ${shimmer} 3s linear infinite;
  }

  @media (max-width: 768px) {
    font-size: 28px;
    padding: 0 20px;
  }
`;

/* ─── Cards container ────────────────────────── */
export const CardsContainer = styled.div`
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) { padding: 0 24px; }
  @media (max-width: 768px)  { padding: 0; }
`;

export const DesktopCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding: 52px 0 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    padding-top: 40px;
  }
  @media (max-width: 768px) { display: none; }
`;

/* ─── Card wrapper ───────────────────────────── */
export const DesktopCardWrapper = styled.div<CardWrapperProps>`
  position: relative;
  height: ${CARD_HEIGHT};
  cursor: pointer;
  overflow: hidden;
  background: ${p => p.$isActive ? blueDeep : '#fff'};
  border: 1px solid #e0eaf3;
  transition: background 0.45s cubic-bezier(0.4, 0, 0.2, 1);

  /* top bar — slides in on hover */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 3px;
    background: ${blue};
    transform: scaleX(${p => p.$isActive ? 1 : 0});
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
  }

  &:hover::before { transform: scaleX(1); }

  /* stagger */
  &:nth-child(1) { animation: ${fadeUp} 0.6s 0.15s ease both; }
  &:nth-child(2) { animation: ${fadeUp} 0.6s 0.28s ease both; }
  &:nth-child(3) { animation: ${fadeUp} 0.6s 0.41s ease both; }

  @media (max-width: 1024px) { height: ${CARD_HEIGHT_TABLET}; }
`;

/* ─── Ant Card shell ─────────────────────────── */
export const StyledCard = styled(Card)<CardWrapperProps>`
  height: 100%;
  overflow: hidden;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  pointer-events: none !important;

  .ant-card-body {
    padding: 0;
    height: 100%;
    width: 100%;
  }
`;

export const CardContent = styled.div`
  width: 100%; height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 40px 28px 32px;

  @media (max-width: 1024px) { padding: 28px 20px 24px; }
`;

/* ─── Icon ───────────────────────────────────── */
export const IconWrapper = styled.div<{ $bgColor?: string; $isMobileActive?: boolean }>`
  position: relative;
  width: 64px; height: 64px;
  border-radius: 16px;
  background: ${p => p.$isMobileActive ? '#fff' : (p.$bgColor || blue)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 22px;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* pulse ring */
  ${DesktopCardWrapper}:hover &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 20px;
    border: 2px solid rgba(255,255,255,0.35);
    animation: ${pulseRing} 1.2s ease-out infinite;
  }

  img {
    width: 28px; height: 28px;
    object-fit: contain;
    filter: brightness(0) invert(1);
    transition: filter 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }

  ${DesktopCardWrapper}:hover & {
    background: #fff !important;
    transform: rotate(-6deg) scale(1.1);
    img { filter: none; transform: scale(1); }
  }

  @media (max-width: 1024px) {
    width: 54px; height: 54px;
    border-radius: 13px;
    margin-bottom: 16px;
    img { width: 24px; height: 24px; }
  }
`;

/* ─── Title ──────────────────────────────────── */
export const Title = styled.h3<CardWrapperProps>`
  font-family: 'Lora', 'Georgia', serif;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  margin: 0;
  color: ${p => p.$isActive ? '#fff' : blueDeep};
  transition: color 0.35s ease;
  text-align: center;
  max-width: 220px;

  @media (max-width: 1024px) { font-size: 17px; }
`;

/* ─── Card image ─────────────────────────────── */
export const CardImage = styled.div`
  width: 100%; height: 240px;
  background-size: cover;
  background-position: center;
  position: absolute;
  bottom: 0; left: 0; right: 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  /* gradient overlay */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(255,255,255,0.06) 0%,
      rgba(13,27,42,0.18) 100%
    );
    transition: opacity 0.4s ease;
  }

  /* shimmer scan on hover */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
    transform: translateX(-100%);
    z-index: 2;
  }

  ${DesktopCardWrapper}:hover & {
    opacity: 0;
    transform: translateY(24px) scale(0.92);
    &::before { animation: ${scanLine} 0.55s ease forwards; }
  }

  @media (max-width: 1024px) { height: 190px; }
`;

/* ─── Description container ──────────────────── */
export const DescriptionContainer = styled.div<CardWrapperProps>`
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 28px 36px;
  visibility: ${p => p.$isActive ? 'visible' : 'hidden'};
  opacity:    ${p => p.$isActive ? 1 : 0};
  transform:  ${p => p.$isActive ? 'translateY(0)' : 'translateY(16px)'};
  transition:
    opacity   0.35s cubic-bezier(0.4,0,0.2,1),
    transform 0.35s cubic-bezier(0.4,0,0.2,1),
    visibility 0s ${p => p.$isActive ? '0s' : '0.35s'};
  pointer-events: ${p => p.$isActive ? 'auto' : 'none'};

  @media (max-width: 1024px) { padding: 0 20px 28px; height: 220px; }
`;

/* ─── Divider ────────────────────────────────── */
export const Divider = styled.hr`
  width: 0;
  border: 0;
  border-top: 1px solid rgba(255,255,255,0.4);
  margin: 0 0 16px 0;
  pointer-events: none;
  transition: width 0.45s cubic-bezier(0.4,0,0.2,1) 0.15s;

  ${DesktopCardWrapper}:hover & { width: 40px; }

  @media (max-width: 1024px) { margin-bottom: 12px; }
`;

/* ─── Description ────────────────────────────── */
export const Description = styled.p`
  font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(255,255,255,0.82);
  margin: 0 0 20px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.4s ease 0.22s, transform 0.4s ease 0.22s;

  ${DesktopCardWrapper}:hover & { opacity: 1; transform: translateY(0); }

  @media (max-width: 1024px) { font-size: 13px; margin-bottom: 14px; }
`;

/* ─── Learn more button ──────────────────────── */
export const LearnMoreButton = styled.button<CardWrapperProps>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.5);
  padding: 10px 20px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #fff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  opacity:    ${p => p.$isActive ? 1 : 0};
  visibility: ${p => p.$isActive ? 'visible' : 'hidden'};
  transform:  ${p => p.$isActive ? 'translateY(0)' : 'translateY(8px)'};
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    opacity   0.35s ease 0.35s,
    transform 0.35s ease 0.35s,
    visibility 0s ${p => p.$isActive ? '0s' : '0.35s'};
  pointer-events: ${p => p.$isActive ? 'auto' : 'none'};

  /* ink fill */
  &::before {
    content: '';
    position: absolute; inset: 0;
    background: #fff;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    z-index: 0;
  }

  span, .anticon { position: relative; z-index: 1; }

  &:hover {
    color: ${blue};
    border-color: #fff;
    &::before { transform: scaleX(1); }
  }

  ${DesktopCardWrapper}:hover & { transition-delay: 0.38s; }

  @media (max-width: 1024px) { padding: 8px 16px; font-size: 9px; }
`;

/* ─── Swiper ─────────────────────────────────── */
export const SwiperContainer = styled.div`
  width: 100%;
  padding: 28px 0 60px;

  .solution-swiper {
    padding: 12px 20px 20px;
    overflow: visible;

    .swiper-slide {
      transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease;
      height: auto;

      &:not(.swiper-slide-active) { opacity: 0.45; transform: scale(0.88); }
      &.swiper-slide-active        { opacity: 1;    transform: scale(1);    }
    }
  }

  .swiper-slide-active {
    ${DescriptionContainer} { opacity: 1; visibility: visible; transform: translateY(0); }
    ${Divider}               { width: 40px; }
    ${Description}           { opacity: 1; transform: translateY(0); }
    ${LearnMoreButton}       { opacity: 1; visibility: visible; transform: translateY(0); }
  }

  /* pagination */
  .swiper-pagination {
    bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
  }
  .swiper-pagination-bullet {
    width: 6px; height: 6px;
    background: #b0c4d8;
    opacity: 1;
    border-radius: 6px;
    transition: all 0.3s ease;
    margin: 0 !important;
  }
  .swiper-pagination-bullet-active {
    width: 22px; height: 6px;
    background: ${blue};
    border-radius: 6px;
  }

  /* nav */
  .swiper-button-next,
  .swiper-button-prev {
    color: ${blue};
    width: 36px; height: 36px;
    background: #fff;
    border-radius: 0;
    box-shadow: 0 2px 12px rgba(14,93,149,0.14);
    transition: all 0.25s ease;

    &::after { font-size: 12px; font-weight: 700; }
    &:hover  { background: ${blue}; color: #fff; }

    @media (max-width: 480px) { display: none; }
  }

  @media (max-width: 768px) {
    padding: 12px 0 48px;
    .solution-swiper { padding: 8px 12px 16px; }
    .swiper-pagination-bullets.swiper-pagination-horizontal { bottom: 8px; }
  }
`;