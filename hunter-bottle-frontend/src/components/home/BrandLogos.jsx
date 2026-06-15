/**
 * BrandLogos.jsx — Horizontal brand ribbon section
 *
 * ASSET DEPLOYMENT GUIDE:
 * Place brand logo images in:  public/images/brands/
 * Example: public/images/brands/hennessy.png
 *
 * Access paths in code:
 *   Correct:       /images/brands/hennessy.png   (public folder — no hashing)
 *   Alternative:   import Logo from '../assets/brands/hennessy.png'
 *                  (src/assets — Vite will hash the filename for cache busting)
 *
 * RECOMMENDED for static brands: public/images/brands/
 * RECOMMENDED for app assets:    src/assets/
 *
 * This component uses public/ paths so images are served directly
 * without Vite transformation. Replace the placeholder divs with
 * actual <img> tags once brand logo files are placed.
 */

import { Wine, Grape, Beer, GlassWater } from 'lucide-react';

const brands = [
  { name: 'Hennessy', icon: Wine },
  { name: 'Moët & Chandon', icon: Grape },
  { name: 'Johnnie Walker', icon: Beer },
  { name: 'Dom Pérignon', icon: GlassWater },
  { name: 'Château Margaux', icon: Wine },
  { name: 'Jack Daniels', icon: Beer },
  { name: 'Grey Goose', icon: GlassWater },
  { name: 'Patrón', icon: Grape },
  { name: 'Patrón', icon: Grape },
];

export default function BrandLogos() {
  return (
    <section className="py-12 md:py-16 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-zi-400 dark:text-amber-500 uppercase tracking-[0.2em]">Brand Partners</span>
          <h3 className="text-lg font-bold text-zinc-500 dark:text-zinc-400 mt-1">Dipercaya oleh brand premium dunia</h3>
        </div>

        {/* Auto-scrolling ribbon */}
        <div className="relative overflow-hidden">
          <div className="flex gap-8 md:gap-12 animate-scroll">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={`${brand.name}-${i}`}
                className="flex flex-col items-center gap-3 flex-shrink-0 w-24 md:w-28 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 hover:border-amber-400/50 transition-colors">
                  <brand.icon size={30} className="text-amber-400 dark:text-amber-500" />
                </div>
                <span className="text-[10px] md:text-xs font-semibold text-zinc-400 dark:text-zinc-500 text-center leading-tight">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
