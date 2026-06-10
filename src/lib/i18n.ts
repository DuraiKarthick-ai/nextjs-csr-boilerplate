/**
 * i18next configuration for the Signs application.
 * Initialises i18next with the react-i18next plugin and loads translation
 * namespaces from the local JSON resource files.
 *
 * Usage: import this module once at the application entry point (_app.tsx).
 * Components access translations via the `useTranslation` hook.
 *
 * @module i18n
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEN from "../locales/en/common.json";
import dashboardEN from "../locales/en/dashboard.json";
import worklistEN from "../locales/en/worklist.json";
import signsEN from "../locales/en/signs.json";

import commonFR from "../locales/fr/common.json";
import dashboardFR from "../locales/fr/dashboard.json";
import worklistFR from "../locales/fr/worklist.json";
import signsFR from "../locales/fr/signs.json";

/**
 * Supported application locales.
 */
export const SUPPORTED_LOCALES = ["en", "fr"] as const;

/**
 * Default fallback locale used when a translation key is missing.
 */
export const DEFAULT_LOCALE = "en" as const;

const resources = {
  en: {
    common: commonEN,
    dashboard: dashboardEN,
    worklist: worklistEN,
    signs: signsEN,
  },
  fr: {
    common: commonFR,
    dashboard: dashboardFR,
    worklist: worklistFR,
    signs: signsFR,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: "common",
    interpolation: {
      /**
       * React already escapes values by default, so XSS escaping
       * via i18next is disabled to avoid double-encoding.
       */
      escapeValue: false,
    },
  });

export default i18n;
