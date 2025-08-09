export interface OrderDetail {
  _id: string;
  id_order: string;
  id_product: string | {
    _id: string;
    name: string;
    images?: string[];
    variants?: Array<{
      _id: string;
      image: string;
      color: string;
      size: string;
    }>;
  };
  variant_id: string;
  name: string;
  size: string;
  color: string;
  unit_price: number;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  id_user: string;
  id_voucher?: string | null;
  discount_amount: number;
  total_amount: number;
  final_total: number;
  total_payment: number;
  address: string;
  phone: string;
  name: string;
  note: string;
  payment_method: 'COD' | 'MOMO';
  payment_status: 'Pending' | 'Completed';
  order_status: 'Processing' | 'Packaging' | 'Shipping' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
  products: OrderDetail[];
}

export interface OrderPayload {
  id_voucher: string | null;
  discount_amount: number;
  total_amount: number;
  final_total: number;
  total_payment: number;
  address: string;
  phone: string;
  name: string;
  note: string;
  payment_method: 'COD' | 'VNPAY';
  cartItems: {
    id_product: string;
    variant_id: string;
    name: string;
    size: string;
    color: string;
    unit_price: number;
    price: number;
    quantity: number;
  }[];
}
