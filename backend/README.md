# PhotoPass AI Backend

## Quick Setup

### 1. Install Dependencies
```bash
cd /Users/sayenden/photopass-backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

### 3. Local Development
```bash
npm run dev
```

### 4. Deploy to AWS
```bash
# Deploy to development
./deploy.sh dev

# Deploy to production
./deploy.sh prod us-west-2
```

## Required API Keys

1. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Stripe Keys**: Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. **AWS Credentials**: Configure via AWS CLI or environment variables

## Architecture

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express + TypeScript
- **AI Processing**: Google Gemini API
- **Image Processing**: Sharp
- **Storage**: AWS S3
- **Database**: DynamoDB
- **Payments**: Stripe
- **Deployment**: AWS Lambda + API Gateway

## API Endpoints

- `POST /api/photos/process` - Replace background
- `POST /api/photos/compliance` - Check compliance
- `POST /api/photos/generate` - Generate final photos
- `POST /api/payments/create-intent` - Create payment intent

## Monitoring

- CloudWatch logs for Lambda functions
- API Gateway metrics
- S3 access logs
- DynamoDB metrics
