import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBanners } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HeroCarousel() {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { t } = useLanguage();

  useEffect(() => {
    getBanners()
      .then(({ data }) => setBanners(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="mx-4 mt-4 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse">
        <div className="h-[320px] md:h-[400px]" />
      </div>
    );
  }

  if (!banners.length) return null;

  const banner = banners[current];

  return (
    <section className="mx-4 mt-4 max-w-7xl md:mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* Image */}
        {banner.image_url ? (
          <img
            src={`${backendUrl}/storage/${banner.image_url}`}
            alt={banner.title}
            className="w-full h-[280px] md:h-[400px] object-cover"
          />
        ) : (
          <div className="w-full h-[280px] md:h-[400px] bg-gradient-to-br from-red-950 via-gray-900 to-gray-800 flex items-center justify-center">
            <span className="text-white/30 text-lg">Hunter Bottle</span>
          </div>
        )}

        {/* Navigasi panah */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Text content di bawah gambar */}
      <div className="py-6 md:py-8 text-center">
        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">
          {t('hero_badge')}
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mt-2 mb-3">
          {banner.title}
        </h1>
        {banner.subtitle && (
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {banner.subtitle}
          </p>
        )}
        <a
          href="#products"
          className="mt-6 inline-block px-8 py-3 bg-amber-600 text-white rounded-full font-semibold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
        >
          {t('hero_cta')}
        </a>
      </div>
    </section>
  );
}
