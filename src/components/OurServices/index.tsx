import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pick } from '../../cms/pick';
import { HEADING_SEPARATOR_SPACE, renderHeading } from '../../cms/headingParts';
import type { Lang, OurServicesData } from '../../cms/types';
import {
  HeaderContainer,
  WaveBackground,
  HeaderContent,
  Subtitle,
  Title,
  Button,
  CardsContainerWrapper,
  CardsContainer,
  CardWrapper,
  CardContent,
  ImageContainer,
  CardIcon,
  CardTitle,
  CardDescription,
  DetailsOverlay,
  DetailsList,
  CategoryTitle,
  DetailItem,
  DetailCategory,
  TouchIndicator,
  CardLink,
} from './styles';

type Props = { data: OurServicesData; lang: Lang };

const scrollToContactForm = () => {
  document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const OurServices = ({ data, lang }: Props) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [windowWidth,   setWindowWidth]   = useState(window.innerWidth);
  const { t } = useTranslation();

  useEffect(() => {
    const handle = () => {
      setWindowWidth(window.innerWidth);
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  /* ── Header ── */
  const HeaderSection: React.FC = () => {
    return (
      <HeaderContainer>
        <WaveBackground className="visible" />
        <HeaderContent>
          <Subtitle className="visible">{pick(data.eyebrow, lang)}</Subtitle>
          <Title className="visible">
            {renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_SPACE })}
          </Title>
          <Button onClick={scrollToContactForm} className="visible">
            <span>{pick(data.buttonLabel, lang)}</span>
          </Button>
        </HeaderContent>
      </HeaderContainer>
    );
  };

  /* ── Cards ── */
  const CardsSection: React.FC = () => {
    return (
        <CardsContainerWrapper>
          <CardsContainer>
            {data.items.map((item, index) => {
              const title = pick(item.title, lang);
              return (
                <CardWrapper key={index} className={`visible-${index + 1}`}>
                  <CardContent>
                    <ImageContainer>
                      <CardIcon src={item.icon?.url ?? ''} alt={(item.icon && pick(item.icon.alt, lang)) || title} />
                    </ImageContainer>
                    <CardTitle as="h2">{title}</CardTitle>
                    <CardDescription>{pick(item.description, lang)}</CardDescription>
                    {item.href && (
                      <CardLink to={item.href}>
                        {t('Learn more')} <span aria-hidden="true">→</span>
                      </CardLink>
                    )}
                  </CardContent>

                  {item.categories.length > 0 && (
                    <DetailsOverlay>
                      <CardTitle>{title}</CardTitle>
                      <DetailsList>
                        {item.categories.map((category, catIndex) => (
                          <DetailCategory key={catIndex}>
                            <CategoryTitle>{pick(category.name, lang)}</CategoryTitle>
                            {category.bullets.map((bullet, itemIdx) => (
                              <DetailItem key={itemIdx}>{pick(bullet, lang)}</DetailItem>
                            ))}
                          </DetailCategory>
                        ))}
                      </DetailsList>
                      {item.href && (
                        <CardLink to={item.href} $onDark tabIndex={-1}>
                          {t('Learn more')} <span aria-hidden="true">→</span>
                        </CardLink>
                      )}
                      {(isTouchDevice || windowWidth <= 1024) && (
                        <TouchIndicator>i</TouchIndicator>
                      )}
                    </DetailsOverlay>
                  )}
                </CardWrapper>
              );
            })}
          </CardsContainer>
        </CardsContainerWrapper>
      );
  };

  return (
    <>
      <HeaderSection />
      <CardsSection />
    </>
  );
};

export default OurServices;