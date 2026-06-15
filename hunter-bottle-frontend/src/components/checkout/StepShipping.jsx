import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../contexts/CartContext';
import { getProvinces, getCities, getSubdistricts, getShippingCost } from '../../services/api';
import { ChevronDown, Truck, Store } from 'lucide-react';

export default function StepShipping({ onNext }) {
  const { totalWeight, note, setOrderNote } = useCart();

  const [deliveryType, setDeliveryType] = useState('shipping');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState({ id: '', name: '' });
  const [selectedCity, setSelectedCity] = useState({ id: '', name: '' });
  const [selectedSubdistrict, setSelectedSubdistrict] = useState({ id: '', name: '' });

  const [courier, setCourier] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingCost, setLoadingCost] = useState(false);
  const [error, setError] = useState('');

  const COURIERS = ['jne', 'pos', 'tiki'];

  useEffect(() => {
    getProvinces()
      .then(({ data }) => setProvinces(data?.rajaongkir?.results || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProvince.id) return;
    getCities(selectedProvince.id)
      .then(({ data }) => {
        setCities(data?.rajaongkir?.results || []);
        setSelectedCity({ id: '', name: '' });
        setSubdistricts([]);
        setServices([]);
        setSelectedService('');
      })
      .catch(() => {});
  }, [selectedProvince.id]);

  useEffect(() => {
    if (!selectedCity.id) return;
    getSubdistricts(selectedCity.id)
      .then(({ data }) => setSubdistricts(data?.rajaongkir?.results || []))
      .catch(() => {});
  }, [selectedCity.id]);

  const calculateCost = useCallback(() => {
    if (!selectedCity.id || !courier || !totalWeight) return;
    setLoadingCost(true);
    setError('');
    getShippingCost({
      destination_city_id: selectedCity.id,
      weight_gram: totalWeight || 1000,
      courier,
    })
      .then(({ data }) => setServices(data?.rajaongkir?.results?.[0]?.costs || []))
      .catch(() => setError('Gagal menghitung ongkos kirim. Coba kurir lain.'))
      .finally(() => setLoadingCost(false));
  }, [selectedCity.id, courier, totalWeight]);

  useEffect(() => { calculateCost(); }, [calculateCost]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setError('Nama dan nomor telepon wajib diisi'); return;
    }
    if (deliveryType === 'shipping' && (!selectedCity.id || !address)) {
      setError('Alamat dan kota tujuan wajib diisi'); return;
    }
    onNext({
      customerName, customerEmail, customerPhone,
      deliveryType, address, postalCode,
      province: selectedProvince.name,
      city: selectedCity.name,
      subdistrict: selectedSubdistrict.name,
      courier, courierService: selectedService,
      shippingCost,
    });
  };

  const formatRupiah = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Pengiriman</h2>

      {/* Delivery Type */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { key: 'shipping', icon: Truck, label: 'Dikirim', sub: '(JNE / POS / TIKI)' },
          { key: 'pickup', icon: Store, label: 'Ambil di Toko', sub: '(Bayar di Tempat)' },
        ].map((opt) => (
          <button key={opt.key} type="button" onClick={() => { setDeliveryType(opt.key); setError(''); }}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              deliveryType === opt.key ? 'border-red-800 bg-red-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
            }`}>
            <opt.icon size={24} className={deliveryType === opt.key ? 'text-red-800' : 'text-gray-400'} />
            <p className="font-semibold text-sm mt-2">{opt.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
          </button>
        ))}
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nama *</label>
          <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" placeholder="Nama lengkap" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" placeholder="email@contoh.com" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon / WA *</label>
          <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" placeholder="08123456789" />
        </div>
      </div>

      {/* Shipping Fields */}
      {deliveryType === 'shipping' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Lengkap *</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" rows={2}
              placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <SelectField label="Provinsi" value={selectedProvince.name} disabled={!provinces.length}
              onChange={(id, name) => { setSelectedProvince({ id, name }); }}>
              {provinces.map((p) => (
                <option key={p.province_id} value={`${p.province_id}|${p.province}`}>{p.province}</option>
              ))}
            </SelectField>
            <SelectField label="Kota/Kabupaten" value={selectedCity.name} disabled={!selectedProvince.id}
              onChange={(id, name) => { setSelectedCity({ id, name }); }}>
              {cities.map((c) => (
                <option key={c.city_id} value={`${c.city_id}|${c.city_name}`}>{c.type} {c.city_name}</option>
              ))}
            </SelectField>
            <SelectField label="Kecamatan" value={selectedSubdistrict.name} disabled={!selectedCity.id}
              onChange={(id, name) => { setSelectedSubdistrict({ id, name }); }}>
              {subdistricts.map((s) => (
                <option key={s.subdistrict_id} value={`${s.subdistrict_id}|${s.subdistrict_name}`}>{s.subdistrict_name}</option>
              ))}
            </SelectField>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Pos</label>
            <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)}
              className="w-full md:w-40 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" placeholder="164xx" />
          </div>

          {/* Courier */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Kurir</label>
            <div className="flex gap-2">
              {COURIERS.map((c) => (
                <button key={c} type="button"
                  onClick={() => { setCourier(c); setSelectedService(''); setServices([]); }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase transition border-2 ${
                    courier === c ? 'border-red-800 bg-red-50 text-red-800' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}>{c}</button>
              ))}
            </div>
          </div>

          {/* Services */}
          {loadingCost && <p className="text-sm text-gray-400 animate-pulse">Menghitung ongkir...</p>}
          {services.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Layanan Tersedia</label>
              <div className="space-y-2">
                {services.map((s) => (
                  <label key={s.service}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition ${
                      selectedService === s.service ? 'border-red-800 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="service" value={s.service} checked={selectedService === s.service}
                        onChange={() => { setSelectedService(s.service); setShippingCost(s.cost[0]?.value || 0); }}
                        className="accent-red-800" />
                      <div>
                        <p className="font-semibold text-sm">{s.service}</p>
                        <p className="text-xs text-gray-500">{s.description} · Estimasi {s.cost[0]?.etd || '-'} hari</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm ml-4">{formatRupiah(s.cost[0]?.value)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Note */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan Pesanan</label>
        <textarea value={note} onChange={e => setOrderNote(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition" rows={2}
          placeholder="Contoh: Tolong dibungkus kado..." />
      </div>

      {error && <p className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-4">{error}</p>}

      <button type="submit"
        className="w-full py-3.5 bg-red-800 text-white rounded-xl font-semibold hover:bg-red-900 active:scale-[0.99] transition-all shadow-lg shadow-red-800/20">
        Lanjut ke Review
      </button>
    </form>
  );
}

function SelectField({ label, value, disabled, onChange, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <select
          disabled={disabled}
          value={value || ''}
          onChange={(e) => {
            const [id, name] = e.target.value.split('|');
            if (onChange) onChange(id, name);
          }}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm appearance-none bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-red-800/20 focus:border-red-800 outline-none transition">
          <option value="">Pilih {label}</option>
          {children}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
