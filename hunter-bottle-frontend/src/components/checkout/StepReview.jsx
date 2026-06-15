import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { createOrder } from '../../services/api';
import { ArrowLeft } from 'lucide-react';

export default function StepReview({ shippingData, onBack }) {
  const { items, subtotal, note, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = subtotal + (shippingData.shippingCost || 0);
  const isPickup = shippingData.deliveryType === 'pickup';

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        customer_name: shippingData.customerName,
        customer_email: shippingData.customerEmail || '',
        customer_phone: shippingData.customerPhone,
        delivery_type: shippingData.deliveryType,
        shipping_address: shippingData.address || null,
        province: shippingData.province || null,
        city: shippingData.city || null,
        subdistrict: shippingData.subdistrict || null,
        postal_code: shippingData.postalCode || null,
        courier: shippingData.courier || null,
        courier_service: shippingData.courierService || null,
        shipping_cost: shippingData.shippingCost || 0,
        payment_method: isPickup ? 'cod' : 'qris',
        order_note: note || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          note: item.note || null,
        })),
      };

      const { data } = await createOrder(payload);
      clearCart();

      if (data.order?.xendit_invoice_url) {
        window.location.href = data.order.xendit_invoice_url;
      } else {
        navigate(`/checkout/success?order=${data.order.order_number}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition">
        <ArrowLeft size={16} /> <span className="text-sm font-medium">Kembali</span>
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Review Pesanan</h2>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex-shrink-0 flex items-center justify-center">
              <span className="text-xl">{isPickup ? '🍷' : '📦'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{item.product_name}</p>
              <p className="text-xs text-gray-500">{item.quantity} x Rp {item.product_price.toLocaleString('id-ID')}</p>
              {item.note && <p className="text-xs text-gray-400 italic mt-0.5">"{item.note}"</p>}
            </div>
            <p className="font-bold text-sm whitespace-nowrap">
              Rp {(item.product_price * item.quantity).toLocaleString('id-ID')}
            </p>
          </div>
        ))}
      </div>

      {/* Shipping Info */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6">
        <h4 className="font-bold text-sm text-gray-900 mb-3">Detail Pengiriman</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-800">{shippingData.customerName}</p>
          <p>{shippingData.customerPhone}</p>
          {shippingData.customerEmail && <p>{shippingData.customerEmail}</p>}
          {!isPickup ? (
            <>
              <div className="border-t border-gray-200 my-2" />
              <p>{shippingData.address}</p>
              <p>{shippingData.city}, {shippingData.province} {shippingData.postalCode}</p>
              <p className="font-semibold text-gray-800 mt-1">
                {shippingData.courier?.toUpperCase()} · {shippingData.courierService} · Rp {shippingData.shippingCost?.toLocaleString('id-ID')}
              </p>
            </>
          ) : (
            <>
              <div className="border-t border-gray-200 my-2" />
              <p className="font-semibold text-gray-800">Ambil di Toko — Bayar di Tempat (COD)</p>
            </>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6">
        <h4 className="font-bold text-sm text-gray-900 mb-2">Metode Pembayaran</h4>
        {isPickup ? (
          <p className="text-sm text-gray-600">💵 Cash on Delivery (COD) — Bayar saat ambil di toko</p>
        ) : (
          <p className="text-sm text-gray-600">📱 QRIS — Scan QR code via Xendit</p>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span>
        </div>
        {shippingData.shippingCost > 0 && (
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Ongkos Kirim</span><span>Rp {shippingData.shippingCost.toLocaleString('id-ID')}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
          <span>Total</span><span className="text-red-800">Rp {totalAmount.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl mb-4">{error}</div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full py-3.5 bg-red-800 text-white rounded-xl font-semibold hover:bg-red-900 disabled:bg-gray-400 transition-all shadow-lg shadow-red-800/20 active:scale-[0.99]"
      >
        {loading ? 'Memproses Pesanan...' : 'Buat Pesanan'}
      </button>
      <p className="text-center text-xs text-gray-400 mt-3">
        Dengan menekan tombol, Anda menyetujui syarat & ketentuan Hunter Bottle
      </p>
    </div>
  );
}
