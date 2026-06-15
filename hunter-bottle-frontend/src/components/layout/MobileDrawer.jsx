import { Link } from 'react-router-dom';
import {
  X, Sun, Moon, ShoppingBag, Home, Package,
  Grid3X3, Search
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import logoImg from '../../assets/logo.png';

export default function MobileDrawer({ open, onClose }) {
  const { dark, toggle } = useTheme();
  const { totalItems } = useCart();
  const { t } = useLanguage();
  if (!open) return null;

  const menu = [
    { label: t('nav_home'), to: '/', icon: Home },
    { label: t('nav_shop'), to: '/#products', icon: Package },
    { label: t('nav_categories'), to: '/#categories', icon: Grid3X3 },
    { label: t('nav_cart'), to: '/checkout', icon: ShoppingBag, count: totalItems },
    { label: t('nav_track'), to: '/tracking', icon: Search },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 border-2 border-gray-200 dark:border-gray-800
          z-[60] h-screen w-90 sm:w-[28rem] flex flex-col
          shadow-[0_0_40px_rgba(0,0,0,0.12)]
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${
            dark
              ? 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-gray-100'
              : 'bg-gradient-to-b from-white via-gray-100 to-gray-600 text-gray-900'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <img
              src={logoImg}
              alt="Hunter Bottle"
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span className="text-sm font-bold  
                           text-gray-900 dark:text-gray-300 
                           text-gray-700 dark:text-gray-600 ">
              Hunter Bottle
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg
                      text-gray-700 dark:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {menu.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3.5 
                         rounded-xl text-sm font-semibold
                         text-gray-700 dark:text-gray-600 
                         hover:bg-gray-100 dark:hover:bg-gray-300 
                         transition-all"
            >
              <item.icon size={20} />
              <span className="flex-1">{item.label}</span>
              {item.count > 0 && (
                <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] rounded-full font-bold">
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-4 space-y-2">
          <a
            href="https://wa.me/6285778266727"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-600/30 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.17 1.6 5.98L0 24l6.2-1.62A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.3-1.55l-.38-.23-3.68.96.98-3.58-.25-.39A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.27-7.73c-.29-.15-1.71-.84-1.97-.93-.26-.1-.45-.15-.64.15-.19.29-.74.93-.91 1.12-.17.19-.34.21-.63.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48-.17-.01-.36-.01-.55-.01-.19 0-.48.07-.74.36-.26.29-1 1-1 2.43s1.02 2.82 1.16 3.01c.14.19 2 3.05 4.85 4.28.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34z"/>
            </svg>
            <span>WhatsApp</span>
          </a>

          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            {dark ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} />
            )}
            {dark ? t('theme_light') : t('theme_dark')}
          </button>
        </div>
      </div>
    </>
  );
}
