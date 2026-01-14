import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import uz from "@/src/locales/uz.json";
import en from "@/src/locales/en.json";
import tr from "@/src/locales/tr.json";

const LANG_KEY = "lang";

export const getLang = (defaultLang: string): string => {
  return localStorage.getItem(LANG_KEY) || defaultLang;
};

export const setLang = (newLang: string): void => {
  i18n.changeLanguage(newLang);
  return localStorage.setItem(LANG_KEY, newLang);
};

const savedLang = getLang("tr");

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    uz: { translation: uz },
    tr: { translation: tr },
  },
  lng: savedLang,
  fallbackLng: "tr",
  interpolation: { escapeValue: false },
});

export default i18n;
