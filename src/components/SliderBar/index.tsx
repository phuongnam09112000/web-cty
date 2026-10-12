import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  SliderContainer,
  LeftPanel,
  PanelTop,
  PanelBottom,
  BrandLabel,
  SlideTitle,
  SlideDescription,
  SlideCounter,
  NavigationButtonsContainer,
  NavigationButton,
  ProgressBar,
  ProgressFill,
  RightPanel,
  SlideContent,
  SlideImage,
  GradientOverlay,
  PaginationContainer,
} from "./styles";
import { SlideData, SliderProps } from "./types";

const images: SlideData[] = [
  {
    src: "/img/background/commitment.jpg",
    text: "Commitment",
    description: "Our unwavering commitment to excellence.",
  },
  {
    src: "/img/background/quality.jpg",
    text: "Quality",
    description: "Delivering the highest quality in everything we do.",
  },
  {
    src: "/img/background/collaboration.jpg",
    text: "Collaboration",
    description: "Working together to achieve greatness.",
  },
];

const ModernSlider: React.FC<SliderProps> = ({
  interval = 6000,
  autoplay = true,
}) => {
  const { t } = useTranslation();
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0); // re-trigger animation
  const total = images.length;

  // Load all slide images once the slider gets close to the viewport, so
  // slide changes stay smooth without downloading them on page load. The
  // slides' own <img> elements do the loading, so each image is fetched once.
  const containerRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          setNearViewport(true);
        }
      },
      { rootMargin: "800px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const real = swiper.realIndex ?? swiper.activeIndex;
    setActiveIndex(real);
    setProgressKey((k) => k + 1);
  }, []);

  const goNext = useCallback(() => swiperRef.current?.slideNext(), []);
  const goPrev = useCallback(() => swiperRef.current?.slidePrev(), []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <SliderContainer ref={containerRef}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Lora&family=DM+Mono:wght@600&display=swap');
      `}</style>

      {/* ── Left text panel ── */}
      <LeftPanel>
        <PanelTop>
          <BrandLabel>{t("Our Values")}</BrandLabel>
          <SlideTitle key={`title-${activeIndex}`}>
            {t(images[activeIndex].text)}
          </SlideTitle>
          <SlideDescription key={`desc-${activeIndex}`}>
            {t(images[activeIndex].description ?? "")}
          </SlideDescription>
        </PanelTop>

        <PanelBottom>
          <ProgressBar>
            <ProgressFill key={progressKey} $duration={interval} />
          </ProgressBar>

          <SlideCounter>
            <span>{pad(activeIndex + 1)}</span>
            — {pad(total)}
          </SlideCounter>

          <NavigationButtonsContainer>
            <NavigationButton onClick={goPrev} aria-label="Previous slide">
              ←
            </NavigationButton>
            <NavigationButton onClick={goNext} aria-label="Next slide">
              →
            </NavigationButton>
          </NavigationButtonsContainer>
        </PanelBottom>
      </LeftPanel>

      {/* ── Right image panel ── */}
      <RightPanel>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          speed={800}
          loop={true}
          autoplay={autoplay ? { delay: interval, disableOnInteraction: false } : false}
          pagination={{ clickable: true, el: ".pagination-dots", type: "bullets" }}
          onSwiper={(swiper: SwiperType) => { swiperRef.current = swiper; }}
          onSlideChange={handleSlideChange}
          style={{ width: "100%", height: "100%" }}
        >
          {images.map((slide, index) => (
            <SwiperSlide key={index}>
              <SlideContent>
                {nearViewport && (
                  <SlideImage src={slide.src} alt={t(slide.text)} />
                )}
                <GradientOverlay />
              </SlideContent>
            </SwiperSlide>
          ))}
        </Swiper>

        <PaginationContainer className="pagination-dots" />
      </RightPanel>
    </SliderContainer>
  );
};

export default ModernSlider;