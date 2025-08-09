import { useState, useEffect } from 'react';
import { getUsers, toggleUserStatus } from '../api/adminApi';
import { User } from '../types';
import { Search, Users as UsersIcon, Shield, Lock, Unlock, Eye } from 'lucide-react';
import UserDetailModal from '../components/UserDetailModal';
import LockAccountModal from '../components/LockAccountModal';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [lockingUser, setLockingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 10
      };

      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await getUsers(params);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
    setShowDetailModal(true);
  };

  const handleToggleStatus = async (user: User) => {
    if (user.isActive) {
      // Nếu đang mở khóa → hiện modal xác nhận khóa
      setLockingUser(user);
      setShowLockModal(true);
    } else {
      // Nếu đang khóa → mở khóa trực tiếp
      try {
        await toggleUserStatus(user._id, true);
        fetchUsers();
        alert('Mở khóa tài khoản thành công!');
      } catch (error: any) {
        console.error('Error unlocking user:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra');
      }
    }
  };

  const handleLockConfirm = async (lockReason: string) => {
    if (!lockingUser) return;

    try {
      await toggleUserStatus(lockingUser._id, false, lockReason);
      fetchUsers();
      alert('Khóa tài khoản thành công!');
    } catch (error: any) {
      console.error('Error locking user:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };



  const handleReset = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <span className="badge bg-danger">
        <Shield size={12} className="me-1" />
        Admin
      </span>
    ) : (
      <span className="badge bg-primary">
        <UsersIcon size={12} className="me-1" />
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Quản lý người dùng</h2>
        <div className="text-muted">
          Tìm thấy {users.length} người dùng
        </div>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả quyền</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Đã khóa</option>
          </select>
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Quyền</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        <UsersIcon size={48} className="mb-3 opacity-50" />
                        <div>Không có người dùng nào</div>
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              {user.avatar ? (
                                <img
                                  src={`http://localhost:5000/images/avatars/${user.avatar}`}
                                  alt={user.username}
                                  className="rounded-circle"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  onError={(e) => {
                                    // Fallback nếu ảnh lỗi
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('d-none');
                                  }}
                                />
                              ) : null}
                              <div className={`bg-primary rounded-circle d-flex align-items-center justify-content-center ${user.avatar ? 'd-none' : ''}`}
                                   style={{ width: '40px', height: '40px' }}>
                                <UsersIcon size={20} className="text-white" />
                              </div>
                            </div>
                            <div>
                              <div className="fw-medium">{user.username}</div>
                              <small className="text-muted">ID: {user._id.slice(-8)}</small>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user.isActive)}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleViewUser(user)}
                              title="Xem chi tiết"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className={`btn ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              onClick={() => handleToggleStatus(user)}
                              title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {user.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        user={viewingUser}
      />

      <LockAccountModal
        show={showLockModal}
        onClose={() => {
          setShowLockModal(false);
          setLockingUser(null);
        }}
        onConfirm={handleLockConfirm}
        user={lockingUser}
      />
    </div>
  );
};

export default UsersPage;