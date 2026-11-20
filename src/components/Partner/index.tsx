import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useNearViewport from "../../common/utils/useNearViewport";
import { Eyebrow, SectionHeading, SectionInner } from "../../styles/section";
import LazySectionComponent from "../../pages/Lazy";
import { pick } from "../../cms/pick";
import type { BlockProps } from "../../cms/BlockRenderer";
import Logo from "./Logo";
import {
  CustomerCell,
  CustomerLogo,
  CustomerName,
  CustomerPanel,
  CustomersHeader,
  CustomersSection,
  Intro,
  LogoCell,
  LogoGrid,
  PartnersAside,
  PartnersLayout,
  PartnersSection,
  Toggle,
  ToggleRow,
} from "./styles";

const Chevron = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path d="M2 4l4 4 4-4" />
  </svg>
);

export const Partners = ({ data, lang }: BlockProps<"partners">) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);
  const [showAll, setShowAll] = useState(false);
  const initial = data.initialCount;

  const toggle = (
    <Toggle
      type="button"
      aria-expanded={showAll}
      aria-controls="partner-logos"
      onClick={() => setShowAll((v) => !v)}
    >
      {showAll
        ? t("home.partners.showFewer")
        : t("home.partners.viewAll", { count: data.items.length })}
      <Chevron />
    </Toggle>
  );

  return (
    <LazySectionComponent>
      <div ref={ref}>
        <PartnersSection aria-labelledby="partners-title">
          <SectionInner>
            <PartnersLayout>
              <PartnersAside>
                <Eyebrow>{pick(data.eyebrow, lang)}</Eyebrow>
                <SectionHeading id="partners-title">{pick(data.heading, lang)}</SectionHeading>
                <Intro>{pick(data.intro, lang)}</Intro>
                {toggle}
              </PartnersAside>

              <div>
                <LogoGrid id="partner-logos">
                  {data.items.map((partner, index) => (
                    <LogoCell key={index} hidden={!showAll && index >= initial}>
                      <Logo
                        image={partner.logo}
                        alt={(partner.logo && pick(partner.logo.alt, lang)) || partner.name}
                        area={3600}
                        maxWidth={150}
                        maxHeight={64}
                        load={near && (showAll || index < initial)}
                      />
                    </LogoCell>
                  ))}
                </LogoGrid>
                <ToggleRow>{toggle}</ToggleRow>
              </div>
            </PartnersLayout>
          </SectionInner>
        </PartnersSection>
      </div>
    </LazySectionComponent>
  );
};

export const Customers = ({ data, lang }: BlockProps<"customers">) => {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);

  return (
    <LazySectionComponent>
      <div ref={ref}>
        <CustomersSection aria-labelledby="customers-title">
          <SectionInner>
            <CustomersHeader>
              <Eyebrow>{pick(data.eyebrow, lang)}</Eyebrow>
              <SectionHeading id="customers-title">{pick(data.heading, lang)}</SectionHeading>
              <Intro $center>{pick(data.intro, lang)}</Intro>
            </CustomersHeader>

            <CustomerPanel>
              {data.items.map((customer, index) => {
                const name = pick(customer.name, lang);
                return (
                  <CustomerCell key={index}>
                    <CustomerLogo>
                      <Logo
                        image={customer.logo}
                        alt={(customer.logo && pick(customer.logo.alt, lang)) || name}
                        area={2600}
                        maxWidth={128}
                        maxHeight={60}
                        load={near}
                        decorative
                      />
                    </CustomerLogo>
                    <CustomerName>{name}</CustomerName>
                  </CustomerCell>
                );
              })}
            </CustomerPanel>
          </SectionInner>
        </CustomersSection>
      </div>
    </LazySectionComponent>
  );
};

export default Partners;
