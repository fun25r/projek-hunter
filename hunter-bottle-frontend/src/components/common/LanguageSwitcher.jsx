import { useLanguage } from '../../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, toggleLang } = useLanguage();
  return (
    <button
      onClick={toggleLang}
      className="px-3 py-1.5 text-xs font-bold rounded-full transition-colors bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700"
    >
      {lang === 'id' ? 'EN' : 'ID'}
    </button>
  );
}
