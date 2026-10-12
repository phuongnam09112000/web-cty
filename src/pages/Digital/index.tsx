import React, { lazy, useRef } from "react";
import AboutBanner from "../../components/AboutBanner";
import ServicesPage from "../../components/Integration";
import { useTranslation } from "react-i18next";
import CoreValuesSystem from "../../components/CoreValuesSystem";
import ContactForm from "../../components/FormContact";
import SolutionBanner from "../../components/SolutionBanner";

const Container = lazy(() => import("../../common/Container"));

const Digital = () => {
  const { t } = useTranslation();
  const contactFormRef = useRef<HTMLDivElement>(null);
  const scrollToContact = () => {
    contactFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };
  const solutionImages = [
    "/img/background/digital_automation.jpg",
    "/img/background/digital_iot.jpg",
    "/img/background/digital_generation.jpg",
    "/img/background/digital_transformation.jpg",
    "/img/background/digital_smartcity.jpg",
  ];
  const solutions = [
    {
      id: "automation",
      title: "Automation & Digital Infrastructure",
      content: [
        "Integrating telecommunications cloud computing, AI automation, OSS & BSS to enhance operational efficiency, helping organizations improve service quality.",
      ],
      image: "/img/background/digital_automation.jpg",
      icon: "/img/icons/automation.png",
    },
    {
      id: "iot-applications",
      title: "AI, Big Data, and IoT Applications",
      content: [
        "Implementing advanced data analytics and AI-driven solutions for business optimization.",
      ],
      image: "/img/background/digital_iot.jpg",
      icon: "/img/icons/artificial-intelligence-2.png",
    },
    {
      id: "digital-platforms",
      title: "Next-Generation Digital Platforms",
      content: [
        "Developing 5G Core SA, O-RAN, and cutting-edge digital platforms.",
      ],
      image: "/img/background/digital_generation.jpg",
      icon: "/img/icons/development.png",
    },
    {
      id: "dt-for-governments",
      title: "Digital Transformation for Governments",
      content: [
        "Advanced solutions for public sector modernization and enhanced governance efficiency.",
      ],
      image: "/img/background/digital_transformation.jpg",
      icon: "/img/icons/transformation.png",
    },
    {
      id: "smart-city",
      title: "Data Management & Smart City",
      content: [
        "Utilizing Big Data for smart city development and efficient urban management.",
      ],
      image: "/img/background/digital_smartcity.jpg",
      icon: "/img/icons/smart-city.png",
    },
  ];

  return (
    <Container>
      <SolutionBanner
        backgroundImage="/img/background/our_service.jpeg"
        title={t("Premium Solutions")}
        subtitle={t(
          "We design high-end technology solutions that are flexible, robust, and ready for the digital future."
        )}
        buttonText={t("Book a consultation")}
        onButtonClick={scrollToContact}
        overlayColor="rgba(14, 93, 149, 0.5)"
        titleColor="#ffffff"
        subtitleColor="rgba(255, 255, 255, 0.85)"
      />
      <ServicesPage
        pageTitle={t("Digital Transformation")}
        sectionTitle={t("Description")}
        serviceText="Supports businesses in Digital Transformation, leveraging technology to optimize operations and enhance competitiveness."
        imagePath="/img/background/digital.jpg"
      />
      <CoreValuesSystem
        title={t("Core Offerings")}
        solutions={solutions.map((item) => ({
          title: t(item.title),
          content: item.content.map((text) => t(text)),
          icon: item.icon,
        }))}
        defaultImage="/img/background/digital_2.jpg"
        images={solutionImages}
      />
      <div ref={contactFormRef}>
        <ContactForm />
      </div>
    </Container>
  );
};

export default Digital;
