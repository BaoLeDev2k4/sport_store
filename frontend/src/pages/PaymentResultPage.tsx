import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);
  const { clearCart } = useCart();

  const status = searchParams.get('status') || 'failed'; // success, failed, error
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Chỉ chạy một lần duy nhất
    if (hasProcessed) return;

    const timer = setTimeout(() => {
      setLoading(false);
      setHasProcessed(true);

      if (status === 'success') {
        // Xóa giỏ hàng khi thanh toán thành công
        clearCart();
        toast.success('Thanh toán thành công!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error('Thanh toán thất bại!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [status, clearCart, hasProcessed]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#333'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px', fontWeight: '500' }}>
            Đang xử lý kết quả thanh toán...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '50px 40px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
        border: status === 'success'
          ? '3px solid #28a745'
          : '3px solid #dc3545'
      }}>

        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: status === 'success'
            ? '#28a745'
            : '#dc3545',
          marginBottom: '15px',
          lineHeight: '1.2'
        }}>
          {status === 'success'
            ? 'Thanh toán thành công!'
            : 'Thanh toán thất bại!'}
        </h1>

        {/* Message */}
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          {status === 'success'
            ? 'Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi. Đơn hàng của bạn đang được xử lý và sẽ được giao sớm nhất có thể.'
            : 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại thông tin thẻ và thử lại sau.'
          }
        </p>

        {/* Order ID */}
        {orderId && (
          <div style={{
            background: '#f8f9fa',
            border: '2px dashed #dee2e6',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              marginBottom: '5px',
              fontWeight: '500'
            }}>
              Mã đơn hàng
            </p>
            <p style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#333',
              fontFamily: 'monospace',
              letterSpacing: '1px'
            }}>
              #{orderId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {status === 'success' ? (
            // Thanh toán thành công - hiển thị nút xem đơn hàng
            <>
              <button
                onClick={() => navigate('/profile/orders')}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '150px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#0056b3';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#007bff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Xem đơn hàng
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #6c757d',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '150px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6c757d';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Về trang chủ
              </button>
            </>
          ) : (
            // Thanh toán thất bại - hiển thị nút thử lại
            <>
              <button
                onClick={() => navigate('/checkout')}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '150px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Thử lại
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '2px solid #6c757d',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '150px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#6c757d';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6c757d';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Về trang chủ
              </button>
            </>
          )}
        </div>


      </div>
    </div>
  );
};

export default PaymentResultPage;
