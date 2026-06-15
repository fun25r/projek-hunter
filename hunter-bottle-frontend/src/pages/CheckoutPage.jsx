import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Truck, Store, Plus, Minus, Trash2,
  Sun, Moon, QrCode, Loader2,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { createOrder, getSnapToken } from '../services/api';
import { formatRupiah } from '../utils/formatRupiah';

const COURIERS = [
  { key: 'jne', label: 'JNE', icon: '📦' },
  { key: 'gojek', label: 'Gojek', icon: '🛵' },
  { key: 'grab', label: 'Grab', icon: '🚗' },
  { key: 'shopee_instan', label: 'Shopee Instan', icon: '⚡' },
];

const ONSITE_COST = 15000; // Flat shipping cost per courier

export default function CheckoutPage() {
  const { items, subtotal, note, setOrderNote, removeItem, updateQuantity, clearCart, totalWeight } = useCart();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState(null);

  // Manual customer inputs
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Manual address inputs (replaces cascade dropdowns)
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Delivery
  const [deliveryType, setDeliveryType] = useState('shipping');
  const [courier, setCourier] = useState('');
  const [shippingCost, setShippingCost] = useState(0);

  // Payment: QRIS = always for shipping; QRIS or COD for pickup
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [orderNumber, setOrderNumber] = useState('');

  const [error, setError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  const labelClass = 'block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5';
  const inputClass = 'w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition';

  // Auto-calculate shipping cost
  const calcShipping = (cKey, weight) => {
    if (!cKey) return 0;
    const baseWeight = weight || items.reduce((s, i) => s + (i.weight_gram || 1000) * i.quantity, 0);
    const weightKg = Math.ceil(baseWeight / 1000);
    return ONSITE_COST * weightKg;
  };

  const handleCourierSelect = (cKey) => {
    setCourier(cKey);
    setShippingCost(calcShipping(cKey, totalWeight));
  };

  // ---- Step 1 → Step 2 ----
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) { setError('Nama dan nomor telepon wajib diisi'); return; }
    if (deliveryType === 'shipping' && (!city.trim() || !address.trim())) { setError('Kota dan alamat wajib diisi untuk pengiriman'); return; }
    setError('');
    setShippingData({ customerName, customerEmail, customerPhone, deliveryType, address, province, city, district, postalCode, courier, shippingCost, paymentMethod });
    setStep(2);
  };

  // ---- Place Order → Show QRIS modal ----
  const handlePlaceOrder = async () => {
    setOrderLoading(true);
    setError('');
    try {
      const payload = {
        customer_name: shippingData.customerName,
        customer_email: shippingData.customerEmail || '',
        customer_phone: shippingData.customerPhone,
        delivery_type: shippingData.deliveryType,
        shipping_address: shippingData.deliveryType === 'shipping' ? shippingData.address : null,
        province: shippingData.province || null,
        city: shippingData.city || null,
        subdistrict: shippingData.district || null,
        postal_code: shippingData.postalCode || null,
        courier: shippingData.courier || null,
        courier_service: shippingData.courier || null,
        shipping_cost: shippingData.shippingCost || 0,
        payment_method: shippingData.paymentMethod,
        order_note: note || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          note: item.note || null,
        })),
      };
      const { data } = await createOrder(payload);
      setOrderNumber(data.order?.order_number || '');

      if (shippingData.paymentMethod === 'qris') {
        clearCart();
        // Get Snap token from Midtrans
        const snap = await getSnapToken({
          order_number: data.order.order_number,
          amount: totalAmount,
          customer_name: shippingData.customerName,
          customer_email: shippingData.customerEmail || 'customer@example.com',
          customer_phone: shippingData.customerPhone,
        });
        // Trigger Midtrans Snap popup
        window.snap.pay(snap.data?.token || snap.token, {
          onSuccess: () => navigate(`/checkout/success?order=${data.order.order_number}`),
          onPending: () => navigate(`/checkout/success?order=${data.order.order_number}`),
          onError: () => setError('Pembayaran gagal. Silakan coba lagi.'),
          onClose: () => setError('Popup pembayaran ditutup. Pesanan tetap aktif.'),
        });
      } else {
        clearCart();
        navigate(`/checkout/success?order=${data.order.order_number}`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setOrderLoading(false);
    }
  };

  const totalAmount = subtotal + (shippingData?.shippingCost || 0);

  // ---- Empty Cart ----
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 py-20">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={36} className="text-zinc-300 dark:text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Keranjang Kosong</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Tambahkan produk sebelum checkout.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-700 transition shadow-lg shadow-amber-600/20">
          <ShoppingBag size={18} /> Lihat Produk
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb + Theme Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"><ArrowLeft size={20} /></Link>
            <div className="flex items-center gap-3 text-sm font-semibold">
              {['Pengiriman', 'Review'].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= i + 1 ? 'bg-amber-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>{i + 1}</span>
                  <span className={step >= i + 1 ? 'text-amber-600' : 'text-zinc-300 dark:text-zinc-600'}>{label}</span>
                  {i < 1 && <span className="text-zinc-300 dark:text-zinc-600 mx-1">—</span>}
                </div>
              ))}
            </div>
          </div>
          <button onClick={toggle} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition" title={dark ? 'Mode Terang' : 'Mode Gelap'}>
            {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* ======== STEP 1: SHIPPING ======== */}
            {step === 1 && (
              <form onSubmit={handleNextStep}>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Informasi Pengiriman</h2>

                {/* Delivery Type */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[{ key: 'shipping', icon: Truck, label: 'Dikirim', sub: 'JNE / Gojek / Grab / Shopee Instan' },
                    { key: 'pickup', icon: Store, label: 'Ambil di Toko', sub: 'Bayar di Tempat (COD)' }].map((opt) => (
                    <button key={opt.key} type="button"
                      onClick={() => { setDeliveryType(opt.key); setPaymentMethod(opt.key === 'shipping' ? 'qris' : 'cod'); setError(''); }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        deliveryType === opt.key ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' : 'border-zinc-200 dark:border-zinc-700'
                      }`}>
                      <opt.icon size={24} className={deliveryType === opt.key ? 'text-amber-600' : 'text-zinc-400'} />
                      <p className="font-semibold text-sm mt-2 text-zinc-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{opt.sub}</p>
                    </button>
                  ))}
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={labelClass}>Nama <span className="text-amber-600">*</span></label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputClass} placeholder="Nama lengkap" />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className={inputClass} placeholder="email@contoh.com" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>No. Telepon / WA <span className="text-amber-600">*</span></label>
                    <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={inputClass} placeholder="08123456789" />
                  </div>
                </div>

                {/* Shipping Address — Manual text inputs */}
                {deliveryType === 'shipping' && (
                  <>
                    <div className="mb-4">
                      <label className={labelClass}>Alamat Lengkap <span className="text-amber-600">*</span></label>
                      <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={labelClass}>Provinsi <span className="text-amber-600">*</span></label>
                        <input type="text" value={province} onChange={e => setProvince(e.target.value)} className={inputClass} placeholder="Jawa Barat" />
                      </div>
                      <div>
                        <label className={labelClass}>Kota/Kabupaten <span className="text-amber-600">*</span></label>
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} className={inputClass} placeholder="Depok" />
                      </div>
                      <div>
                        <label className={labelClass}>Kecamatan</label>
                        <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className={inputClass} placeholder="Pancoran Mas" />
                      </div>
                      <div>
                        <label className={labelClass}>Kode Pos</label>
                        <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} className={inputClass} placeholder="16424" />
                      </div>
                    </div>

                    {/* Courier */}
                    <div className="mb-4">
                      <label className={labelClass}>Pilih Kurir</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {COURIERS.map(c => (
                          <button key={c.key} type="button" onClick={() => handleCourierSelect(c.key)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                              courier === c.key ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                            }`}>
                            <span>{c.icon}</span> {c.label}
                          </button>
                        ))}
                      </div>
                      {courier && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                          Estimasi ongkir: <strong className="text-zinc-800 dark:text-zinc-200">{formatRupiah(shippingCost)}</strong>
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Payment Method — Conditional */}
                <div className="mb-6">
                  <label className={labelClass}>Metode Pembayaran</label>
                  {deliveryType === 'shipping' ? (
                    <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10">
                      <div className="flex items-center gap-3">
                        <QrCode size={24} className="text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="font-bold text-sm text-zinc-900 dark:text-white">QRIS</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Pembayaran digital (dikirim wajib QRIS)</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {[{ key: 'cod', label: 'COD', desc: 'Bayar di Toko' },
                        { key: 'qris', label: 'QRIS', desc: 'Scan & Bayar' }].map(pm => (
                        <button key={pm.key} type="button" onClick={() => setPaymentMethod(pm.key)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            paymentMethod === pm.key ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' : 'border-zinc-200 dark:border-zinc-700'
                          }`}>
                          <p className="font-semibold text-sm text-zinc-900 dark:text-white">{pm.label}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{pm.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note */}
                <div className="mb-8">
                  <label className={labelClass}>Catatan Pesanan</label>
                  <textarea value={note} onChange={e => setOrderNote(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Contoh: Tolong dibungkus kado..." />
                </div>

                {error && <p className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl mb-4">{error}</p>}

                <button type="submit" className="w-full py-3.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 active:scale-[0.99] transition-all shadow-lg shadow-amber-600/20">
                  Lanjut ke Review
                </button>
              </form>
            )}

            {/* ======== STEP 2: REVIEW ======== */}
            {step === 2 && shippingData && (
              <div>
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6 transition">
                  <ArrowLeft size={16} /><span className="text-sm font-medium">Kembali</span>
                </button>

                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Review Pesanan</h2>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700">
                      <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-700 rounded-xl flex-shrink-0 flex items-center justify-center text-xl">🍷</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{item.product_name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{formatRupiah(item.product_price)} / item</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => item.quantity <= 1 ? removeItem(item.product_id) : updateQuantity(item.product_id, item.quantity - 1)} className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition text-zinc-600 dark:text-zinc-300"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-semibold text-zinc-900 dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition text-zinc-600 dark:text-zinc-300"><Plus size={14} /></button>
                      </div>
                      <p className="font-bold text-sm text-zinc-900 dark:text-white whitespace-nowrap">{formatRupiah(item.product_price * item.quantity)}</p>
                      <button onClick={() => removeItem(item.product_id)} className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition p-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>

                {/* Shipping Info */}
                <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-5 mb-6 border border-zinc-100 dark:border-zinc-700">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-3">Detail Pengiriman</h4>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{shippingData.customerName}</p>
                    <p>{shippingData.customerPhone}</p>
                    {shippingData.deliveryType === 'shipping' ? (
                      <>
                        <div className="border-t border-zinc-200 dark:border-zinc-700 my-2" />
                        <p>{shippingData.address}</p>
                        <p>{shippingData.city}, {shippingData.province} {shippingData.postalCode}</p>
                        {shippingData.courier && <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{shippingData.courier.toUpperCase()} &mdash; {formatRupiah(shippingData.shippingCost)}</p>}
                      </>
                    ) : (
                      <>
                        <div className="border-t border-zinc-200 dark:border-zinc-700 my-2" />
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">Ambil di Toko — {shippingData.paymentMethod === 'cod' ? 'Bayar di Tempat' : 'QRIS'}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div className="mb-6">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-3">Metode Pembayaran</h4>
                  <div className="p-5 rounded-xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800/40 rounded-xl flex items-center justify-center">
                        {shippingData.paymentMethod === 'qris' ? <QrCode size={24} className="text-amber-600" /> : <Store size={24} className="text-amber-600" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-white">
                          {shippingData.paymentMethod === 'qris' ? 'QRIS' : 'Cash on Delivery'}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {shippingData.paymentMethod === 'qris' ? 'Scan QR code untuk membayar' : 'Bayar langsung saat ambil di toko'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mb-6">
                  <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-1"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                  {shippingData.shippingCost > 0 && <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-1"><span>Ongkos Kirim</span><span>{formatRupiah(shippingData.shippingCost)}</span></div>}
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700"><span className="text-zinc-900 dark:text-white">Total</span><span className="text-amber-600">{formatRupiah(totalAmount)}</span></div>
                </div>

                {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-4 rounded-xl mb-4">{error}</div>}

                <button onClick={handlePlaceOrder} disabled={orderLoading}
                  className="w-full py-3.5 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 transition-all shadow-lg shadow-amber-600/20 active:scale-[0.99] flex items-center justify-center gap-2">
                  {orderLoading ? <><Loader2 size={18} className="animate-spin" /> Memproses...</> : <>{shippingData.paymentMethod === 'qris' ? <QrCode size={18} /> : <Store size={18} />} Buat Pesanan</>}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1 order-first lg:order-none">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-5 md:p-6 border border-zinc-100 dark:border-zinc-800 lg:sticky lg:top-24">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-3">Ringkasan</h3>
              <p className="text-xs text-zinc-500 mb-4">{items.length} item</p>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-80 overflow-y-auto">
                {items.map((item, i) => (
                  <div key={i} className="py-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2"><p className="text-sm text-zinc-800 dark:text-zinc-200 line-clamp-1">{item.product_name}</p><p className="text-xs text-zinc-500">{formatRupiah(item.product_price)}</p></div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => item.quantity <= 1 ? removeItem(item.product_id) : updateQuantity(item.product_id, item.quantity - 1)} className="p-1 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition text-zinc-500"><Minus size={12} /></button>
                        <span className="w-6 text-center text-xs font-semibold text-zinc-900 dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition text-zinc-500"><Plus size={12} /></button>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1 text-right">{formatRupiah(item.product_price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-300 dark:border-zinc-700 mt-4 pt-4">
                <div className="flex justify-between font-bold text-zinc-900 dark:text-white"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                {shippingData?.shippingCost > 0 && <div className="flex justify-between text-sm mt-2 text-zinc-600 dark:text-zinc-400"><span>Ongkir</span><span className="font-medium">{formatRupiah(shippingData.shippingCost)}</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
