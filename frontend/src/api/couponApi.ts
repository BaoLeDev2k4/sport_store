import axios from 'axios';

// ✅ Đổi tên từ Coupon sang Voucher để thống nhất
export interface Voucher {
  _id: string;
  code: string;
  discount: number;
  description: string;
  status: 'Active' | 'InActive' | 'Expired' | 'out_of_stock';
  start_date: string;
  end_date: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
  // Thêm các trường mới từ backend
  currentStatus?: string;
  isExpired?: boolean;
  isOutOfStock?: boolean;
  isNotStarted?: boolean;
  canUse?: boolean;
  min_order_amount?: number;
}

// Đổi API endpoint từ coupons sang vouchers
export const fetchVouchers = () => axios.get<Voucher[]>('/api/vouchers/user');

// Validate voucher
export const validateVoucher = (code: string, orderAmount?: number) => {
  if (orderAmount !== undefined) {
    return axios.post(`/api/vouchers/validate/${code}`, { order_amount: orderAmount });
  }
  return axios.get(`/api/vouchers/validate/${code}`);
};

// Backward compatibility - export cũ để không break code
export const fetchCoupons = fetchVouchers;
export type Coupon = Voucher;
