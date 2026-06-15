import { Wine, GlassWater, Grape, Martini, Flame } from 'lucide-react';

const categories = [
  { name: 'Red Wine', icon: Wine, color: 'from-red-100 to-rose-50 dark:from-red-950/40 dark:to-rose-950/20', accent: 'text-red-700 dark:text-red-400' },
  { name: 'White Wine', icon: GlassWater, color: 'from-yellow-100 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/20', accent: 'text-yellow-700 dark:text-yellow-300' },
  { name: 'Champagne', icon: Grape, color: 'from-amber-100 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/20', accent: 'text-amber-700 dark:text-amber-400' },
  { name: 'Whisky', icon: Wine, color: 'from-orange-100 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/20', accent: 'text-orange-700 dark:text-orange-400' },
  { name: 'Vodka', icon: Martini, color: 'from-sky-100 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/30', accent: 'text-sky-700 dark:text-sky-600' },
  { name: 'Rum', icon: Flame, color: 'from-amber-200 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/20', accent: 'text-amber-700 dark:text-amber-400' },
];

export default function CategoryGrid() {
  return (
    <section className="px-4 py-14 md:py-20 max-w-7xl mx-auto" id="categories">
      <div className="text-center mb-10 md:mb-14">
        <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">Pilihan</span>
        <h2 className="text-3xl md:text-[2.618rem] font-bold text-gray-900 dark:text-white mt-2">Kategori</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto text-sm md:text-base">
          Jelajahi koleksi kami berdasarkan kategori favorit Anda
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {categories.map((cat) => (
          <a
            key={cat.name}
            href={`#products`}
            className={`relative bg-gradient-to-br ${cat.color} rounded-2xl p-5 md:p-6 text-center border-2 border-transparent hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-amber-500/10 group overflow-hidden`}
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/[0.03] dark:group-hover:bg-amber-500/[0.06] transition-colors rounded-2xl" />

            {/* Icon */}
            <div className="relative mb-3 md:mb-4 flex justify-center">
              <cat.icon size={32} className={`${cat.accent} md:size-10 transition-transform group-hover:scale-110 duration-300`} />
            </div>

            {/* Category Name */}
            <span className="relative block text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
              {cat.name}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
