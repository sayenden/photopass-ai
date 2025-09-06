# PhotoPass AI Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/sayenden/photopass-ai.git
cd photopass-ai
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Get API Keys
- **Gemini API**: [Get key here](https://makersuite.google.com/app/apikey)
- **Stripe**: [Get keys here](https://dashboard.stripe.com/apikeys)

### 4. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
```

### 5. Run Locally
```bash
npm run dev
```

Visit: http://localhost:3000

## 🌐 Deploy to Production

### Prerequisites
- AWS Account
- AWS CLI configured
- Domain name (optional)

### Deploy
```bash
cd backend
./deploy.sh prod
```

## 📋 Environment Variables

### Backend (.env)
```bash
# Required
GEMINI_API_KEY=your_gemini_key_here
STRIPE_SECRET_KEY=sk_live_your_stripe_key

# AWS (auto-configured in production)
AWS_REGION=us-west-2
S3_BUCKET_NAME=photopass-prod-photos

# Optional
PORT=3001
NODE_ENV=production
```

### Frontend (.env.local)
```bash
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
```

## 🏗️ Architecture Overview

```
User → CloudFront → S3 (Frontend)
     → API Gateway → Lambda (Backend)
                  → Gemini API (AI Processing)
                  → S3 (Photo Storage)
                  → DynamoDB (Data)
                  → Stripe (Payments)
```

## 💰 Cost Estimation (Monthly)

### Development
- AWS Free Tier: $0
- Gemini API: ~$10
- **Total: ~$10/month**

### Production (1000 photos/month)
- AWS Lambda: ~$5
- S3 Storage: ~$2
- DynamoDB: ~$3
- CloudFront: ~$1
- Gemini API: ~$50
- **Total: ~$61/month**

## 🔧 Troubleshooting

### Common Issues

**1. Gemini API Errors**
- Check API key is valid
- Ensure billing is enabled
- Verify quota limits

**2. AWS Deployment Fails**
- Check AWS credentials
- Verify IAM permissions
- Ensure region is correct

**3. Frontend Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (requires 18+)

### Support
- Create issue: [GitHub Issues](https://github.com/sayenden/photopass-ai/issues)
- Email: support@photopass.ai
