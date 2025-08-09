import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Eye, Package, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOrders, updateOrderStatus, OrderFilters } from '../api/orderApi';
import { Order } from '../types';
import OrderDetailModal from '../components/OrderDetailModal';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
    search: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders(filters);
      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof OrderFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value) // Reset to page 1 when changing filters
    }));
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as any);

      // Refresh orders list
      fetchOrders();

      // Nếu modal đang mở và đang xem order này, đóng modal để user mở lại xem dữ liệu mới
      if (showDetailModal && selectedOrderId === orderId) {
        handleCloseDetailModal();

        // Hiển thị thông báo thành công
        if (newStatus === 'Completed') {
          alert('✅ Đã cập nhật trạng thái đơn hàng thành "Hoàn thành". Trạng thái thanh toán COD đã được tự động cập nhật!');
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    }
  };

  const handleViewDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedOrderId(null);
    setShowDetailModal(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Render status options dựa trên payment method và current status
  const renderStatusOptions = (order: Order) => {
    const isVNPayPaid = order.payment_method === 'VNPAY' && order.payment_status === 'Completed';
    const currentStatus = order.order_status;

    // Nếu là VNPay đã thanh toán, không cho phép quay về Processing
    if (isVNPayPaid) {
      return (
        <>
          {currentStatus === 'Packaging' && <option value="Packaging">Đang đóng gói</option>}
          {(currentStatus === 'Packaging' || currentStatus === 'Shipping') && <option value="Shipping">Đang giao</option>}
          <option value="Completed">Hoàn thành</option>
          <option value="Cancelled">Đã hủy</option>
        </>
      );
    }

    // COD hoặc VNPay chưa thanh toán - cho phép tất cả options
    return (
      <>
        <option value="Processing">Đang xử lý</option>
        <option value="Packaging">Đang đóng gói</option>
        <option value="Shipping">Đang giao</option>
        <option value="Completed">Hoàn thành</option>
        <option value="Cancelled">Đã hủy</option>
      </>
    );
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

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Quản lý đơn hàng</h2>
        <div className="d-flex align-items-center gap-3">
          <div className="text-muted">
            Tổng: {pagination.total} đơn hàng
          </div>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="search-filter-container">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Processing">Đang xử lý</option>
              <option value="Packaging">Đang đóng gói</option>
              <option value="Shipping">Đang giao</option>
              <option value="Completed">Hoàn thành</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>
          <div className="col-md-2">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={() => setFilters({ search: '', status: '' })}
            >
              <Filter size={16} className="me-1" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <ShoppingCart size={48} className="mb-3 opacity-50" />
                      <div>Không có đơn hàng nào</div>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded d-flex align-items-center justify-content-center me-3"
                               style={{ width: '40px', height: '40px' }}>
                            <Package size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="fw-bold">{order.orderCode}</div>
                            <small className="text-muted">ID: {order._id.slice(-8)}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{order.name}</div>
                      </td>
                      <td>
                        <div className="small">
                          <div>{order.id_user?.email || 'N/A'}</div>
                          <div className="text-muted">{order.phone}</div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          {formatCurrency(order.total_payment)}
                        </span>
                      </td>
                      <td>{getStatusBadge(order.order_status)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            title="Xem chi tiết"
                            onClick={() => handleViewDetail(order._id)}
                          >
                            <Eye size={14} />
                          </button>
                          <select
                            className="form-select form-select-sm"
                            value={order.order_status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            style={{ width: 'auto' }}
                          >
                            {renderStatusOptions(order)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}
            trong tổng số {pagination.total} đơn hàng
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft size={16} />
                </button>
              </li>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handleFilterChange('page', page)}
                  >
                    {page}
                  </button>
                </li>
              ))}

              <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default OrdersPage;
