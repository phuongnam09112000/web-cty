import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useNearViewport from "../../common/utils/useNearViewport";
import { Eyebrow, SectionHeading, SectionInner } from "../../styles/section";
import { partnersData, customersData } from "./data";
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

// Partners shown before "View all": the first ones in the existing data
// order (no ranking implied).
const INITIAL_PARTNERS = 8;

const Chevron = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path d="M2 4l4 4 4-4" />
  </svg>
);

/* Partners: a compact grid of the first logos with a disclosure button that
 * reveals the rest in place. Customers: every logo, named, in one balanced
 * panel. Nothing moves on its own; logos load as the sections approach. */
const PartnersAndCustomersSection = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);
  const [showAll, setShowAll] = useState(false);

  const toggle = (
    <Toggle
      type="button"
      aria-expanded={showAll}
      aria-controls="partner-logos"
      onClick={() => setShowAll((v) => !v)}
    >
      {showAll
        ? t("home.partners.showFewer")
        : t("home.partners.viewAll", { count: partnersData.length })}
      <Chevron />
    </Toggle>
  );

  return (
    <div ref={ref}>
      <PartnersSection aria-labelledby="partners-title">
        <SectionInner>
          <PartnersLayout>
            <PartnersAside>
              <Eyebrow>{t("Ecosystem")}</Eyebrow>
              <SectionHeading id="partners-title">{t("Our Partners")}</SectionHeading>
              <Intro>{t("United in vision, stronger in execution.")}</Intro>
              {toggle}
            </PartnersAside>

            <div>
              <LogoGrid id="partner-logos">
                {partnersData.map((partner, index) => (
                  <LogoCell key={partner.name} hidden={!showAll && index >= INITIAL_PARTNERS}>
                    <Logo
                      src={partner.logo}
                      alt={partner.name}
                      area={3600}
                      maxWidth={150}
                      maxHeight={64}
                      load={near && (showAll || index < INITIAL_PARTNERS)}
                    />
                  </LogoCell>
                ))}
              </LogoGrid>
              <ToggleRow>{toggle}</ToggleRow>
            </div>
          </PartnersLayout>
        </SectionInner>
      </PartnersSection>

      <CustomersSection aria-labelledby="customers-title">
        <SectionInner>
          <CustomersHeader>
            <Eyebrow>{t("Trust")}</Eyebrow>
            <SectionHeading id="customers-title">{t("Our Customers")}</SectionHeading>
            <Intro $center>{t("Trusted by leading businesses.")}</Intro>
          </CustomersHeader>

          <CustomerPanel>
            {customersData.map((customer) => (
              <CustomerCell key={customer.name}>
                <CustomerLogo>
                  <Logo
                    src={customer.logo}
                    alt={t(customer.name)}
                    area={2600}
                    maxWidth={128}
                    maxHeight={60}
                    load={near}
                    decorative
                  />
                </CustomerLogo>
                <CustomerName>{t(customer.name)}</CustomerName>
              </CustomerCell>
            ))}
          </CustomerPanel>
        </SectionInner>
      </CustomersSection>
    </div>
  );
};

export default PartnersAndCustomersSection;
