import React, { lazy } from "react";
import AboutBanner from "../../components/AboutBanner";
import ServicesPage from "../../components/Integration";
import { useTranslation } from "react-i18next";
import CoreValuesSystem from "../../components/CoreValuesSystem";

const Container = lazy(() => import("../../common/Container"));

const Support = () => {
  const { t } = useTranslation();
  const coreOfferings = {
    title: "Core Offerings",
    solutions: [
      {
        title: "24/7 Multi-Tier Support",
        content: "Comprehensive assistance available online and on-site."
      },
      {
        title: "On-Site Engineering Teams",
        content: "Strategically located in Hanoi, Ho Chi Minh City, and Da Nang for immediate response."
      },
      {
        title: "SLA-Driven Performance",
        content: "Adherence to strict service level agreements to ensure reliability and customer satisfaction."
      }
    ]
  };
  
  return (
    <Container>
      <AboutBanner
        backgroundImage="/img/banners/support.svg"
        title={t("Professional Services")}
        headingLevel={2}
      />
      <ServicesPage 
        pageTitle={t("Technical Support")} 
        sectionTitle={t("Description")} 
        serviceText="We offers 24/7 technical support services designed to ensure system reliability and uptime. With a skilled support team and strategic on-site presence across Vietnam, we provide rapid issue resolution and consistent service quality."
        imagePath="/img/background/support.jpg"
      />
      <CoreValuesSystem
        title={t(coreOfferings.title)}
        solutions={coreOfferings.solutions.map((solution) => ({
          title: t(solution.title),
          content: [t(solution.content)],
        }))}
        defaultImage="/img/background/support_2.jpg" 
      />
    </Container>
  );
};

export default Support;