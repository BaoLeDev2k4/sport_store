import * as cron from 'node-cron';
import Voucher from '../models/voucherModel.js';

// Job chạy mỗi giờ để cập nhật status voucher
export const startVoucherStatusJob = () => {
  // Chạy mỗi giờ vào phút thứ 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 Running voucher status update job...');
      
      const now = new Date();
      
      // Cập nhật voucher hết hạn
      const expiredResult = await Voucher.updateMany(
        { 
          status: 'Active',
          end_date: { $lt: now }
        },
        { 
          status: 'Expired' 
        }
      );
      
      // Cập nhật voucher hết số lượng
      const outOfStockResult = await Voucher.updateMany(
        {
          status: 'Active',
          quantity: { $lte: 0 }
        },
        {
          status: 'out_of_stock'
        }
      );
      
      console.log(`✅ Updated ${expiredResult.modifiedCount} expired vouchers`);
      console.log(`✅ Updated ${outOfStockResult.modifiedCount} out-of-stock vouchers`);
      
    } catch (error) {
      console.error('❌ Error in voucher status job:', error);
    }
  });
  
  console.log('📅 Voucher status job scheduled (every hour)');
};

// Job chạy ngay lập tức để cập nhật status
export const runVoucherStatusUpdate = async () => {
  try {
    console.log('🔄 Running immediate voucher status update...');
    
    const now = new Date();
    
    const expiredResult = await Voucher.updateMany(
      { 
        status: 'Active',
        end_date: { $lt: now }
      },
      { 
        status: 'Expired' 
      }
    );
    
    const outOfStockResult = await Voucher.updateMany(
      {
        status: 'Active',
        quantity: { $lte: 0 }
      },
      {
        status: 'out_of_stock'
      }
    );
    
    console.log(`✅ Updated ${expiredResult.modifiedCount} expired vouchers`);
    console.log(`✅ Updated ${outOfStockResult.modifiedCount} out-of-stock vouchers`);
    
    return {
      expired: expiredResult.modifiedCount,
      outOfStock: outOfStockResult.modifiedCount
    };
    
  } catch (error) {
    console.error('❌ Error in immediate voucher status update:', error);
    throw error;
  }
};
