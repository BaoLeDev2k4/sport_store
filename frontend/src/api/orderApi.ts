import axios from 'axios';
import type { Order, OrderPayload } from '../types/Order';

const API_URL = '/api/orders';

export const createOrder = async (
  orderData: OrderPayload,
  token: string
): Promise<Order> => {
  const res = await axios.post<Order>(API_URL, orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getUserOrders = async (token: string): Promise<Order[]> => {
  const res = await axios.get<Order[]>(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const cancelOrder = async (id: string, token: string) => {
  await axios.patch(`/api/orders/${id}/cancel`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
