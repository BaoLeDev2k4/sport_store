import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { uploadMultipleImages, deleteImage } from '../api/uploadApi';

interface MultipleImageUploadProps {
  type: 'products' | 'categories' | 'posts';
  currentImages: string[];
  onImagesChange: (filenames: string[]) => void;
  label?: string;
  maxImages?: number;
}

const MultipleImageUpload = ({ 
  type, 
  currentImages = [], 
  onImagesChange, 
  label = 'Ảnh',
  maxImages = 5
}: MultipleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total images limit
    if (currentImages.length + files.length > maxImages) {
      alert(`Chỉ được upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chỉ chọn file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Mỗi file ảnh không được vượt quá 5MB');
        return;
      }
    }

    try {
      setUploading(true);
      
      const response = await uploadMultipleImages(files, type);
      const uploadedFiles = response.data.files;
      
      const newFilenames = uploadedFiles.map((file: any) => file.filename);
      onImagesChange([...currentImages, ...newFilenames]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (filename: string, index: number) => {
    try {
      await deleteImage(filename, type);
      const newImages = currentImages.filter((_, i) => i !== index);
      onImagesChange(newImages);
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Lỗi khi xóa ảnh');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      
      <div className="border rounded p-3">
        <div className="row g-3">
          {/* Existing Images */}
          {currentImages.map((filename, index) => (
            <div key={index} className="col-6 col-md-4 col-lg-3">
              <div className="position-relative">
                <img 
                  src={`http://localhost:5000/images/${type}/${filename}`}
                  alt={`Image ${index + 1}`}
                  className="img-thumbnail w-100"
                  style={{ height: '120px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                  style={{ transform: 'translate(50%, -50%)' }}
                  onClick={() => handleRemoveImage(filename, index)}
                  disabled={uploading}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Image Button */}
          {currentImages.length < maxImages && (
            <div className="col-6 col-md-4 col-lg-3">
              <div 
                className="border-2 border-dashed rounded d-flex flex-column align-items-center justify-content-center text-muted cursor-pointer hover-bg-light"
                style={{ height: '120px', cursor: 'pointer' }}
                onClick={triggerFileInput}
              >
                <Plus size={24} className="mb-1" />
                <small>Thêm ảnh</small>
              </div>
            </div>
          )}
        </div>

        {currentImages.length === 0 && (
          <div 
            className="text-center py-4 border-2 border-dashed rounded cursor-pointer hover-bg-light"
            onClick={triggerFileInput}
            style={{ cursor: 'pointer' }}
          >
            <ImageIcon size={48} className="text-muted mb-2" />
            <div className="text-muted">
              <div>Nhấp để chọn ảnh</div>
              <small>Hỗ trợ: JPG, PNG, GIF, WEBP (tối đa 5MB mỗi file)</small>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
        />

        <div className="mt-3 d-flex justify-content-between align-items-center">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={triggerFileInput}
            disabled={uploading || currentImages.length >= maxImages}
          >
            <Upload size={16} className="me-1" />
            {uploading ? 'Đang upload...' : 'Thêm ảnh'}
          </button>
          
          <small className="text-muted">
            {currentImages.length}/{maxImages} ảnh
          </small>
        </div>

        {uploading && (
          <div className="mt-2">
            <div className="progress">
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated" 
                style={{ width: '100%' }}
              >
                Đang upload...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleImageUpload;
