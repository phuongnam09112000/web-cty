import React, { useState } from "react";
import { ContentWrapper, BackgroundImage, Title, Description } from "./styles";
import { ContentBlockProps } from "./types";
import SwiperCore from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

SwiperCore.use([Navigation, Pagination, Autoplay, EffectFade]);

const Content1: React.FC<ContentBlockProps> = ({
  backgroundImage,
  title,
  descriptions,
  id,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  // Only the first slide is visible on load. The other slides' images are
  // rendered once it has loaded (or failed), so they don't compete with it.
  const [firstSlideDone, setFirstSlideDone] = useState(false);
  const onFirstSlideDone = () => setFirstSlideDone(true);
  return (
    <ContentWrapper id={id}>
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        pagination={{ clickable: true }}
        autoplay={{ 
          delay: 5000, 
          disableOnInteraction: false 
        }}
        speed={1500} 
        loop
        onSlideChange={(swiper: SwiperType) =>
          setActiveSlideIndex(swiper.realIndex)
        }
        onInit={(swiper: SwiperType) => setActiveSlideIndex(swiper.realIndex)}
      >
        {backgroundImage.map((image: string, index: number) => (
          <SwiperSlide key={index}>
            {(index === 0 || firstSlideDone) && (
              <BackgroundImage
                src={image}
                alt={`Slide background ${index + 1}`}
                loading="eager"
                onLoad={index === 0 ? onFirstSlideDone : undefined}
                onError={index === 0 ? onFirstSlideDone : undefined}
              />
            )}
            {index === activeSlideIndex && (
              <>
                <Title>{title}</Title>
                <Description>{descriptions[index]}</Description>
              </>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </ContentWrapper>
  );
};

export default Content1;