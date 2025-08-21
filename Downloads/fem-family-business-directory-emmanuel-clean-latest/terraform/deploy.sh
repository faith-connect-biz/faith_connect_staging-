#!/bin/bash

# FEM Family Business Directory - AWS Serverless Deployment Script
# This script automates the deployment of the infrastructure using Terraform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command_exists aws; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Terraform is installed
    if ! command_exists terraform; then
        print_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Function to create S3 bucket for Terraform state
create_terraform_state_bucket() {
    print_status "Creating S3 bucket for Terraform state..."
    
    BUCKET_NAME="fem-terraform-state-$(aws sts get-caller-identity --query Account --output text)"
    REGION="us-east-1"
    
    # Check if bucket already exists
    if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
        print_warning "S3 bucket $BUCKET_NAME already exists."
    else
        # Create bucket
        aws s3api create-bucket \
            --bucket "$BUCKET_NAME" \
            --region "$REGION" \
            --create-bucket-configuration LocationConstraint="$REGION"
        
        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "$BUCKET_NAME" \
            --versioning-configuration Status=Enabled
        
        # Enable encryption
        aws s3api put-bucket-encryption \
            --bucket "$BUCKET_NAME" \
            --server-side-encryption-configuration '{
                "Rules": [
                    {
                        "ApplyServerSideEncryptionByDefault": {
                            "SSEAlgorithm": "AES256"
                        }
                    }
                ]
            }'
        
        print_success "S3 bucket $BUCKET_NAME created successfully!"
    fi
}

# Function to initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    
    # Initialize Terraform
    terraform init
    
    print_success "Terraform initialized successfully!"
}

# Function to plan Terraform deployment
plan_terraform() {
    print_status "Planning Terraform deployment..."
    
    # Create terraform.tfvars if it doesn't exist
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found. Creating default configuration..."
        cat > terraform.tfvars << EOF
# Terraform variables for FEM Family Business Directory
aws_region = "us-east-1"
environment = "prod"
domain_name = "your-domain.com"  # Change this to your actual domain

# Optional: Override defaults
# lambda_timeout = 30
# lambda_memory_size = 1024
# rds_min_capacity = 0.5
# rds_max_capacity = 16
EOF
        print_warning "Please edit terraform.tfvars with your actual domain name and other settings."
        read -p "Press Enter to continue after editing terraform.tfvars..."
    fi
    
    # Plan Terraform deployment
    terraform plan -out=tfplan
    
    print_success "Terraform plan created successfully!"
}

# Function to apply Terraform deployment
apply_terraform() {
    print_status "Applying Terraform deployment..."
    
    # Check if plan exists
    if [ ! -f "tfplan" ]; then
        print_error "Terraform plan not found. Please run the plan step first."
        exit 1
    fi
    
    # Apply Terraform deployment
    terraform apply tfplan
    
    print_success "Terraform deployment completed successfully!"
}

# Function to show outputs
show_outputs() {
    print_status "Showing Terraform outputs..."
    
    terraform output
    
    print_success "Deployment completed! Please note the outputs above."
}

# Function to create deployment package for Lambda
create_lambda_package() {
    print_status "Creating Lambda deployment package..."
    
    # Check if backend directory exists
    if [ ! -d "../backend" ]; then
        print_error "Backend directory not found. Please ensure the Django backend is in the ../backend directory."
        exit 1
    fi
    
    # Create lambda.zip
    cd ../backend
    
    # Install dependencies
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        pip install -r requirements.txt -t .
    fi
    
    # Create lambda.zip
    print_status "Creating lambda.zip..."
    zip -r lambda.zip . -x "*.git*" "*.pyc" "__pycache__/*" "*.DS_Store"
    
    cd ../terraform
    
    print_success "Lambda deployment package created successfully!"
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to S3..."
    
    # Check if frontend build exists
    if [ ! -d "../dist" ]; then
        print_warning "Frontend build not found. Building frontend..."
        cd ..
        npm run build
        cd terraform
    fi
    
    # Get S3 bucket name from Terraform output
    BUCKET_NAME=$(terraform output -raw frontend_bucket 2>/dev/null || echo "")
    
    if [ -z "$BUCKET_NAME" ]; then
        print_error "Could not get S3 bucket name from Terraform output. Please ensure infrastructure is deployed."
        exit 1
    fi
    
    # Sync frontend to S3
    aws s3 sync ../dist/ s3://"$BUCKET_NAME" --delete
    
    # Invalidate CloudFront cache
    DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
    
    if [ -n "$DISTRIBUTION_ID" ]; then
        print_status "Invalidating CloudFront cache..."
        aws cloudfront create-invalidation \
            --distribution-id "$DISTRIBUTION_ID" \
            --paths "/*"
    fi
    
    print_success "Frontend deployed successfully!"
}

# Function to show deployment status
show_deployment_status() {
    print_status "Checking deployment status..."
    
    echo ""
    echo "=== DEPLOYMENT STATUS ==="
    echo ""
    
    # Check S3 bucket
    BUCKET_NAME=$(terraform output -raw frontend_bucket 2>/dev/null || echo "Not deployed")
    echo "Frontend S3 Bucket: $BUCKET_NAME"
    
    # Check CloudFront distribution
    DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "Not deployed")
    echo "CloudFront Distribution: $DISTRIBUTION_ID"
    
    # Check API Gateway
    API_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "Not deployed")
    echo "API Gateway URL: $API_URL"
    
    # Check RDS endpoint
    RDS_ENDPOINT=$(terraform output -raw rds_endpoint 2>/dev/null || echo "Not deployed")
    echo "RDS Endpoint: $RDS_ENDPOINT"
    
    # Check Cognito
    COGNITO_POOL_ID=$(terraform output -raw cognito_user_pool_id 2>/dev/null || echo "Not deployed")
    echo "Cognito User Pool: $COGNITO_POOL_ID"
    
    echo ""
    echo "=== NEXT STEPS ==="
    echo "1. Update your frontend environment variables with the API Gateway URL"
    echo "2. Configure your domain DNS to point to CloudFront"
    echo "3. Test the application endpoints"
    echo ""
}

# Function to destroy infrastructure
destroy_infrastructure() {
    print_warning "This will destroy all AWS resources created by Terraform!"
    read -p "Are you sure you want to continue? (yes/no): " -r
    
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_status "Destroying infrastructure..."
        terraform destroy -auto-approve
        print_success "Infrastructure destroyed successfully!"
    else
        print_status "Destroy cancelled."
    fi
}

# Function to show help
show_help() {
    echo "FEM Family Business Directory - AWS Serverless Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  check       - Check prerequisites"
    echo "  init        - Initialize Terraform"
    echo "  plan        - Plan Terraform deployment"
    echo "  apply       - Apply Terraform deployment"
    echo "  deploy      - Full deployment (init, plan, apply)"
    echo "  frontend    - Deploy frontend to S3"
    echo "  lambda      - Create Lambda deployment package"
    echo "  status      - Show deployment status"
    echo "  destroy     - Destroy infrastructure"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy      # Full deployment"
    echo "  $0 frontend    # Deploy only frontend"
    echo "  $0 status      # Check deployment status"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "check")
        check_prerequisites
        ;;
    "init")
        check_prerequisites
        create_terraform_state_bucket
        init_terraform
        ;;
    "plan")
        check_prerequisites
        plan_terraform
        ;;
    "apply")
        check_prerequisites
        apply_terraform
        show_outputs
        ;;
    "deploy")
        check_prerequisites
        create_terraform_state_bucket
        init_terraform
        plan_terraform
        apply_terraform
        show_outputs
        ;;
    "frontend")
        deploy_frontend
        ;;
    "lambda")
        create_lambda_package
        ;;
    "status")
        show_deployment_status
        ;;
    "destroy")
        destroy_infrastructure
        ;;
    "help"|*)
        show_help
        ;;
esac 