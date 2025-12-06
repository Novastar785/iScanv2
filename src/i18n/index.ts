import * as Localization from 'expo-localization';
import i18n from 'i18next';
import 'intl-pluralrules'; // 1. Importante: Polyfill para que funcione i18n v4 en Android
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
};

const getDeviceLanguage = () => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    return locales[0].languageCode ?? 'en';
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(), // Detecta el idioma del dispositivo
    fallbackLng: 'en', // Si no es es/pt/en, usa inglés
    interpolation: {
      escapeValue: false,
    },
    // compatibilityJSON: 'v3', // <--- LÍNEA ELIMINADA para corregir el error de tipos
  });

export default i18n;