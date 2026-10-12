import React, { lazy, useRef } from "react";
import AboutBanner from "../../components/AboutBanner";
import ServicesPage from "../../components/Integration";
import { useTranslation } from "react-i18next";
import CoreValuesSystem from "../../components/CoreValuesSystem";
import SolutionBanner from "../../components/SolutionBanner";

const Container = lazy(() => import("../../common/Container"));

const Integration = () => {
  const { t } = useTranslation();
  const contactFormRef = useRef<HTMLDivElement>(null);
  const coreOfferings = {
    title: "Core Offerings",
    solutions: [
      {
        title: "Telecom Solutions",
        content:
          "STP (SS7), DSR (Diameter), SBC (SIP), MNP, SMSC-FDA, DNS, SMS GW, USSD GW.",
      },
      {
        title: "Roaming & Interconnect Solutions",
        content: "Seamless global and local network integration.",
      },
      {
        title: "Optimized Telecom Infrastructure",
        content: "Secure, high-performance networking solutions",
      },
    ],
  };
  const scrollToContact = () => {
    contactFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };
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
        pageTitle="System Integration"
        sectionTitle={t("Description")}
        serviceText={t(
          "ISTT is a leading provider in the field of System Integration (SI), helping businesses and organizations connect different technology platforms into a unified system, optimizing operational efficiency, security, and scalability."
        )}
        imagePath="/img/background/sy.jpg"
      />
      <CoreValuesSystem
        title={t(coreOfferings.title)}
        solutions={coreOfferings.solutions.map((solution) => ({
          title: t(solution.title),
          content: [t(solution.content)],
        }))}
        defaultImage="/img/background/sy_2.jpg"
      />
    </Container>
  );
};

export default Integration;
