// Đổi tên từ Coupon sang Voucher để thống nhất
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

// Backward compatibility
export type Coupon = Voucher;
