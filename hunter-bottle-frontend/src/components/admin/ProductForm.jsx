import { useState } from 'react';
import { adminCreateProduct, adminUpdateProduct } from '../../services/api';
import { Upload, X, Save, ImageIcon } from 'lucide-react';

export default function ProductForm({ product, onSave, onCancel }) {
  const isEdit = !!product;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [subcategory, setSubcategory] = useState(product?.subcategory || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || '');
  const [stockCount, setStockCount] = useState(product?.stock_count ?? 0);
  const [abv, setAbv] = useState(product?.abv || '');
  const [origin, setOrigin] = useState(product?.origin || '');
  const [weightGram, setWeightGram] = useState(product?.weight_gram || 1000);
  const [discountPercent, setDiscountPercent] = useState(product?.discount_percent || 0);
  const [discountExpiresAt, setDiscountExpiresAt] = useState(product?.discount_expires_at ? product.discount_expires_at.slice(0, 16) : '');
  const [newCollectionExpiresAt, setNewCollectionExpiresAt] = useState(product?.new_collection_expires_at ? product.new_collection_expires_at.slice(0, 16) : '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    product?.image_url ? `${backendUrl}/storage/${product.image_url}` : null
  );
  const [isFeatured, setIsFeatured] = useState(product?.is_featured || false);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller || false);
  const [isNewCollection, setIsNewCollection] = useState(product?.is_new_collection || false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Gambar maksimal 2MB'); return; }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const clearImage = () => { setImage(null); setImagePreview(null); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) { setError('Nama dan harga wajib diisi'); return; }

    setLoading(true);
    setError('');

    const fd = new FormData();
    fd.append('name', name);
    fd.append('category', category);
    fd.append('subcategory', subcategory);
    fd.append('description', description);
    fd.append('price', price);
    fd.append('stock_count', String(stockCount));
    if (abv) fd.append('abv', abv);
    fd.append('origin', origin);
    fd.append('weight_gram', String(weightGram));
    fd.append('discount_percent', String(discountPercent));
    if (discountExpiresAt) fd.append('discount_expires_at', discountExpiresAt);
    if (newCollectionExpiresAt) fd.append('new_collection_expires_at', newCollectionExpiresAt);
    fd.append('is_featured', isFeatured ? '1' : '0');
    fd.append('is_bestseller', isBestseller ? '1' : '0');
    fd.append('is_new_collection', isNewCollection ? '1' : '0');
    fd.append('is_active', isActive ? '1' : '0');
    if (image) fd.append('image', image);

    try {
      if (isEdit) {
        await adminUpdateProduct(product.id, fd);
      } else {
        await adminCreateProduct(fd);
      }
      onSave();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan produk. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const lbl = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';
  const inp = 'w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h3>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Error */}
        {error && <div className="md:col-span-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">{error}</div>}

        {/* Name */}
        <div className="md:col-span-2">
          <label className={lbl}>Nama Produk <span className="text-amber-600">*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Chateau Margaux 2018" className={inp} />
        </div>

        {/* Category + Subcategory */}
        <div>
          <label className={lbl}>Kategori</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className={inp}>
            <option value="">Pilih Kategori</option>
            {['Red Wine','White Wine','Champagne','Whisky','Vodka','Rum','Liqueur','Gin','Tequila','Brandy','Sake','Soju','Beer'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Subkategori</label>
          <input value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="Bordeaux, Brut..." className={inp} />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className={lbl}>Deskripsi</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inp} resize-none`} placeholder="Deskripsikan produk..." />
        </div>

        {/* Price + Stock */}
        <div>
          <label className={lbl}>Harga (Rp) <span className="text-amber-600">*</span></label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="15000000" className={inp} />
        </div>
        <div>
          <label className={lbl}>Stok</label>
          <input type="number" value={stockCount} onChange={e => setStockCount(parseInt(e.target.value) || 0)} className={inp} />
        </div>

        {/* ABV + Origin */}
        <div>
          <label className={lbl}>ABV (%)</label>
          <input type="number" step="0.01" value={abv} onChange={e => setAbv(e.target.value)} placeholder="13.5" className={inp} />
        </div>
        <div>
          <label className={lbl}>Asal (Origin)</label>
          <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Bordeaux, Prancis" className={inp} />
        </div>

        {/* Weight + Discount */}
        <div>
          <label className={lbl}>Berat (gram)</label>
          <input type="number" value={weightGram} onChange={e => setWeightGram(parseInt(e.target.value) || 1000)} className={inp} />
        </div>
        <div>
          <label className={lbl}>Diskon (%)</label>
          <input type="number" min="0" max="100" value={discountPercent} onChange={e => setDiscountPercent(parseInt(e.target.value) || 0)} className={inp} />
        </div>

        {/* Timed Discount & New Collection Expiry */}
        <div>
          <label className={lbl}>Diskon Berakhir <span className="text-xs font-normal text-gray-400 ml-1">(Flash Sale)</span></label>
          <input type="datetime-local" value={discountExpiresAt} onChange={e => setDiscountExpiresAt(e.target.value)} className={inp} />
        </div>
        <div>
          <label className={lbl}>Tag New Berakhir <span className="text-xs font-normal text-gray-400 ml-1">(otomatis hilang)</span></label>
          <input type="datetime-local" value={newCollectionExpiresAt} onChange={e => setNewCollectionExpiresAt(e.target.value)} className={inp} />
        </div>

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className={lbl}>Gambar Produk</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="w-28 h-28 object-cover rounded-xl border border-gray-200 dark:border-gray-600" />
              <button type="button" onClick={clearImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition shadow-lg">
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition group">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition">
                <Upload size={22} className="text-gray-400 group-hover:text-amber-600 transition" />
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-amber-600 transition">Klik untuk upload gambar</p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP — Maks 2MB</p>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Checkbox Tags — Penjelasan fungsi */}
        <div className="md:col-span-2">
          <label className={lbl}>Tag Produk <span className="text-xs font-normal text-gray-400 ml-2">(centang untuk mengaktifkan)</span></label>
          <div className="flex flex-wrap gap-3 mt-1">
            {[
              { key: isFeatured, set: setIsFeatured, label: 'Featured', desc: 'Tampil di rekomendasi & banner', icon: '💎' },
              { key: isBestseller, set: setIsBestseller, label: 'Best Seller', desc: 'Tandai sebagai produk terlaris', icon: '⭐' },
              { key: isNewCollection, set: setIsNewCollection, label: 'New Collection', desc: 'Tampil di koleksi terbaru', icon: '🆕' },
              { key: isActive, set: setIsActive, label: 'Active', desc: 'Produk muncul di katalog publik', icon: '✅' },
            ].map((tag) => (
              <label key={tag.label}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  tag.key ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}>
                <input type="checkbox" checked={tag.key} onChange={e => tag.set(e.target.checked)}
                  className="accent-amber-600 w-4 h-4 mt-0.5 rounded" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{tag.icon} {tag.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tag.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-amber-600/20">
            <Save size={16} /> {loading ? 'Menyimpan...' : isEdit ? 'Update Produk' : 'Simpan Produk'}
          </button>
          <button type="button" onClick={onCancel}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm transition">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
