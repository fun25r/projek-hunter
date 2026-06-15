import { useLanguage } from '../../contexts/LanguageContext';
import logoImg from '../../assets/logo.png';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12 px-4 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logoImg} alt="Hunter Bottle" className="h-8 w-8 object-contain rounded-lg" />
            <h3 className="text-white font-semibold">Hunter Bottle</h3>
          </div>
          <p className="text-sm text-gray-500">{t('footer_brand')}</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{t('footer_contact')}</h4>
          <p className="text-sm text-gray-500">WhatsApp: +6285778266727</p>
          <p className="text-sm text-gray-500">Email: support@hunterbottle.com</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{t('footer_hours')}</h4>
          <p className="text-sm text-gray-500">{t('footer_hours_detail')}</p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-600 mt-8">&copy; {new Date().getFullYear()} Hunter Bottle. All rights reserved.</p>
    </footer>
  );
}
