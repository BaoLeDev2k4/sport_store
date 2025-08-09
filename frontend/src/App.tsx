import { useState, useEffect } from 'react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AccountLockedModal from './components/AccountLockedModal';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import VoucherPage from './pages/VoucherPage';
import UserOrdersPage from './pages/UserOrdersPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import SearchResultsPage from './pages/SearchResultsPage'; // ✅ THÊM
import PaymentResultPage from './pages/PaymentResultPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // ✅ THÊM
import ResetPasswordPage from './pages/ResetPasswordPage'; // ✅ THÊM

import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import About from "./pages/About";
import ContactPage from './pages/ContactPage';
import PostList from "./components/PostList";
import PostDetail from "./components/PostDetail";
const App = () => {
  const [showAccountLockedModal, setShowAccountLockedModal] = useState(false);
  const [lockedMessage, setLockedMessage] = useState('');

  useEffect(() => {
    const handleAccountLocked = (event: any) => {
      // Tránh hiển thị modal trùng lặp
      if (!showAccountLockedModal) {
        setLockedMessage(event.detail.message);
        setShowAccountLockedModal(true);
      }
    };

    window.addEventListener('accountLocked', handleAccountLocked);

    return () => {
      window.removeEventListener('accountLocked', handleAccountLocked);
    };
  }, [showAccountLockedModal]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      <main className="flex-grow bg-gray-50 p-8">
        <div className="container mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/orders" element={<UserOrdersPage />} />
            <Route path="/profile/change-password" element={<ChangePasswordPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/voucher" element={<VoucherPage />} />
            <Route path="/news" element={<PostList />} />
            <Route path="/posts/:slug" element={<PostDetail />} />
            <Route path="/about" element={<About/>} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/search" element={<SearchResultsPage />} /> {/* ✅ THÊM MỚI */}
            <Route path="/payment/result" element={<PaymentResultPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* ✅ THÊM */}
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* ✅ THÊM */}

            <Route path="/news" element={
              <div>
                <h1>Trang Tin tức</h1>
                <p>Nội dung đang cập nhật...</p>
              </div>
            } />

          </Routes>
        </div>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Account Locked Modal */}
      <AccountLockedModal
        show={showAccountLockedModal}
        message={lockedMessage}
        onClose={() => {
          setShowAccountLockedModal(false);
          setLockedMessage(''); // Reset message khi đóng modal
        }}
      />
    </div>
  );
};

export default App;
