import { lazy, useRef } from "react";
import ScrollToTop from "../../common/ScrollToTop";
import OurServices from "../../components/OurServices";
import Opportunity from "../../components/Opportunity";
import ContactForm from "../../components/FormContact";
const Container = lazy(() => import("../../common/Container"));

export interface ServiceData {
  title: string;
  description: string;
  icon: string; 
  /** Detail page for this service */
  path?: string;
  full_des: Partial<{
    "Telecom Solutions": string[];
    "Custom Software Development": string[];
    "Multi-Vendor System Integration": string[];
    "Risk Management": string[];
    "24/7 Multi-Tier Support": string[];
    "On-Site Engineering Teams": string[];
    "SLA-Driven Performance": string[];
  }>;
}

const Services = () => {
  const contactFormRef = useRef<HTMLDivElement>(null);

  const scrollToContactForm = () => {
    if (contactFormRef.current) {
      contactFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const servicesData: ServiceData[] = [
    {
      title: "System Integration",
      description:
        "ISTT is a leading company in the field of System Integration (SI), helping businesses and organizations connect different technology platforms into a unified system, optimizing operational efficiency, security, and scalability.",
      icon: "/img/icons/sys.png",
      path: "/integration",
      full_des: {
        "Telecom Solutions": [
          "Powerhouse of telco solutions for major tier-1 communication service providers in Vietnam.",
          "Provide niche solutions that tailored to meet the needs of Secure & Defense industries.",
          "Supports businesses in Digital Transformation, leveraging technology to optimize operations and enhance competitiveness.",
        ],
      },
    },
    {
      title: "Software Development",
      description:
        "Specializes in developing and integrating custom software solutions that align with diverse client requirements. By leveraging advanced technologies, we help businesses achieve greater efficiency, minimize risks, and reduce costs.",
      icon: "/img/icons/sw.png",
      path: "/software",
      full_des: {
        "Custom Software Development": [
          "Tailored software solutions designed to meet specific operational needs.",
        ],
        "Multi-Vendor System Integration": [
          "Ensuring seamless interoperability across platforms and technologies.",
        ],
        "Risk Management": [
          "Expertise in detecting and mitigating potential challenges during implementation.",
        ],
      },
    },
    {
      title: "Technical Support",
      description:
        "We offers 24/7 technical support services designed to ensure system reliability and uptime. With a skilled support team and strategic on-site presence across Vietnam, we provide rapid issue resolution and consistent service quality.",
      icon: "/img/icons/technical-support.png",
      path: "/support",
      full_des: {
        "24/7 Multi-Tier Support": [
          "Comprehensive assistance available online and on-site.",
        ],
        "On-Site Engineering Teams": [
          "Strategically located in Hanoi, Ho Chi Minh City, and Da Nang for immediate response.",
        ],
        "SLA-Driven Performance": [
          "Adherence to strict service level agreements to ensure reliability and customer satisfaction.",
        ],
      },
    },
  ];

  return (
    <Container>
      <ScrollToTop />
      <OurServices services={servicesData} onButtonClick={scrollToContactForm} />
      <Opportunity
        title="Customized services"
        imageSrc="/img/background/services-2.png"
        subtitle="Flexible Services"
      />
      <div ref={contactFormRef}>
        <ContactForm />
      </div>
    </Container>
  );
};

export default Services;