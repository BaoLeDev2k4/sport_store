import { useState, useRef } from 'react';
import { Upload, X, User as UserIcon } from 'lucide-react';
import { uploadAvatar } from '../api/authApi';

interface UploadResponse {
  filename?: string;
  data?: {
    filename?: string;
  };
}

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (filename: string) => void;
  token: string;
  disabled?: boolean;
}

const AvatarUpload = ({ 
  currentAvatar, 
  onAvatarChange, 
  token,
  disabled = false 
}: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentAvatar ? `http://localhost:5000/images/avatars/${currentAvatar}` : null
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

    // Validate file size (2MB for avatar)
    if (file.size > 2 * 1024 * 1024) {
      alert('File ảnh không được vượt quá 2MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const response = await uploadAvatar(file, token);
      const filename = (response as UploadResponse)?.filename || (response as UploadResponse)?.data?.filename;

      if (filename) {
        onAvatarChange(filename);
        // Update preview with server URL
        setPreview(`http://localhost:5000/images/avatars/${filename}`);
      } else {
        throw new Error('Không nhận được tên file từ server');
      }

    } catch (error) {
      console.error('Upload error:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alert((error as any)?.response?.data?.message || 'Lỗi khi upload ảnh');
      // Revert preview
      setPreview(currentAvatar ? `http://localhost:5000/images/avatars/${currentAvatar}` : null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreview(null);
    onAvatarChange('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="avatar-upload-container">
      <div className="avatar-preview" onClick={triggerFileInput}>
        {preview ? (
          <div className="avatar-image-container">
            <img 
              src={preview} 
              alt="Avatar" 
              className="avatar-image"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-avatar.png';
              }}
            />
            {!disabled && (
              <div className="avatar-overlay">
                <Upload size={20} />
                <span>Thay đổi</span>
              </div>
            )}
          </div>
        ) : (
          <div className="avatar-placeholder" style={{ cursor: disabled ? 'default' : 'pointer' }}>
            <UserIcon size={40} />
            {!disabled && (
              <div className="avatar-overlay">
                <Upload size={20} />
                <span>Thêm ảnh</span>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden-input"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading || disabled}
        style={{ display: 'none' }}
      />

      {!disabled && (
        <div className="avatar-actions">
          <button
            type="button"
            className="avatar-upload-btn"
            onClick={triggerFileInput}
            disabled={uploading}
          >
            <Upload size={16} />
            {uploading ? 'Đang upload...' : preview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
          </button>
          
          {preview && (
            <button
              type="button"
              className="avatar-remove-btn"
              onClick={handleRemoveAvatar}
              disabled={uploading}
            >
              <X size={16} />
              Xóa ảnh
            </button>
          )}
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span>Đang upload...</span>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
