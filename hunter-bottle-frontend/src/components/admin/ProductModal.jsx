import { useState, useEffect } from 'react';
import {
  X, Save, Upload, ImageIcon, Package, Tag,
} from 'lucide-react';
import { adminCreateProduct, adminUpdateProduct } from '../../services/api';
import { imageUrl } from '../../utils/formatRupiah';

const CATEGORIES = ['Red Wine', 'White Wine', 'Champagne', 'Whisky', 'Vodka', 'Rum', 'Liqueur', 'Gin', 'Tequila', 'Brandy', 'Sake', 'Soju', 'Beer'];

const CHECKBOX_TAGS = [
  { key: 'is_featured', label: 'Featured' },
  { key: 'is_bestseller', label: 'Best Seller' },
  { key: 'is_new_collection', label: 'New Collection' },
  { key: 'is_active', label: 'Active' },
];

export default function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ---- Form State ----
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockCount, setStockCount] = useState(0);
  const [abv, setAbv] = useState('');
  const [origin, setOrigin] = useState('');
  const [weightGram, setWeightGram] = useState(1000);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [tags, setTags] = useState({
    is_featured: false,
    is_bestseller: false,
    is_new_collection: false,
    is_active: true,
  });

  // ---- Image State ----
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---- Pre-fill on EDIT ----
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || '');
      setSubcategory(product.subcategory || '');
      setDescription(product.description || '');
      setPrice(product.price || '');
      setStockCount(product.stock_count ?? 0);
      setAbv(product.abv || '');
      setOrigin(product.origin || '');
      setWeightGram(product.weight_gram || 1000);
      setDiscountPercent(product.discount_percent || 0);
      setTags({
        is_featured: product.is_featured || false,
        is_bestseller: product.is_bestseller || false,
        is_new_collection: product.is_new_collection || false,
        is_active: product.is_active ?? true,
      });
      if (product.image_url) {
        setExistingImage(imageUrl(product.image_url));
        setImagePreview(imageUrl(product.image_url));
      }
    }
  }, [product]);

  // ---- Image file handler ----
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Hanya file JPEG, PNG, atau WebP yang diperbolehkan');
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 2MB');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(existingImage || null);
  };

  // ---- Form Submit via FormData ----
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price) {
      setError('Nama produk dan harga wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock_count', String(stockCount));
    if (abv) formData.append('abv', abv);
    formData.append('origin', origin);
    formData.append('weight_gram', String(weightGram));
    formData.append('discount_percent', String(discountPercent));
    formData.append('is_featured', tags.is_featured ? '1' : '0');
    formData.append('is_bestseller', tags.is_bestseller ? '1' : '0');
    formData.append('is_new_collection', tags.is_new_collection ? '1' : '0');
    formData.append('is_active', tags.is_active ? '1' : '0');

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      if (isEdit) {
        await adminUpdateProduct(product.id, formData);
      } else {
        await adminCreateProduct(formData);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal menyimpan produk';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const labelClass = 'block text-sm font-semibold text-white mb-1.5';
  const inputClass = 'w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition';
  const selectClass = 'w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition appearance-none';

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 my-8 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit ? `Editing: ${product?.name}` : 'Isi detail produk di bawah'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error banner */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm p-3 rounded-xl flex items-center gap-2">
              <X size={16} /> {error}
            </div>
          )}

          {/* ---- IMAGE DROPZONE ---- */}
          <div>
            <label className={labelClass}>Gambar Produk</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-slate-600"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-600 rounded-2xl cursor-pointer hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-amber-600/10 transition">
                  <Upload size={26} className="text-slate-400 group-hover:text-amber-400 transition" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition">
                    Klik atau seret gambar ke sini
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    JPEG, PNG, atau WebP — Maks 2MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* ---- PRODUCT NAME ---- */}
          <div>
            <label className={labelClass}>Nama Produk <span className="text-amber-400">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Chateau Margaux 2018"
              className={inputClass}
            />
          </div>

          {/* ---- CATEGORY + SUBCATEGORY ---- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
              >
                <option value="">Pilih Kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Subkategori</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Bordeaux, Brut..."
                className={inputClass}
              />
            </div>
          </div>

          {/* ---- DESCRIPTION ---- */}
          <div>
            <label className={labelClass}>Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsikan produk secara detail..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* ---- PRICE + STOCK ---- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Harga (Rp) <span className="text-amber-400">*</span></label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="15000000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Stok</label>
              <input
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>

          {/* ---- ABV + ORIGIN ---- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ABV (%)</label>
              <input
                type="number"
                step="0.01"
                value={abv}
                onChange={(e) => setAbv(e.target.value)}
                placeholder="13.5"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Asal (Origin)</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Bordeaux, Prancis"
                className={inputClass}
              />
            </div>
          </div>

          {/* ---- WEIGHT + DISCOUNT ---- */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Berat (gram)</label>
              <input
                type="number"
                value={weightGram}
                onChange={(e) => setWeightGram(parseInt(e.target.value) || 1000)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Diskon (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>

          {/* ---- CHECKBOX TAGS ---- */}
          <div>
            <label className={labelClass}>Tag Produk</label>
            <div className="flex flex-wrap gap-3">
              {CHECKBOX_TAGS.map((tag) => (
                <label
                  key={tag.key}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl cursor-pointer hover:border-slate-500 transition"
                >
                  <input
                    type="checkbox"
                    checked={tags[tag.key]}
                    onChange={(e) =>
                      setTags((prev) => ({ ...prev, [tag.key]: e.target.checked }))
                    }
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-slate-200">{tag.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ---- ACTION BUTTONS ---- */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-600/20"
            >
              <Save size={18} />
              {loading ? 'Menyimpan...' : isEdit ? 'Update Produk' : 'Simpan Produk'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition border border-slate-600"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
