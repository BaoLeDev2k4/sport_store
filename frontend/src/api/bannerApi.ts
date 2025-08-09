import axios from 'axios';

export interface BannerData {
  _id: string;
  title: string;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchBanners = () => axios.get<BannerData[]>('http://localhost:5000/api/banners');
