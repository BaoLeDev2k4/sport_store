import { useState, useEffect } from 'react';
import { createBanner, updateBanner } from '../api/bannerApi';
import { uploadSingleImage } from '../api/uploadApi';
import { Banner } from '../types';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface BannerModalProps {
  banner?: Banner | null;
  onClose: () => void;
}

const BannerModal = ({ banner, onClose }: BannerModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    description: '',
    status: 'Active' as 'Active' | 'InActive'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        image: banner.image,
        description: banner.description,
        status: banner.status
      });
      setImagePreview(`http://localhost:5000/admin-images/banners/${banner.image}`);
    }
  }, [banner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) {
      return formData.image; // Return existing image if no new file
    }

    setUploading(true);
    try {
      const response = await uploadSingleImage(imageFile, 'banners');
      return response.data.filename;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Lỗi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề banner');
      return;
    }

    if (!formData.image && !imageFile) {
      alert('Vui lòng chọn ảnh banner');
      return;
    }

    setLoading(true);
    try {
      // Upload image if new file selected
      const imageName = await uploadImage();
      
      const bannerData = {
        ...formData,
        image: imageName
      };

      if (banner) {
        await updateBanner(banner._id, bannerData);
      } else {
        await createBanner(bannerData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Có lỗi xảy ra khi lưu banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {banner ? 'Sửa Banner' : 'Thêm Banner Mới'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label">
                      Tiêu đề <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Nhập tiêu đề banner"
                      required
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
                      placeholder="Nhập mô tả banner"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Trạng thái</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Hiển thị</option>
                      <option value="InActive">Ẩn</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">
                      Ảnh Banner <span className="text-danger">*</span>
                    </label>
                    <div className="image-upload-area">
                      {imagePreview ? (
                        <div className="image-preview">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-fluid rounded"
                          />
                          <div className="image-overlay">
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              onClick={() => {
                                setImagePreview('');
                                setImageFile(null);
                                setFormData(prev => ({ ...prev, image: '' }));
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <ImageIcon size={48} className="text-muted mb-2" />
                          <p className="text-muted mb-0">Chọn ảnh banner</p>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        className="form-control mt-2"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      
                      {uploading && (
                        <div className="text-center mt-2">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Uploading...</span>
                          </div>
                          <small className="text-muted d-block">Đang upload...</small>
                        </div>
                      )}
                    </div>
                  </div>
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
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || uploading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="me-2" />
                    {banner ? 'Cập nhật' : 'Tạo mới'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;
