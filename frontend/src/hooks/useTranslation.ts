import { translations, TranslationKey, Language } from '../i18n/translations';
import { useAppStore } from '../store/appStore';

export const useTranslation = () => {
  const language = useAppStore((state) => state.language);
  
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['fr'][key] || key;
  };
  
  return { t, language };
};
