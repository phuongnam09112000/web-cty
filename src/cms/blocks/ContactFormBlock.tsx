import ContactForm from "../../components/ContactForm";
import FormContact from "../../components/FormContact";
import type { BlockProps } from "../BlockRenderer";

const ContactFormBlock = ({ data, lang }: BlockProps<"contact-form">) =>
  data.variant === "inline" ? <FormContact data={data} lang={lang} /> : <ContactForm data={data} lang={lang} />;

export default ContactFormBlock;
