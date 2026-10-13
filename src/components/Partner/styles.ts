import styled from "styled-components";

const blue     = "#0e5d95";
const bluePale = "rgba(14, 93, 149, 0.06)";

export const PageWrapper = styled.div`
  background: #f8f9fb;
  width: 100%;
`;

export const SectionContainer = styled.div`
  width: 100%;
  max-width: 1480px;
  margin: 0 auto;
  padding: 48px 48px;

  @media (max-width: 1024px) { padding: 40px 32px; }
  @media (max-width: 768px)  { padding: 32px 20px; }
  @media (max-width: 480px)  { padding: 28px 16px; }
`;

export const SectionHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const TitleBlock = styled.div`
  flex-shrink: 0;
  margin-right: 20px;
`;

export const TitleEyebrow = styled.span`
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: ${blue};
  font-family: 'DM Mono', 'Courier New', monospace;
  margin-bottom: 3px;
`;

export const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.3px;
`;

export const HeaderRule = styled.div`
  flex: 1;
  height: 1px;
  background: #e2e8f0;
`;

export const Subtitle = styled.p`
  font-size: 13px;
  color: #5a7080; /* ≥ 4.5:1 on white */
  margin: 0 0 24px;
  font-style: italic;
  // font-family: Georgia, serif;
`;

export const SwiperWrapper = styled.div`
  position: relative;
  width: 100%;
  /* Make room for arrows on both sides */
  padding: 0;
  box-sizing: border-box;

  /* The swiper fills the inner area — no padding on it */
  .swiper {
    width: 100%;
    overflow: hidden; /* clip slides only, arrows are outside */
  }

  .swiper-slide {
    display: flex;
    height: auto;
  }

  /* Arrows sit on the wrapper, outside the swiper overflow */
  .swiper-button-prev,
  .swiper-button-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: ${blue};
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.09);
    margin: 0;
    z-index: 10;
    transition: border-color 0.15s ease;

    &::after {
      font-size: 10px;
      font-weight: 900;
    }

    &:hover { border-color: ${blue}; }
  }

  .swiper-button-prev { left: 0; }
  .swiper-button-next { right: 0; }

  @media (max-width: 480px) {
    padding: 0;
    .swiper-button-prev,
    .swiper-button-next { display: none; }
  }
`;

export const SlideContainer = styled.div`
  width: 100%;
  height: 96px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  outline: 2px solid transparent;
  outline-offset: -2px;
  transition: background-color 0.15s ease, outline-color 0.15s ease;

  &:hover {
    background: ${bluePale};
    outline-color: rgba(14, 93, 149, 0.2);
  }

  @media (max-width: 768px) { height: 80px; }
  @media (max-width: 480px) { height: 70px; }
`;

export const LogoItem = styled.img`
  max-width: 100%;
  max-height: 52px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  filter: grayscale(45%) opacity(0.72);
  transition: filter 0.2s ease;

  ${SlideContainer}:hover & {
    filter: grayscale(0%) opacity(1);
  }

  /* Touch screens can't hover, so show the logos in full colour there */
  @media (hover: none) {
    filter: none;
  }

  @media (max-width: 768px) { max-height: 42px; }
`;

export const SectionDivider = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;

  &::after {
    content: "";
    display: block;
    height: 1px;
    background: #e2e8f0;
  }

  @media (max-width: 1024px) { padding: 0 32px; }
  @media (max-width: 768px)  { padding: 0 20px; }
  @media (max-width: 480px)  { padding: 0 16px; }
`;

export interface Partner {
  name: string;
  logo: string;
}