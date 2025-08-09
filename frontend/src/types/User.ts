export interface User {
  _id: string; // ✅ Thêm dòng này
  id: string;
  username: string;
  email: string;
  phone: string;
  avatar?: string; // ✅ Thêm avatar field
  address?: { address: string }[];
  isActive: boolean; // ✅ Thay đổi từ optional thành required
  role?: string; // ✅ Thêm role field
}
