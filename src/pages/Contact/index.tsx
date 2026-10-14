import { lazy } from "react";

import ContactForm from "../../components/ContactForm";
import { useTranslation } from "react-i18next";
import MapBanner from "../../components/Contact";
const Container = lazy(() => import("../../common/Container"));

const Contact = () => {
  useTranslation();
  return (
    <Container>
      <MapBanner />
      <ContactForm />
    </Container>
  );
};

export default Contact;
