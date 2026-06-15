import { useState } from 'react';
import { Search, Package, Clock, Truck, MapPin, CheckCircle, X, Loader2 } from 'lucide-react';
import api from '../services/api';
import { formatRupiah } from '../utils/formatRupiah';
import { useLanguage } from '../contexts/LanguageContext';

export default function TrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const { t } = useLanguage();

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setTracking(null);
    setSearched(true);
    try {
      const { data } = await api.get(`/orders/track/${orderNumber.trim()}`);
      if (data.found) {
        setTracking(data);
      } else {
        setError(data.message || 'Pesanan tidak ditemukan');
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setError('Nomor pesanan tidak ditemukan. Periksa kembali nomor pesanan Anda.');
      } else {
        setError('Gagal melacak pesanan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = tracking ? [
    { label: 'Pesanan Dibuat', done: true },
    { label: 'Pembayaran', done: tracking.payment_status === 'paid' },
    { label: 'Dikonfirmasi', done: ['confirmed', 'processing', 'shipped', 'delivered'].includes(tracking.order_status) },
    { label: 'Dikirim', done: ['shipped', 'delivered'].includes(tracking.order_status) },
    { label: 'Selesai', done: tracking.order_status === 'delivered' },
  ] : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package size={30} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Lacak Pesanan</h1>
        <p className="text-gray-500 dark:text-gray-400">Masukkan nomor pesanan untuk melihat status pengiriman</p>
      </div>

      {/* Input Tracking */}
      <form onSubmit={handleTrack} className="relative mb-8">
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
          placeholder="Masukkan nomor pesanan (contoh: HB-20260608-XXXX)"
          className="w-full pl-5 pr-32 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-sm"
        />
        <button type="submit" disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-xl font-semibold text-sm hover:bg-amber-700 disabled:bg-gray-400 transition">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Mencari...' : 'Lacak'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm p-4 rounded-2xl mb-6 flex items-start gap-3">
          <X size={18} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Mencari pesanan...</p>
        </div>
      )}

      {/* Not searched yet */}
      {!searched && !loading && !error && (
        <p className="text-center text-gray-400 text-sm">Masukkan nomor pesanan Anda di atas untuk melacak status pengiriman.</p>
      )}

      {/* Tracking Result */}
      {tracking && (
        <div className="space-y-6">
          {/* Order Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Order</p>
                <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">{tracking.order_number}</p>
              </div>
              <span className="text-xs text-gray-400">{tracking.created_at}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Pelanggan</p>
                <p className="font-semibold text-gray-900 dark:text-white">{tracking.customer_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Pembayaran</p>
                <p className={`font-semibold ${tracking.payment_status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-amber-600'}`}>
                  {tracking.payment_label}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Status</p>
                <p className="font-semibold text-gray-900 dark:text-white">{tracking.order_label}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total</p>
                <p className="font-semibold text-amber-600">{formatRupiah(tracking.total_amount)}</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">Status Pengiriman</h3>
            <div className="flex items-start justify-between">
              {steps.map((step, i) => (
                <div key={step.label} className="flex-1 flex flex-col items-center text-center relative">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${step.done ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
                  )}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    step.done ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {step.done ? <CheckCircle size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <span className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Detail */}
          {tracking.delivery_type === 'shipping' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Detail Pengiriman</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Alamat</p>
                    <p className="text-gray-800 dark:text-gray-200">{tracking.shipping_address || '-'}</p>
                  </div>
                </div>
                {tracking.courier && (
                  <div className="flex items-start gap-3">
                    <Truck size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Kurir</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{tracking.courier}</p>
                    </div>
                  </div>
                )}
                {tracking.resi_number && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <Package size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Nomor Resi</p>
                      <p className="font-mono font-bold text-amber-600 dark:text-amber-400">{tracking.resi_number}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Item Pesanan</h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {tracking.items.map((item, i) => (
                <div key={i} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
