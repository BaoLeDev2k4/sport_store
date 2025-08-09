import { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../types/Product';
import '../scss/_productList.scss'; // SCSS cho product grid

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const keyword = searchParams.get('keyword') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Scroll to top khi có keyword mới
  useEffect(() => {
    if (location.pathname === '/search' && keyword.trim()) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, keyword]);

  // Fetch dữ liệu khi có keyword và đúng trang
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products/search?keyword=${keyword}`);
        setProducts(res.data as Product[]);
      } catch (err) {
        console.error('Lỗi tìm kiếm:', err);
      } finally {
        setLoading(false);
      }
    };

    if (location.pathname === '/search' && keyword.trim()) {
      fetchResults();
    }
  }, [keyword, location.pathname]);

  // Nếu không có keyword, không hiển thị gì
  if (!keyword.trim()) return null;

  return (
    <div className="product-list-container">
      <h2>Kết quả tìm kiếm cho: "{keyword}"</h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : products.length === 0 ? (
        <p>Không tìm thấy sản phẩm nào phù hợp.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <Link to={`/products/${p._id}`} key={p._id} className="product-card">
              <div className="image-wrapper">
                <img
                  src={
                    p.images?.[0]?.startsWith('http')
                      ? p.images[0]
                      : `/images/products/${p.images?.[0] || 'default.jpg'}`
                  }
                  alt={p.name}
                />
              </div>
              <h3>{p.name}</h3>
              <p className="product-price">{p.variants?.[0]?.price.toLocaleString()}đ</p>
              <button>Xem sản phẩm</button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
