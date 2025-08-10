import { useEffect, useState, useContext } from 'react';
import { fetchVouchers, validateVoucher, type Voucher } from '../api/couponApi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../scss/_voucher.scss';

const VoucherPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [error, setError] = useState('');
  const [applyingVoucher, setApplyingVoucher] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cart } = useCart();

  useEffect(() => {
    fetchVouchers()
      .then((res) => setVouchers(res.data))
      .catch(() => setError('Không thể tải dữ liệu voucher. Vui lòng thử lại sau.'));
  }, []);

  const handleApplyVoucher = async (voucherCode: string) => {
    // Kiểm tra đăng nhập
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng voucher.');
      navigate('/auth');
      return;
    }

    // Kiểm tra giỏ hàng
    if (!cart || cart.length === 0) {
      toast.error('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi áp dụng voucher.');
      navigate('/products');
      return;
    }

    // Tính tổng giá trị đơn hàng
    const orderAmount = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

    setApplyingVoucher(voucherCode);

    try {
      const response = await validateVoucher(voucherCode, orderAmount);
      const { voucher } = (response as any).data;

      // Lưu voucher vào localStorage để sử dụng trong checkout
      localStorage.setItem('selectedVoucher', JSON.stringify(voucher));

      toast.success(`Áp dụng voucher ${voucherCode} thành công! Giảm ${voucher.discount.toLocaleString()}₫`);

      // Chuyển đến trang checkout
      navigate('/checkout');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Voucher không hợp lệ hoặc đã hết hạn.');
    } finally {
      setApplyingVoucher(null);
    }
  };

  return (
    <div className="voucher-page">
      <h2>Kho Voucher</h2>

      {error && <div className="voucher-error">{error}</div>}

      <div className="voucher-list">
        {vouchers.map((v, idx) => (
          <div key={idx} className="voucher-card">
            <div className="voucher-code">
              <span className="voucher-icon">🏷️</span>
              <span className="voucher-label">Mã:</span>
              <span className="voucher-value">{v.code}</span>
            </div>
            <p>{v.description}</p>
            <div className="voucher-info">
              <span><strong>Giảm:</strong> {v.discount.toLocaleString()}₫</span>
              <span><strong>HSD:</strong> {new Date(v.end_date).toLocaleDateString()}</span>
              <span><strong>Số lượng:</strong> {v.quantity}</span>
              {v.min_order_amount && v.min_order_amount > 0 && (
                <span className="min-order-condition">
                  <strong>Điều kiện:</strong> Đơn hàng từ {v.min_order_amount.toLocaleString()}₫
                </span>
              )}
              <span
                className={
                  v.canUse ? 'voucher-status active' :
                  v.isExpired ? 'voucher-status expired' :
                  v.isOutOfStock ? 'voucher-status out-of-stock' :
                  v.isNotStarted ? 'voucher-status not-started' :
                  'voucher-status inactive'
                }
              >
                <strong>Trạng thái:</strong>{' '}
                {v.canUse ? 'Có thể sử dụng' :
                 v.isExpired ? 'Đã hết hạn' :
                 v.isOutOfStock ? 'Hết số lượng' :
                 v.isNotStarted ? 'Chưa bắt đầu' :
                 'Không hoạt động'}
              </span>
            </div>

            {/* Nút áp dụng voucher */}
            <div className="voucher-actions">
              <button
                className={`apply-voucher-btn ${!v.canUse ? 'disabled' : ''}`}
                onClick={() => handleApplyVoucher(v.code)}
                disabled={!v.canUse || applyingVoucher === v.code}
              >
                {applyingVoucher === v.code ? 'Đang áp dụng...' :
                 !v.canUse ? 'Không thể sử dụng' : 'Áp dụng'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherPage;
