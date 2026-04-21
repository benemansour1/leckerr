import React, { createContext, useContext, useState, useEffect } from 'react';
import { ar } from './ar';
import { he } from './he';

export type Language = 'ar' | 'he';
export type Translations = typeof ar;

const translations: Record<Language, Translations> = { ar, he };

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  setLang: () => {},
  t: ar,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('lecker-lang') as Language;
      return stored === 'he' ? 'he' : 'ar';
    } catch {
      return 'ar';
    }
  });

  const setLang = (l: Language) => {
    setLangState(l);
    try { localStorage.setItem('lecker-lang', l); } catch {}
    document.documentElement.lang = l;
    document.documentElement.dir = 'rtl';
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'rtl';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
