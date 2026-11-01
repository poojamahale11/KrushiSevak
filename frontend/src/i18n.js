import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

// Get saved language or default to 'en'
const savedLanguage = localStorage.getItem('language') || localStorage.getItem('krushisevak_lang') || 'en';

i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    lng: savedLanguage, // Set initial language from localStorage
    fallbackLng: 'en', // Fallback language if translation is missing
    interpolation: {
      escapeValue: false, // React already escapes values to prevent XSS
    },
    react: {
      useSuspense: false, // Disable suspense for simpler setup
    },
  });

// Save language to localStorage whenever it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  localStorage.setItem('krushisevak_lang', lng); // Keep compatibility with existing system
  document.documentElement.lang = lng; // Set HTML lang attribute
});

export default i18n;
