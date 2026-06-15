import { MapPin, Clock, Phone } from 'lucide-react';

const info = [
  {
    icon: MapPin,
    title: 'Lokasi',
    lines: ['Jl. Margonda Raya No. 123', 'Depok, Jawa Barat 16424'],
  },
  {
    icon: Clock,
    title: 'Jam Operasional',
    lines: ['Senin - Minggu: 14:00 - 03:00', 'Minggu: 12:00 - 18:00'],
  },
  {
    icon: Phone,
    title: 'Hubungi Kami',
    lines: ['WhatsApp: +62 812-3456-7890', 'support@hunterbottle.com'],
  },
];

export default function StoreInfo() {
  return (
    <section className="bg-gradient-to-b from-white via-gray-50 to-white py-16 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-red-800 uppercase tracking-widest">Info</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Kunjungi Toko Kami</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {info.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <item.icon size={26} className="text-red-800" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
              {item.lines.map((line, i) => (
                <p key={i} className="text-sm text-gray-500">{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
