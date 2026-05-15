import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import es from "../locales/es.json";
import en from "../locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: undefined, // let detector decide, fallback to es
    fallbackLng: "es",
    supportedLngs: ["es", "en"],
    nonExplicitSupportedLngs: false,
    load: "languageOnly",
    interpolation: { escapeValue: false },
    detection: {
      // Prefer explicit user choice; only fall back to navigator on first visit
      order: ["localStorage", "htmlTag"],
      lookupLocalStorage: "roomie.lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
