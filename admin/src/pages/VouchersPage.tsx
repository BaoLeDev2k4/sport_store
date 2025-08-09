import { useState, useEffect } from 'react';
import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from '../api/voucherApi';
import { Voucher } from '../types';
import { Plus, Search, Filter, Edit, Trash2, Ticket, Calendar, DollarSign } from 'lucide-react';

const VouchersPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [formData, setFormData] = useState<{
    code: string;
    discount: number;
    start_date: string;
    end_date: string;
    quantity: number;
    description: string;
    status: 'Active' | 'InActive' | 'Expired' | 'out_of_stock';
  }>({
    code: '',
    discount: 0,
    start_date: '',
    end_date: '',
    quantity: 0,
    description: '',
    status: 'Active'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVouchers();
  }, [filters, pagination.current]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 10,
        ...filters
      };
      
      const response = await getVouchers(params);
      setVouchers(response.data.vouchers);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      discount: voucher.discount,
      start_date: voucher.start_date.split('T')[0],
      end_date: voucher.end_date.split('T')[0],
      quantity: voucher.quantity,
      description: voucher.description,
      status: voucher.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      try {
        await deleteVoucher(id);
        fetchVouchers();
      } catch (error) {
        console.error('Error deleting voucher:', error);
        alert('Có lỗi xảy ra khi xóa voucher');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingVoucher) {
        await updateVoucher(editingVoucher._id, formData);
      } else {
        await createVoucher(formData);
      }
      fetchVouchers();
      handleModalClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingVoucher(null);
    setFormData({
      code: '',
      discount: 0,
      start_date: '',
      end_date: '',
      quantity: 0,
      description: '',
      status: 'Active'
    });
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discount' || name === 'quantity' ? Number(value) : value
    }));
  };

  const getStatusBadge = (voucher: Voucher) => {
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);

    // Kiểm tra status từ database trước
    if (voucher.status === 'Expired') {
      return <span className="badge bg-danger">Hết hạn</span>;
    }
    if (voucher.status === 'InActive') {
      return <span className="badge bg-secondary">Không hoạt động</span>;
    }
    if (voucher.status === 'out_of_stock') {
      return <span className="badge bg-warning text-dark">Hết số lượng</span>;
    }

    // Kiểm tra logic thời gian và số lượng
    if (now > endDate) {
      return <span className="badge bg-danger">Hết hạn</span>;
    }
    if (voucher.quantity <= 0) {
      return <span className="badge bg-warning text-dark">Hết số lượng</span>;
    }
    if (now < startDate) {
      return <span className="badge bg-info">Sắp diễn ra</span>;
    }
    return <span className="badge bg-success">Hoạt động</span>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Quản lý Voucher</h2>
        <button 
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} className="me-2" />
          Thêm voucher
        </button>
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
                placeholder="Tìm kiếm theo mã voucher hoặc mô tả..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="InActive">Không hoạt động</option>
              <option value="Expired">Hết hạn</option>
              <option value="out_of_stock">Hết số lượng</option>
            </select>
          </div>
          <div className="col-md-2">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setFilters({ search: '', status: '' });
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
            >
              <Filter size={16} className="me-1" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
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
                    <th>Mã voucher</th>
                    <th>Giảm giá</th>
                    <th>Số lượng</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Mô tả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        <Ticket size={48} className="mb-3 opacity-50" />
                        <div>Không có voucher nào</div>
                      </td>
                    </tr>
                  ) : (
                    vouchers.map(voucher => (
                      <tr key={voucher._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary rounded d-flex align-items-center justify-content-center me-3"
                                 style={{ width: '40px', height: '40px' }}>
                              <Ticket size={20} className="text-white" />
                            </div>
                            <div>
                              <div className="fw-bold">{voucher.code}</div>
                              <small className="text-muted">
                                Tạo: {formatDate(voucher.createdAt)}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <DollarSign size={16} className="text-success me-1" />
                            <span className="fw-bold text-success">
                              {formatCurrency(voucher.discount)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info">{voucher.quantity}</span>
                        </td>
                        <td>
                          <div className="small">
                            <div className="d-flex align-items-center mb-1">
                              <Calendar size={12} className="me-1" />
                              {formatDate(voucher.start_date)}
                            </div>
                            <div className="d-flex align-items-center text-muted">
                              <Calendar size={12} className="me-1" />
                              {formatDate(voucher.end_date)}
                            </div>
                          </div>
                        </td>
                        <td>{getStatusBadge(voucher)}</td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {voucher.description || 'Không có mô tả'}
                          </div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(voucher)}
                              title="Chỉnh sửa"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(voucher._id)}
                              title="Xóa"
                            >
                              <Trash2 size={14} />
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link"
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
              >
                Trước
              </button>
            </li>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <li key={page} className={`page-item ${pagination.current === page ? 'active' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                >
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
              <button 
                className="page-link"
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
              >
                Sau
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingVoucher ? 'Chỉnh sửa voucher' : 'Thêm voucher mới'}
                </h5>
                <button type="button" className="btn-close" onClick={handleModalClose}></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Mã voucher *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        placeholder="VD: SALE20"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Giảm giá (VNĐ) *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        required
                        min="0"
                        placeholder="50000"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ngày bắt đầu *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ngày kết thúc *</label>
                      <input
                        type="date"
                        className="form-control"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Số lượng *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        min="0"
                        placeholder="100"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Trạng thái</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Active">Hoạt động</option>
                        <option value="InActive">Không hoạt động</option>
                        <option value="Expired">Hết hạn</option>
                        <option value="out_of_stock">Hết số lượng</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Mô tả về voucher..."
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleModalClose}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      editingVoucher ? 'Cập nhật' : 'Thêm mới'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VouchersPage;
