import { useCart } from '../context/CartContext';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchVouchers, validateVoucher } from '../api/couponApi';
import { createOrder } from '../api/orderApi';
import { createVNPayPayment } from '../api/paymentApi';
import type { Voucher } from '../types/Coupon';
import type { OrderPayload } from '../types/Order';
import '../scss/_checkout.scss';
import { FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user, token } = useContext(AuthContext);
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [note, setNote] = useState('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const navigate = useNavigate();
  const today = new Date();

  const total = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const discountedTotal = total - discount;

  useEffect(() => {
    fetchVouchers()
      .then((res) => setVouchers(res.data))
      .catch(() => setVouchers([]));

    // Kiểm tra voucher đã chọn từ VoucherPage
    const savedVoucher = localStorage.getItem('selectedVoucher');
    if (savedVoucher) {
      try {
        const voucher = JSON.parse(savedVoucher);
        setSelectedVoucher(voucher);
        setVoucherCode(voucher.code);
        setDiscount(voucher.discount);
        toast.success(`Đã áp dụng voucher ${voucher.code}!`);

        // Xóa voucher khỏi localStorage sau khi áp dụng
        localStorage.removeItem('selectedVoucher');
      } catch (error) {
        console.error('Error parsing saved voucher:', error);
        localStorage.removeItem('selectedVoucher');
      }
    }
  }, []);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã voucher.');
      return;
    }

    try {
      const response = await validateVoucher(voucherCode.toUpperCase(), total);
      const { voucher } = response.data;

      setSelectedVoucher(voucher);
      setDiscount(voucher.discount);
      setError('');
      toast.success('Áp dụng voucher thành công!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Mã voucher không hợp lệ.');
      setDiscount(0);
      setSelectedVoucher(null);
    }
  };

  const handleConfirmOrder = async () => {
    if (!user || !token) {
      toast.error('Vui lòng đăng nhập trước khi đặt hàng.');
      return;
    }

    const payload: OrderPayload = {
      id_voucher: selectedVoucher?._id || null,
      discount_amount: discount,
      total_amount: total,
      final_total: discountedTotal,
      total_payment: discountedTotal,
      address: user.address?.[0]?.address || '',
      phone: user.phone || '',
      name: user.username || '',
      note,
      payment_method: paymentMethod,
      cartItems: cart.map(item => ({
        id_product: item.product._id,
        variant_id: item.variant._id as string,
        name: item.product.name,
        size: item.selectedSize,
        color: item.selectedColor,
        unit_price: item.variant.price,
        price: item.variant.price * item.quantity,
        quantity: item.quantity,
      })),
    };

    try {
      if (paymentMethod === 'COD') {
        // COD: Tạo order ngay lập tức
        const orderResponse = await createOrder(payload, token);
        toast.success('Đặt hàng thành công!');
        clearCart();
        navigate('/profile/orders');
      } else if (paymentMethod === 'VNPAY') {
        // VNPay: Gửi thông tin đơn hàng trực tiếp đến VNPay API
        try {
          const paymentResponse = await createVNPayPayment(payload, token);
          if (paymentResponse.success && paymentResponse.payUrl) {
            toast.info('Đang chuyển hướng đến VNPay...');
            window.location.href = paymentResponse.payUrl;
          } else {
            toast.error('Không thể tạo liên kết thanh toán VNPay');
          }
        } catch (error) {
          toast.error('Lỗi khi tạo thanh toán VNPay');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Đặt hàng lỗi:', err.message);
      } else {
        console.error('Đặt hàng lỗi:', err);
      }
      toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="checkout-container">
      <h2>Trang Thanh Toán</h2>

      <div className="checkout-section">
        <h3>Thông tin người dùng</h3>
        {user ? (
          <ul className="user-info">
            <li><strong>Tên:</strong> {user.username}</li>
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Điện thoại:</strong> {user.phone}</li>
            <li><strong>Địa chỉ:</strong> {user.address?.[0]?.address || 'Chưa có địa chỉ'}</li>
          </ul>
        ) : (
          <p>Vui lòng đăng nhập để thanh toán.</p>
        )}
      </div>

      <div className="checkout-section">
        <h3>Đơn hàng</h3>
        <ul className="order-list">
          {cart.map((item, index) => (
            <li key={index}>
              {item.product.name} ({item.selectedColor} - {item.selectedSize}) × {item.quantity} ={' '}
              {(item.quantity * item.variant.price).toLocaleString()}₫
            </li>
          ))}
        </ul>
        <div className="total-amount">Tổng tiền: {total.toLocaleString()}₫</div>
      </div>

      <div className="checkout-section">
        <div className="coupon-row">
          <input
            type="text"
            placeholder="Nhập mã voucher"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
          />
          <div className="coupon-actions">
            <button onClick={handleApplyVoucher}>Áp dụng</button>
            <button className="voucher-store-button" onClick={() => navigate('/voucher')}>
              Kho voucher
            </button>
          </div>
        </div>

        {error && <div className="error-message">✖ {error}</div>}
        {discount > 0 && <div className="discount-applied">✓ Giảm giá: {discount.toLocaleString()}₫</div>}
      </div>

      {discount > 0 && (
        <p className="final-price">Tổng tiền sau giảm: {discountedTotal.toLocaleString()}₫</p>
      )}

      {/* ✅ Thêm phần ghi chú */}
      <div className="checkout-section">
        <h3>Ghi chú cho người bán</h3>
        <textarea
          placeholder="Ghi chú nếu có..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="note-textarea"
          rows={3}
        />
      </div>

      <div className="checkout-section">
        <h3>Chọn phương thức thanh toán</h3>
        <div className="payment-option">
          <input
            type="radio"
            id="cod"
            name="paymentMethod"
            value="COD"
            checked={paymentMethod === 'COD'}
            onChange={() => setPaymentMethod('COD')}
          />
          <label htmlFor="cod">
            <FaMoneyBillWave className="icon cod-icon" />
            Thanh toán khi nhận hàng (COD)
          </label>
        </div>

        <div className="payment-option">
          <input
            type="radio"
            id="vnpay"
            name="paymentMethod"
            value="VNPAY"
            checked={paymentMethod === 'VNPAY'}
            onChange={() => setPaymentMethod('VNPAY')}
          />
          <label htmlFor="vnpay">
            <FaCreditCard className="icon vnpay-icon" />
            Thanh toán qua VNPay
          </label>
        </div>
      </div>

      <button className="confirm-button" onClick={handleConfirmOrder}>
        Xác nhận đặt hàng
      </button>
    </div>
  );
};

export default CheckoutPage;
