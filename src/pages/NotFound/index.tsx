import { lazy } from "react";
import { useTranslation } from "react-i18next";
import { Section, Inner, Eyebrow, Heading, Text, Actions, ActionLink } from "./styles";

const Container = lazy(() => import("../../common/Container"));

// Shown for any URL that doesn't match a route, so visitors get a way back
// instead of an empty page between the header and footer.
const NotFound = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <Section aria-labelledby="not-found-title">
        <Inner>
          <Eyebrow>404</Eyebrow>
          <Heading id="not-found-title">{t("notfound.title")}</Heading>
          <Text>{t("notfound.text")}</Text>
          <Actions>
            <ActionLink to="/">{t("notfound.home")}</ActionLink>
            <ActionLink to="/contact" $variant="secondary">
              {t("notfound.contact")}
            </ActionLink>
          </Actions>
        </Inner>
      </Section>
    </Container>
  );
};

export default NotFound;
