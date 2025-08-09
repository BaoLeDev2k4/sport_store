import crypto from 'crypto';
import qs from 'qs';
import moment from 'moment';

interface VNPayPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
  bankCode?: string;
  locale?: string;
}

interface VNPayPaymentResponse {
  code: string;
  message: string;
  data?: string;
}

class VNPayService {
  private tmnCode: string;
  private secretKey: string;
  private vnpUrl: string;
  private returnUrl: string;

  constructor() {
    this.tmnCode = process.env.VNPAY_TMN_CODE || '';
    this.secretKey = process.env.VNPAY_SECRET_KEY || '';
    this.vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:5000/api/payment/vnpay/return';
  }

  private sortObject(obj: any): any {
    const sorted: any = {};
    const str = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }

  createPayment(paymentData: VNPayPaymentRequest): string {
    // Set timezone theo chuẩn VNPay
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const {
      orderId,
      amount,
      orderInfo,
      ipAddr,
      bankCode,
      locale = 'vn'
    } = paymentData;

    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    let vnpParams: any = {};
    vnpParams['vnp_Version'] = '2.1.0';
    vnpParams['vnp_Command'] = 'pay';
    vnpParams['vnp_TmnCode'] = this.tmnCode;
    vnpParams['vnp_Locale'] = locale;
    vnpParams['vnp_CurrCode'] = 'VND';
    vnpParams['vnp_TxnRef'] = orderId;
    vnpParams['vnp_OrderInfo'] = orderInfo;
    vnpParams['vnp_OrderType'] = 'other';
    vnpParams['vnp_Amount'] = amount * 100; // VNPay yêu cầu amount * 100
    vnpParams['vnp_ReturnUrl'] = this.returnUrl;
    vnpParams['vnp_IpAddr'] = ipAddr;
    vnpParams['vnp_CreateDate'] = createDate;

    // Thêm bank code nếu có
    if (bankCode && bankCode !== '') {
      vnpParams['vnp_BankCode'] = bankCode;
    }

    vnpParams = this.sortObject(vnpParams);

    const signData = qs.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;

    const paymentUrl = this.vnpUrl + '?' + qs.stringify(vnpParams, { encode: false });

    return paymentUrl;
  }

  verifyReturnUrl(vnpParams: any): { isValid: boolean; message: string; responseCode?: string } {
    const secureHash = vnpParams['vnp_SecureHash'];
    const responseCode = vnpParams['vnp_ResponseCode'];

    // Tạo bản copy để không modify original object
    const params = { ...vnpParams };
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      if (responseCode === '00') {
        return { isValid: true, message: 'Giao dịch thành công', responseCode };
      } else {
        return { isValid: false, message: 'Giao dịch thất bại', responseCode };
      }
    } else {
      return { isValid: false, message: 'Chữ ký không hợp lệ', responseCode: '97' };
    }
  }

  verifyIPN(vnpParams: any): { isValid: boolean; message: string; rspCode: string } {
    const secureHash = vnpParams['vnp_SecureHash'];
    const responseCode = vnpParams['vnp_ResponseCode'];

    // Tạo bản copy để không modify original object
    const params = { ...vnpParams };
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      if (responseCode === '00') {
        return { isValid: true, message: 'Success', rspCode: '00' };
      } else {
        return { isValid: false, message: 'Success', rspCode: '00' }; // VNPay vẫn trả 00 cho IPN
      }
    } else {
      return { isValid: false, message: 'Checksum failed', rspCode: '97' };
    }
  }

  // Thêm method để lấy IP address đúng cách
  getClientIpAddress(req: any): string {
    return req.headers['x-forwarded-for'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
  }
}

export default new VNPayService();
