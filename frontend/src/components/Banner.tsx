import { useEffect, useState } from 'react';
import axios from 'axios';
import '../scss/_banner.scss';

interface BannerItem {
  _id: string;
  title: string;
  image: string;
  description: string;
}

const Banner = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get<BannerItem[]>('/api/banners');
        if (Array.isArray(res.data)) {
          setBanners(res.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải banner:', error);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsAnimating(true);
      const timeoutId = setTimeout(() => {
        setCurrentImageIndex((prevIndex) =>
          banners.length > 0 ? (prevIndex + 1) % banners.length : 0
        );
        setIsAnimating(false);
      }, 700);
      return () => clearTimeout(timeoutId);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [banners]);

  const handleDotClick = (index: number) => {
    if (index === currentImageIndex) return;
    setIsAnimating(true);
    const timeoutId = setTimeout(() => {
      setCurrentImageIndex(index);
      setIsAnimating(false);
    }, 700);
    return () => clearTimeout(timeoutId);
  };

  // const currentBanner = banners[currentImageIndex];

  return (
    <div className="banner">
      {banners.map((banner, index) => (
        <img
          key={banner._id}
          src={`http://localhost:5000/admin-images/banners/${banner.image}`}
          alt={banner.title}
          className={`banner-image ${index === currentImageIndex ? 'active' : ''} ${
            isAnimating && index === currentImageIndex ? 'exiting' : ''
          }`}
        />
      ))}

    {/* {currentBanner && (
        <div className="banner-content-overlay">
          <h2 className="banner-headline">{currentBanner.description}</h2>
          <button className="banner-cta">
            <a href="/products">Xem sản phẩm</a>
          </button>
        </div>
      )} */}

      <div className="banner-dots">
        {banners.map((_, index: number) => (
          <span
            key={index}
            className={`dot ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Banner;
