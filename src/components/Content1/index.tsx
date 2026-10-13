import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SwiperCore from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import {
  HeroSection,
  Slides,
  SlideImage,
  Scrim,
  Inner,
  Content,
  Eyebrow,
  Title,
  Tagline,
  Actions,
  ActionLink,
  ActionAnchor,
  Controls,
  Counter,
  Segments,
  Segment,
  PauseButton,
} from "./styles";
import { ContentBlockProps, HeroAction } from "./types";

// Registered globally, as before, for any carousel that does not pass its own
// `modules`.
SwiperCore.use([Navigation, Pagination, Autoplay, EffectFade]);

const SLIDE_DELAY = 6000; // ms each slide stays before the crossfade
const pad = (n: number) => String(n).padStart(2, "0");

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Arrow = () => <span aria-hidden="true">→</span>;

const ActionButton = ({ action, variant }: { action: HeroAction; variant: "primary" | "secondary" }) =>
  action.to ? (
    <ActionLink to={action.to} $variant={variant}>
      {action.label} <Arrow />
    </ActionLink>
  ) : (
    <ActionAnchor href={action.href} onClick={action.onClick} $variant={variant}>
      {action.label} <Arrow />
    </ActionAnchor>
  );

const Content1: React.FC<ContentBlockProps> = ({
  backgroundImage,
  eyebrow,
  title,
  descriptions,
  primaryAction,
  secondaryAction,
  id,
}) => {
  const { t } = useTranslation();
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  // Only the first slide is visible on load. The other slides' images are
  // rendered once it has loaded (or failed), so they don't compete with it.
  const [firstSlideDone, setFirstSlideDone] = useState(false);
  const onFirstSlideDone = () => setFirstSlideDone(true);
  // Rotation starts automatically unless the user prefers reduced motion;
  // the pause / play control lets anyone stop or restart it.
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());

  const total = backgroundImage.length;

  // Rotation is driven here rather than by Swiper's autoplay, whose
  // stop()/start() left stray or stalled timers. The timer restarts on every
  // slide change (including manual jumps) and only runs while playing.
  useEffect(() => {
    if (!playing || total < 2) return;
    const timer = window.setTimeout(() => swiperRef.current?.slideNext(), SLIDE_DELAY);
    return () => window.clearTimeout(timer);
  }, [playing, activeSlideIndex, total]);

  const goTo = (index: number) => swiperRef.current?.slideTo(index);

  return (
    <HeroSection id={id} aria-labelledby={`${id}-title`} className="istt-on-dark">
      <Slides aria-hidden="true">
        <Swiper
          modules={[EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1200}
          // rewind (not loop): a crossfade needs no duplicated slides, and loop
          // mode left Swiper stuck mid-transition after jumping between slides
          rewind
          slidesPerView={1}
          allowTouchMove
          onSwiper={(swiper: SwiperType) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper: SwiperType) => setActiveSlideIndex(swiper.activeIndex)}
        >
          {backgroundImage.map((image, index) => (
            <SwiperSlide key={index}>
              {(index === 0 || firstSlideDone) && (
                <SlideImage
                  src={image}
                  alt=""
                  loading="eager"
                  $active={index === activeSlideIndex}
                  onLoad={index === 0 ? onFirstSlideDone : undefined}
                  onError={index === 0 ? onFirstSlideDone : undefined}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </Slides>
      <Scrim />

      <Inner>
        <Content>
          <Eyebrow>{eyebrow}</Eyebrow>
          <Title id={`${id}-title`}>{title}</Title>
          <Tagline key={activeSlideIndex}>{descriptions[activeSlideIndex]}</Tagline>
          <Actions>
            <ActionButton action={primaryAction} variant="primary" />
            <ActionButton action={secondaryAction} variant="secondary" />
          </Actions>
        </Content>
      </Inner>

      {total > 1 && (
        <Controls role="group" aria-label={t("a11y.hero.controls")}>
          <Counter aria-hidden="true">
            <strong>{pad(activeSlideIndex + 1)}</strong> / {pad(total)}
          </Counter>
          <Segments>
            {backgroundImage.map((_, index) => (
              <Segment
                key={index}
                type="button"
                aria-label={t("a11y.hero.slide", { n: index + 1, total })}
                aria-current={index === activeSlideIndex ? "true" : undefined}
                $active={index === activeSlideIndex}
                $running={playing}
                $duration={SLIDE_DELAY}
                onClick={() => goTo(index)}
              >
                <span />
              </Segment>
            ))}
          </Segments>
          <PauseButton
            type="button"
            aria-label={playing ? t("a11y.hero.pause") : t("a11y.hero.play")}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? (
              <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                <rect x="2" y="1" width="3.5" height="12" />
                <rect x="8.5" y="1" width="3.5" height="12" />
              </svg>
            ) : (
              <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
                <path d="M3 1.5v11l9.5-5.5z" />
              </svg>
            )}
          </PauseButton>
        </Controls>
      )}
    </HeroSection>
  );
};

export default Content1;
