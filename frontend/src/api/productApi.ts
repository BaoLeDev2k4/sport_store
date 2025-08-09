import axios from 'axios';
import type { Product } from '../types/Product';

const API_URL = 'http://localhost:5000/api/products';

export const fetchProducts = () => axios.get<Product[]>(`${API_URL}`); // ✅ thêm hàm này
export const fetchHotProducts = () => axios.get<Product[]>(`${API_URL}/hot`);
export const fetchLatestProducts = () => axios.get<Product[]>(`${API_URL}/latest`);
export const fetchRandomProducts = () => axios.get<Product[]>(`${API_URL}/random`);

export const fetchProductById = (id: string) => {
  return axios.get<Product>(`${API_URL}/${id}`);
};
