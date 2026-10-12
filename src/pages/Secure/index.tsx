import React, { lazy, useRef } from "react";
import AboutBanner from "../../components/AboutBanner";
import ServicesPage from "../../components/Integration";
import { useTranslation } from "react-i18next";
import CoreValuesSystem from "../../components/CoreValuesSystem";
import ContactForm from "../../components/FormContact";
import SolutionBanner from "../../components/SolutionBanner";

const Container = lazy(() => import("../../common/Container"));

const Secure = () => {
  const { t } = useTranslation();

  const contactFormRef = useRef<HTMLDivElement>(null);
  const solutionImages = [
    "/img/background/secure_telecom.jpg",
    "/img/background/secure_threat.jpg",
    "/img/background/secure_regulatory.jpg",
    "/img/background/defense_solution.jpg",
  ];
  // Đây là mảng solutions, không phải là object coreOfferings
  const solutions = [
    {
      id: "telecommunication-security",
      title: "Telecommunication Security",
      content: [
        "Signaling Firewall (SS7, Diameter, SIP, GTP) protects telecommunication systems from cyber threats.",
      ],
      image: "/img/background/secure_telecom.jpg",
      icon: "/img/icons/critical.png",
    },
    {
      id: "threat-prevention-systems",
      title: "Threat Prevention Systems",
      content: [
        "DDoS Protection, DNS Filtering, and Anti-Spoofing solutions to secure network infrastructure.",
      ],
      image: "/img/background/secure_threat.jpg",
      icon: "/img/icons/prevention.png",
    },
    {
      id: "regulatory-compliance-monitoring",
      title: "Regulatory Compliance & Monitoring",
      content: [
        "Lawful Interception Systems & carrier-grade URL Filtering solutions for government and enterprise compliance.",
      ],
      image: "/img/background/secure_regulatory.jpg",
      icon: "/img/icons/regulatory-compliance.png",
    },
    {
      id: "defense-solutions",
      title: "Defense Solutions",
      content: [
        "We provide specialized solutions, such as Anti-Drone Systems, Private Tactical Networks, Border Control Systems (Virtual Wall), EW... to enhance national and organizational security.",
      ],
      image: "/img/background/defense_solution.png",
      icon: "/img/icons/cybersecurity.png",
    },
  ];
  const scrollToContact = () => {
    contactFormRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };
  return (
    <Container>
      <SolutionBanner
        backgroundImage="/img/background/our_service.jpeg"
        title={t("Premium Solutions")}
        subtitle={t("We design high-end technology solutions that are flexible, robust, and ready for the digital future.")}
        buttonText={t("Book a consultation")}
        onButtonClick={scrollToContact}
        overlayColor="rgba(14, 93, 149, 0.5)"
        titleColor="#ffffff"
        subtitleColor="rgba(255, 255, 255, 0.85)"
      />
      <ServicesPage
        pageTitle={t("Secure & Defense")}
        sectionTitle={t("Description")}
        serviceText="ISTT offers security and defense solutions, safeguarding systems against sophisticated threats."
        imagePath="/img/background/secure.jpg"
      />
      <CoreValuesSystem
        title={t("Core Offerings")}
        solutions={solutions.map((item) => ({
          title: t(item.title),
          content: item.content.map((text) => t(text)),
          icon: item.icon,
        }))}
        defaultImage="/img/background/secure_telecom.jpg"
        images={solutionImages}
      />
      <div ref={contactFormRef}>
        <ContactForm />
      </div>
    </Container>
  );
};

export default Secure;
