export interface ServiceCardProps {
    title: string;
    description: string;
    icon: string; // URL hoặc SVG icon
  }
  
export interface OurServicesProps {
    services: ServiceCardProps[];
  }

  export interface CardsSectionProps {
    services: {
      title: string;
      description: string;
      icon: string;
    }[];
  }
  // types.ts or services.tsx
export interface ServiceData {
  title: string;
  description: string;
  icon: string;
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