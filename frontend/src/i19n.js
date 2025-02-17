import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationFI from './locales/fi/translation.json';
import translationET from './locales/et/translation.json';

const resources = {
    en: {
      translation: translationEN
    },
    fi: {
      translation: translationFI
    },
    et: {
      translation: translationET
    }
  };


  i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;