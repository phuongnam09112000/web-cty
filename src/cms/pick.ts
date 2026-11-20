import { useTranslation } from "react-i18next";
import type { Lang, LocalizedText } from "./types";

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

export function pick(text: LocalizedText | null | undefined, lang: Lang): string {
  const en = asString(text?.en);
  if (lang === "en" && en.trim() !== "") return en;
  return asString(text?.vi);
}

export function useLang(): Lang {
  const { i18n } = useTranslation();
  return (i18n.language || "").startsWith("vi") ? "vi" : "en";
}

if (process.env.NODE_ENV !== "production") {
  (window as unknown as { __cmsPick: typeof pick }).__cmsPick = pick;
}
