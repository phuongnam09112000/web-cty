import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
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
        title={t("Information Services & Technology Transfer Company Limited")}
        descriptions={descriptions.map((desc) => t(desc))}
        id="home"
      />

      <Section />

      <LazySectionComponent>
        <ServiceSection />
      </LazySectionComponent>
      <LazySectionComponent>
        <ImageSlider />
      </LazySectionComponent>

      <PartnersSection />
    </Container>
  );
};

export default Home;
