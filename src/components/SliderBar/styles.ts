import styled from "styled-components";

/* ── Root ───────────────────────────────────────────────── */
export const SliderContainer = styled.div`
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: 90vh;
  max-height: 860px;
  min-height: 560px;
  display: flex;
  overflow: hidden;
  background: #06101a;
  font-family: 'Cormorant Garamond', Georgia, serif;

  @media (max-width: 900px) {
    flex-direction: column;
    height: auto;
    min-height: unset;
    max-height: unset;
  }
`;

/* ── Left panel — text ──────────────────────────────────── */
export const LeftPanel = styled.div`
  position: relative;
  z-index: 10;
  width: 400px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 56px 48px;
  background: #06101a;

  @media (max-width: 1100px) {
    width: 340px;
    padding: 44px 36px;
  }

  @media (max-width: 900px) {
    width: 100%;
    padding: 36px 28px 28px;
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 16px;
  }

  @media (max-width: 576px) {
    padding: 28px 20px 20px;
  }
`;

export const PanelTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const BrandLabel = styled.span`
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: 48px;
  display: block;

  @media (max-width: 900px) {
    margin-bottom: 0;
  }
`;

export const SlideTitle = styled.h2`
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 64px;
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -2px;
  color: #fff;
  margin: 0 0 24px 0;
  text-transform: uppercase;
  /* GPU-only transition */
  transition: opacity 0.5s ease;

  @media (max-width: 1100px) {
    font-size: 52px;
  }

  @media (max-width: 900px) {
    font-size: 42px;
    letter-spacing: -1.5px;
    margin-bottom: 12px;
  }

  @media (max-width: 576px) {
    font-size: 34px;
  }
`;

export const SlideDescription = styled.p`
  font-family: 'Lora', Georgia, serif;
  font-size: 15px;
  line-height: 1.75;
  color: rgba(255,255,255,0.5);
  margin: 0;
  max-width: 280px;
  /* GPU-only transition */
  transition: opacity 0.5s ease;

  @media (max-width: 900px) {
    font-size: 14px;
    max-width: 100%;
  }
`;

export const PanelBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 900px) {
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }
`;

/* ── Counter ────────────────────────────────────────────── */
export const SlideCounter = styled.div`
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(255,255,255,0.3);

  span {
    color: #fff;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -1px;
    display: block;
    margin-bottom: 4px;
    font-family: 'Cormorant Garamond', Georgia, serif;
  }
`;

/* ── Nav buttons ────────────────────────────────────────── */
export const NavigationButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

export const NavigationButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* opacity transition only */
  transition: opacity 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: rgba(255,255,255,0.5);
    opacity: 1;
    color: #fff;
  }

  &:focus:not(:focus-visible) { outline: none; }
  /* keyboard focus ring in the light variant for the dark panel */
  &:focus-visible { outline-color: var(--istt-focus-ring-inverse) !important; }

  @media (max-width: 576px) {
    width: 40px;
    height: 40px;
    font-size: 15px;
  }
`;

/* ── Progress bar ───────────────────────────────────────── */
export const ProgressBar = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255,255,255,0.08);
  border-radius: 1px;
  overflow: hidden;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const ProgressFill = styled.div<{ $duration: number }>`
  height: 100%;
  background: rgba(255,255,255,0.4);
  border-radius: 1px;
  width: 0%;
  animation: progressAnim ${({ $duration }) => $duration}ms linear forwards;

  @keyframes progressAnim {
    from { width: 0%; }
    to   { width: 100%; }
  }
`;

/* ── Right panel — image ────────────────────────────────── */
export const RightPanel = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;

  .swiper {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 900px) {
    height: 52vw;
    min-height: 260px;
    max-height: 480px;
  }
`;

export const SlideContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
`;

/* Thin vignette on the left edge — blends into dark panel */
export const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(6, 16, 26, 0.55) 0%,
    transparent 35%
  );
  z-index: 1;
  pointer-events: none;
`;

/* ── Pagination (vertical dots on image) ───────────────── */
export const PaginationContainer = styled.div`
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .swiper-pagination-bullet {
    width: 4px;
    height: 24px;
    border-radius: 2px;
    background: rgba(255,255,255,0.25);
    opacity: 1;
    display: block;
    margin: 0;
    transition: background-color 0.25s ease, height 0.25s ease;
  }

  .swiper-pagination-bullet-active {
    background: #fff;
    height: 40px;
  }

  @media (max-width: 576px) {
    right: 14px;
    gap: 8px;

    .swiper-pagination-bullet { height: 18px; }
    .swiper-pagination-bullet-active { height: 30px; }
  }
`;

/* ── Unused legacy exports (keep types happy) ───────────── */
export const TextOverlay = styled.div``;
export const SlideTextBackground = styled.div``;