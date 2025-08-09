import { useParams, useNavigate } from 'react-router-dom'; // ✅ THÊM useNavigate
import { useState, useEffect } from 'react';
import { fetchProductById, fetchRandomProducts } from '../api/productApi';
import type { Product, Variant } from '../types/Product';
import '../scss/_product-detail-page.scss';
import { useCart } from '../context/CartContext';
import ProductCarousel from '../components/ProductCarousel';
import type { UIProduct } from '../types/UIProduct';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // ✅ THÊM useNavigate
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [quantityToBuy, setQuantityToBuy] = useState<string>('1');
  const [suggestedProducts, setSuggestedProducts] = useState<UIProduct[]>([]);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProductById(id)
        .then((res) => {
          const data = res.data;
          setProduct(data);
          setSelectedColor(data.colors?.[0] || '');
          setSelectedSize(data.sizes?.[0] || '');
          setMainImage(data.images?.[0] || '');
        })
        .catch((error) => {
          console.error('Error fetching product:', error);
          setProduct(null);
        });

      fetchRandomProducts().then((res) => {
        const products = res.data.map((item: Product) => ({
          id: item._id,
          name: item.name,
          imageUrl: `/images/products/${item.images?.[0] || ''}`,
          price: item.variants?.[0]?.price || 0,
        }));
        setSuggestedProducts(products);
      });
    }
  }, [id]);

  if (!product) {
    return (
      <div className="item-detail-container no-item-found">
        <h2>Sản phẩm không tìm thấy</h2>
        <p>Sản phẩm này có thể đã ngừng bán hoặc không còn tồn tại.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/products')}
        >
          Xem sản phẩm khác
        </button>
      </div>
    );
  }

  const currentVariant: Variant | undefined = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const maxQty = currentVariant?.quantity ?? 99;
  const qtyNumber = parseInt(quantityToBuy) || 1;

  const handleBuyClick = () => {
    if (!currentVariant) {
      alert('Vui lòng chọn màu và size hợp lệ!');
      return;
    }

    const existingItem = cart.find(
      (item) =>
        item.product._id === product._id &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    );

    const currentQtyInCart = existingItem?.quantity || 0;

    if (currentQtyInCart + qtyNumber > maxQty) {
      alert(
        `"${product.name}" (Màu: ${selectedColor}, Size: ${selectedSize}) chỉ còn tối đa ${maxQty} sản phẩm!\nBạn đã thêm ${currentQtyInCart} sản phẩm này vào giỏ hàng.`
      );
      return;
    }

    for (let i = 0; i < qtyNumber; i++) {
      addToCart(product, selectedColor, selectedSize, currentVariant);
    }

    alert(
`Đã thêm ${qtyNumber} sản phẩm "${product.name}" (${selectedColor}, ${selectedSize}) vào giỏ hàng!`
    );
  };

  return (
    <>
      <div className="item-detail-container">
        <div className="product-image">
          <img src={`/images/products/${mainImage}`} alt={product.name} />
          <div className="thumbnail-list">
            {product.images?.map((img, index) => (
              <div
                key={index}
                className={`thumbnail-item ${img === mainImage ? 'selected' : ''}`}
                onClick={() => setMainImage(img)}
              >
                <img src={`/images/products/${img}`} alt={`thumb-${index}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="item-detail-info">
          <h1>{product.name}</h1>

          {/* Hiển thị trạng thái sản phẩm */}
          {product.status === 'InActive' && (
            <div className="product-status-warning" style={{
              backgroundColor: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              color: '#cf1322'
            }}>
              <strong>Sản phẩm này hiện đã ngừng bán</strong>
            </div>
          )}

          <div className="price-group">
            <p className="item-price-detail">
              <span className="label">Giá sản phẩm:</span>
              <span className="value">
                {currentVariant ? currentVariant.price.toLocaleString('vi-VN') : '---'} VNĐ
              </span>
            </p>
          </div>

          <div className="size-select">
            <label>Chọn kích cỡ:</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              disabled={product.status === 'InActive'}
            >
              {product.sizes?.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="size-select">
            <label>Chọn màu sắc:</label>
            <select
              value={selectedColor}
              disabled={product.status === 'InActive'}
              onChange={(e) => {
                const newColor = e.target.value;
                setSelectedColor(newColor);
                const variant = product.variants.find(
                  (v) => v.color === newColor && v.size === selectedSize
                );
                if (variant) setMainImage(variant.image);
              }}
            >
              {product.colors?.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          <div className="quantity-row">
            <label>Số Lượng</label>
            <div className="quantity-controls">
              <button
                disabled={product.status === 'InActive'}
                onClick={() => {
                  const val = parseInt(quantityToBuy) || 1;
                  if (val > 1) setQuantityToBuy(String(val - 1));
                }}
              >
                −
              </button>
              <input
                type="number"
                value={quantityToBuy}
                min="1"
                max={maxQty}
                disabled={product.status === 'InActive'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setQuantityToBuy('');
} else if (/^\d+$/.test(val)) {
                    const num = parseInt(val);
                    if (num > maxQty) {
                      setQuantityToBuy(String(maxQty));
                    } else {
                      setQuantityToBuy(val);
                    }
                  }
                }}
                onBlur={(e) => {
                  const val = parseInt(e.target.value);
                  if (isNaN(val) || val < 1) {
                    setQuantityToBuy('1');
                  }
                }}
                className={qtyNumber > maxQty ? 'exceed' : ''}
              />
              <button
                disabled={product.status === 'InActive'}
                onClick={() => {
                  const val = parseInt(quantityToBuy) || 1;
                  if (val < maxQty) {
                    setQuantityToBuy(String(val + 1));
                  }
                }}
              >
                +
              </button>
            </div>
            <span className="stock-info">
              {product.status === 'InActive' ? 'Sản phẩm ngừng bán' : `${maxQty} sản phẩm có sẵn`}
            </span>
            {qtyNumber >= maxQty && product.status === 'Active' && (
              <p style={{ color: '#ff4d4f', marginTop: '6px' }}>
                Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này
              </p>
            )}
          </div>

          <p className="item-description-detail">
            <strong>Mô tả sản phẩm:</strong>{' '}
            {product.description || 'Chưa có mô tả chi tiết.'}
          </p>

          <button
            className="buy-item-button"
            onClick={product.status === 'Active' ? handleBuyClick : undefined}
            disabled={product.status === 'InActive'}
            style={{
              backgroundColor: product.status === 'InActive' ? '#d9d9d9' : '',
              cursor: product.status === 'InActive' ? 'not-allowed' : 'pointer',
              color: product.status === 'InActive' ? '#999' : ''
            }}
          >
            {product.status === 'InActive' ? 'Sản phẩm ngừng bán' : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>

      {/* GỢI Ý THÊM SẢN PHẨM */}
      <hr className="section-divider" />
      <ProductCarousel
        title="Có thể bạn quan tâm"
        products={suggestedProducts}
        buttonLabel="Xem sản phẩm"
        onBuy={(productId) => navigate(`/products/${productId}`)} // ✅ FIX
      />
    </>
  );
};

export default ProductDetailPage;