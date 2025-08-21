#!/bin/bash

# 🚀 FEM Family Business Directory - Production Deployment Script
# This script helps you deploy to Railway and Vercel

echo "🚀 Starting Production Deployment..."

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking deployment requirements..."
    
    # Check Railway CLI
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI not found. Install with: npm install -g @railway/cli"
        exit 1
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Install with: npm install -g vercel"
        exit 1
    fi
    
    # Check if logged in to Railway
    if ! railway whoami &> /dev/null; then
        print_error "Not logged in to Railway. Run: railway login"
        exit 1
    fi
    
    # Check if logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_error "Not logged in to Vercel. Run: vercel login"
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Deploy backend to Railway
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    cd backend
    
    # Check if Railway project exists
    if [ ! -f "railway.json" ]; then
        print_error "railway.json not found. Run: railway init"
        exit 1
    fi
    
    # Deploy to Railway
    print_status "Running railway up..."
    if railway up; then
        print_success "Backend deployed to Railway!"
        
        # Get the Railway URL
        RAILWAY_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
        if [ ! -z "$RAILWAY_URL" ]; then
            print_success "Railway URL: $RAILWAY_URL"
            echo "RAILWAY_URL=$RAILWAY_URL" > ../.railway_url
        fi
    else
        print_error "Backend deployment failed!"
        exit 1
    fi
    
    cd ..
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    # Check if Railway URL is available
    if [ -f ".railway_url" ]; then
        source .railway_url
        print_status "Using Railway URL: $RAILWAY_URL"
        
        # Update environment variables
        if [ -f "env.production.template" ]; then
            cp env.production.template .env.production
            sed -i "s|https://your-railway-app-name.railway.app|$RAILWAY_URL|g" .env.production
            print_success "Environment variables updated with Railway URL"
        fi
    else
        print_warning "Railway URL not found. Please update .env.production manually."
    fi
    
    # Deploy to Vercel
    print_status "Running vercel --prod..."
    if vercel --prod; then
        print_success "Frontend deployed to Vercel!"
    else
        print_error "Frontend deployment failed!"
        exit 1
    fi
}

# Run migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd backend
    
    if railway run python manage.py migrate; then
        print_success "Database migrations completed!"
    else
        print_error "Database migrations failed!"
        exit 1
    fi
    
    if railway run python manage.py collectstatic --noinput; then
        print_success "Static files collected!"
    else
        print_warning "Static files collection failed (this is usually OK)"
    fi
    
    cd ..
}

# Create superuser
create_superuser() {
    print_status "Creating superuser..."
    
    cd backend
    
    print_warning "You will be prompted to enter superuser credentials..."
    if railway run python manage.py createsuperuser; then
        print_success "Superuser created successfully!"
    else
        print_warning "Superuser creation failed or was cancelled"
    fi
    
    cd ..
}

# Main deployment flow
main() {
    echo "🎯 FEM Family Business Directory - Production Deployment"
    echo "======================================================"
    echo ""
    
    # Check requirements
    check_requirements
    
    # Deploy backend
    deploy_backend
    
    # Run migrations
    run_migrations
    
    # Deploy frontend
    deploy_frontend
    
    # Create superuser
    create_superuser
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test your API endpoints"
    echo "2. Test user registration and login"
    echo "3. Test business creation and reviews"
    echo "4. Set up monitoring and alerts"
    echo ""
    echo "📚 For more information, see: PRODUCTION_DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@"
