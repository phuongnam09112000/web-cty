import { lazy } from "react";

import AboutBanner from "../../components/AboutBanner";
import ServiceContent from "../../components/Integration";
import ContactForm from "../../components/ContactForm";
import { useTranslation } from "react-i18next";
import MapComponent from "../../components/Contact";
import MapBanner from "../../components/Contact";
const Container = lazy(() => import("../../common/Container"));

const Contact = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <MapBanner />
      <ContactForm />
    </Container>
  );
};

export default Contact;
