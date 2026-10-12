import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Title,
  Description,
  SolutionItem,
  Divider,
  ContainerContent,
} from "./styles";
import PremiumContent from "../../content/Premium.json";
import { SectionProps } from "./types";
import { useTranslation } from "react-i18next";

// Hàm easing để tạo chuyển động mượt mà hơn
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const PremiumServices: React.FC<
  SectionProps & { isLast?: boolean; sectionRef?: React.Ref<HTMLDivElement> }
> = ({ title, description, title2, solutions, isLast, sectionRef }) => {
  const { t } = useTranslation();
  return (
    <Container ref={sectionRef}>
      <Title>{t(title)}</Title>
      <Description>{t(description)}</Description>
      <h3
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#0E5D95",
          marginBottom: "10px",
        }}
      >
        {t(title2)}
      </h3>
      {solutions.map((solution, idx) => (
        <SolutionItem key={idx}>
          <span>{t(solution.title)}:</span> {t(solution.content)}
        </SolutionItem>
      ))}
      {!isLast && <Divider />}
    </Container>
  );
};

const PremiumPage = () => {
  const location = useLocation();
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace("#", "");
      const targetSection = sectionRefs.current[sectionId];

      if (targetSection) {
        const scrollToSection = () => {
          const start = window.scrollY;
          const targetPosition =
            targetSection.getBoundingClientRect().top + window.scrollY - 50;
          const distance = targetPosition - start;
          const duration = 1200;
          let startTime: number | null = null;
        
          const animation = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeProgress = easeOutCubic(progress);
        
            window.scrollTo(0, start + distance * easeProgress);
        
            if (progress < 1) {
              setTimeout(() => requestAnimationFrame(animation), 0);
            }
          };
        
          requestAnimationFrame(animation);
        };

        scrollToSection();
      }
    }
  }, [location]);

  return (
    <ContainerContent>
      {PremiumContent.sections.map((section, index) => (
        <PremiumServices
          key={section.id || index}
          {...section}
          isLast={index === PremiumContent.sections.length - 1}
          sectionRef={(el) => (sectionRefs.current[section.id] = el)}
        />
      ))}
    </ContainerContent>
  );
};

export default PremiumPage;