import { useEffect, useState, useContext } from 'react';
import { getUserOrders, cancelOrder } from '../api/orderApi';
import { AuthContext } from '../context/AuthContext';
import '../scss/_orders.scss';
import { toast } from 'react-toastify';
import { FaClock, FaShippingFast, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import type { Order, OrderDetail } from '../types/Order';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Processing':
      return (
        <span className="status-badge processing">
          <FaClock /> Đang xử lý
        </span>
      );
    case 'Packaging':
      return (
        <span className="status-badge packaging">
          📦 Đang đóng gói
        </span>
      );
    case 'Shipping':
      return (
        <span className="status-badge shipping">
          <FaShippingFast /> Đang giao
        </span>
      );
    case 'Completed':
      return (
        <span className="status-badge completed">
          <FaCheckCircle /> Hoàn thành
        </span>
      );
    case 'Cancelled':
      return (
        <span className="status-badge canceled">
          <FaTimesCircle /> Đã huỷ
        </span>
      );
    default:
      return <span className="status-badge">{status}</span>;
  }
};

const convertPaymentStatus = (status: string) => {
  switch (status) {
    case 'Pending': return 'Chờ xác nhận';
    case 'Paid': return 'Đã thanh toán';
    case 'Completed': return 'Đã thanh toán';
    default: return status;
  }
};

const convertPaymentMethod = (method: string) => {
  switch (method) {
    case 'COD': return 'COD - Thanh toán khi nhận hàng';
    case 'VNPAY': return 'VNPay';
    default: return method;
  }
};

const UserOrdersPage = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    getUserOrders(token)
      .then((res) => setOrders(res))
      .catch(() => toast.error('Không thể tải đơn hàng.'));
  }, [token]);

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const handleCancel = async (id: string) => {
    if (!token) return;

    const confirm = window.confirm('Bạn có chắc chắn muốn huỷ đơn hàng này?');
    if (!confirm) return;

    try {
      await cancelOrder(id, token);
      toast.success('Đơn hàng đã được huỷ.');
      const updated = await getUserOrders(token);
      setOrders(updated);
    } catch (err) {
      toast.error('Huỷ đơn hàng thất bại.');
      console.error(err);
    }
  };

  return (
    <div className="profile-container">
      <h2>Đơn hàng đã mua</h2>
      {orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order._id} className="order-item">
              <div className="order-summary" onClick={() => toggleExpand(order._id)}>
                <span><strong>Mã đơn:</strong> {order._id}</span>
                <span><strong>Trạng thái:</strong> {getStatusBadge(order.order_status)}</span>
                <span><strong>Ngày:</strong> {new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              {expandedOrderId === order._id && (
                <div className="order-details">
                  <p><strong>Tên:</strong> {order.name}</p>
                  <p><strong>Địa chỉ:</strong> {order.address}</p>
                  <p><strong>Điện thoại:</strong> {order.phone}</p>
                  <p><strong>Thanh toán:</strong> {convertPaymentMethod(order.payment_method)} - {convertPaymentStatus(order.payment_status)}</p>
                  <p><strong>Giảm giá:</strong> {order.discount_amount.toLocaleString()}₫</p>
                  <p><strong>Tổng tiền:</strong> {order.total_payment.toLocaleString()}₫</p>
                  <p><strong>Ghi chú:</strong> {order.note?.trim() || 'Không có ghi chú'}</p>
                  <div className="products-list">
                    {order.products.map((p: OrderDetail, index: number) => (
                      <div key={index} className="product-item">
                        <div className="product-image">
                          {typeof p.id_product === 'object' && p.id_product.images && p.id_product.images.length > 0 ? (
                            <img
                              src={`/images/products/${p.id_product.images[0]}`}
                              alt={p.name}
                              className="product-img"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) {
                                  placeholder.classList.remove('d-none');
                                }
                              }}
                            />
                          ) : (
                            <img
                              src={`/images/products/${p.name.toLowerCase().replace(/\s+/g, '_')}_${p.color.toLowerCase()}.webp`}
                              alt={p.name}
                              className="product-img"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) {
                                  placeholder.classList.remove('d-none');
                                }
                              }}
                            />
                          )}
                          <div className="product-placeholder d-none">
                            📦
                          </div>
                        </div>
                        <div className="product-info">
                          <span className="product-name">{p.name}</span>
                          <span className="product-variant">({p.color} - {p.size})</span>
                          <span className="product-quantity">× {p.quantity}</span>
                          <span className="product-price">{p.price.toLocaleString()}₫</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {order.order_status === 'Processing' && (
                    <div className="cancel-button-wrapper">
                      <button className="cancel-button" onClick={() => handleCancel(order._id)}>
                        Huỷ đơn hàng
                      </button>
                    </div>
                  )}
                  {order.order_status === 'Packaging' && (
                    <div className="info-message">
                      <p style={{ color: '#8b5cf6', fontWeight: '500', fontSize: '14px', marginTop: '10px' }}>
                        📦 Đơn hàng đã thanh toán và đang được đóng gói. Không thể hủy.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrdersPage;
