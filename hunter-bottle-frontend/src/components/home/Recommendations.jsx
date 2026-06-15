import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { getProductRecommendations } from '../../services/api';
import ProductCard from '../product/ProductCard';

export default function Recommendations({ onQuickView }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductRecommendations()
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !products.length) return null;

  return (
    <section className="px-4 py-12 md:py-16 max-w-7xl mx-auto">
      <div className="relative mb-8">
        <span className="text-1xl font-semibold text-amber-400 uppercase tracking-widest">Rekomendasi</span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-0 mt-2">Untuk Anda</h2>
        <p className="text-gray-500 mt-1">Produk pilihan yang mungkin Anda sukai</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
          ))}
        </div>
      )}
    </section>
  );
}
