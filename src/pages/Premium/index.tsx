import React, { lazy } from "react";
import AboutBanner from "../../components/AboutBanner";
import { useTranslation } from "react-i18next";
import PremiumPage from "../../components/Premium";

const Container = lazy(() => import("../../common/Container"));

const Premium = () => {
  const { t } = useTranslation();
  return (
    <Container>
      {/* <AboutBanner
        backgroundImage="/img/background/our_service.jpeg"
        title={t("Premium Services")}
      /> */}
      <PremiumPage />
    </Container>
  );
};

export default Premium;
