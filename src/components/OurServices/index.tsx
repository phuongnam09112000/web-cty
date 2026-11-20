import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ServiceData } from '../../pages/Services';
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

interface CardsSectionProps  { services: ServiceData[]; }
interface OurServicesProps extends CardsSectionProps {
  onButtonClick?: () => void;
}

type Props = Partial<OurServicesProps> & { data?: OurServicesData; lang?: Lang };

const scrollToContactForm = () => {
  document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const OurServices = ({ data, lang = 'vi', services = [], onButtonClick }: Props) => {
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
    const { t } = useTranslation();
    return (
      <HeaderContainer>
        <WaveBackground className="visible" />
        <HeaderContent>
          <Subtitle className="visible">{data ? pick(data.eyebrow, lang) : t('ourservices.eyebrow')}</Subtitle>
          <Title className="visible">
            {data ? (
              renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_SPACE })
            ) : (
              <Trans i18nKey="ourservices.title">
                Dịch vụ <em>Chuyên nghiệp</em>
              </Trans>
            )}
          </Title>
          <Button onClick={data ? scrollToContactForm : onButtonClick} className="visible">
            <span>{data ? pick(data.buttonLabel, lang) : t('ourservices.cta')}</span>
          </Button>
        </HeaderContent>
      </HeaderContainer>
    );
  };

  /* ── Cards ── */
  const CardsSection: React.FC<CardsSectionProps> = ({ services }) => {
    if (data) {
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
    }
    return (
      <CardsContainerWrapper>
        <CardsContainer>
          {services.map((service, index) => (
            <CardWrapper key={index} className={`visible-${index + 1}`}>
              {/* Front face */}
              <CardContent>
                <ImageContainer>
                  <CardIcon src={service.icon} alt={t(service.title)} />
                </ImageContainer>
                <CardTitle as="h2">{t(service.title)}</CardTitle>
                <CardDescription>{t(service.description)}</CardDescription>
                {service.path && (
                  <CardLink to={service.path}>
                    {t('Learn more')} <span aria-hidden="true">→</span>
                  </CardLink>
                )}
              </CardContent>

              {/* Hover overlay */}
              {service.full_des && Object.keys(service.full_des).length > 0 && (
                <DetailsOverlay>
                  <CardTitle>{t(service.title)}</CardTitle>
                  <DetailsList>
                    {Object.entries(service.full_des).map(([category, items], catIndex) => (
                      <DetailCategory key={catIndex}>
                        <CategoryTitle>{t(category)}</CategoryTitle>
                        {Array.isArray(items) &&
                          items.map((item, itemIdx) => (
                            <DetailItem key={itemIdx}>{t(item)}</DetailItem>
                          ))}
                      </DetailCategory>
                    ))}
                  </DetailsList>
                  {service.path && (
                    <CardLink to={service.path} $onDark tabIndex={-1}>
                      {t('Learn more')} <span aria-hidden="true">→</span>
                    </CardLink>
                  )}
                  {(isTouchDevice || windowWidth <= 1024) && (
                    <TouchIndicator>i</TouchIndicator>
                  )}
                </DetailsOverlay>
              )}
            </CardWrapper>
          ))}
        </CardsContainer>
      </CardsContainerWrapper>
    );
  };

  return (
    <>
      <HeaderSection />
      <CardsSection services={services} />
    </>
  );
};

export default OurServices;