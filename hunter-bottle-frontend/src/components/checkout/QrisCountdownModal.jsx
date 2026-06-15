import { useState, useEffect, useRef } from 'react';
import { QrCode, Timer, CheckCircle, AlertTriangle, RefreshCw, X } from 'lucide-react';

export default function QrisCountdownModal({ orderNumber, totalAmount, onSuccess, onClose }) {
  const TIMEOUT_SECONDS = 900; // 15 minutes
  const POLL_INTERVAL = 5000;  // 5 seconds

  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [status, setStatus] = useState('pending'); // pending | paid | expired
  const [pollCount, setPollCount] = useState(0);

  const intervalRef = useRef(null);
  const pollRef = useRef(null);

  // ---- Countdown Timer ----
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          clearInterval(pollRef.current);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // ---- Payment Polling Simulation ----
  useEffect(() => {
    pollRef.current = setInterval(() => {
      setPollCount((prev) => {
        const next = prev + 1;
        // Simulate payment success after random 3-10 polls (15-50 seconds)
        if (next >= 3 && Math.random() > 0.7) {
          clearInterval(intervalRef.current);
          clearInterval(pollRef.current);
          setStatus('paid');
          setTimeout(() => onSuccess?.(), 2000);
          return next;
        }
        return next;
      });
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, []);

  // ---- Format Time ----
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleRegenerate = () => {
    clearInterval(intervalRef.current);
    clearInterval(pollRef.current);
    setTimeLeft(TIMEOUT_SECONDS);
    setStatus('pending');
    setPollCount(0);
    // Re-trigger effects by re-mounting state
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-slate-700 max-w-md w-full p-6 md:p-8 animate-in" onClick={e => e.stopPropagation()}>
        {/* Close button for COD flow */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
          <X size={20} />
        </button>

        {/* ---- PENDING STATE ---- */}
        {status === 'pending' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Timer size={40} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Scan QRIS</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Order #{orderNumber}</p>

            {/* Countdown */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${
              timeLeft < 300 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}>
              <Timer size={16} />
              {formatTime(timeLeft)}
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-6 mb-6 inline-block border-2 border-zinc-200 dark:border-zinc-700">
              <QrCode size={160} className="text-zinc-800 dark:text-white" />
            </div>

            <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Total Pembayaran</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">
              Rp {totalAmount.toLocaleString('id-ID')}
            </p>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Buka aplikasi e-wallet atau mobile banking Anda, pilih menu <strong>QRIS</strong>, lalu scan kode di atas. Pembayaran akan terverifikasi otomatis.
            </p>

            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Menunggu pembayaran... (polling #{pollCount})
            </div>
          </div>
        )}

        {/* ---- SUCCESS STATE ---- */}
        {status === 'paid' && (
          <div className="text-center py-6">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Pembayaran Berhasil!</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Order #{orderNumber}</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Pesanan Berhasil Dibayar & Masuk</p>
            <button onClick={() => window.location.href = `/checkout/success?order=${orderNumber}`}
              className="px-8 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition shadow-lg shadow-amber-600/20">
              Lihat Pesanan
            </button>
          </div>
        )}

        {/* ---- EXPIRED STATE ---- */}
        {status === 'expired' && (
          <div className="text-center py-6">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={48} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Waktu Habis</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">Order #{orderNumber}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed">
              Waktu pembayaran QRIS telah berakhir. Silakan generate ulang kode QR untuk melanjutkan pembayaran.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleRegenerate}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition shadow-lg shadow-amber-600/20">
                <RefreshCw size={18} /> Generate Ulang QRIS
              </button>
              <button onClick={onClose}
                className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition">
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
