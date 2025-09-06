#!/bin/bash

set -e

# Configuration
ENVIRONMENT=${1:-dev}
REGION=${2:-us-west-2}
STACK_NAME="photopass-${ENVIRONMENT}"

echo "🚀 Deploying PhotoPass AI to ${ENVIRONMENT} environment..."

# Build the application
echo "📦 Building application..."
npm run build

# Deploy CloudFormation stack
echo "☁️ Deploying infrastructure..."
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides Environment=$ENVIRONMENT \
  --capabilities CAPABILITY_IAM \
  --region $REGION

# Get stack outputs
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
  --output text \
  --region $REGION)

API_URL=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text \
  --region $REGION)

echo "✅ Infrastructure deployed successfully!"
echo "📦 S3 Bucket: $S3_BUCKET"
echo "🌐 API URL: $API_URL"

# Deploy Lambda function
echo "⚡ Deploying Lambda function..."
zip -r function.zip dist/ node_modules/
aws lambda update-function-code \
  --function-name "photopass-${ENVIRONMENT}-processor" \
  --zip-file fileb://function.zip \
  --region $REGION

# Deploy frontend to S3 (if frontend build exists)
if [ -d "../frontend/dist" ]; then
  echo "🌐 Deploying frontend..."
  aws s3 sync ../frontend/dist s3://$S3_BUCKET/web/ --delete
fi

echo "🎉 Deployment complete!"
echo "🔗 Your PhotoPass AI is ready at: https://$API_URL"
