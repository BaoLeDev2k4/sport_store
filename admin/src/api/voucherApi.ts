import axios from 'axios';
import { Voucher } from '../types';

const API_URL = 'http://localhost:5000/api/vouchers';

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}` };
};

export const getVouchers = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  return axios.get(`${API_URL}/admin`, {
    headers: getAuthHeaders(),
    params
  });
};

export const getVoucherById = (id: string) => {
  return axios.get(`${API_URL}/admin/${id}`, {
    headers: getAuthHeaders()
  });
};

export const createVoucher = (data: Partial<Voucher>) => {
  return axios.post(`${API_URL}/admin`, data, {
    headers: getAuthHeaders()
  });
};

export const updateVoucher = (id: string, data: Partial<Voucher>) => {
  return axios.put(`${API_URL}/admin/${id}`, data, {
    headers: getAuthHeaders()
  });
};

export const deleteVoucher = (id: string) => {
  return axios.delete(`${API_URL}/admin/${id}`, {
    headers: getAuthHeaders()
  });
};

export const validateVoucher = (code: string) => {
  return axios.get(`${API_URL}/validate/${code}`);
};
