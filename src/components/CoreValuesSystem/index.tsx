import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import { useTranslation } from "react-i18next";
import { CoreValuesSystemProps, SolutionItem } from "./types";
import {
  Container,
  TitleBlock,
  TitleEyebrow,
  PageTitle,
  TitleDivider,
  ContentLayout,
  ImageSide,
  ImageContainer,
  ImageLayer,
  SolutionsContainer,
  SolutionCard,
  IconContainer,
  CustomIcon,
  SolutionContent,
  SolutionTitle,
  ContentList,
  ContentItem,
  ImageControls,
  ProgressIndicators,
  ProgressDotShell,
  ProgressDotInner,
} from "./styles";

/* ─── Card item ──────────────────────────────── */
interface CardProps {
  solution: SolutionItem;
  index: number;
  isSelected: boolean;
  iconEl: React.ReactNode;
  onSelect: (index: number) => void;
  t: (key: string) => string;
}

const SolutionCardItem = memo(
  ({ solution, index, isSelected, iconEl, onSelect, t }: CardProps) => (
    <SolutionCard isSelected={isSelected} onClick={() => onSelect(index)}>
      <IconContainer isActive={isSelected}>{iconEl}</IconContainer>
      <SolutionContent>
        <SolutionTitle level={3}>{t(solution.title)}</SolutionTitle>
        <ContentList>
          {solution.content.map((item, i) => (
            <ContentItem key={i}>{t(item)}</ContentItem>
          ))}
        </ContentList>
      </SolutionContent>
    </SolutionCard>
  )
);

/* ─── Main ───────────────────────────────────── */
const CoreValuesSystem: React.FC<CoreValuesSystemProps> = ({
  title,
  solutions,
  backgroundColor,
  defaultImage = "/img/background/sy.jpg",
  autoPlayInterval = 5000,
  images = [],
  icons = [],
}) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef    = useRef<NodeJS.Timeout | null>(null);
  const pauseTimerRef  = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef    = useRef(false);

  const getImage = useCallback(
    (index: number) =>
      solutions[index]?.image ||
      images[index % images.length] ||
      defaultImage,
    [solutions, images, defaultImage]
  );

  const getIcon = useCallback(
    (index: number) => {
      const src = solutions[index]?.icon || icons[index];
      return src ? (
        <CustomIcon src={src} alt={solutions[index]?.title} />
      ) : null;
    },
    [solutions, icons]
  );

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setActiveIndex((prev) =>
          prev === solutions.length - 1 ? 0 : prev + 1
        );
      }
    }, autoPlayInterval);
  }, [autoPlayInterval, solutions.length]);

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startInterval]);

  const handleSelect = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      setActiveIndex(index);
      isPausedRef.current = true;
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        isPausedRef.current = false;
      }, 10000);
    },
    [activeIndex]
  );

  useEffect(() => {
    return () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); };
  }, []);

  return (
    <Container backgroundColor={backgroundColor}>
      {/* ── Title ── */}
      <TitleBlock>
        <TitleEyebrow>Our Solutions</TitleEyebrow>
        <PageTitle level={1}>{t(title)}</PageTitle>
        <TitleDivider />
      </TitleBlock>

      <ContentLayout>
        {/* ── Image ── */}
        <ImageSide>
          <ImageContainer>
            {solutions.map((_, index) => (
              <ImageLayer key={index} active={index === activeIndex}>
                <img
                  src={getImage(index)}
                  alt={t(solutions[index]?.title ?? "")}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </ImageLayer>
            ))}
            <ImageControls>
              <ProgressIndicators>
                {solutions.map((_, index) => (
                  <ProgressDotShell
                    key={index}
                    onClick={() => handleSelect(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <ProgressDotInner active={activeIndex === index} />
                  </ProgressDotShell>
                ))}
              </ProgressIndicators>
            </ImageControls>
          </ImageContainer>
        </ImageSide>

        {/* ── Cards ── */}
        <SolutionsContainer>
          {solutions.map((solution, index) => (
            <SolutionCardItem
              key={index}
              solution={solution}
              index={index}
              isSelected={activeIndex === index}
              iconEl={getIcon(index)}
              onSelect={handleSelect}
              t={t}
            />
          ))}
        </SolutionsContainer>
      </ContentLayout>
    </Container>
  );
};

export default CoreValuesSystem;