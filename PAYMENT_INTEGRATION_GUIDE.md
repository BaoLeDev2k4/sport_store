# Hướng dẫn tích hợp thanh toán online VNPay

## Tổng quan

Dự án đã được tích hợp thành công với cổng thanh toán online:
- **VNPay**: Cổng thanh toán trực tuyến hàng đầu Việt Nam

## Cấu trúc hệ thống

### Backend
```
backend/src/
├── services/
│   └── vnpayService.ts     # Service xử lý thanh toán VNPay
├── controllers/
│   └── paymentController.ts # Controller xử lý API thanh toán
├── routes/
│   └── paymentRoutes.ts    # Routes cho thanh toán
└── models/
    └── orderModel.ts       # Model đã cập nhật hỗ trợ thanh toán online
```

### Frontend
```
frontend/src/
├── api/
│   └── paymentApi.ts       # API calls cho thanh toán
├── pages/
│   ├── CheckoutPage.tsx    # Trang checkout đã cập nhật
│   └── PaymentResultPage.tsx # Trang hiển thị kết quả thanh toán
└── scss/
    └── _payment-result.scss # Styles cho payment result
```

## Cấu hình Environment Variables

Trong file `backend/.env`, đã thêm các biến môi trường:

```env
# Payment Gateway Configuration
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# VNPay Configuration (Sandbox) - Từ VNPay chính thức
VNPAY_TMN_CODE=GSD1J3BZ
VNPAY_SECRET_KEY=RE3P56MWSV4B19632XWXDOQPNEYOMH9W
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5000/api/payment/vnpay/return
```

**⚠️ Lưu ý**: Đây là thông tin sandbox/test. Khi deploy production, cần thay đổi thành thông tin thật.

## Flow thanh toán

### 1. Thanh toán COD (Cash on Delivery)
- User chọn COD → Tạo order → Hoàn thành

### 2. Thanh toán VNPay
1. User chọn VNPay → Tạo order
2. Gọi API `/api/payment/vnpay/create` → Nhận payment URL
3. Redirect user đến VNPay
4. User thanh toán trên VNPay
5. VNPay redirect về `/api/payment/vnpay/return`
6. Cập nhật trạng thái order và redirect user đến `/payment/result`

## API Endpoints

### VNPay
- `POST /api/payment/vnpay/create` - Tạo payment URL
- `GET /api/payment/vnpay/return` - Return URL sau khi thanh toán
- `POST /api/payment/vnpay/ipn` - Webhook nhận IPN từ VNPay

## Database Schema Updates

Order model đã được cập nhật với các trường mới:
```typescript
{
  payment_method: 'COD' | 'VNPAY',
  payment_status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled',
  transaction_id: string,
  payment_url: string,
  payment_gateway_response: object
}
```

## Testing

### Sandbox Testing
1. **VNPay Sandbox**: Sử dụng thông tin test đã cấu hình

### Test Cards cho VNPay Sandbox
- Thẻ test: 9704198526191432198
- Tên chủ thẻ: NGUYEN VAN A
- Ngày hết hạn: 07/15
- Mật khẩu OTP: 123456

## Deployment Notes

### Production Environment
1. Thay đổi tất cả thông tin sandbox thành production
2. Cập nhật `CLIENT_URL` và `SERVER_URL`
3. Đảm bảo HTTPS cho production
4. Cấu hình webhook URLs chính xác

### Security
- Tất cả signature đều được verify
- Sensitive data được mã hóa
- Environment variables không được commit

## Troubleshooting

### Common Issues
1. **Invalid Signature**: Kiểm tra secret key và cách tạo signature
2. **Webhook không hoạt động**: Kiểm tra URL và network connectivity
3. **Payment URL không tạo được**: Kiểm tra thông tin merchant

### Logs
- Tất cả payment activities đều được log
- Kiểm tra console logs để debug

## Next Steps

1. Test thoroughly với sandbox environment
2. Tích hợp với production credentials
3. Implement additional security measures
4. Add monitoring và alerting
5. Optimize user experience

