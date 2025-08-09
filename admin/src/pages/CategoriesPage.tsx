import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/adminApi';
import { Category } from '../types';
import { Plus, Edit, Trash2, FolderOpen, Package } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Không thể xóa danh mục này vì còn ${productCount} sản phẩm`);
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Có lỗi xảy ra khi xóa danh mục');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData);
      } else {
        await createCategory(formData);
      }
      fetchCategories();
      handleModalClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setFormLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Quản lý danh mục</h2>
        <button 
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} className="me-2" />
          Thêm danh mục
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {categories.length === 0 ? (
            <div className="col-12">
              <div className="text-center py-5">
                <FolderOpen size={48} className="text-muted mb-3" />
                <h5 className="text-muted">Chưa có danh mục nào</h5>
                <p className="text-muted">Thêm danh mục đầu tiên để bắt đầu</p>
              </div>
            </div>
          ) : (
            categories.map(category => (
              <div key={category._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-start mb-3">
                      {category.image ? (
                        <img 
                          src={`http://localhost:5000/images/categories/${category.image}`}
                          alt={category.name}
                          className="category-image me-3"
                          onError={(e) => {
                            e.currentTarget.src = '/images/placeholder.jpg';
                          }}
                        />
                      ) : (
                        <div className="category-image bg-light d-flex align-items-center justify-content-center me-3">
                          <FolderOpen size={32} className="text-muted" />
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-2">{category.name}</h5>
                        <p className="card-text text-muted small mb-2">
                          {category.description || 'Không có mô tả'}
                        </p>
                        <div className="d-flex align-items-center text-muted small">
                          <Package size={14} className="me-1" />
                          {category.productCount || 0} sản phẩm
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(category)}
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(category._id, category.productCount || 0)}
                          title="Xóa"
                          disabled={(category.productCount || 0) > 0}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                </h5>
                <button type="button" className="btn-close" onClick={handleModalClose}></button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger">{error}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Tên danh mục *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="VD: Áo thể thao"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Mô tả về danh mục..."
                    />
                  </div>

                  <ImageUpload
                    type="categories"
                    currentImage={formData.image}
                    onImageChange={(filename) => setFormData(prev => ({ ...prev, image: filename }))}
                    label="Ảnh đại diện"
                  />
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
                      editingCategory ? 'Cập nhật' : 'Thêm mới'
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

export default CategoriesPage;
