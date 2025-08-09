import api from './axiosConfig';
import { Order } from '../types';

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

// Lấy danh sách đơn hàng
export const getOrders = async (filters: OrderFilters = {}): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);

  const response = await api.get(`/admin/orders?${params.toString()}`);
  return response.data;
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (id: string): Promise<Order> => {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (
  id: string,
  status: 'Processing' | 'Packaging' | 'Shipping' | 'Completed' | 'Cancelled'
): Promise<{ message: string; order: { _id: string; order_status: string } }> => {
  const response = await api.patch(`/admin/orders/${id}/status`, {
    order_status: status
  });
  return response.data;
};

// Thống kê đơn hàng
export const getOrderStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};
