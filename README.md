# PhotoPass AI

> AI-powered passport photo compliance platform with global coverage, live guidance, and enterprise APIs.

[![Deploy](https://img.shields.io/badge/Deploy-AWS-orange)](./backend/deploy.sh)
[![Frontend](https://img.shields.io/badge/Frontend-React-blue)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js-green)](./backend)

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

## 🎯 Features

- ✅ **AI Background Replacement** - Gemini-powered background processing
- ✅ **Compliance Checking** - 100+ countries and document types
- ✅ **Live Camera Guidance** - AR overlays for perfect positioning
- ✅ **Print Sheet Generation** - 4x6" sheets with multiple photos
- ✅ **Enterprise API** - Bulk processing for agencies
- ✅ **Payment Integration** - Stripe-powered transactions

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓
Backend API (Node.js + Express)
    ↓
AWS Infrastructure (Lambda + S3 + DynamoDB)
    ↓
AI Processing (Google Gemini API)
```

## 💰 Business Model

- **Freemium**: Free validator + watermarked preview
- **Consumer**: $3-6 AI-only, $7-12 human-verified
- **Enterprise**: Usage-based API pricing

## 🚀 Deploy to AWS

```bash
cd backend
./deploy.sh prod
```

## 📊 Success Metrics

- Target: >95% acceptance rate
- Coverage: 100+ countries
- Processing: <30 seconds per photo
- Uptime: 99.9% SLA

## 🔑 Required API Keys

1. [Gemini API Key](https://makersuite.google.com/app/apikey)
2. [Stripe Keys](https://dashboard.stripe.com/apikeys)
3. AWS Credentials

## 📁 Project Structure

```
photopass-ai/
├── frontend/          # React frontend
├── backend/           # Node.js API
├── infrastructure/    # AWS CloudFormation
└── docs/             # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file.
