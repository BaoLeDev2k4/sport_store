import { useState, useEffect } from 'react';
import { createProduct, updateProduct, getImagesList } from '../api/adminApi';
import { Product, Category } from '../types';
import { X, Plus, Trash2, Package } from 'lucide-react';
import ImageUpload from './ImageUpload';

interface ProductModalProps {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const ProductModal = ({ product, categories, onClose, onSuccess }: ProductModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    idcate: '',
    description: '',
    status: 'Active',
    hot: 0,
    flag: true,
    colors: [] as string[],
    sizes: [] as string[],
    images: [] as string[],
    variants: [
      {
        option: '',
        size: '',
        color: '',
        price: 0,
        sale_price: 0,
        image: '',
        quantity: 0
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  // State riêng cho input text
  const [inputTexts, setInputTexts] = useState({
    colors: '',
    sizes: '',
    images: ''
  });

  // Load danh sách ảnh có sẵn
  useEffect(() => {
    const loadAvailableImages = async () => {
      try {
        const response = await getImagesList('products');
        setAvailableImages(response.data.images);
      } catch (error) {
        console.error('Error loading images list:', error);
      }
    };

    loadAvailableImages();
  }, []);

  useEffect(() => {
    if (product) {
      const colors = (product as any).colors || [];
      const sizes = (product as any).sizes || [];
      const images = (product as any).images || [];

      setFormData({
        name: product.name,
        idcate: typeof product.idcate === 'string' ? product.idcate : product.idcate._id,
        description: product.description || '',
        status: product.status,
        hot: product.hot || 0,
        flag: (product as any).flag !== undefined ? (product as any).flag : true,
        colors,
        sizes,
        images,
        variants: product.variants.length > 0 ? product.variants.map(v => ({
          option: v.option,
          size: v.size,
          color: v.color,
          price: v.price,
          sale_price: v.sale_price || 0,
          image: v.image,
          quantity: v.quantity || 0
        })) : [
          {
            option: '',
            size: '',
            color: '',
            price: 0,
            sale_price: 0,
            image: '',
            quantity: 0
          }
        ]
      });

      // Cập nhật input texts
      setInputTexts({
        colors: colors.join(', '),
        sizes: sizes.join(', '),
        images: images.join(', ')
      });
    } else {
      // Reset form khi không có product (thêm mới)
      setFormData({
        name: '',
        idcate: '',
        description: '',
        status: 'Active',
        hot: 0,
        flag: true,
        colors: [],
        sizes: [],
        images: [],
        variants: [
          {
            option: '',
            size: '',
            color: '',
            price: 0,
            sale_price: 0,
            image: '',
            quantity: 0
          }
        ]
      });

      setInputTexts({
        colors: '',
        sizes: '',
        images: ''
      });
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hot' ? Number(value) : value
    }));
  };

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => {
        if (i === index) {
          const updatedVariant = { ...variant, [field]: value };

          // Auto-generate option field when size or color changes
          if (field === 'size' || field === 'color') {
            const size = field === 'size' ? value : variant.size;
            const color = field === 'color' ? value : variant.color;
            if (size && color) {
              updatedVariant.option = `${size} - ${color}`;
            }
          }

          return updatedVariant;
        }
        return variant;
      })
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        option: '',
        size: '',
        color: '',
        price: 0,
        sale_price: 0,
        image: '',
        quantity: 0
      }]
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }));
    }
  };

  const generateVariants = () => {
    if (formData.colors.length === 0 || formData.sizes.length === 0) {
      alert('Vui lòng nhập màu sắc và kích thước trước khi tạo biến thể');
      return;
    }

    // Nếu đang chỉnh sửa và đã có variants, hỏi xác nhận
    if (product && formData.variants.length > 0) {
      const confirmReplace = window.confirm(
        'Bạn có muốn thay thế tất cả biến thể hiện tại bằng biến thể mới được tạo từ màu sắc và kích thước không?\n\n' +
        'Lưu ý: Điều này sẽ xóa tất cả thông tin giá và số lượng hiện tại.'
      );
      if (!confirmReplace) {
        return;
      }
    }

    const newVariants = [];
    for (const size of formData.sizes) {
      for (const color of formData.colors) {
        // Tìm variant cũ có cùng size và color để giữ lại giá và số lượng
        const existingVariant = formData.variants.find(v => v.size === size && v.color === color);

        newVariants.push({
          option: `${size} - ${color}`,
          size: size,
          color: color,
          price: existingVariant?.price || 0,
          sale_price: existingVariant?.sale_price || 0,
          image: existingVariant?.image || formData.images[0] || '',
          quantity: existingVariant?.quantity || 0
        });
      }
    }

    setFormData(prev => ({
      ...prev,
      variants: newVariants
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Tên sản phẩm không được để trống');
        return;
      }
      if (!formData.idcate) {
        setError('Vui lòng chọn danh mục');
        return;
      }
      if (formData.variants.length === 0) {
        setError('Phải có ít nhất một biến thể sản phẩm');
        return;
      }

      // Validate variants
      for (let i = 0; i < formData.variants.length; i++) {
        const variant = formData.variants[i];
        if (!variant.option.trim()) {
          setError(`Biến thể ${i + 1}: Tùy chọn không được để trống`);
          return;
        }
        if (!variant.size.trim()) {
          setError(`Biến thể ${i + 1}: Size không được để trống`);
          return;
        }
        if (!variant.color.trim()) {
          setError(`Biến thể ${i + 1}: Màu sắc không được để trống`);
          return;
        }
        if (!variant.price || variant.price <= 0) {
          setError(`Biến thể ${i + 1}: Giá phải lớn hơn 0`);
          return;
        }
        if (!variant.image.trim()) {
          setError(`Biến thể ${i + 1}: Ảnh không được để trống`);
          return;
        }
      }

      if (product) {
        await updateProduct(product._id, formData);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await createProduct(formData);
        alert('Tạo sản phẩm mới thành công!');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable" style={{ maxHeight: '90vh' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              {/* Thông tin cơ bản */}
              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Thông tin cơ bản</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Tên sản phẩm *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="VD: Áo thun thể thao Nike"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Danh mục *</label>
                      <select
                        className="form-select"
                        name="idcate"
                        value={formData.idcate}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Trạng thái</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Active">🟢 Đang bán</option>
                        <option value="InActive">⚫ Ngừng bán</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Sản phẩm Hot</label>
                      <select
                        className="form-select"
                        name="hot"
                        value={formData.hot}
                        onChange={handleInputChange}
                      >
                        <option value={0}>⭐ Sản phẩm thường</option>
                        <option value={1}>🔥 Sản phẩm Hot</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Hiển thị</label>
                      <select
                        className="form-select"
                        name="flag"
                        value={formData.flag.toString()}
                        onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value === 'true' }))}
                      >
                        <option value="true">✅ Hiển thị</option>
                        <option value="false">❌ Ẩn</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Màu sắc có sẵn</label>
                      <input
                        type="text"
                        className="form-control"
                        value={inputTexts.colors}
                        onChange={(e) => {
                          setInputTexts(prev => ({ ...prev, colors: e.target.value }));
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            colors: value.split(',').map(c => c.trim()).filter(c => c)
                          }));
                        }}
                        placeholder="VD: Đỏ, Xanh, Vàng"
                      />
                      <div className="form-text">Phân cách bằng dấu phẩy</div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Size có sẵn</label>
                      <input
                        type="text"
                        className="form-control"
                        value={inputTexts.sizes}
                        onChange={(e) => {
                          setInputTexts(prev => ({ ...prev, sizes: e.target.value }));
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            sizes: value.split(',').map(s => s.trim()).filter(s => s)
                          }));
                        }}
                        placeholder="VD: S, M, L, XL"
                      />
                      <div className="form-text">Phân cách bằng dấu phẩy</div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Ảnh chính</label>
                      <input
                        type="text"
                        className="form-control mb-2"
                        value={inputTexts.images}
                        onChange={(e) => {
                          setInputTexts(prev => ({ ...prev, images: e.target.value }));
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            images: value.split(',').map(i => i.trim()).filter(i => i)
                          }));
                        }}
                        placeholder="VD: image1.jpg, image2.jpg"
                      />
                      <div className="form-text mb-2">Phân cách bằng dấu phẩy</div>

                      {availableImages.length > 0 && (
                        <div>
                          <label className="form-label">Hoặc chọn từ ảnh có sẵn:</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              if (e.target.value) {
                                const currentImages = inputTexts.images ? inputTexts.images.split(',').map(s => s.trim()) : [];
                                if (!currentImages.includes(e.target.value)) {
                                  const newImages = [...currentImages, e.target.value].join(', ');
                                  setInputTexts(prev => ({ ...prev, images: newImages }));
                                  setFormData(prev => ({
                                    ...prev,
                                    images: newImages.split(',').map(i => i.trim()).filter(i => i)
                                  }));
                                }
                                e.target.value = ''; // Reset dropdown
                              }
                            }}
                          >
                            <option value="">Chọn ảnh để thêm</option>
                            {availableImages.map((image, idx) => (
                              <option key={idx} value={image}>{image}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Mô tả sản phẩm</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Mô tả chi tiết về sản phẩm..."
                    />
                  </div>
                </div>
              </div>

              {/* Biến thể sản phẩm */}
              <div className="card">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Biến thể sản phẩm</h6>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={generateVariants}
                      title="Tự động tạo biến thể từ màu sắc và kích thước"
                    >
                      <Package size={16} className="me-1" />
                      Tạo tự động
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={addVariant}
                    >
                      <Plus size={16} className="me-1" />
                      Thêm biến thể
                    </button>
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa tất cả biến thể?')) {
                            setFormData(prev => ({
                              ...prev,
                              variants: [{
                                option: '',
                                size: '',
                                color: '',
                                price: 0,
                                sale_price: 0,
                                image: '',
                                quantity: 0
                              }]
                            }));
                          }
                        }}
                        title="Xóa tất cả biến thể"
                      >
                        <Trash2 size={16} className="me-1" />
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-body">

                {formData.variants.map((variant, index) => (
                  <div key={index} className="card mb-3 border-start border-primary border-3">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                      <h6 className="mb-0 text-primary">
                        Biến thể {index + 1}
                      </h6>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeVariant(index)}
                          title="Xóa biến thể"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="card-body">
                      {/* Thông tin variant */}
                      <div className="row mb-3">
                        <div className="col-md-6 mb-2">
                          <label className="form-label">
                            Tùy chọn <small className="text-muted">(Tự động tạo từ Size - Màu)</small>
                          </label>
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={variant.option}
                            readOnly
                            placeholder="Sẽ tự động tạo khi nhập Size và Màu"
                          />
                        </div>
                        <div className="col-md-3 mb-2">
                          <label className="form-label">
                            Size
                          </label>
                          {formData.sizes.length > 0 ? (
                            <select
                              className="form-control"
                              value={variant.size}
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                            >
                              <option value="">Chọn size</option>
                              {formData.sizes.map((size, idx) => (
                                <option key={idx} value={size}>{size}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              value={variant.size}
                              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                              placeholder="S, M, L, XL"
                            />
                          )}
                        </div>
                        <div className="col-md-3 mb-2">
                          <label className="form-label">
                            Màu sắc
                          </label>
                          {formData.colors.length > 0 ? (
                            <select
                              className="form-control"
                              value={variant.color}
                              onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                            >
                              <option value="">Chọn màu</option>
                              {formData.colors.map((color, idx) => (
                                <option key={idx} value={color}>{color}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              value={variant.color}
                              onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                              placeholder="Đỏ, Xanh, Vàng"
                            />
                          )}
                        </div>
                      </div>

                      {/* Giá và số lượng */}
                      <div className="row mb-3">
                        <div className="col-md-4 mb-2">
                          <label className="form-label">
                            Giá bán *
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                              required
                              min="0"
                              placeholder="0"
                            />
                            <span className="input-group-text">VNĐ</span>
                          </div>
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label">
                            Giá khuyến mãi
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              value={variant.sale_price}
                              onChange={(e) => handleVariantChange(index, 'sale_price', Number(e.target.value))}
                              min="0"
                              placeholder="0"
                            />
                            <span className="input-group-text">VNĐ</span>
                          </div>
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label">
                            Số lượng
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={variant.quantity}
                            onChange={(e) => handleVariantChange(index, 'quantity', Number(e.target.value))}
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Ảnh sản phẩm */}
                      <div className="row">
                        <div className="col-md-6">
                          <label className="form-label">Chọn ảnh từ thư mục server</label>
                          {availableImages.length > 0 ? (
                            <select
                              className="form-control"
                              value={variant.image}
                              onChange={(e) => handleVariantChange(index, 'image', e.target.value)}
                            >
                              <option value="">Chọn ảnh có sẵn</option>
                              {availableImages.map((image, idx) => (
                                <option key={idx} value={image}>{image}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              value={variant.image}
                              onChange={(e) => handleVariantChange(index, 'image', e.target.value)}
                              placeholder="Tên file ảnh"
                            />
                          )}
                          {variant.image && (
                            <div className="mt-2">
                              <img
                                src={`http://localhost:5000/images/products/${variant.image}`}
                                alt="Preview"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                className="border rounded"
                              />
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <ImageUpload
                            type="products"
                            currentImage={variant.image}
                            onImageChange={(filename) => handleVariantChange(index, 'image', filename)}
                            label="Hoặc upload ảnh mới"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                <X size={16} className="me-2" />
                Hủy bỏ
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    {product ? (
                      <>
                        Cập nhật sản phẩm
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="me-2" />
                        Thêm sản phẩm mới
                      </>
                    )}
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

export default ProductModal;
