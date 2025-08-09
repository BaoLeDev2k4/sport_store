# Sport Store Admin Dashboard

Admin Dashboard cho hệ thống quản lý cửa hàng thể thao Sport Store.

## Tính năng

### 1. Dashboard Tổng quan
- Thống kê doanh thu theo tháng, quý, năm
- Biểu đồ doanh thu 12 tháng gần nhất
- Top 10 sản phẩm bán chạy nhất
- Tổng số sản phẩm, danh mục, người dùng, đơn hàng, voucher

### 2. Quản lý Sản phẩm
- Danh sách sản phẩm với phân trang
- Thêm/sửa/xóa sản phẩm
- Quản lý variants (size, color, price, quantity)
- **Upload ảnh sản phẩm từ thiết bị**
- Lọc theo danh mục, trạng thái, sản phẩm hot
- Tìm kiếm theo tên sản phẩm

### 3. Quản lý Danh mục
- Danh sách danh mục với số lượng sản phẩm
- Thêm/sửa/xóa danh mục
- **Upload ảnh danh mục từ thiết bị**
- Hiển thị dạng grid với ảnh đại diện

### 4. Quản lý Người dùng
- Danh sách người dùng với phân trang
- Khóa/mở khóa tài khoản
- Thay đổi quyền (user/admin)
- Lọc theo quyền và trạng thái
- Tìm kiếm theo tên, email, số điện thoại

### 5. Quản lý Đơn hàng
- Danh sách đơn hàng (đang phát triển)
- Cập nhật trạng thái đơn hàng
- Xem chi tiết đơn hàng
- Lọc theo trạng thái

### 6. Quản lý Voucher
- Danh sách voucher với trạng thái tự động
- Thêm/sửa/xóa voucher
- Tự động cập nhật trạng thái (hết hạn, hết số lượng)
- Lọc theo trạng thái

## Công nghệ sử dụng

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Bootstrap 5.3.6
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Styling**: SCSS

## Cài đặt và chạy

1. Cài đặt dependencies:
```bash
cd admin
npm install
```

2. Chạy development server:
```bash
npm run dev
```

3. Truy cập: http://localhost:3001

## Đăng nhập Admin

Để truy cập admin dashboard, cần:
1. Tài khoản có role = 'admin'
2. Tài khoản phải active (isActive = true)

## Cấu trúc thư mục

```
admin/src/
├── api/              # API services
├── components/       # React components
├── context/          # Context providers
├── pages/           # Page components
├── styles/          # SCSS styles
├── types/           # TypeScript types
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## API Endpoints

### Admin APIs
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/products` - Products list
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/categories` - Categories list
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category
- `GET /api/admin/users` - Users list
- `PUT /api/admin/users/:id/status` - Toggle user status
- `PUT /api/admin/users/:id/role` - Update user role

### Voucher APIs
- `GET /api/vouchers` - Vouchers list
- `POST /api/vouchers` - Create voucher
- `PUT /api/vouchers/:id` - Update voucher
- `DELETE /api/vouchers/:id` - Delete voucher
- `GET /api/vouchers/validate/:code` - Validate voucher

## Tính năng Upload Ảnh

### Đặc điểm:
- **Hỗ trợ định dạng**: JPG, JPEG, PNG, GIF, WEBP
- **Kích thước tối đa**: 5MB mỗi file
- **Giữ nguyên chất lượng**: Không nén/resize ảnh
- **Preview real-time**: Xem trước ảnh ngay khi chọn
- **Xóa ảnh**: Xóa ảnh cũ khi upload ảnh mới

### Cách sử dụng:
1. **Sản phẩm**: Mỗi variant có thể có 1 ảnh riêng
2. **Danh mục**: Mỗi danh mục có 1 ảnh đại diện
3. **Drag & Drop**: Kéo thả file vào vùng upload
4. **Click to upload**: Nhấp vào vùng upload để chọn file

## Tính năng đang phát triển

- [ ] Quản lý đơn hàng hoàn chỉnh
- [x] Upload ảnh sản phẩm ✅
- [ ] Xuất báo cáo Excel/PDF
- [ ] Thông báo real-time
- [ ] Quản lý kho hàng
- [ ] Tích hợp thanh toán

## Lưu ý

1. Admin dashboard yêu cầu backend API đang chạy tại port 5000
2. Cần có tài khoản admin để truy cập
3. Một số tính năng đang trong quá trình phát triển
4. Database cần có collection users với role 'admin'
