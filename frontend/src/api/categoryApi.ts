import axios from 'axios';
import type { Category } from '../types/Category';

const API_URL = 'http://localhost:5000/api/categories';

export const fetchCategories = () => axios.get<Category[]>(API_URL);
