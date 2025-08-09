import { useState, useEffect } from 'react';
import { getProducts, deleteProduct, getCategories } from '../api/adminApi';
import { Product, Category } from '../types';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Star,
  Package
} from 'lucide-react';
import ProductModal from '../components/ProductModal';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    hot: '',
    flag: '' // ✅ Thêm filter cho hiển thị/ẩn
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters, pagination.current]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 10,
        ...filters,
        hot: filters.hot === 'true' ? true : undefined
      };

      const response = await getProducts(params);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
        alert('Xóa sản phẩm thành công!');
      } catch (error: any) {
        console.error('Error deleting product:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa sản phẩm';
        alert(errorMessage);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleModalSuccess = () => {
    fetchProducts();
    handleModalClose();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { class: string; text: string } } = {
      'Active': { class: 'bg-success', text: 'Đang bán' },
      'InActive': { class: 'bg-secondary', text: 'Ngừng bán' }
    };
    const statusInfo = statusMap[status] || { class: 'bg-secondary', text: `Không xác định (${status})` };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getFlagBadge = (flag: boolean) => {
    return flag ? (
      <span className="badge bg-success">✅ Hiển thị</span>
    ) : (
      <span className="badge bg-danger">❌ Ẩn</span>
    );
  };



  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Quản lý sản phẩm</h2>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} className="me-2" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="search-filter-container">
        <div className="row g-2 align-items-center">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Danh mục</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Trạng thái</option>
              <option value="Active">Đang bán</option>
              <option value="InActive">Ngừng bán</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.hot}
              onChange={(e) => handleFilterChange('hot', e.target.value)}
            >
              <option value="">Hot</option>
              <option value="true">🔥 Hot</option>
              <option value="false">⭐ Thường</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.flag}
              onChange={(e) => handleFilterChange('flag', e.target.value)}
            >
              <option value="">Hiển thị</option>
              <option value="true">✅ Hiển thị</option>
              <option value="false">❌ Ẩn</option>
            </select>
          </div>
          <div className="col-md-1">
            <button
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => {
                setFilters({ search: '', category: '', status: '', hot: '', flag: '' });
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              title="Reset tất cả filter"
            >
              <Filter size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
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
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Hot</th>
                    <th>Trạng thái</th>
                    <th>Hiển thị</th>
                    <th>Lượt xem</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5 text-muted">
                        <Package size={48} className="mb-3 opacity-50" />
                        <div>Không có sản phẩm nào</div>
                      </td>
                    </tr>
                  ) : (
                    products.map(product => {
                      const firstVariant = product.variants[0];
                      // const image = firstVariant?.image ? `/images/products/${firstVariant.image}` : '/default.jpg';
                      const categoryName = product.idcate && typeof product.idcate === 'object'
                        ? product.idcate.name
                        : product.idcate
                          ? categories.find(cat => cat._id === product.idcate)?.name || 'Không tìm thấy danh mục'
                          : 'Chưa phân loại';
                      
                      return (
                        <tr key={product._id}>
                          <td>
                            {firstVariant?.image ? (
                              <img
                                src={`http://localhost:5000/images/products/${firstVariant.image}`}
                                alt={product.name}
                                className="product-image"
                                onError={(e) => {
                                  e.currentTarget.src = 'http://localhost:5000/images/placeholder.jpg';
                                }}
                              />
                            ) : (
                              <div className="product-image bg-light d-flex align-items-center justify-content-center">
                                <Package size={24} className="text-muted" />
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="fw-medium">{product.name}</div>
                            <small className="text-muted">
                              {product.variants.length} biến thể
                            </small>
                          </td>
                          <td>{categoryName}</td>
                          <td>
                            {firstVariant ? formatPrice(firstVariant.price) : 'N/A'}
                          </td>
                          <td>
                            {product.hot > 0 ? (
                              <Star size={16} className="text-warning" fill="currentColor" />
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{getStatusBadge(product.status)}</td>
                          <td>{getFlagBadge(product.flag)}</td>
                          <td>
                            <span className="badge bg-info">{product.view || 0}</span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(product)}
                                title="Chỉnh sửa"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(product._id)}
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
              <li key={page} className={`page-item ${page === pagination.current ? 'active' : ''}`}>
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

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default ProductsPage;
