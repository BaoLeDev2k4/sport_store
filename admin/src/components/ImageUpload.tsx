import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadSingleImage, deleteImage } from '../api/uploadApi';

interface ImageUploadProps {
  type: 'products' | 'categories' | 'posts';
  currentImage?: string;
  onImageChange: (filename: string) => void;
  label?: string;
  required?: boolean;
}

const ImageUpload = ({ 
  type, 
  currentImage, 
  onImageChange, 
  label = 'Ảnh',
  required = false 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImage ? `http://localhost:5000/images/${type}/${currentImage}` : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const response = await uploadSingleImage(file, type);
      const { filename } = response.data;
      
      onImageChange(filename);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Lỗi khi upload ảnh');
      setPreview(currentImage ? `http://localhost:5000/images/${type}/${currentImage}` : null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImage) return;

    try {
      await deleteImage(currentImage, type);
      setPreview(null);
      onImageChange('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      
      <div className="border rounded p-3">
        {preview ? (
          <div className="position-relative d-inline-block">
            <img 
              src={preview} 
              alt="Preview" 
              className="img-thumbnail"
              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.jpg';
              }}
            />
            <button
              type="button"
              className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
              style={{ transform: 'translate(50%, -50%)' }}
              onClick={handleRemoveImage}
              disabled={uploading}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div 
            className="text-center py-4 border-2 border-dashed rounded cursor-pointer hover-bg-light"
            onClick={triggerFileInput}
            style={{ cursor: 'pointer' }}
          >
            <ImageIcon size={48} className="text-muted mb-2" />
            <div className="text-muted">
              <div>Nhấp để chọn ảnh</div>
              <small>Hỗ trợ: JPG, PNG, GIF, WEBP (tối đa 5MB)</small>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        <div className="mt-3">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm me-2"
            onClick={triggerFileInput}
            disabled={uploading}
          >
            <Upload size={16} className="me-1" />
            {uploading ? 'Đang upload...' : preview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
          </button>
          
          {preview && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleRemoveImage}
              disabled={uploading}
            >
              <X size={16} className="me-1" />
              Xóa ảnh
            </button>
          )}
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

export default ImageUpload;
