import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import XHR from "i18next-xhr-backend";

import translationEn from "./locales/en/translation.json";
import translationEs from "./locales/es/translation.json";
import translationVn from "./locales/vn/translation.json";

const savedLanguage = localStorage.getItem("i18nLang") || "en";
i18n
  .use(XHR)
  .use(LanguageDetector)
  .init({
    debug: false,
    lng: savedLanguage,
    fallbackLng: "en",

    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },

    resources: {
      en: {
        translations: translationEn,
      },
      es: {
        translations: translationEs,
      },
      vi: {
        translations: translationVn,
      },
    },
    ns: ["translations"],
    defaultNS: "translations",
  });

// Keep <html lang> in sync with the active language for screen readers
const syncHtmlLang = (lng?: string) => {
  if (lng) document.documentElement.lang = lng.split("-")[0];
};
syncHtmlLang(i18n.language);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;