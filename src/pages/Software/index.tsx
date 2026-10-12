import React, { lazy } from "react";
import AboutBanner from "../../components/AboutBanner";
import ServicesPage from "../../components/Integration";
import { useTranslation } from "react-i18next";
import CoreValuesSystem from "../../components/CoreValuesSystem";

const Container = lazy(() => import("../../common/Container"));

const Software = () => {
  const { t } = useTranslation();
  const coreOfferings = {
    title: "Core Offerings",
    solutions: [
      {
        title: "Custom Software Development",
        content: "Tailored software solutions designed to meet specific operational needs."
      },
      {
        title: "Multi-Vendor System Integration",
        content: "Ensuring seamless interoperability across platforms and technologies."
      },
      {
        title: "Risk Management",
        content: "Expertise in detecting and mitigating potential challenges during implementation."
      }
    ]
  };
  
  return (
    <Container>
      <AboutBanner
        backgroundImage="/img/background/our_service.jpeg"
        title={t("Professional Services")}
      />
      <ServicesPage 
        pageTitle={t("Software Development")}
        sectionTitle={t("Description")} 
        serviceText="Specializes in developing and integrating custom software solutions that align with diverse client requirements. By leveraging advanced technologies, we help businesses achieve greater efficiency, minimize risks, and reduce costs."
        imagePath="/img/background/software.jpg"
      />
      <CoreValuesSystem
        title={t(coreOfferings.title)}
        solutions={coreOfferings.solutions.map((solution) => ({
          title: t(solution.title),
          content: [t(solution.content)],
        }))}
        defaultImage="/img/background/software_2.png" 
      />
    </Container>
  );
};

export default Software;