import { useState, useEffect } from 'react';
import { Package, User, MapPin, Phone, Mail, CreditCard, Tag, Image as ImageIcon } from 'lucide-react';
import { getOrderById } from '../api/orderApi';
import { Order } from '../types';

interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailModal = ({ orderId, isOpen, onClose, refreshTrigger }: OrderDetailModalProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { class: string; text: string } } = {
      'Processing': { class: 'bg-warning text-dark', text: 'Đang xử lý' },
      'Packaging': { class: 'bg-primary', text: 'Đang đóng gói' },
      'Shipping': { class: 'bg-info', text: 'Đang giao' },
      'Completed': { class: 'bg-success', text: 'Hoàn thành' },
      'Cancelled': { class: 'bg-danger', text: 'Đã hủy' }
    };
    
    const statusInfo = statusMap[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { class: string; text: string } } = {
      'Pending': { class: 'bg-warning text-dark', text: 'Chờ thanh toán' },
      'Completed': { class: 'bg-success', text: 'Đã thanh toán' }
    };
    
    const statusInfo = statusMap[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Chi tiết đơn hàng {order?.orderCode}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Đang tải thông tin đơn hàng...</p>
              </div>
            ) : order ? (
              <div className="row">
                {/* Thông tin đơn hàng */}
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <Package className="me-2" size={16} />
                        Thông tin đơn hàng
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Mã đơn hàng:</strong></div>
                        <div className="col-sm-8">
                          <code className="bg-light px-2 py-1 rounded">{order.orderCode}</code>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Trạng thái:</strong></div>
                        <div className="col-sm-8">{getStatusBadge(order.order_status)}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Thanh toán:</strong></div>
                        <div className="col-sm-8">{getPaymentStatusBadge(order.payment_status)}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Phương thức:</strong></div>
                                                  <div className="col-sm-8">
                            <span className={`badge ${order.payment_method === 'COD' ? 'bg-secondary' : 'bg-primary'}`}>
                              {order.payment_method === 'COD' ? 'COD - Thanh toán khi nhận hàng' : 'VNPay'}
                            </span>
                          </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Ngày tạo:</strong></div>
                        <div className="col-sm-8">{formatDate(order.createdAt)}</div>
                      </div>
                      {order.note && (
                        <div className="row mb-3">
                          <div className="col-sm-4"><strong>Ghi chú:</strong></div>
                          <div className="col-sm-8">
                            <div className="bg-light p-2 rounded">
                              {order.note}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thông tin khách hàng */}
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <User className="me-2" size={16} />
                        Thông tin khách hàng
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Tên:</strong></div>
                        <div className="col-sm-8">
                          <span className="fw-medium">{order.name}</span>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Email:</strong></div>
                        <div className="col-sm-8">
                          <Mail className="me-1" size={14} />
                          {order.id_user?.email || 'N/A'}
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Điện thoại:</strong></div>
                        <div className="col-sm-8">
                          <Phone className="me-1" size={14} />
                          {order.phone}
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-4"><strong>Địa chỉ:</strong></div>
                        <div className="col-sm-8">
                          <MapPin className="me-1" size={14} />
                          <div className="bg-light p-2 rounded mt-1">
                            {order.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sản phẩm với hình ảnh */}
                <div className="col-12 mt-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <Package className="me-2" size={16} />
                        Sản phẩm đã đặt ({order.products.length} sản phẩm)
                      </h6>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: '80px' }}>Hình ảnh</th>
                              <th>Sản phẩm</th>
                              <th>Phân loại</th>
                              <th>Đơn giá</th>
                              <th>Số lượng</th>
                              <th>Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.products.map((item) => (
                              <tr key={item._id}>
                                <td>
                                  <div className="d-flex justify-content-center">
                                    {typeof item.id_product === 'object' && item.id_product.images && item.id_product.images.length > 0 ? (
                                      <img 
                                        src={`/images/products/${item.id_product.images[0]}`}
                                        alt={item.name}
                                        className="img-fluid rounded"
                                        style={{ 
                                          width: '50px', 
                                          height: '50px', 
                                          objectFit: 'cover',
                                          border: '1px solid #dee2e6'
                                        }}
                                        onError={(e) => {
                                          // Fallback to placeholder if image doesn't exist
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove('d-none');
                                        }}
                                      />
                                    ) : (
                                      <img 
                                        src={`/images/products/${item.name.toLowerCase().replace(/\s+/g, '_')}_${item.color.toLowerCase()}.webp`}
                                        alt={item.name}
                                        className="img-fluid rounded"
                                        style={{ 
                                          width: '50px', 
                                          height: '50px', 
                                          objectFit: 'cover',
                                          border: '1px solid #dee2e6'
                                        }}
                                        onError={(e) => {
                                          // Fallback to placeholder if image doesn't exist
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove('d-none');
                                        }}
                                      />
                                    )}
                                    <div 
                                      className="bg-light rounded d-flex align-items-center justify-content-center d-none"
                                      style={{ width: '50px', height: '50px' }}
                                    >
                                      <ImageIcon size={20} className="text-muted" />
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="fw-medium">{item.name}</div>
                                </td>
                                <td>
                                  <div className="d-flex flex-column gap-1">
                                    <span className="badge bg-primary">
                                      Size: {item.size}
                                    </span>
                                    <span className="badge bg-info">
                                      Màu: {item.color}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="fw-medium text-primary">
                                    {formatCurrency(item.unit_price)}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-secondary fs-6">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-bold text-success">
                                    {formatCurrency(item.price)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tổng tiền */}
                <div className="col-12 mt-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <CreditCard className="me-2" size={16} />
                        Tổng kết đơn hàng
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 offset-md-6">
                          <div className="row mb-2">
                            <div className="col-6">Tổng tiền hàng:</div>
                            <div className="col-6 text-end fw-medium">{formatCurrency(order.total_amount)}</div>
                          </div>
                          {order.discount_amount > 0 && (
                            <>
                              <div className="row mb-2">
                                <div className="col-6">
                                  <Tag className="me-1" size={14} />
                                  Giảm giá:
                                </div>
                                <div className="col-6 text-end text-success fw-medium">
                                  -{formatCurrency(order.discount_amount)}
                                </div>
                              </div>
                              {order.id_voucher && (
                                <div className="row mb-2">
                                  <div className="col-6">Mã voucher:</div>
                                  <div className="col-6 text-end">
                                    <span className="badge bg-success fs-6">
                                      {order.id_voucher.code}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          <hr />
                          <div className="row">
                            <div className="col-6"><strong>Tổng thanh toán:</strong></div>
                            <div className="col-6 text-end">
                              <strong className="text-primary fs-4">
                                {formatCurrency(order.total_payment)}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                          ) : (
                <div className="text-center py-5">
                  <p>Không thể tải thông tin đơn hàng</p>
                </div>
              )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
