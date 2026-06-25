import { X, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { imageUrl } from '../../utils/formatRupiah';

export default function QuickView({ product, onClose }) {
  const { addItem, updateQuantity, removeItem, items } = useCart();
  const [qty, setQty] = useState(0);
  const [added, setAdded] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Sync with cart
  useEffect(() => {
    const cartItem = items.find(i => i.product_id === product.id);
    setQty(cartItem ? cartItem.quantity : 0);
  }, [items, product.id]);

  const discountedPrice = product.discount_percent > 0
    ? product.price - (product.price * product.discount_percent / 100)
    : null;

  const isOutOfStock = product.stock_status === 'out_of_stock' || product.stock_count <= 0;

  const handleAdd = () => {
    const newQty = 1;
    setQty(newQty);
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_price: discountedPrice || product.price,
      weight_gram: product.weight_gram || 1000,
      quantity: newQty,
      image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 1000);
  };

  const handleIncrease = () => {
    const newQty = qty + 1;
    setQty(newQty);
    updateQuantity(product.id, newQty);
  };

  const handleDecrease = () => {
    if (qty <= 1) {
      setQty(0);
      removeItem(product.id);
    } else {
      const newQty = qty - 1;
      setQty(newQty);
      updateQuantity(product.id, newQty);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
          <X size={20} className="text-gray-400" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Image */}
          <div className="aspect-square bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden">
            {product.image_url ? (
              <img src={imageUrl(product.image_url)} alt={product.name}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-500">
                <ShoppingCart size={64} />
              </div>
            )}
            {product.discount_percent > 0 && (
              <span className="absolute top-6 left-6 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">-{product.discount_percent}%</span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">{product.category}</p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">{product.name}</h2>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                Rp {(discountedPrice || product.price).toLocaleString('id-ID')}
              </span>
              {discountedPrice && (
                <span className="text-sm text-gray-400 line-through">Rp {product.price.toLocaleString('id-ID')}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              {product.abv && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">
                  ABV {product.abv}%
                </span>
              )}
              {product.origin && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {product.origin}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                product.stock_status === 'in_stock' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                product.stock_status === 'low_stock' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {product.stock_status === 'in_stock' ? 'Tersedia' :
                 product.stock_status === 'low_stock' ? `Sisa ${product.stock_count}` : 'Habis'}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1">
              {product.description || 'Tidak ada deskripsi.'}
            </p>

            {!isOutOfStock && (
              <div className="flex items-center gap-3 mt-auto">
                {qty > 0 ? (
                  <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-full p-1.5">
                    <button onClick={handleDecrease} className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-500 hover:text-amber-600 transition shadow-sm">
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-base font-bold tabular-nums text-gray-900 dark:text-white">{qty}</span>
                    <button onClick={handleIncrease} className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-500 hover:text-amber-600 transition shadow-sm">
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button onClick={handleAdd}
                    className={`flex-1 py-3 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      added ? 'bg-green-600 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20'
                    }`}>
                    {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                    {added ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
