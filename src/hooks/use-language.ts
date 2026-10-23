import { useEffect, useState } from 'react';
import { getT, LANGS, type Lang } from '@/lib/i18n';
import { translateText } from '@/lib/interface-translations';
import { store } from '@/lib/shopbook';

function readLanguage(): Lang {
  const saved = localStorage.getItem('shopbook.language') || store.get()?.language;
  return LANGS.find(l => l === saved) ?? 'English';
}

export function useLanguage() {
  const [language, updateLanguage] = useState<Lang>('English');
  useEffect(() => {
    const sync = () => updateLanguage(readLanguage());
    sync();
    window.addEventListener('shopbook-language', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('shopbook-language', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const setLanguage = (value: Lang) => {
    localStorage.setItem('shopbook.language', value);
    store.update({ language: value });
    updateLanguage(value);
    window.dispatchEvent(new Event('shopbook-language'));
  };
  const { t, dir } = getT(language);
  useEffect(() => {
    document.documentElement.lang = ({ English: 'en', Swahili: 'sw', French: 'fr', Arabic: 'ar', Spanish: 'es', Portuguese: 'pt', German: 'de', Italian: 'it', Chinese: 'zh', Hindi: 'hi', Somali: 'so' })[language];
    document.documentElement.dir = dir;
  }, [language, dir]);
  return { language, setLanguage, t, dir, tr: (text: string, x?: string | number) => translateText(language, text, x) };
}
