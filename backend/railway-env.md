# Railway Environment Variables Setup

## Required Environment Variables

Copy these to your Railway project dashboard:

### Database
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/databaseDATN
```

### Authentication
```
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
```

### Server Configuration
```
PORT=5000
NODE_ENV=production
```

### URLs (Update after deployment)
```
CLIENT_URL=https://your-frontend.vercel.app
SERVER_URL=https://your-backend.railway.app
ADMIN_URL=https://your-admin.vercel.app
```

### Email Service
```
RESEND_API_KEY=re_your_resend_api_key_here
```

### VNPay Payment Gateway
```
VNPAY_TMN_CODE=GSD1J3BZ
VNPAY_SECRET_KEY=RE3P56MWSV4B19632XWXDOQPNEYOMH9W
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://your-backend.railway.app/api/payment/vnpay/return
```

## Deployment Steps

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Create new project**:
   ```bash
   railway project new sport-store-backend
   ```

4. **Link project**:
   ```bash
   railway link
   ```

5. **Set environment variables** in Railway dashboard

6. **Deploy**:
   ```bash
   railway up
   ```

## Post-Deployment

1. **Update VNPAY_RETURN_URL** with your actual Railway domain
2. **Update CLIENT_URL** with your Vercel frontend domain
3. **Test health check**: `https://your-domain.railway.app/api/health`
4. **Test API endpoints**

## Monitoring

- **Railway Dashboard**: https://railway.app/dashboard
- **Logs**: `railway logs`
- **Metrics**: Available in Railway dashboard
