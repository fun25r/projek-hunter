import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const whatsapp = import.meta.env.VITE_STORE_WHATSAPP || '6281234567890';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const text = encodeURIComponent(
      `Halo Hunter Bottle,%0A%0A` +
      `Nama: ${name}%0A` +
      `Pesan: ${message}%0A%0A` +
      `Mohon info lebih lanjut. Terima kasih.`
    );
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setName(''); setMessage(''); }, 2000);
    window.open(`https://wa.me/${whatsapp}?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open
            ? 'bg-gray-200 dark:bg-gray-700 rotate-90'
            : 'bg-green-500 hover:bg-green-600 hover:scale-110'
        }`}
      >
        
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
         <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.17 1.6 5.98L0 24l6.2-1.62A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.3-1.55l-.38-.23-3.68.96.98-3.58-.25-.39A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.27-7.73c-.29-.15-1.71-.84-1.97-.93-.26-.1-.45-.15-.64.15-.19.29-.74.93-.91 1.12-.17.19-.34.21-.63.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.54-.88-2.11-.23-.55-.47-.47-.64-.48-.17-.01-.36-.01-.55-.01-.19 0-.48.07-.74.36-.26.29-1 1-1 2.43s1.02 2.82 1.16 3.01c.14.19 2 3.05 4.85 4.28.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.71-.7 1.95-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34z"/>
      </svg>
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in">
          {/* Header */}
          <div className="bg-green-500 px-5 py-4 flex items-center gap-3">
            <img src={logoImg} alt="Hunter Bottle" className="w-10 h-10 object-contain rounded-lg bg-white/20 p-1" />
            <div className="text-white">
              <p className="font-semibold text-sm">Hunter Bottle</p>
              <p className="text-xs text-white/80">Biasanya membalas dalam 1 jam</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {sent ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Pesan Terkirim!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Membuka WhatsApp...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Ada yang bisa kami bantu? Kirim pesan langsung ke WhatsApp kami.</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan..."
                  rows={3}
                  className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition resize-none"
                />
                <button
                  type="submit"
                  disabled={!name.trim() || !message.trim()}
                  className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition"
                >
                  <Send size={16} /> Kirim via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
