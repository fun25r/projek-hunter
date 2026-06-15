import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOrder } from '../../services/api';
import { CircleCheck, MessageCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function StepSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber) { setError('Nomor pesanan tidak ditemukan'); setLoading(false); return; }
    getOrder(orderNumber)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setError('Gagal memuat detail pesanan'))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full animate-pulse mx-auto mb-6" />
        <div className="h-6 bg-gray-100 rounded w-48 mx-auto mb-4 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-64 mx-auto animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-6">{error || 'Pesanan tidak ditemukan'}</p>
        <Link to="/" className="text-red-800 font-semibold hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  const waText = encodeURIComponent(
    `Halo Hunter Bottle,\n\n` +
    `Saya sudah melakukan pemesanan:\n` +
    `No. Order: ${order.order_number}\n` +
    `Nama: ${order.customer_name}\n` +
    `Total: Rp ${order.total_amount.toLocaleString('id-ID')}\n\n` +
    `Mohon konfirmasi pesanan saya. Terima kasih.`
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CircleCheck size={42} className="text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2">Pesanan Berhasil!</h1>
        <p className="text-gray-300">Terima kasih, {order.customer_name}.</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-gray-800 uppercase tracking-widest">Order</span>
          <span className="text-sm font-bold text-gray-900">{order.order_number}</span>
        </div>

        <div className="divide-y divide-gray-200">
          {order.items?.map((item, i) => (
            <div key={i} className="py-3 flex justify-between text-sm">
              <span className="text-gray-800">{item.product_name} x{item.quantity}</span>
              <span className="font-medium text-gray-700">Rp {item.subtotal.toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-300 mt-4 pt-4 space-y-1 text-sm">
          {order.shipping_cost > 0 && (
            <div className="flex justify-between text-gray-900">
              <span>Ongkir</span><span>Rp {order.shipping_cost.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2">
            <span>Total</span><span className="text-amber-600">Rp {order.total_amount.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-800">{order.customer_name}</p>
        <p>{order.customer_phone}</p>
        {order.delivery_type === 'shipping' ? (
          <>
            <p>{order.shipping_address}</p>
            <p>{order.city}, {order.province} {order.postal_code}</p>
            <p className="font-semibold text-gray-800 mt-1">{order.courier?.toUpperCase()} · {order.courier_service}</p>
          </>
        ) : (
          <p className="font-semibold text-gray-800 mt-1">Ambil di Toko (COD)</p>
        )}
        <p className="text-xs mt-2">
          Status: <span className="font-semibold capitalize">{order.order_status}</span> · Pembayaran: <span className="font-semibold capitalize">{order.payment_status}</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`https://wa.me/${import.meta.env.VITE_STORE_WHATSAPP}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
        >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.17 1.6 5.98L0 24l6.2-1.62A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.3-1.55l-.38-.23-3.68.96.98-3.58-.25-.39A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.27-7.73c-.29-.15-1.71-.84-1.97-.93-.26-.1-.45-.15-.64.15-.19.29-.74.93-.91 1.12-.17.19-.34.21-.63.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48-.17-.01-.36-.01-.55-.01-.19 0-.48.07-.74.36-.26.29-1 1-1 2.43s1.02 2.82 1.16 3.01c.14.19 2 3.05 4.85 4.28.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34z"/>
            </svg>
          <span>Kirim Bukti via WhatsApp</span>
        </a>
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
        >
          <ShoppingBag size={20} /> Lanjut Belanja
        </Link>
      </div>
    </div>
  );
}
