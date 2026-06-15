import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, Sun, Moon } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState } from 'react';
import MobileDrawer from './MobileDrawer';
import LanguageSwitcher from '../common/LanguageSwitcher';
import logoImg from '../../assets/logo.png';

export default function Header() {
  const { totalItems } = useCart();
  const { dark, toggle } = useTheme();
  const { t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Brand Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logoImg}
            alt="Hunter Bottle Logo"
            className="h-10 w-10 object-contain rounded-lg group-hover:scale-105 transition-transform"
          />
          <span className="text-lg font-bold text-gray-900 dark:text-white font-vogue tracking-tight">Hunter Bottle</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition">{t('nav_home')}</Link>
            <a href="#products" className="hover:text-gray-900 dark:hover:text-white transition">{t('nav_shop')}</a>
            <a href="#categories" className="hover:text-gray-900 dark:hover:text-white transition">{t('nav_categories')}</a>
            <Link to="/tracking" className="hover:text-gray-900 dark:hover:text-white transition">{t('nav_track')}</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <button onClick={toggle}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title={dark ? 'Mode Terang' : 'Mode Gelap'}>
            {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
          <Link to="/checkout" className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2 text-gray-600 dark:text-gray-400" onClick={() => setDrawerOpen(true)}>
            <Menu size={20} />
          </button>
        </div>
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
