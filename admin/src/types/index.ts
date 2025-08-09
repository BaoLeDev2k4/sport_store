export interface Address {
  _id?: string;
  name?: string;
  phone?: string;
  company?: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  zip?: string;
  default?: boolean;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'user' | 'admin';
  address?: Address[];
  isActive: boolean;
  lockReason?: string;
  lockedAt?: string;
  lockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  image: string;
  description: string;
  status: 'Active' | 'InActive';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  idcate: string | Category;
  colors?: string[];
  sizes?: string[];
  images?: string[];
  variants: Variant[];
  hot: number;
  view: number;
  status: string;
  description: string;
  flag: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Variant {
  _id?: string;
  option: string;
  size: string;
  color: string;
  price: number;
  sale_price?: number;
  image: string;
  quantity?: number;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  id_user: {
    _id: string;
    name: string;
    email: string;
  };
  id_voucher?: {
    _id: string;
    code: string;
    discount_value: number;
  };
  discount_amount: number;
  total_amount: number;
  final_total: number;
  total_payment: number;
  name: string;
  phone: string;
  address: string;
  note: string;
  payment_method: 'COD' | 'VNPAY';
  payment_status: 'Pending' | 'Completed';
  order_status: 'Processing' | 'Packaging' | 'Shipping' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
  products: OrderItem[];
  orderCode: string;
}

export interface OrderItem {
  _id: string;
  id_product: string | {
    _id: string;
    name: string;
    images?: string[];
    variants?: Variant[];
  };
  variant_id: string;
  name: string;
  size: string;
  color: string;
  unit_price: number;
  price: number;
  quantity: number;
  id_order: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  imageSummary?: string;
  create_at: string;
  status: number; // 1 = hiển thị, 0 = ẩn
  author: string;
  view: number;
  hot: number; // 1 = hot
}

export interface Voucher {
  _id: string;
  code: string;
  discount: number;
  start_date: string;
  end_date: string;
  status: 'Active' | 'InActive' | 'Expired' | 'out_of_stock';
  quantity: number;
  description: string;
  currentStatus?: string;
  isExpired?: boolean;
  isOutOfStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totals: {
    products: number;
    categories: number;
    users: number;
    orders: number;
    vouchers: number;
  };
  revenue: {
    monthly: number;
    yearly: number;
    growth: number;
    chart: Array<{
      _id: { year: number; month: number };
      revenue: number;
      orders: number;
    }>;
  };
  orders: {
    total: number;
    monthly: number;
    growth: number;
    byStatus: Array<{
      _id: string;
      count: number;
    }>;
    recent: Array<{
      _id: string;
      customer_name: string;
      total_payment: number;
      order_status: string;
      createdAt: string;
    }>;
  };
  topProducts: Array<{
    _id: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  recentUsers: Array<{
    _id: string;
    username: string;
    email: string;
    createdAt: string;
  }>;
}

export interface TopProductsResponse {
  topProducts: Array<{
    _id: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
  year: number;
  month: number | null;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}
