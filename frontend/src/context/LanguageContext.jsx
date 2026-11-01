import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();
  
  // Sync with existing localStorage key on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('krushisevak_lang') || localStorage.getItem('language');
    if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  const changeLanguage = (newLang) => {
    if (['en', 'hi', 'mr'].includes(newLang)) {
      i18n.changeLanguage(newLang);
      localStorage.setItem('krushisevak_lang', newLang);
      localStorage.setItem('language', newLang);
      document.documentElement.lang = newLang;
    }
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        lang: i18n.language, 
        setLang: changeLanguage, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
