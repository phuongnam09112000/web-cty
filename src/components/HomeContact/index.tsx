import React from "react";
import { useTranslation } from "react-i18next";
import { Eyebrow, SectionHeading, SectionInner } from "../../styles/section";
import { ContactButton, ContactSection, Layout } from "./styles";

/* Closing call to action: one clear route to the contact page. Contact
 * details themselves stay on the contact page and in the footer. */
const HomeContact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ContactSection aria-labelledby="home-contact-title" className="istt-on-dark">
      <SectionInner>
        <Layout>
          <div>
            <Eyebrow $onDark>{t("contact.eyebrow")}</Eyebrow>
            <SectionHeading id="home-contact-title" $onDark>
              {t("contact.heading.part1")} <em>{t("contact.heading.em")}</em>
            </SectionHeading>
          </div>
          <ContactButton to="/contact">
            {t("home.hero.cta.contact")} <span aria-hidden="true">→</span>
          </ContactButton>
        </Layout>
      </SectionInner>
    </ContactSection>
  );
};

export default HomeContact;
