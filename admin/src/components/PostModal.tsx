import { useState, useEffect } from 'react';
import { createPost, updatePost } from '../api/adminApi';
import { Post } from '../types';
import { X, Save, FileText, Eye, EyeOff, Star } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface PostModalProps {
  post?: Post | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PostModal({ post, onClose, onSuccess }: PostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    imageSummary: '',
    status: 1,
    author: 'Admin',
    hot: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        summary: post.summary || '',
        imageSummary: post.imageSummary || '',
        status: post.status,
        author: post.author,
        hot: post.hot
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung bài viết');
      return;
    }

    try {
      setLoading(true);
      
      if (post) {
        await updatePost(post._id, formData);
        alert('Cập nhật bài viết thành công!');
      } else {
        await createPost(formData);
        alert('Tạo bài viết thành công!');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving post:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi lưu bài viết';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <FileText className="me-2" />
              {post ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Tiêu đề */}
                <div className="col-12">
                  <label className="form-label">Tiêu đề *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề bài viết"
                    required
                  />
                </div>

                {/* Tóm tắt */}
                <div className="col-12">
                  <label className="form-label">Tóm tắt</label>
                  <textarea
                    className="form-control"
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Nhập tóm tắt bài viết"
                  />
                </div>

                {/* Nội dung */}
                <div className="col-12">
                  <label className="form-label">Nội dung *</label>
                  <textarea
                    className="form-control"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={10}
                    placeholder="Nhập nội dung bài viết"
                    required
                  />
                </div>

                {/* Ảnh đại diện */}
                <div className="col-12">
                  <label className="form-label">Ảnh đại diện</label>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      name="imageSummary"
                      value={formData.imageSummary}
                      onChange={handleChange}
                      placeholder="Nhập URL ảnh từ trang web (ví dụ: https://example.com/image.jpg)"
                    />
                  </div>

                  <div className="text-center text-muted mb-3">
                    <small>HOẶC</small>
                  </div>

                  <ImageUpload
                    currentImage={formData.imageSummary && !formData.imageSummary.startsWith('http') ? formData.imageSummary : ''}
                    onImageChange={(filename) => setFormData(prev => ({ ...prev, imageSummary: filename }))}
                    type="posts"
                    label="Upload ảnh từ máy tính"
                  />

                  {formData.imageSummary && (
                    <div className="mt-3">
                      <label className="form-label">Preview:</label>
                      <div>
                        <img
                          src={formData.imageSummary.startsWith('http')
                            ? formData.imageSummary
                            : `/images/posts/${formData.imageSummary}`
                          }
                          alt="Preview"
                          className="img-thumbnail"
                          style={{ maxWidth: '300px', maxHeight: '200px' }}
                          onError={(e) => {
                            e.currentTarget.src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tác giả */}
                <div className="col-md-6">
                  <label className="form-label">Tác giả</label>
                  <input
                    type="text"
                    className="form-control"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Tên tác giả"
                  />
                </div>

                {/* Trạng thái */}
                <div className="col-md-3">
                  <label className="form-label">Trạng thái</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value={1}>
                      <Eye size={16} /> Hiển thị
                    </option>
                    <option value={0}>
                      <EyeOff size={16} /> Ẩn
                    </option>
                  </select>
                </div>

                {/* Hot */}
                <div className="col-md-3">
                  <label className="form-label">Bài viết nổi bật</label>
                  <select
                    className="form-select"
                    name="hot"
                    value={formData.hot}
                    onChange={handleChange}
                  >
                    <option value={0}>Bình thường</option>
                    <option value={1}>
                      <Star size={16} /> Hot
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                <X size={16} className="me-2" />
                Hủy
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    {post ? 'Cập nhật' : 'Tạo mới'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
