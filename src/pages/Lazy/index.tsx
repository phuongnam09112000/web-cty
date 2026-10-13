import { useEffect, useRef, useState } from "react";
import { LazySection } from "./styles";

interface LazySectionProps {
  children: React.ReactNode;
}

const LazySectionComponent = ({ children }: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <LazySection ref={sectionRef} isVisible={isVisible}>
      {children}
    </LazySection>
  );
};

export default LazySectionComponent;