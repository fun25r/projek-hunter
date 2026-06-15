import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  adminGetProducts, adminGetOrders, adminDeleteProduct,
  adminGetBanners, adminCreateBanner, adminUpdateBanner, adminDeleteBanner,
  adminToggleProductTag,
  adminUpdateOrderStatus, adminMarkOrderPaid,
  adminGetAnalytics, adminCalculateBestsellers,
} from '../services/api';
import ProductForm from '../components/admin/ProductForm';
import OrderTable from '../components/admin/OrderTable';
import {
  LogOut, BarChart3, ClipboardList, Package, Image, Plus, Search, X, Upload, Save, RefreshCw, TrendingUp, DollarSign, ShoppingCart, AlertCircle,
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function AdminDashboardPage() {
  const { admin, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const role = admin?.role || 'kasirhunterbottle';
  const isAdmin = role === 'admin';

  const [tab, setTab] = useState('analytics');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const formatRupiah = (n) => 'Rp ' + ((n || 0)).toLocaleString('id-ID');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/admin/login', { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'products') {
        const { data } = await adminGetProducts(search ? { search } : {});
        setProducts(data.data || data);
      } else if (tab === 'orders') {
        const { data } = await adminGetOrders();
        setOrders(data.data || data);
      } else if (tab === 'banners') {
        const { data } = await adminGetBanners();
        setBanners(data);
      } else if (tab === 'analytics') {
        const params = { period: period === 'now' ? 'daily' : period };
        if (period === 'now') {
          const today = new Date().toISOString().split('T')[0];
          params.date_from = today;
          params.date_to = today;
        } else {
          if (dateFrom) params.date_from = dateFrom;
          if (dateTo) params.date_to = dateTo;
        }
        const { data } = await adminGetAnalytics(params);
        setAnalytics(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tab, search, period, dateFrom, dateTo]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Hapus produk?')) return;
    await adminDeleteProduct(id); fetchData();
  };
  const handleTagToggle = async (product, field) => {
    await adminToggleProductTag(product.id, field); fetchData();
  };
  const handleBannerSave = async (fd, id) => {
    if (id) await adminUpdateBanner(id, fd); else await adminCreateBanner(fd);
    setShowBannerForm(false); setEditBanner(null); fetchData();
  };
  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Hapus banner?')) return;
    await adminDeleteBanner(id); fetchData();
  };
  const handleCalcBestsellers = async () => {
    await adminCalculateBestsellers(); fetchData();
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!isAuthenticated) return null;

  const allTabs = [
    { key: 'analytics', icon: BarChart3, label: 'Analytics' },
    { key: 'orders', icon: ClipboardList, label: 'Pesanan' },
    { key: 'products', icon: Package, label: 'Produk', adminOnly: true },
    { key: 'banners', icon: Image, label: 'Banner', adminOnly: true },
  ];
  const tabs = allTabs.filter(t => !t.adminOnly || isAdmin);

  // Force non-admin to valid tabs
  if (!tabs.find(t => t.key === tab)) {
    setTab('analytics');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Hunter Bottle" className="h-8 w-8 object-contain rounded-lg" />
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-sm">Hunter Bottle</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">{admin?.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${isAdmin ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                  {isAdmin ? 'Admin' : 'Kasir'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={async () => { await logout(); navigate('/admin/login'); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setShowProductForm(false); setShowBannerForm(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${tab === t.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* ===== ANALYTICS ===== */}
        {tab === 'analytics' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {['now','daily','weekly','monthly','annual'].map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${period === p ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>{p}</button>
                ))}
              </div>
              {isAdmin && <button onClick={handleCalcBestsellers} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition"><RefreshCw size={14} /> Hitung Bestseller</button>}
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-wrap items-center gap-3 mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Filter Tanggal</span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Dari</label>
                <input type="date" onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Sampai</label>
                <input type="date" onChange={e => setDateTo(e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <button onClick={fetchData}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition">
                Filter
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
            ) : analytics ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[{ label: 'Total Revenue', val: formatRupiah(analytics.summary?.total_revenue), Icon: DollarSign, cls: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Total Orders', val: analytics.summary?.total_orders, Icon: ShoppingCart, cls: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Avg Order', val: formatRupiah(analytics.summary?.avg_order_value), Icon: TrendingUp, cls: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { label: 'Cancelled', val: analytics.summary?.cancelled_orders, Icon: AlertCircle, cls: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-3"><div className={`p-2 rounded-xl ${kpi.bg}`}><kpi.Icon size={20} className={kpi.cls} /></div><span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{kpi.label}</span></div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.val}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">Revenue by Payment</h4>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">QRIS</p><p className="text-lg font-bold text-blue-700 dark:text-blue-400">{formatRupiah(analytics.summary?.qris_revenue)}</p></div>
                      <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center"><p className="text-xs text-gray-500 dark:text-gray-400 mb-1">COD</p><p className="text-lg font-bold text-amber-700 dark:text-amber-400">{formatRupiah(analytics.summary?.cod_revenue)}</p></div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">Top Produk</h4>
                    <div className="space-y-2">{(analytics.top_products || []).slice(0, 5).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span><span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px]">{p.product_name}</span></div><span className="font-semibold text-gray-900 dark:text-white">{p.total_qty}x</span></div>
                    ))}</div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {tab === 'orders' && <OrderTable orders={orders} loading={loading} onRefresh={fetchData} isAdmin={isAdmin} />}

        {/* ===== PRODUCTS (Admin only) ===== */}
        {tab === 'products' && isAdmin && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition" placeholder="Cari produk..." /></div>
              <button onClick={() => { setEditProduct(null); setShowProductForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition"><Plus size={16} /> Tambah</button>
            </div>
            {showProductForm && <ProductForm product={editProduct} onSave={() => { setShowProductForm(false); setEditProduct(null); fetchData(); }} onCancel={() => { setShowProductForm(false); setEditProduct(null); }} />}
            {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
            : !products.length ? <div className="text-center py-16 text-gray-400">Belum ada produk</div>
            : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{products.map((p) => (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex gap-4 hover:shadow-md transition">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => { setEditProduct(p); setShowProductForm(true); }}>
                  {p.image_url ? <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/${p.image_url}`} alt="" className="w-full h-full object-cover" /> : <Package size={24} className="m-4 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between"><p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{p.name}</p><button onClick={() => handleDeleteProduct(p.id)} className="text-gray-300 hover:text-red-500 transition"><X size={14} /></button></div>
                  <p className="text-xs text-gray-500">{p.category}</p>
                  <div className="flex items-center gap-2 mt-1 mb-2"><span className="text-sm font-bold text-amber-600">{formatRupiah(p.price)}</span><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.stock_status === 'in_stock' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : p.stock_status === 'low_stock' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>{p.stock_count} stok</span></div>
                  <div className="flex gap-1.5">{[{ key: 'is_new_collection', label: 'New', emoji: '🆕' },{ key: 'is_bestseller', label: 'Best', emoji: '⭐' },{ key: 'is_featured', label: 'Featured', emoji: '💎' }].map((tag) => (
                    <button key={tag.key} onClick={() => handleTagToggle(p, tag.key)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition ${p[tag.key] ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}>{tag.emoji} {tag.label}</button>
                  ))}</div>
                </div>
              </div>
            ))}</div>}
          </>
        )}

        {/* ===== BANNERS (Admin only) ===== */}
        {tab === 'banners' && isAdmin && (
          <>
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-gray-900 dark:text-white">Kelola Banner</h3><button onClick={() => { setEditBanner(null); setShowBannerForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition"><Plus size={16} /> Banner Baru</button></div>
            {showBannerForm && <BannerFormModal banner={editBanner} onSave={handleBannerSave} onCancel={() => { setShowBannerForm(false); setEditBanner(null); }} />}
            {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>
            : !banners.length ? <div className="text-center py-12 text-gray-400">Belum ada banner</div>
            : <div className="space-y-3">{banners.map((b) => (
              <div key={b.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4">
                 <div className="w-20 h-14 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                   {b.image_url
                     ? <img src={`${import.meta.env.VITE_BACKEND_URL}/storage/${b.image_url}`} alt={b.title} className="w-full h-full object-cover" />
                     : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                   }
                 </div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-gray-900 dark:text-white">{b.title}</p><p className="text-xs text-gray-500">{b.subtitle || '-'}</p><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{b.is_active ? 'Active' : 'Inactive'}</span></div>
                <div className="flex gap-1"><button onClick={() => { setEditBanner(b); setShowBannerForm(true); }} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition">Edit</button><button onClick={() => handleDeleteBanner(b.id)} className="px-3 py-1.5 text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition">Hapus</button></div>
              </div>
            ))}</div>}
          </>
        )}
      </div>
    </div>
  );
}

/* Banner Form sub-component */
function BannerFormModal({ banner, onSave, onCancel }) {
  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [linkUrl, setLinkUrl] = useState(banner?.link_url || '');
  const [sortOrder, setSortOrder] = useState(banner?.sort_order ?? 0);
  const [isActive, setIsActive] = useState(banner?.is_active ?? true);
  const [expiresAt, setExpiresAt] = useState(banner?.expires_at ? banner.expires_at.slice(0, 16) : '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(banner?.image_url ? `${import.meta.env.VITE_BACKEND_URL}/storage/${banner.image_url}` : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Gambar maksimal 2MB'); return; }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const clearImage = () => { setImage(null); setImagePreview(null); };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Judul wajib diisi'); return; }
    const fd = new FormData();
    fd.append('title', title);
    fd.append('subtitle', subtitle);
    fd.append('link_url', linkUrl);
    fd.append('sort_order', String(sortOrder));
    fd.append('is_active', isActive ? '1' : '0');
    if (expiresAt) fd.append('expires_at', expiresAt);
    if (image) fd.append('image', image);
    setLoading(true);
    try { await onSave(fd, banner?.id); } catch { setError('Gagal menyimpan banner'); } finally { setLoading(false); }
  };

  const lbl = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';
  const inp = 'w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">{banner ? 'Edit Banner' : 'Banner Baru'}</h3>
        <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition"><X size={18} /></button>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {error && <div className="md:col-span-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">{error}</div>}
        <div className="md:col-span-2">
          <label className={lbl}>Judul <span className="text-amber-600">*</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Diskon Spesial Akhir Pekan" className={inp} />
        </div>
        <div className="md:col-span-2">
          <label className={lbl}>Deskripsi / Subtitle</label>
          <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2} className={`${inp} resize-none`} placeholder="Teks pendukung banner..." />
        </div>
        <div>
          <label className={lbl}>Link URL (opsional)</label>
          <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className={inp} />
        </div>
        <div>
          <label className={lbl}>Urutan Tampil</label>
          <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} className={inp} />
        </div>

        <div>
          <label className={lbl}>Tanggal Kedaluwarsa <span className="text-xs font-normal text-gray-400 ml-1">(banner otomatis nonaktif)</span></label>
          <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className={inp} />
        </div>

        {/* Image Dropzone */}
        <div className="md:col-span-2">
          <label className={lbl}>Gambar Banner</label>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover rounded-xl border border-gray-200 dark:border-gray-600" />
              <button type="button" onClick={clearImage}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition shadow-lg"><X size={14} /></button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition group">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition">
                <Upload size={22} className="text-gray-400 group-hover:text-amber-600 transition" />
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-amber-600 transition">Klik untuk upload gambar banner</p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP — Maks 2MB</p>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <div className="flex items-end mb-1">
          <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition ${isActive ? 'border-green-500/50 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-600'}`}>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-amber-600 w-4 h-4" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{isActive ? '✅ Active — Banner ditampilkan' : '⏸️ Inactive — Banner disembunyikan'}</span>
          </label>
        </div>

        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-xl font-semibold text-sm transition shadow">
            <Save size={16} /> {loading ? 'Menyimpan...' : banner ? 'Update Banner' : 'Simpan Banner'}
          </button>
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm transition">Batal</button>
        </div>
      </form>
    </div>
  );
}
