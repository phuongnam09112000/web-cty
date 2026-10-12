import { lazy } from "react";
import { useTranslation } from "react-i18next";
import AboutBanner from "../../components/AboutBanner";
import OverviewSection from "../../components/OverviewSection";
import Vision from "../../components/Vision";
import Mission from "../../components/Mission"
import CoreValues from "../../components/CoreValues";
import ScrollToTop from "../../common/ScrollToTop";
import ContactForm from "../../components/FormContact";
const Container = lazy(() => import("../../common/Container"));

const About = () => {
  const { t } = useTranslation();
  const images = [
    "/img/background/istt_about.jpg",
    "/img/background/istt_about_2.jpg",
    "/img/background/istt_about_3.jpg",
  ];
  return (
    <Container>
      <ScrollToTop />
      <AboutBanner
        backgroundImage="/img/background/about_banner.jpeg"
        title={t("About us")}
      />
      <OverviewSection images={images} />
      <Vision />
      <Mission />
      <CoreValues />
      <ContactForm />
    </Container>
  );
};

export default About;
