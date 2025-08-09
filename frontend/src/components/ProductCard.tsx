import React from 'react';
import '../scss/_product-card.scss';

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  isCompact?: boolean;
  onBuy?: () => void;
  buttonLabel?: string; // ✅ thêm prop để tuỳ chỉnh nội dung nút
  status?: string; // ✅ thêm prop trạng thái sản phẩm
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  imageUrl,
  price,
  oldPrice,
  rating,
  isCompact = false,
  onBuy,
  buttonLabel = 'Thêm vào giỏ', // ✅ mặc định
  status = 'Active' // ✅ mặc định là Active
}) => {
  const productLink = `/products/${id}`;

  return (
    <div className={`product-card ${isCompact ? 'compact-mode' : ''}`}>
      <a href={productLink} className="product-link-overlay">
        <div className="product-image-wrapper">
          <img src={imageUrl} alt={name} className="product-image" />
          {oldPrice && (
            <span className="discount-badge">
              -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
            </span>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{name}</h3>

          {/* Hiển thị trạng thái ngừng bán */}
          {status === 'InActive' && (
            <div className="product-status-badge" style={{
              backgroundColor: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              color: '#cf1322',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              Ngừng bán
            </div>
          )}

          {rating !== undefined && (
            <div className="product-rating">
              {Array(5).fill(0).map((_, i) => (
                <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>
                  ★
                </span>
              ))}
            </div>
          )}
          <div className="product-prices">
            {oldPrice && <span className="old-price">{oldPrice.toLocaleString()}₫</span>}
            <span className="current-price">{price.toLocaleString()}₫</span>
          </div>
          {!isCompact && onBuy && (
            <button
              className="add-to-cart-button"
              onClick={(e) => {
                e.preventDefault();
                onBuy(); // ✅ Luôn cho phép click để xem sản phẩm
              }}
            >
              {status === 'InActive' ? 'Xem sản phẩm' : buttonLabel}
            </button>
          )}
        </div>
      </a>
    </div>
  );
};

export default ProductCard;
