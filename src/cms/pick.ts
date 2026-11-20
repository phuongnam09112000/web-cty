import { useTranslation } from "react-i18next";
import type { Lang, LocalizedText } from "./types";

export function pick(text: LocalizedText, lang: Lang): string {
  if (lang === "en" && text.en.trim() !== "") return text.en;
  return text.vi;
}

export function useLang(): Lang {
  const { i18n } = useTranslation();
  return (i18n.language || "").startsWith("vi") ? "vi" : "en";
}

if (process.env.NODE_ENV !== "production") {
  (window as unknown as { __cmsPick: typeof pick }).__cmsPick = pick;
}
