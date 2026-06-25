import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../contexts/CartContext';
import { getShippingCost } from '../../services/api';
import { Truck, Store } from 'lucide-react';

const COURIERS = [
  { code: 'gojek', name: 'Gojek', color: '#00AA13', logo: 'Gojek' },
  { code: 'grab', name: 'Grab', color: '#00B14F', logo: 'Grab' },
  { code: 'shopee', name: 'Shopee', color: '#EE4D2D', logo: 'Shopee' },
];

export default function StepShipping({ onNext }) {
  const { totalWeight, note, setOrderNote } = useCart();

  const [deliveryType, setDeliveryType] = useState('shipping');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');

  const [courier, setCourier] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingCost, setLoadingCost] = useState(false);
  const [error, setError] = useState('');

  const calculateCost = useCallback(() => {
    if (!destLat || !destLng || !courier || !totalWeight) return;
    setLoadingCost(true);
    setError('');
    setSelectedService('');
    setServices([]);
    setShippingCost(0);

    getShippingCost({
      courier,
      destination_lat: parseFloat(destLat),
      destination_lng: parseFloat(destLng),
      weight: totalWeight || 1000,
      value: 100000,
    })
      .then(({ data }) => {
        const result = data?.rajaongkir?.results?.[0];
        if (result?.costs?.length) {
          setServices(result.costs);
        } else {
          setError('Tidak ada layanan tersedia untuk kurir ini. Coba kurir lain.');
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Gagal menghitung ongkir. Coba lagi.';
        setError(msg);
      })
      .finally(() => setLoadingCost(false));
  }, [destLat, destLng, courier, totalWeight]);

  useEffect(() => {
    if (courier && destLat && destLng) calculateCost();
  }, [courier]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!customerName || !customerPhone) {
      setError('Nama dan nomor telepon wajib diisi'); return;
    }
    if (deliveryType === 'shipping') {
      if (!address || !destLat || !destLng) {
        setError('Alamat lengkap dan koordinat wajib diisi untuk pengiriman.'); return;
      }
      if (!selectedService) {
        setError('Pilih layanan kurir terlebih dahulu.'); return;
      }
    }

    onNext({
      customerName, customerEmail, customerPhone,
      deliveryType,
      shippingAddress: address,
      destination_lat: parseFloat(destLat),
      destination_lng: parseFloat(destLng),
      courier, courierService: selectedService,
      shippingCost,
    });
  };

  const formatRupiah = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Informasi Pengiriman</h2>

      {/* Delivery Type */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { key: 'shipping', icon: Truck, label: 'Dikirim', sub: '(Gojek / Grab / Shopee Instant)' },
          { key: 'pickup', icon: Store, label: 'Ambil di Toko', sub: '(Bayar di Tempat — COD)' },
        ].map((opt) => (
          <button key={opt.key} type="button" onClick={() => { setDeliveryType(opt.key); setError(''); }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              deliveryType === opt.key
                ? 'border-red-800 bg-red-50 dark:bg-red-900/20 shadow-sm'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <opt.icon size={24} className={deliveryType === opt.key ? 'text-red-800 dark:text-red-400' : 'text-gray-400'} />
            <p className="font-semibold text-sm mt-2 dark:text-white">{opt.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{opt.sub}</p>
          </button>
        ))}
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama *</label>
          <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" placeholder="Nama lengkap" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" placeholder="email@contoh.com" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No. Telepon / WA *</label>
          <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" placeholder="08123456789" />
        </div>
      </div>

      {/* Shipping Fields */}
      {deliveryType === 'shipping' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Alamat Lengkap *</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" rows={2}
              placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Latitude *</label>
              <input type="text" value={destLat} onChange={e => { setDestLat(e.target.value); setServices([]); }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition font-mono" placeholder="-6.2415" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Longitude *</label>
              <input type="text" value={destLng} onChange={e => { setDestLng(e.target.value); setServices([]); }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition font-mono" placeholder="106.5285" />
            </div>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4 -mt-2">
            Buka Google Maps, klik kanan di lokasi tujuan, pilih &quot;What&apos;s here?&quot; untuk melihat koordinat.
          </p>

          {/* Courier Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pilih Kurir Instant/Express</label>
            <div className="grid grid-cols-3 gap-2">
              {COURIERS.map((c) => (
                <button key={c.code} type="button"
                  onClick={() => { setCourier(c.code); setSelectedService(''); setServices([]); }}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-bold transition border-2 ${
                    courier === c.code
                      ? 'border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span style={{ color: courier === c.code ? undefined : c.color }}
                    className={`text-lg font-extrabold tracking-tight ${courier === c.code ? 'text-red-800 dark:text-red-400' : ''}`}
                  >
                    {c.logo}
                  </span>
                  <span className="text-[11px]">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loadingCost && (
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-4">
              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              Menghitung ongkir via Biteship...
            </div>
          )}

          {/* Services */}
          {!loadingCost && services.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Layanan Tersedia</label>
              <div className="space-y-2">
                {services.map((s, idx) => (
                  <label key={idx}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition ${
                      selectedService === s.service
                        ? 'border-red-800 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" name="service" value={s.service} checked={selectedService === s.service}
                        onChange={() => { setSelectedService(s.service); setShippingCost(s.cost?.[0]?.value || 0); }}
                        className="accent-red-800" />
                      <div>
                        <p className="font-semibold text-sm dark:text-white">{s.description || s.service}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Estimasi {s.cost?.[0]?.etd || '1-2 jam'} · Via Biteship
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-sm ml-4 dark:text-white">{formatRupiah(s.cost?.[0]?.value || 0)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Note */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Catatan Pesanan</label>
        <textarea value={note} onChange={e => setOrderNote(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm dark:text-white dark:bg-gray-800 focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" rows={2}
          placeholder="Contoh: Tolong dibungkus kado..." />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-sm p-3 rounded-xl mb-4">{error}</div>
      )}

      <button type="submit"
        className="w-full py-3.5 bg-red-800 text-white rounded-xl font-semibold hover:bg-red-900 active:scale-[0.99] transition-all shadow-lg shadow-red-800/20">
        Lanjut ke Review
      </button>
    </form>
  );
}
