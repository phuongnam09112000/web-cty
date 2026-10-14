import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ServiceData } from '../../pages/Services';
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

const OurServices: React.FC<OurServicesProps> = ({ services, onButtonClick }) => {
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
          <Subtitle className="visible">{t('ourservices.eyebrow')}</Subtitle>
          <Title className="visible">
            <Trans i18nKey="ourservices.title">
              Dịch vụ <em>Chuyên nghiệp</em>
            </Trans>
          </Title>
          <Button onClick={onButtonClick} className="visible">
            <span>{t('ourservices.cta')}</span>
          </Button>
        </HeaderContent>
      </HeaderContainer>
    );
  };

  /* ── Cards ── */
  const CardsSection: React.FC<CardsSectionProps> = ({ services }) => {
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