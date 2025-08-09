import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Banner from '../components/Banner';
import ProductSection from '../components/ProductSection';
import ProductCarousel from '../components/ProductCarousel'; // ✅ Thêm
import { fetchHotProducts, fetchLatestProducts, fetchRandomProducts } from '../api/productApi';
import type { Product } from '../types/Product';
import { FaArrowUp } from 'react-icons/fa';
import '../scss/_home.scss';

interface UIProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  rating?: number;
  status?: string;
}

const mapToUIProduct = (backendProduct: Product): UIProduct => {
  const firstVariant = backendProduct.variants?.[0] || {};
  return {
    id: backendProduct._id,
    name: backendProduct.name,
    imageUrl: firstVariant.image ? `/images/products/${firstVariant.image}` : '/default.jpg',
    price: firstVariant.price || 0,
    rating: undefined,
    status: backendProduct.status,
  };
};

const HomePage = () => {
  const [hotProducts, setHotProducts] = useState<UIProduct[]>([]);
  const [latestProducts, setLatestProducts] = useState<UIProduct[]>([]);
  const [randomProducts, setRandomProducts] = useState<UIProduct[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotProducts().then(res => {
      const data = (res.data as Product[]).map(mapToUIProduct);
      setHotProducts(data);
    });
    fetchLatestProducts().then(res => {
      const data = (res.data as Product[]).map(mapToUIProduct);
      setLatestProducts(data);
    });
    fetchRandomProducts().then(res => {
      const data = (res.data as Product[]).map(mapToUIProduct);
      setRandomProducts(data);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
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
    <>
      <Banner />
      <ProductSection
        title="Sản phẩm HOT trong tuần"
        products={hotProducts}
        onBuy={handleView}
        buttonLabel="Xem sản phẩm"
      />
      <hr className="section-divider" />
      <ProductSection
        title="Sản phẩm MỚI NHẤT"
        products={latestProducts}
        onBuy={handleView}
        buttonLabel="Xem sản phẩm"
      />
      <hr className="section-divider" />
      <ProductCarousel
        title="Có thể bạn quan tâm"
        products={randomProducts}
        onBuy={handleView}
        buttonLabel="Xem sản phẩm"
      />

      {showScrollTop && (
        <button className="scroll-to-top-button" onClick={handleScrollToTop}>
          <FaArrowUp />
        </button>
      )}
    </>
  );
};

export default HomePage;
