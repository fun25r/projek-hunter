import { useState } from 'react';
import AgeGate from '../components/common/AgeGate';
import HeroCarousel from '../components/home/HeroCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import TabbedCollections from '../components/home/TabbedCollections';
import Recommendations from '../components/home/Recommendations';
import BrandLogos from '../components/home/BrandLogos';
import StoreInfo from '../components/home/StoreInfo';
import QuickView from '../components/product/QuickView';

export default function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <AgeGate>
      <HeroCarousel />
      <CategoryGrid />
      <TabbedCollections onQuickView={setQuickViewProduct} />
      <Recommendations onQuickView={setQuickViewProduct} />
      <BrandLogos />
      <StoreInfo />
      {quickViewProduct && (
        <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </AgeGate>
  );
}
