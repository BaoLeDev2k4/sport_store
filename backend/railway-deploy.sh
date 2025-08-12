#!/bin/bash

# Railway Deployment Script for Sport Store Backend

echo "🚂 Starting Railway deployment preparation..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Create new project (if needed)
echo "📦 Creating Railway project..."
railway project new sport-store-backend

# Link to project
railway link

# Set environment variables
echo "🔧 Setting environment variables..."
echo "Please set these environment variables in Railway dashboard:"
echo "- MONGO_URI"
echo "- JWT_SECRET"
echo "- CLIENT_URL"
echo "- SERVER_URL"
echo "- RESEND_API_KEY"
echo "- VNPAY_TMN_CODE"
echo "- VNPAY_SECRET_KEY"
echo "- VNPAY_URL"
echo "- VNPAY_RETURN_URL"
echo "- NODE_ENV=production"

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your backend will be available at: https://your-project.railway.app"
echo "📊 Monitor your deployment at: https://railway.app/dashboard"
