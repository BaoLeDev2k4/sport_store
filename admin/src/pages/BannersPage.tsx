import { useState, useEffect } from 'react';
import { getBanners, deleteBanner } from '../api/bannerApi';
import { Banner } from '../types';
import BannerModal from '../components/BannerModal';
import '../styles/banners.scss';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';

const BannersPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await getBanners({
        page: currentPage,
        limit: 10,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined
      });
      
      setBanners(response.data.banners);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [currentPage, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBanners();
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        await deleteBanner(id);
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Có lỗi xảy ra khi xóa banner');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingBanner(null);
    fetchBanners();
  };

  const getStatusBadge = (status: string) => {
    return status === 'Active' ? (
      <span className="badge bg-success">
        <Eye size={12} className="me-1" />
        Hiển thị
      </span>
    ) : (
      <span className="badge bg-secondary">
        <EyeOff size={12} className="me-1" />
        Ẩn
      </span>
    );
  };

  return (
    <div className="banners-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Banner</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} className="me-2" />
          Thêm Banner
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Active">Hiển thị</option>
                <option value="InActive">Ẩn</option>
              </select>
            </div>
            <div className="col-md-3">
              <button type="submit" className="btn btn-outline-primary w-100">
                <Filter size={16} className="me-2" />
                Lọc
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Banners List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-4">
              <ImageIcon size={48} className="text-muted mb-3" />
              <p className="text-muted">Không có banner nào</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tiêu đề</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr key={banner._id}>
                        <td>
                          <img
                            src={`http://localhost:5000/admin-images/banners/${banner.image}`}
                            alt={banner.title}
                            className="banner-thumbnail"
                          />
                        </td>
                        <td>
                          <strong>{banner.title}</strong>
                        </td>
                        <td>
                          <span className="text-muted">
                            {banner.description.length > 50 
                              ? `${banner.description.substring(0, 50)}...` 
                              : banner.description}
                          </span>
                        </td>
                        <td>{getStatusBadge(banner.status)}</td>
                        <td>
                          {new Date(banner.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(banner)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(banner._id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <BannerModal
          banner={editingBanner}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default BannersPage;
