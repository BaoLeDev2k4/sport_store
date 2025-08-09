import axios from 'axios';

const API_URL = '/api/payment';

export interface PaymentResponse {
  success: boolean;
  payUrl?: string;
  message: string;
}

export const createVNPayPayment = async (
  orderData: any, // Thông tin đơn hàng đầy đủ thay vì chỉ orderId
  token: string
): Promise<PaymentResponse> => {
  const res = await axios.post<PaymentResponse>(
    `${API_URL}/vnpay/create`,
    orderData, // Gửi toàn bộ thông tin đơn hàng
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
