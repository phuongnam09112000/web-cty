import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import { useTranslation } from "react-i18next";
import { SolutionItem } from "./types";
import { pick } from "../../cms/pick";
import type { CoreValuesSystemData, Lang } from "../../cms/types";
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
}

const SolutionCardItem = memo(
  ({ solution, index, isSelected, iconEl, onSelect }: CardProps) => (
    <SolutionCard
      isSelected={isSelected}
      onClick={() => onSelect(index)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(index);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <IconContainer isActive={isSelected}>{iconEl}</IconContainer>
      <SolutionContent>
        <SolutionTitle level={3}>{solution.title}</SolutionTitle>
        <ContentList>
          {solution.content.map((item, i) => (
            <ContentItem key={i}>{item}</ContentItem>
          ))}
        </ContentList>
      </SolutionContent>
    </SolutionCard>
  )
);

/* ─── Main ───────────────────────────────────── */
type Props = { data: CoreValuesSystemData; lang: Lang };

const AUTO_PLAY_INTERVAL = 5000;

const CoreValuesSystem = ({ data, lang }: Props) => {
  const { t } = useTranslation();
  const solutions = useMemo<SolutionItem[]>(
    () =>
      data.items.map((item) => {
        const itemTitle = pick(item.title, lang);
        return {
          title: itemTitle,
          content: item.bullets.map((bullet) => pick(bullet, lang)),
          image: item.image?.url,
          icon: item.icon?.url,
          imageAlt: (item.image && pick(item.image.alt, lang)) || itemTitle,
          iconAlt: (item.icon && pick(item.icon.alt, lang)) || itemTitle,
        };
      }),
    [data, lang]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef    = useRef<NodeJS.Timeout | null>(null);
  const pauseTimerRef  = useRef<NodeJS.Timeout | null>(null);
  const isPausedRef    = useRef(false);

  const getIcon = useCallback(
    (index: number) => {
      const src = solutions[index]?.icon;
      return src ? <CustomIcon src={src} alt={solutions[index]?.iconAlt ?? solutions[index]?.title} /> : null;
    },
    [solutions]
  );

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setActiveIndex((prev) =>
          prev === solutions.length - 1 ? 0 : prev + 1
        );
      }
    }, AUTO_PLAY_INTERVAL);
  }, [solutions.length]);

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
    <Container>
      {/* ── Title ── */}
      <TitleBlock>
        <TitleEyebrow>{pick(data.eyebrow, lang)}</TitleEyebrow>
        <PageTitle level={2}>{pick(data.title, lang)}</PageTitle>
        <TitleDivider />
      </TitleBlock>

      <ContentLayout>
        {/* ── Image ── */}
        <ImageSide>
          <ImageContainer>
            {solutions.map((_, index) => (
              <ImageLayer key={index} active={index === activeIndex}>
                {solutions[index]?.image && (
                  <img
                    src={solutions[index].image}
                    alt={solutions[index].imageAlt ?? solutions[index].title}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                )}
              </ImageLayer>
            ))}
            <ImageControls>
              <ProgressIndicators>
                {solutions.map((_, index) => (
                  <ProgressDotShell
                    key={index}
                    onClick={() => handleSelect(index)}
                    aria-label={t("Go to slide {{number}}", { number: index + 1 })}
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
            />
          ))}
        </SolutionsContainer>
      </ContentLayout>
    </Container>
  );
};

export default CoreValuesSystem;