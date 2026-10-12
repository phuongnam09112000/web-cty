import React, { lazy, useRef } from "react";
import AboutBanner from "../../components/AboutBanner";
import ServicesPage from "../../components/Integration";
import { useTranslation } from "react-i18next";
import CoreValuesSystem from "../../components/CoreValuesSystem";
import ContactForm from "../../components/FormContact";
import ContactBanner from "../../components/ContactBanner";
import SolutionBanner from "../../components/SolutionBanner";

const Container = lazy(() => import("../../common/Container"));

const IctComponent = () => {
  const { t } = useTranslation();
  const contactFormRef = useRef<HTMLDivElement>(null);
  const scrollToContact = () => {
    contactFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };
  // Define multiple images for the solution carousel
  const solutionImages = [
    "/img/background/ict_2.jpg",
    "/img/background/ict_cloud.jpg",
    "/img/background/ict_optical.jpg",
  ];

  // Define icon paths for each solution
  const solutionIcons = [
    "/img/icons/telecommunication-icon.svg", // Replace with your actual icon paths
    "/img/icons/cloud-icon.svg",
    "/img/icons/optical-icon.svg",
  ];

  const contentData = [
    {
      id: "telecommunication",
      title: "Telecommunication Network Systems",
      content: [
        "Providing core network solutions from 3G/4G to 5G, specialized in signaling systems, e.g. STP/DRA-DEA/SBC/SCP.",
        "Providing comprehensive PacketCore & IMS-VoLTE solutions.",
        "Providing Assurance solutions for network and services.",
      ],
      image: "/img/background/ict_2.jpg",
      icon: "/img/icons/telecommunication.png",
    },
    {
      id: "telco-cloud",
      title: "Telco Cloud & Network Automation",
      content: [
        "Optimize infrastructure management efficiency, enhance scalability and flexibility in network operations, while improving telecommunications service quality.",
      ],
      image: "/img/background/ict_cloud.jpg",
      icon: "/img/icons/artificial-intelligence.png",
    },
    {
      id: "optical",
      title: "Optical Transmission Systems",
      content: [
        "Providing optical transmission solutions and managed services for communication service provider.",
      ],
      image: "/img/background/ict_optical.jpg",
      icon: "/img/icons/technology.png",
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
        pageTitle="Information Communication Technology - ICT"
        sectionTitle={t("Description")}
        serviceText="Delivers advanced ICT solutions, assisting businesses and organizations in optimizing their technology infrastructure, improving operational efficiency, and ensuring high security."
        imagePath="/img/background/ict.jpg"
      />

      <CoreValuesSystem
        title={t("Core Offerings")}
        solutions={contentData.map((item) => ({
          title: t(item.title),
          content: item.content.map((text) => t(text)),
          image: item.image,
          icon: item.icon,
        }))}
        defaultImage="/img/background/ict_2.jpg"
        icons={solutionIcons}
        images={solutionImages}
      />
      <div ref={contactFormRef}>
        <ContactForm />
      </div>
    </Container>
  );
};

export default IctComponent;
