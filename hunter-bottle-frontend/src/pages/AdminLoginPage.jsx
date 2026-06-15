import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) { navigate('/admin/dashboard', { replace: true }); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || '';
      if (msg.includes('Network') || msg.includes('connect') || err?.code === 'ERR_NETWORK') {
        setError('Gagal terhubung ke server. Pastikan backend berjalan di port 8000.');
      } else {
        setError(msg || 'Email atau password salah');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logoImg} alt="Hunter Bottle" className="h-16 w-16 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Hunter Bottle</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" placeholder="admin@hunterbottle.com" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" placeholder="••••••••" />
          </div>

          {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-red-800 text-white rounded-xl font-semibold hover:bg-red-900 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2">
            <LogIn size={18} /> {loading ? 'Login...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
