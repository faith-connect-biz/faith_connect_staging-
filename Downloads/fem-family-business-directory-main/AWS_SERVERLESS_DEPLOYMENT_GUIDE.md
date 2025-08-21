# AWS Serverless Deployment Guide

## Overview
This guide outlines the deployment of the FEM Family Business Directory on AWS serverless architecture, which provides better scalability, cost-effectiveness, and maintenance compared to traditional server instances.

## Why AWS Serverless?

### Advantages
- **Cost-Effective**: Pay only for what you use
- **Auto-Scaling**: Automatically handles traffic spikes
- **High Availability**: Built-in redundancy and failover
- **Low Maintenance**: No server management required
- **Global Distribution**: CDN and edge locations
- **Security**: AWS-managed security features

### Cost Comparison
- **Traditional EC2**: ~$50-200/month (always running)
- **Serverless**: ~$5-50/month (usage-based)

## AWS Services Architecture

### Frontend (React App)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Route 53      │    │   CloudFront    │    │   S3 Bucket     │
│   (DNS)         │───▶│   (CDN)         │───▶│   (Static Host) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Services:**
- **Amazon S3**: Static website hosting
- **CloudFront**: Global CDN and caching
- **Route 53**: DNS management and domain routing

### Backend (Django API)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Lambda        │    │   RDS Aurora    │
│   (API Proxy)   │───▶│   (Functions)   │───▶│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   DynamoDB      │
                       │   (Cache/Session)│
                       └─────────────────┘
```

**Services:**
- **API Gateway**: REST API management
- **Lambda**: Serverless compute functions
- **RDS Aurora Serverless**: Auto-scaling database
- **DynamoDB**: Session storage and caching

### Additional Services
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cognito       │    │   S3 (Media)    │    │   SES/SNS       │
│   (Auth)        │    │   (File Storage)│    │   (Email/SMS)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Services:**
- **Cognito**: User authentication and management
- **S3**: Media file storage
- **SES/SNS**: Email and SMS notifications

## Detailed Service Breakdown

### 1. Frontend Deployment

#### Amazon S3
- **Purpose**: Host static React build files
- **Configuration**:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::your-app-bucket/*"
      }
    ]
  }
  ```
- **Cost**: ~$0.023/GB/month

#### CloudFront
- **Purpose**: Global CDN, HTTPS, caching
- **Configuration**:
  - Origin: S3 bucket
  - Behaviors: Cache static assets, bypass API calls
  - SSL Certificate: ACM certificate
- **Cost**: ~$0.085/GB transfer

#### Route 53
- **Purpose**: DNS management, domain routing
- **Configuration**:
  - A Record → CloudFront distribution
  - CNAME for www subdomain
- **Cost**: ~$0.50/month per hosted zone

### 2. Backend Deployment

#### API Gateway
- **Purpose**: REST API management, authentication, rate limiting
- **Configuration**:
  ```yaml
  openapi: 3.0.0
  info:
    title: FEM API
    version: 1.0.0
  paths:
    /api/auth/{proxy+}:
      x-amazon-apigateway-integration:
        uri: arn:aws:lambda:region:account:function:auth-handler
    /api/business/{proxy+}:
      x-amazon-apigateway-integration:
        uri: arn:aws:lambda:region:account:function:business-handler
  ```
- **Cost**: ~$3.50/million requests

#### Lambda Functions
- **Purpose**: Serverless Django application
- **Configuration**:
  - Runtime: Python 3.9+
  - Memory: 512MB-1024MB
  - Timeout: 30 seconds
  - Environment variables for database connection
- **Cost**: ~$0.20/million requests + compute time

#### RDS Aurora Serverless v2
- **Purpose**: PostgreSQL database
- **Configuration**:
  - Engine: PostgreSQL 13+
  - Capacity: 0.5-16 ACU (auto-scaling)
  - Multi-AZ: Enabled for high availability
- **Cost**: ~$0.12/ACU-hour

#### DynamoDB
- **Purpose**: Session storage, caching, real-time features
- **Configuration**:
  - On-demand capacity
  - TTL for session expiration
- **Cost**: ~$1.25/million requests

### 3. Authentication & Storage

#### Cognito
- **Purpose**: User authentication, OTP, social login
- **Configuration**:
  - User Pool: Custom attributes
  - Identity Pool: AWS credentials
  - Triggers: Lambda functions for OTP
- **Cost**: ~$0.0055 per MAU

#### S3 (Media Storage)
- **Purpose**: Business images, user uploads
- **Configuration**:
  - Bucket policies for secure access
  - Lifecycle policies for cost optimization
- **Cost**: ~$0.023/GB/month

#### SES/SNS
- **Purpose**: Email and SMS notifications
- **Configuration**:
  - SES: Email templates for OTP
  - SNS: SMS delivery
- **Cost**: SES ~$0.10/1000 emails, SNS ~$0.00645/SMS

## Deployment Architecture

### Production Environment
```
Internet
    │
    ▼
┌─────────────┐
│  Route 53   │
└─────────────┘
    │
    ▼
┌─────────────┐
│ CloudFront  │
└─────────────┘
    │
    ├─────────────┬─────────────┐
    ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│   S3    │  │   API   │  │ Cognito │
│(Static) │  │ Gateway │  │ (Auth)  │
└─────────┘  └─────────┘  └─────────┘
                   │
                   ▼
              ┌─────────┐
              │ Lambda  │
              │(Django) │
              └─────────┘
                   │
              ┌─────────┐
              │  RDS    │
              │ Aurora  │
              └─────────┘
```

### Development/Staging Environment
```
┌─────────────┐
│  CodeBuild  │
└─────────────┘
    │
    ▼
┌─────────────┐
│ CodePipeline│
└─────────────┘
    │
    ▼
┌─────────────┐
│   Lambda    │
│ (Staging)   │
└─────────────┘
```

## Implementation Steps

### Phase 1: Infrastructure Setup

#### 1.1 Create AWS Account & IAM
```bash
# Create IAM user with appropriate permissions
aws iam create-user --user-name fem-deployment
aws iam attach-user-policy --user-name fem-deployment --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

#### 1.2 Set up Infrastructure as Code (Terraform)
```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# S3 Bucket for static hosting
resource "aws_s3_bucket" "frontend" {
  bucket = "fem-frontend-${random_string.suffix.result}"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"
  }
  
  enabled             = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
}
```

### Phase 2: Backend Migration

#### 2.1 Django to Lambda Adaptation
```python
# lambda_function.py
import os
import sys
from django.core.wsgi import get_wsgi_application
from mangum import Mangum

# Add Django project to path
sys.path.append('/opt/python/lib/python3.9/site-packages')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()

# Mangum adapter for Lambda
handler = Mangum(application)
```

#### 2.2 Database Migration
```python
# settings/production.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Use DynamoDB for sessions
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dynamodb.DynamoDBCache',
        'LOCATION': 'sessions',
    }
}
```

### Phase 3: Frontend Deployment

#### 3.1 Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
})
```

#### 3.2 Deployment Script
```bash
#!/bin/bash
# deploy-frontend.sh

# Build the application
npm run build

# Sync to S3
aws s3 sync dist/ s3://fem-frontend-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

### Phase 4: CI/CD Pipeline

#### 4.1 GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build frontend
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
    
    - name: Deploy to S3
      run: |
        aws s3 sync dist/ s3://fem-frontend-bucket --delete
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
    
    - name: Deploy Lambda
      run: |
        cd backend
        zip -r lambda.zip .
        aws lambda update-function-code --function-name fem-api --zip-file fileb://lambda.zip
```

## Cost Estimation

### Monthly Costs (Estimated)
| Service | Usage | Cost |
|---------|-------|------|
| S3 (Static) | 1GB | $0.023 |
| CloudFront | 100GB transfer | $8.50 |
| API Gateway | 1M requests | $3.50 |
| Lambda | 1M requests | $0.20 |
| RDS Aurora | 2 ACU avg | $43.20 |
| DynamoDB | 1M requests | $1.25 |
| Cognito | 1000 MAU | $5.50 |
| Route 53 | 1 hosted zone | $0.50 |
| **Total** | | **$62.72** |

### Cost Optimization
- **RDS**: Use Aurora Serverless v2 for auto-scaling
- **Lambda**: Optimize function size and execution time
- **CloudFront**: Implement proper caching strategies
- **S3**: Use lifecycle policies for old files

## Security Considerations

### 1. Network Security
```yaml
# VPC Configuration
VPC:
  CIDR: 10.0.0.0/16
  Subnets:
    - Private: 10.0.1.0/24 (Lambda)
    - Private: 10.0.2.0/24 (RDS)
    - Public: 10.0.3.0/24 (NAT Gateway)
```

### 2. IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction",
        "dynamodb:GetItem",
        "dynamodb:PutItem"
      ],
      "Resource": [
        "arn:aws:lambda:region:account:function:function-name",
        "arn:aws:dynamodb:region:account:table:table-name"
      ]
    }
  ]
}
```

### 3. Data Encryption
- **At Rest**: AES-256 encryption
- **In Transit**: TLS 1.2+ encryption
- **Secrets**: AWS Secrets Manager

## Monitoring & Logging

### 1. CloudWatch
```yaml
# CloudWatch Alarms
Alarms:
  - API Gateway 4xx Errors
  - Lambda Duration
  - RDS CPU Utilization
  - DynamoDB Throttled Requests
```

### 2. X-Ray Tracing
```python
# Lambda function with tracing
import aws_xray_sdk.core as xray
from aws_xray_sdk.core import patch_all

patch_all()

@xray.capture()
def lambda_handler(event, context):
    # Your function code
    pass
```

## Migration Strategy

### Phase 1: Preparation (Week 1)
1. Set up AWS account and IAM
2. Create infrastructure with Terraform
3. Set up CI/CD pipeline
4. Configure monitoring

### Phase 2: Backend Migration (Week 2)
1. Adapt Django for Lambda
2. Migrate database to Aurora
3. Set up Cognito authentication
4. Test API endpoints

### Phase 3: Frontend Deployment (Week 3)
1. Configure S3 and CloudFront
2. Update API endpoints
3. Deploy frontend
4. Test integration

### Phase 4: Optimization (Week 4)
1. Performance tuning
2. Security hardening
3. Cost optimization
4. Documentation

## Benefits of This Architecture

### 1. Scalability
- **Auto-scaling**: Handles traffic spikes automatically
- **Global distribution**: CloudFront edge locations
- **Database scaling**: Aurora Serverless v2

### 2. Cost Efficiency
- **Pay-per-use**: Only pay for actual usage
- **No idle costs**: No charges when not in use
- **Optimized resources**: Right-sized for workload

### 3. Reliability
- **High availability**: Multi-AZ deployment
- **Fault tolerance**: Automatic failover
- **Backup**: Automated backups and recovery

### 4. Security
- **AWS managed**: Security patches and updates
- **Encryption**: End-to-end encryption
- **Compliance**: SOC, PCI, HIPAA compliance

## Next Steps

1. **Immediate**: Set up AWS account and basic infrastructure
2. **Short-term**: Migrate backend to Lambda
3. **Medium-term**: Deploy frontend and integrate
4. **Long-term**: Optimize and scale

This serverless architecture will provide a robust, scalable, and cost-effective solution for your FEM Family Business Directory application. 