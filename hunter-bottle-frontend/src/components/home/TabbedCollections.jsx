import { useState, useEffect, useRef } from 'react';
import { Wine, GlassWater, Grape, Beer, Martini, Flame, Search, X } from 'lucide-react';
import { getProducts } from '../../services/api';
import ProductCard from '../product/ProductCard';
import { useLanguage } from '../../contexts/LanguageContext';

const CATEGORY_FILTERS = [
  { key: 'all', label: 'all', icon: null },
  { key: 'Red Wine', label: 'Red Wine', icon: Wine },
  { key: 'White Wine', label: 'White Wine', icon: GlassWater },
  { key: 'Champagne', label: 'Champagne', icon: Grape },
  { key: 'Whisky', label: 'Whisky', icon: Beer },
  { key: 'Vodka', label: 'Vodka', icon: Martini },
  { key: 'Rum', label: 'Rum', icon: Flame },
];

const TABS = [
  { key: 'all', label: 'all' },
  { key: 'new', label: 'new Collection' },
  { key: 'bestseller', label: 'best Seller' },
  { key: 'featured', label: 'featured' },
];

export default function TabbedCollections({ onQuickView, searchQuery = '' }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchRef = useRef(null);

  // Sync external search
  useEffect(() => { setLocalSearch(searchQuery); }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = { per_page: 12 };
    if (activeTab !== 'all') params.tab = activeTab;
    if (activeCategory !== 'all') params.category = activeCategory;
    if (localSearch.trim()) params.search = localSearch.trim();

    getProducts(params)
      .then(({ data }) => setProducts(data.data || data))
      .catch(() => { setError(true); setProducts([]); })
      .finally(() => setLoading(false));
  }, [activeTab, activeCategory, localSearch]);

  return (
    <section className="px-4 py-14 md:py-20 max-w-7xl mx-auto" id="products">
      <div className="mb-8">
        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">{t('section_shop')}</span>
        <h2 className="text-3xl md:text-[2.618rem] font-bold text-zinc-900 dark:text-white mt-2">{t('section_collection')}</h2>
      </div>

      {/* Search Bar — di bawah title, di atas tabs */}
      <div className="relative mb-6">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          ref={searchRef}
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Cari produk wine, champagne, whisky..."
          className="w-full pl-12 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-sm"
        />
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(''); searchRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Collection Tabs — SELALU TERLIHAT */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-4 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Filter Row — SELALU TERLIHAT */}
      <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1">
        {CATEGORY_FILTERS.map((cat) => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all ${
              activeCategory === cat.key
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}>
            {cat.icon && <cat.icon size={14} />}
            <span>{cat.label === 'all' ? t('filter_all') : cat.label}</span>
          </button>
        ))}
      </div>

      {/* Product Grid — 3 states: loading / error / empty / products */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl aspect-[3/4] animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-3">Gagal memuat produk</p>
          <button onClick={() => { setActiveTab('all'); setActiveCategory('all'); }}
            className="text-amber-600 hover:underline text-sm font-semibold">
            Coba lagi
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-400 dark:text-zinc-500 text-lg font-medium">Tidak ada produk ditemukan</p>
          <p className="text-zinc-300 dark:text-zinc-600 text-sm mt-1">Coba filter lain atau klik tab yang berbeda</p>
          <button onClick={() => { setActiveTab('all'); setActiveCategory('all'); }}
            className="mt-4 inline-block px-6 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition">
            Tampilkan Semua
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
          ))}
        </div>
      )}
    </section>
  );
}
