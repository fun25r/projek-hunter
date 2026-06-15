import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import logoImg from '../../assets/logo.png';

const AGE_KEY = 'hunter_bottle_age_verified';

export default function AgeGate({ children }) {
  const [show, setShow] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!sessionStorage.getItem(AGE_KEY)) setShow(true);
  }, []);

  if (!show) return children;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900 via-gray-800 to-red-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl animate-in">
        <img src={logoImg} alt="Hunter Bottle" className="h-20 w-20 object-contain mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('age_title')}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">{t('age_text')}</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => { sessionStorage.setItem(AGE_KEY, 'true'); setShow(false); }}
            className="w-full py-3.5 bg-red-800 text-white rounded-xl font-semibold text-lg hover:bg-red-900 transition-all shadow-lg">{t('age_yes')}</button>
          <button onClick={() => window.location.href = 'https://www.google.com'}
            className="w-full py-2.5 text-gray-400 hover:text-gray-600 text-sm underline underline-offset-4 transition">{t('age_no')}</button>
        </div>
      </div>
    </div>
  );
}
