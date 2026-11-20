import { pick } from "../pick";
import type { BlockProps } from "../BlockRenderer";

const ContactFormBlock = ({ data, lang }: BlockProps<"contact-form">) => (
  <section data-testid="cms-contact-form">
    <h1>{[pick(data.heading.lead, lang), pick(data.heading.emphasis, lang)].filter(Boolean).join(" ")}</h1>
    <p>{pick(data.tagline, lang)}</p>
  </section>
);

export default ContactFormBlock;
