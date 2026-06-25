import { useState } from 'react';
import { adminUpdateOrderStatus, adminMarkOrderPaid, adminToggleItemCheck, adminMarkOrderReady } from '../../services/api';
import { RefreshCw, CheckCircle, ChevronDown, ChevronUp, Package, MapPin, Truck } from 'lucide-react';
import PasswordVerificationModal from './PasswordVerificationModal';
import { formatRupiah } from '../../utils/formatRupiah';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'canceled'];

export default function OrderTable({ orders, loading, onRefresh, isAdmin }) {
  const [updating, setUpdating] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [checks, setChecks] = useState({});

  const executeStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try { await adminUpdateOrderStatus(orderId, newStatus); if (onRefresh) onRefresh(); } catch {}
    setUpdating(null);
    setPendingChange(null);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setPendingChange({ orderId, newStatus });
    setShowVerification(true);
  };

  const handleMarkPaid = async (orderId) => {
    if (!window.confirm('Konfirmasi pembayaran COD sebagai PAID?')) return;
    setUpdating(orderId);
    try { await adminMarkOrderPaid(orderId); if (onRefresh) onRefresh(); } catch {}
    setUpdating(null);
  };

  const handleToggleCheck = async (orderId, itemId, currentChecked) => {
    const key = `${orderId}-${itemId}`;
    setChecks((prev) => ({ ...prev, [key]: !currentChecked }));
    try { await adminToggleItemCheck(orderId, itemId); if (onRefresh) onRefresh(); } catch {}
  };

  const handleMarkReady = async (order) => {
    if (!window.confirm('Tandai pesanan ini sebagai SIAP DIAMBIL?')) return;
    setUpdating(order.id);
    try { await adminMarkOrderReady(order.id); if (onRefresh) onRefresh(); } catch {}
    setUpdating(null);
  };

  const allItemsChecked = (order) => {
    if (!order.items?.length) return false;
    return order.items.every((item) => {
      const key = `${order.id}-${item.id}`;
      return checks[key] !== undefined ? checks[key] : item.is_checked;
    });
  };

  if (loading) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}</div>;
  }
  if (!orders.length) return <div className="text-center py-16 text-gray-400 dark:text-gray-500">Belum ada pesanan</div>;

  const getPaymentBadge = (status) => {
    const map = {
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
      expired: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    };
    return `text-[10px] px-2 py-1 rounded-full font-bold ${map[status] || 'bg-gray-100 text-gray-500'}`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onRefresh} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expanded === order.id;
          return (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 flex flex-wrap items-center gap-3">
                <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-400">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <span className="font-mono font-bold text-xs text-gray-900 dark:text-white w-36">{order.order_number}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 hidden md:inline w-32 truncate">{order.customer_name}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{formatRupiah(order.total_amount)}</span>
                <span className={`text-[10px] capitalize px-2 py-0.5 rounded-full ${order.delivery_type === 'pickup' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                  {order.delivery_type === 'pickup' ? 'Pickup' : 'Kirim'}
                </span>
                <span className={getPaymentBadge(order.payment_status)}>{order.payment_status}</span>
                <select value={order.order_status} disabled={updating === order.id}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="text-[10px] px-2 py-1 rounded-full font-bold border-0 cursor-pointer outline-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {order.payment_method === 'cod' && order.payment_status === 'pending' && (
                  <button onClick={() => handleMarkPaid(order.id)}
                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold bg-green-100 text-green-700 hover:bg-green-200 transition">
                    <CheckCircle size={10} /> Paid
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
                    <div><span className="text-gray-400">Pelanggan:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{order.customer_name}</span></div>
                    <div><span className="text-gray-400">Telepon:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{order.customer_phone}</span></div>
                    <div><span className="text-gray-400">Email:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{order.customer_email || '-'}</span></div>
                    {order.delivery_type === 'shipping' && (
                      <>
                        <div className="md:col-span-3 flex items-start gap-2">
                          <MapPin size={14} className="text-gray-400 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-400">{order.shipping_address}, {order.city}, {order.province} {order.postal_code}</span>
                        </div>
                        {order.courier && (
                          <div className="flex items-center gap-2">
                            <Truck size={14} className="text-gray-400" />
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{order.courier.toUpperCase()} &mdash; {order.courier_service}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Item Pesanan</h4>
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item) => {
                      const key = `${order.id}-${item.id}`;
                      const isChecked = checks[key] !== undefined ? checks[key] : item.is_checked;
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                          <input type="checkbox" checked={isChecked}
                            onChange={() => handleToggleCheck(order.id, item.id, isChecked)}
                            className="accent-amber-600 w-4 h-4 rounded flex-shrink-0" />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Package size={16} className="text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{item.product_name}</p>
                              <p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(item.product_price)}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">{formatRupiah(item.product_price * item.quantity)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-400">
                      {allItemsChecked(order) ? 'Semua item siap' : `Centang ${order.items?.filter(i => { const k = `${order.id}-${i.id}`; return !(checks[k] !== undefined ? checks[k] : i.is_checked); }).length || order.items?.length} item lagi`}
                    </span>
                    <button onClick={() => handleMarkReady(order)}
                      disabled={!allItemsChecked(order) || updating === order.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition shadow-sm">
                      {updating === order.id ? '...' : 'Pesanan Siap'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showVerification && (
        <PasswordVerificationModal
          onVerified={() => {
            if (pendingChange) executeStatusUpdate(pendingChange.orderId, pendingChange.newStatus);
            setShowVerification(false);
          }}
          onClose={() => { setShowVerification(false); setPendingChange(null); }}
        />
      )}
    </div>
  );
}
