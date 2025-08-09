import React from 'react';
import ProductCard from './ProductCard';
import '../scss/_product-section.scss';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  rating?: number;
}

interface ProductSectionProps {
  title: string;
  products: Product[];
  columns?: number;
  isCompactCards?: boolean;
  onBuy?: (id: string) => void;
  buttonLabel?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  products,
  columns,
  isCompactCards = false,
  onBuy,
  buttonLabel = 'Thêm vào giỏ',
}) => {
  return (
    <section className="product-section">
      <h2 className="section-title">{title}</h2>
      <div className={`product-grid ${columns ? `grid-cols-${columns}` : ''}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            isCompact={isCompactCards}
            onBuy={() => onBuy?.(product.id)}
            buttonLabel={buttonLabel}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
