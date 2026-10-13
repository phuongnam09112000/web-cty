import { lazy, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
// import Section from "../../components/Content2";
// import ServiceSection from "../../components/Services";
// import ImageSlider from "../../components/SliderBar";
// import PartnersSection from "../../components/Partner";
import ScrollToTop from "../../common/ScrollToTop";
import LazySectionComponent from "../Lazy";

const Content1 = lazy(() => import("../../components/Content1"));
const Container = lazy(() => import("../../common/Container"));
const ServiceSection = lazy(() => import("../../components/OurSolutions"));
const ImageSlider = lazy(() => import("../../components/SliderBar"));
const PartnersSection = lazy(() => import("../../components/Partner"));
const Section = lazy(() => import("../../components/Content2"));

// Target of the hero's "Explore our solutions" button. Focus lands here so
// keyboard and screen-reader users continue from the solutions section.
const SolutionsAnchor = styled.div`
  scroll-margin-top: ${({ theme }) => theme.layout.headerHeight};
  &:focus { outline: none !important; }

  ${({ theme }) => theme.media.down("md")} {
    scroll-margin-top: ${({ theme }) => theme.layout.headerHeightMobile};
  }
`;

const scrollToSolutions = (event: MouseEvent<HTMLAnchorElement>) => {
  const target = document.getElementById("solutions");
  if (!target) return; // fall back to the plain #solutions link
  event.preventDefault();
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  target.focus({ preventScroll: true });
};

const Home = () => {
  const { t } = useTranslation();
  const images = [
    "/img/background/home_banner.jpeg",
    "/img/background/home_banner_2.jpeg",
    "/img/background/home_banner_3.jpeg",
    "/img/background/home_banner_4.jpg",
  ];
  const descriptions = [
    "The Path of Technology – Turning Dreams into Reality",
    "Contributing to elevating Vietnam's IT, Telecommunications, Secure & Defense industry to a new level.",
    "Establishing relationships with leading global partners in the IT, Telecommunications, Secure & Defense sectors.",
    "Always ready to update with the latest advanced knowledge from around the world.",
  ];
  return (
    <Container>
      <ScrollToTop />

      <Content1
        backgroundImage={images}
        eyebrow={t("Information Services & Technology Transfer Company Limited")}
        title={t("home.hero.title")}
        descriptions={descriptions.map((desc) => t(desc))}
        primaryAction={{
          label: t("home.hero.cta.solutions"),
          href: "#solutions",
          onClick: scrollToSolutions,
        }}
        secondaryAction={{ label: t("home.hero.cta.contact"), to: "/contact" }}
        id="home"
      />

      <Section />

      <SolutionsAnchor id="solutions" tabIndex={-1}>
        <LazySectionComponent>
          <ServiceSection />
        </LazySectionComponent>
      </SolutionsAnchor>
      <LazySectionComponent>
        <ImageSlider />
      </LazySectionComponent>

      <PartnersSection />
    </Container>
  );
};

export default Home;
