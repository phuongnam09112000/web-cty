import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import XHR from "i18next-xhr-backend";

import translationEn from "./locales/en/translation.json";
import translationEs from "./locales/es/translation.json";
import translationVn from "./locales/vn/translation.json";

// The language detector saves the visitor's choice under "i18nextLng" whenever
// the language changes; start from that choice so it survives a page reload.
const SUPPORTED_LANGUAGES = ["en", "vi"];
const readSavedLanguage = () => {
  try {
    const saved = localStorage.getItem("i18nextLng");
    return saved && SUPPORTED_LANGUAGES.includes(saved) ? saved : "en";
  } catch {
    return "en"; // storage unavailable (e.g. blocked by browser settings)
  }
};
const savedLanguage = readSavedLanguage();
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