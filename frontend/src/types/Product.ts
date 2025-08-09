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

export interface Product {
  _id: string;
  name: string;
  idcate: string;
  description?: string;
  view?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  hot?: number;
  flag?: boolean;
  variants: Variant[];

  // Các trường cần bổ sung cho chi tiết sản phẩm
  colors?: string[];
  sizes?: string[];
  images?: string[];
}
