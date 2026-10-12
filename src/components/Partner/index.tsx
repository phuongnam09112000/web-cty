import React from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { partnersData, customersData } from "./data";
import {
  PageWrapper,
  SectionContainer,
  SectionHeader,
  TitleBlock,
  TitleEyebrow,
  Title,
  HeaderRule,
  Subtitle,
  SwiperWrapper,
  SlideContainer,
  LogoItem,
  SectionDivider,
} from "./styles";

const breakpoints = {
  0:    { slidesPerView: 2, spaceBetween: 10 },
  480:  { slidesPerView: 3, spaceBetween: 12 },
  768:  { slidesPerView: 4, spaceBetween: 14 },
  1024: { slidesPerView: 5, spaceBetween: 16 },
  1280: { slidesPerView: 6, spaceBetween: 16 },
};

const PartnersAndCustomersSection = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@700&display=swap');
      `}</style>

      {/* ── Partners ── */}
      <SectionContainer>
        <SectionHeader>
          <TitleBlock>
            <TitleEyebrow>{t("Ecosystem")}</TitleEyebrow>
            <Title>{t("Our Partners")}</Title>
          </TitleBlock>
          <HeaderRule />
        </SectionHeader>
        <Subtitle>{t("United in vision, stronger in execution.")}</Subtitle>

        <SwiperWrapper>
          <Swiper
            modules={[Autoplay, Navigation]}
            loop={true}
            speed={700}
            navigation={{
              prevEl: ".swiper-button-prev",
              nextEl: ".swiper-button-next",
            }}
            autoplay={{ delay: 3200, disableOnInteraction: false }}
            breakpoints={breakpoints}
            spaceBetween={16}
          >
            {partnersData.map((p, i) => (
              <SwiperSlide key={i}>
                <SlideContainer>
                  <LogoItem src={p.logo} alt={p.name} loading={i < 6 ? "eager" : "lazy"} />
                </SlideContainer>
              </SwiperSlide>
            ))}
            <div className="swiper-button-prev" />
            <div className="swiper-button-next" />
          </Swiper>
        </SwiperWrapper>
      </SectionContainer>

      <SectionDivider />

      {/* ── Customers ── */}
      <SectionContainer>
        <SectionHeader>
          <TitleBlock>
            <TitleEyebrow>{t("Trust")}</TitleEyebrow>
            <Title>{t("Our Customers")}</Title>
          </TitleBlock>
          <HeaderRule />
        </SectionHeader>
        <Subtitle>{t("Trusted by leading businesses.")}</Subtitle>

        <SwiperWrapper>
          <Swiper
            modules={[Autoplay, Navigation]}
            loop={true}
            speed={700}
            navigation={{
              prevEl: ".swiper-button-prev",
              nextEl: ".swiper-button-next",
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={breakpoints}
            spaceBetween={16}
          >
            {customersData.map((c, i) => (
              <SwiperSlide key={i}>
                <SlideContainer>
                  <LogoItem src={c.logo} alt={c.name} loading={i < 6 ? "eager" : "lazy"} />
                </SlideContainer>
              </SwiperSlide>
            ))}
            <div className="swiper-button-prev" />
            <div className="swiper-button-next" />
          </Swiper>
        </SwiperWrapper>
      </SectionContainer>
    </PageWrapper>
  );
};

export default PartnersAndCustomersSection;