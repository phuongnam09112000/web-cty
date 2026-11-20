import React from "react";
import { renderHeading, HEADING_SEPARATOR_SPACE } from "../../cms/headingParts";
import { pick } from "../../cms/pick";
import type { BlockProps } from "../../cms/BlockRenderer";
import { Eyebrow, SectionHeading, SectionInner } from "../../styles/section";
import { ContactButton, ContactSection, Layout } from "./styles";

/* Closing call to action: one clear route to the contact page. Contact
 * details themselves stay on the contact page and in the footer. */
const HomeContact = ({ data, lang }: BlockProps<"home-contact">) => {
  return (
    <ContactSection aria-labelledby="home-contact-title" className="istt-on-dark">
      <SectionInner>
        <Layout>
          <div>
            <Eyebrow $onDark>{pick(data.eyebrow, lang)}</Eyebrow>
            <SectionHeading id="home-contact-title" $onDark>
              {renderHeading(data.heading, lang, { separator: HEADING_SEPARATOR_SPACE })}
            </SectionHeading>
          </div>
          <ContactButton to={data.cta.href}>
            {pick(data.cta.label, lang)} <span aria-hidden="true">→</span>
          </ContactButton>
        </Layout>
      </SectionInner>
    </ContactSection>
  );
};

export default HomeContact;
