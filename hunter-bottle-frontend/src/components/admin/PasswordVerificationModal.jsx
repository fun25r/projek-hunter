import { useState } from 'react';
import { X, Shield, Eye, EyeOff } from 'lucide-react';
import { adminLogin } from '../../services/api';

export default function PasswordVerificationModal({ onVerified, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await adminLogin({ email, password });
      if (data?.admin?.role === 'admin') {
        onVerified();
        onClose();
      } else {
        setError('Hanya admin yang bisa mengubah status secara manual');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Email atau password admin salah');
      } else {
        setError('Gagal verifikasi. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-sm w-full p-6 animate-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600/20 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Verifikasi Admin</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-5">
          Masukkan kredensial <strong className="text-amber-400">admin</strong> untuk mengubah status pesanan secara manual.
        </p>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm p-3 rounded-xl mb-4">{error}</div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Admin</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@hunterbottle.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password Admin</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-semibold text-sm transition">
            {loading ? 'Memverifikasi...' : 'Verifikasi & Konfirmasi'}
          </button>
        </form>
      </div>
    </div>
  );
}
