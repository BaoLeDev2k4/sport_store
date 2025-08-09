import { useState, useEffect } from 'react';
import { User } from '../types';
import { User as UserIcon, Mail, Phone, Shield, MapPin, Calendar, ShoppingCart, DollarSign, Award } from 'lucide-react';
import { getUserStats } from '../api/adminApi';

interface UserDetailModalProps {
  show: boolean;
  onClose: () => void;
  user: User | null;
}

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  completedOrders: number;
  completedSpent: number;
  loyaltyPoints: number;
}

interface RecentOrder {
  _id: string;
  name: string;
  total_payment: number;
  order_status: string;
  createdAt: string;
}

const UserDetailModal = ({ show, onClose, user }: UserDetailModalProps) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && user) {
      fetchUserStats();
    }
  }, [show, user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await getUserStats(user._id);
      setUserStats(response.data.stats);
      setRecentOrders(response.data.recentOrders || []);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <span className="badge bg-danger">
        <Shield size={12} className="me-1" />
        Admin
      </span>
    ) : (
      <span className="badge bg-primary">
        <UserIcon size={12} className="me-1" />
        User
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="badge bg-success">Hoạt động</span>
    ) : (
      <span className="badge bg-secondary">Đã khóa</span>
    );
  };

  const getOrderStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { class: string; text: string } } = {
      'Processing': { class: 'bg-warning', text: 'Chờ xử lý' },
      'Shipping': { class: 'bg-info', text: 'Đang giao' },
      'Completed': { class: 'bg-success', text: 'Hoàn thành' },
      'Cancelled': { class: 'bg-danger', text: 'Đã hủy' }
    };

    const statusInfo = statusMap[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  // Tạo avatar gradient dựa trên username
  const generateAvatarGradient = (username: string) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Chi tiết người dùng</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* User Avatar & Basic Info */}
            <div className="row mb-4">
              <div className="col-md-3 text-center">
                {user.avatar ? (
                  <div className="position-relative mb-3">
                    <img
                      src={`http://localhost:5000/images/avatars/${user.avatar}`}
                      alt={user.username}
                      className="rounded-circle border-3 border-primary"
                      style={{
                        width: '140px',
                        height: '140px',
                        objectFit: 'cover',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        // Fallback nếu ảnh lỗi
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.querySelector('.avatar-fallback')?.classList.remove('d-none');
                      }}
                    />
                    <div className="position-absolute top-0 end-0">
                      {getStatusBadge(user.isActive)}
                    </div>
                  </div>
                ) : null}

                {/* Fallback avatar cho trường hợp không có avatar hoặc lỗi */}
                <div className={`position-relative mb-3 ${user.avatar ? 'avatar-fallback d-none' : ''}`}>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto border-3 border-primary"
                    style={{
                      width: '140px',
                      height: '140px',
                      background: generateAvatarGradient(user.username),
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                    <UserIcon size={48} className="text-white" />
                  </div>
                  <div className="position-absolute top-0 end-0">
                    {getStatusBadge(user.isActive)}
                  </div>
                </div>
                <h5 className="mb-2 fw-bold">{user.username}</h5>
                <div className="mb-2">{getRoleBadge(user.role)}</div>
                
                {/* Thông tin cơ bản */}
                <div className="text-start mt-3">
                  <div className="d-flex align-items-center mb-2">
                    <Mail size={16} className="me-2 text-muted" />
                    <small className="text-muted">{user.email}</small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <Phone size={16} className="me-2 text-muted" />
                    <small className="text-muted">{user.phone}</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <Calendar size={16} className="me-2 text-muted" />
                    <small className="text-muted">Tham gia: {formatDate(user.createdAt)}</small>
                  </div>
                </div>
              </div>
              
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Email</label>
                    <div className="d-flex align-items-center">
                      <Mail size={16} className="me-2 text-muted" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Số điện thoại</label>
                    <div className="d-flex align-items-center">
                      <Phone size={16} className="me-2 text-muted" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Ngày tạo</label>
                    <div className="d-flex align-items-center">
                      <Calendar size={16} className="me-2 text-muted" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Cập nhật lần cuối</label>
                    <div className="d-flex align-items-center">
                      <Calendar size={16} className="me-2 text-muted" />
                      <span>{formatDate(user.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label className="form-label text-muted">ID người dùng</label>
                    <div className="bg-light p-2 rounded">
                      <code>{user._id}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {user.address && user.address.length > 0 && (
              <div className="mb-4">
                <h6 className="mb-3">
                  <MapPin size={16} className="me-2" />
                  Địa chỉ ({user.address.length})
                </h6>
                <div className="row">
                  {user.address.map((addr, index) => (
                    <div key={addr._id || index} className="col-md-6 mb-3">
                      <div className="card border">
                        <div className="card-body">
                          {addr.default && (
                            <span className="badge bg-success mb-2">Mặc định</span>
                          )}
                          {addr.name && (
                            <div className="mb-1">
                              <strong>Tên:</strong> {addr.name}
                            </div>
                          )}
                          {addr.phone && (
                            <div className="mb-1">
                              <strong>SĐT:</strong> {addr.phone}
                            </div>
                          )}
                          {addr.company && (
                            <div className="mb-1">
                              <strong>Công ty:</strong> {addr.company}
                            </div>
                          )}
                          <div className="mb-1">
                            <strong>Địa chỉ:</strong> {addr.address}
                          </div>
                          {(addr.ward || addr.district || addr.city) && (
                            <div className="mb-1">
                              <strong>Khu vực:</strong> {[addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                            </div>
                          )}
                          {addr.zip && (
                            <div className="mb-1">
                              <strong>Mã bưu điện:</strong> {addr.zip}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="row">
              <div className="col-md-4">
                <div className="card bg-light border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <ShoppingCart size={20} className="text-primary me-2" />
                      <h6 className="card-title mb-0">Tổng đơn hàng</h6>
                    </div>
                    {loading ? (
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-primary mb-1">{userStats?.totalOrders || 0}</h4>
                        <small className="text-muted">
                          {userStats?.completedOrders || 0} đã hoàn thành
                        </small>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <DollarSign size={20} className="text-success me-2" />
                      <h6 className="card-title mb-0">Tổng chi tiêu</h6>
                    </div>
                    {loading ? (
                      <div className="spinner-border spinner-border-sm text-success" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-success mb-1">
                          {formatCurrency(userStats?.totalSpent || 0)}
                        </h4>
                        <small className="text-muted">
                          {formatCurrency(userStats?.completedSpent || 0)} đã thanh toán
                        </small>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <Award size={20} className="text-warning me-2" />
                      <h6 className="card-title mb-0">Điểm tích lũy</h6>
                    </div>
                    {loading ? (
                      <div className="spinner-border spinner-border-sm text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-warning mb-1">{userStats?.loyaltyPoints || 0}</h4>
                        <small className="text-muted">
                          1 điểm = 10.000 VND
                        </small>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

                        {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <div className="mt-4">
                <h6 className="mb-3">
                  <ShoppingCart size={16} className="me-2" />
                  Đơn hàng gần đây ({recentOrders.length})
                </h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Tên đơn hàng</th>
                        <th>Giá trị</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <code className="text-muted">#{order._id.slice(-6)}</code>
                          </td>
                          <td>{order.name}</td>
                          <td className="fw-bold text-success">
                            {formatCurrency(order.total_payment)}
                          </td>
                          <td>
                            {getOrderStatusBadge(order.order_status)}
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(order.createdAt)}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

export default UserDetailModal;
