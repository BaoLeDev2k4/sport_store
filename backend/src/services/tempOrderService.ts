interface TempOrderData {
  userId: string;
  cartItems: any[];
  name: string;
  phone: string;
  address: string;
  note: string;
  payment_method: string;
  id_voucher?: string | null;
  discount_amount: number;
  total_amount: number;
  final_total: number;
  total_payment: number;
  createdAt: Date;
}

class TempOrderService {
  private tempOrders: Map<string, TempOrderData> = new Map();
  private readonly TTL = 30 * 60 * 1000; // 30 phút

  constructor() {
    // Tự động xóa các order hết hạn mỗi 5 phút
    setInterval(() => {
      this.cleanExpiredOrders();
    }, 5 * 60 * 1000);
  }

  // Tạo temporary order và trả về unique key
  createTempOrder(orderData: Omit<TempOrderData, 'createdAt'>): string {
    const tempOrderId = `temp_${Date.now()}_${orderData.userId}`;
    
    this.tempOrders.set(tempOrderId, {
      ...orderData,
      createdAt: new Date()
    });

    console.log(`✅ Temp order created: ${tempOrderId}`);
    return tempOrderId;
  }

  // Lấy thông tin temporary order
  getTempOrder(tempOrderId: string): TempOrderData | null {
    const tempOrder = this.tempOrders.get(tempOrderId);
    
    if (!tempOrder) {
      console.log(`❌ Temp order not found: ${tempOrderId}`);
      return null;
    }

    // Kiểm tra TTL
    const now = new Date();
    const elapsed = now.getTime() - tempOrder.createdAt.getTime();
    
    if (elapsed > this.TTL) {
      console.log(`⏰ Temp order expired: ${tempOrderId}`);
      this.tempOrders.delete(tempOrderId);
      return null;
    }

    return tempOrder;
  }

  // Xóa temporary order sau khi đã xử lý
  deleteTempOrder(tempOrderId: string): boolean {
    const deleted = this.tempOrders.delete(tempOrderId);
    if (deleted) {
      console.log(`🗑️ Temp order deleted: ${tempOrderId}`);
    }
    return deleted;
  }

  // Xóa các order hết hạn
  private cleanExpiredOrders(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, order] of this.tempOrders.entries()) {
      const elapsed = now.getTime() - order.createdAt.getTime();
      if (elapsed > this.TTL) {
        this.tempOrders.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} expired temp orders`);
    }
  }

  // Debug: Xem tất cả temp orders
  getAllTempOrders(): Map<string, TempOrderData> {
    return this.tempOrders;
  }
}

// Singleton instance
const tempOrderService = new TempOrderService();
export default tempOrderService;
