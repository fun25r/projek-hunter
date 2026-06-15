import { useState, useEffect } from 'react';
import { X, Save, Upload, ImageIcon, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminCreateBanner, adminUpdateBanner } from '../../services/api';

export default function BannerModal({ banner, onClose, onSaved }) {
  const isEdit = !!banner;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Image State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill on EDIT
  useEffect(() => {
    if (banner) {
      setTitle(banner.title || '');
      setSubtitle(banner.subtitle || '');
      setLinkUrl(banner.link_url || '');
      setSortOrder(banner.sort_order ?? 0);
      setIsActive(banner.is_active ?? true);
      if (banner.image_url) {
        const fullUrl = `${backendUrl}/storage/${banner.image_url}`;
        setExistingImage(fullUrl);
        setImagePreview(fullUrl);
      }
    }
  }, [banner]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Hanya JPEG, PNG, atau WebP yang diperbolehkan');
      return;
    }
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
    setImagePreview(existingImage || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Judul banner wajib diisi'); return; }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('link_url', linkUrl);
    formData.append('sort_order', String(sortOrder));
    formData.append('is_active', isActive ? '1' : '0');
    if (imageFile) formData.append('image', imageFile);

    try {
      if (isEdit) {
        await adminUpdateBanner(banner.id, formData);
      } else {
        await adminCreateBanner(formData);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan banner');
    } finally {
      setLoading(false);
    }
  };

  const labelClass = 'block text-sm font-semibold text-white mb-1.5';
  const inputClass = 'w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition';

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 my-8 animate-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
              <ImageIcon size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Banner' : 'Banner Baru'}</h2>
              <p className="text-xs text-slate-400">{isEdit ? 'Update konten banner promosi' : 'Tambahkan banner promosi baru'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm p-3 rounded-xl">{error}</div>
          )}

          {/* Title */}
          <div>
            <label className={labelClass}>Judul Banner <span className="text-amber-400">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Diskon Spesial Akhir Pekan" className={inputClass} />
          </div>

          {/* Subtitle / Description */}
          <div>
            <label className={labelClass}>Deskripsi / Subtitle</label>
            <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2}
              placeholder="Teks pendukung banner..." className={`${inputClass} resize-none`} />
          </div>

          {/* Link URL */}
          <div>
            <label className={labelClass}>Link URL (opsional)</label>
            <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://..." className={inputClass} />
          </div>

          {/* Sort Order */}
          <div>
            <label className={labelClass}>Urutan Tampil</label>
            <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
              className={`${inputClass} w-32`} />
          </div>

          {/* Active Toggle */}
          <div>
            <label className={labelClass}>Status</label>
            <button type="button" onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all w-full ${
                isActive ? 'border-green-500/50 bg-green-500/10' : 'border-slate-600 bg-slate-800'
              }`}>
              {isActive ? <ToggleRight size={24} className="text-green-400" /> : <ToggleLeft size={24} className="text-slate-500" />}
              <span className={`text-sm font-semibold ${isActive ? 'text-green-400' : 'text-slate-400'}`}>
                {isActive ? 'Active — Banner akan ditampilkan' : 'Inactive — Banner disembunyikan'}
              </span>
            </button>
          </div>

          {/* Image Dropzone */}
          <div>
            <label className={labelClass}>Gambar Banner</label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl border border-slate-600" />
                <button type="button" onClick={clearImage}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-600 rounded-2xl cursor-pointer hover:border-amber-500/50 hover:bg-slate-800/50 transition-all group">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-amber-600/10 transition">
                  <Upload size={26} className="text-slate-400 group-hover:text-amber-400 transition" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition">Klik untuk upload gambar banner</p>
                  <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP — Maks 2MB</p>
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-600/20">
              <Save size={18} /> {loading ? 'Menyimpan...' : isEdit ? 'Update Banner' : 'Simpan Banner'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition border border-slate-600">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
