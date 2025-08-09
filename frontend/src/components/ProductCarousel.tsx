import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // 👈 Import icon
import ProductCard from './ProductCard';
import type { UIProduct } from '../types/UIProduct';
import '../scss/_product-section.scss';

interface ProductCarouselProps {
  title: string;
  products: UIProduct[];
  onBuy?: (id: string) => void;
  buttonLabel?: string;
}

const VISIBLE_COUNT = 5;

const ProductCarousel = ({
  title,
  products,
  onBuy,
  buttonLabel = 'Xem sản phẩm',
}: ProductCarouselProps) => {
  const [startIndex, setStartIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 3000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [products.length]);

  const visibleProducts = Array.from({ length: VISIBLE_COUNT }, (_, i) => {
    const index = (startIndex + i) % products.length;
    return products[index];
  });

  return (
    <section
      className="product-section carousel-mode"
      onMouseEnter={stopAutoSlide}
      onMouseLeave={startAutoSlide}
    >
      <h2 className="section-title">{title}</h2>
      <div className="carousel-wrapper">
        <button className="carousel-nav left" onClick={prevSlide}>
          <ChevronLeft size={20} />
        </button>

        <div className="carousel-track no-scrollbar">
          {visibleProducts.map((product) =>
            product ? (
              <div className="carousel-slide" key={product.id}>
                <ProductCard
                  {...product}
                  onBuy={() => onBuy?.(product.id)}
                  buttonLabel={buttonLabel}
                />
              </div>
            ) : null
          )}
        </div>

        <button className="carousel-nav right" onClick={nextSlide}>
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default ProductCarousel;
