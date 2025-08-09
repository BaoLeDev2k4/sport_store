import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/Product';
import type { Category } from '../types/Category';
import axios from 'axios';
import '../scss/_products-page.scss'; // ✅ giữ nguyên
import { FaArrowUp } from 'react-icons/fa'; // ✅ thêm icon nút cuộn lên

const ProductsPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false); // ✅ thêm state
  const navigate = useNavigate();

  useEffect(() => {
    axios.get<Category[]>('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const url = selectedCategory
      ? `http://localhost:5000/api/products?categoryId=${selectedCategory}`
      : 'http://localhost:5000/api/products';

    axios.get<Product[]>(url)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, [selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300); // hiện khi kéo xuống trên 300px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (id: string) => {
    navigate(`/products/${id}`);
  };

  return (
    <main className="products-main-content">
      <div className="products-container">
        <aside className="products-sidebar">
          <h3>Danh mục sản phẩm</h3>
          <ul className="category-list">
            {categories.map(category => (
              <li key={category._id} className={`category-item ${selectedCategory === category._id ? 'active' : ''}`}>
                <button onClick={() => setSelectedCategory(category._id)}>
                  {category.name}
                </button>
              </li>
            ))}
            <li className="category-item reset-filter">
              <button onClick={() => setSelectedCategory(null)}>Tất cả sản phẩm</button>
            </li>
          </ul>
        </aside>

        <section className="products-grid-area">
          <h2 className="current-filter-title">
            {selectedCategory ? categories.find(c => c._id === selectedCategory)?.name : 'Tất cả sản phẩm'}
          </h2>

          {products.length > 0 ? (
            <div className="product-list-grid">
              {products.map(product => {
                const firstVariant = product.variants?.[0];
                const image = firstVariant?.image ? `/images/products/${firstVariant.image}` : '/default.jpg';
                const price = firstVariant?.price || 0;

                return (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    imageUrl={image}
                    price={price}
                    status={product.status}
                    onBuy={() => handleView(product._id)}
                    buttonLabel="Xem sản phẩm"
                  />
                );
              })}
            </div>
          ) : (
            <p className="no-products-found">Không tìm thấy sản phẩm nào phù hợp</p>
          )}
        </section>
      </div>

      {/* ✅ Nút Scroll lên đầu trang */}
      {showScrollTop && (
        <button className="scroll-to-top-button" onClick={handleScrollToTop}>
          <FaArrowUp />
        </button>
      )}
    </main>
  );
};

export default ProductsPage;
