import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ProductCard({ product, onQuickView }) {
  const { addItem, updateQuantity, removeItem, items } = useCart();
  const { t } = useLanguage();
  const [qty, setQty] = useState(0);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Sync local qty with cart after refresh or cart change
  useEffect(() => {
    const cartItem = items.find(i => i.product_id === product.id);
    setQty(cartItem ? cartItem.quantity : 0);
  }, [items, product.id]);

  const isOutOfStock = product.stock_status === 'out_of_stock' || product.stock_count <= 0;
  const isLowStock = product.stock_status === 'low_stock';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const discountedPrice = product.discount_percent > 0
    ? product.price - (product.price * product.discount_percent / 100)
    : null;

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
    setTimeout(() => setAdded(false), 1500);
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
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer" onClick={() => onQuickView?.(product)}>
        {product.image_url && !imgError ? (
          <img
            src={`${backendUrl}/storage/${product.image_url}`}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <ShoppingCart size={40} className="mx-auto text-gray-300 mb-2" />
              <span className="text-xs text-gray-400">{product.category}</span>
            </div>
          </div>
        )}
        {/* Discount Badge */}
        {product.discount_percent > 0 && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            -{product.discount_percent}%
          </span>
        )}
        {/* Low Stock Badge */}
        {isLowStock && !isOutOfStock && (
                <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                  {t('product_low')}
          </span>
        )}
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold px-5 py-2 rounded-xl shadow-lg">{t('product_out')}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-gray-900">
              Rp {(discountedPrice || product.price).toLocaleString('id-ID')}
            </span>
            {discountedPrice && (
              <span className="text-xs text-gray-400 line-through">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-3">
            {product.abv && <span>ABV {product.abv}%</span>}
            {product.abv && product.origin && <span>·</span>}
            {product.origin && <span>{product.origin}</span>}
          </div>

          {/* Controls */}
          {!isOutOfStock && (
            <div className="flex items-center gap-2">
              {qty > 0 ? (
                <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                  <button
                    onClick={handleDecrease}
                    className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-sm"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold tabular-nums text-gray-900 dark:text-white">{qty}</span>
                  <button
                    onClick={handleIncrease}
                    className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-sm"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className={`flex-1 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
                    added
                      ? 'bg-green-600 text-white'
                      : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.97] shadow-lg shadow-amber-600/20'
                  }`}
                >
                  {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                  {added ? t('product_added') : t('product_add')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
