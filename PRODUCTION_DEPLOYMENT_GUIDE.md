# 🚀 Production Deployment Guide

## Overview
This guide will help you deploy your FEM Family Business Directory to production:
- **Backend (Django)**: Railway
- **Frontend (React)**: Vercel
- **Database**: Railway PostgreSQL
- **File Storage**: AWS S3

## 📋 Prerequisites

### 1. Railway Account
- Sign up at [railway.app](https://railway.app)
- Install Railway CLI: `npm install -g @railway/cli`

### 2. Vercel Account
- Sign up at [vercel.com](https://vercel.com)
- Install Vercel CLI: `npm install -g vercel`

### 3. AWS Account
- S3 bucket for file storage
- IAM user with S3 permissions

## 🚀 Backend Deployment (Railway)

### Step 1: Create Railway Project
```bash
cd backend
railway login
railway init
```

### Step 2: Add PostgreSQL Database
```bash
railway add
# Select PostgreSQL
```

### Step 3: Set Environment Variables
Copy from `env.railway.template` and set in Railway dashboard:

**Required Variables:**
- `SECRET_KEY` - Generate a secure Django secret key
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_STORAGE_BUCKET_NAME` - Your S3 bucket name
- `EMAIL_HOST_USER` - ZeptoMail username
- `EMAIL_HOST_PASSWORD` - ZeptoMail password
- `SMS_API_KEY` - Ndovubase API key

**Railway Auto-provided:**
- `DATABASE_URL` - Automatically set by Railway

### Step 4: Deploy
```bash
railway up
```

### Step 5: Run Migrations
```bash
railway run python manage.py migrate
railway run python manage.py collectstatic --noinput
```

### Step 6: Create Superuser
```bash
railway run python manage.py createsuperuser
```

## 🌐 Frontend Deployment (Vercel)

### Step 1: Update Environment Variables
Copy `env.production.template` to `.env.production` and update:
```bash
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_WS_URL=wss://your-railway-app.railway.app/ws
```

### Step 2: Deploy to Vercel
```bash
vercel --prod
```

## 🔧 Post-Deployment Setup

### 1. Test API Endpoints
- Health check: `https://your-app.railway.app/api/`
- Categories: `https://your-app.railway.app/api/categories/`

### 2. Test Frontend
- Visit your Vercel domain
- Test user registration and login
- Test business creation and reviews

### 3. Monitor Logs
```bash
# Railway logs
railway logs

# Vercel logs
vercel logs
```

## 🚨 Important Security Notes

### 1. Environment Variables
- Never commit `.env` files to git
- Use Railway's secure environment variable storage
- Rotate secrets regularly

### 2. CORS Configuration
- Update `CORS_ALLOWED_ORIGINS` with your Vercel domain
- Remove `CORS_ALLOW_ALL_ORIGINS = True` in production

### 3. Database Security
- Railway provides secure database connections
- Use connection pooling for better performance

## 📊 Monitoring & Maintenance

### 1. Health Checks
- Railway automatically monitors your app
- Set up external monitoring (UptimeRobot, etc.)

### 2. Database Backups
- Railway provides automatic PostgreSQL backups
- Consider additional backup strategies

### 3. Performance Monitoring
- Monitor API response times
- Set up error tracking (Sentry, etc.)

## 🔄 Update Process

### Backend Updates
```bash
cd backend
git pull origin main
railway up
railway run python manage.py migrate
```

### Frontend Updates
```bash
git pull origin main
vercel --prod
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check `DATABASE_URL` in Railway
   - Verify PostgreSQL service is running

2. **Static Files Not Loading**
   - Check S3 bucket permissions
   - Verify `AWS_*` environment variables

3. **CORS Errors**
   - Update `CORS_ALLOWED_ORIGINS` with Vercel domain
   - Check browser console for specific errors

4. **Email/SMS Not Working**
   - Verify API credentials
   - Check service quotas and limits

### Getting Help
- Railway documentation: [docs.railway.app](https://docs.railway.app)
- Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Django deployment: [docs.djangoproject.com/en/stable/howto/deployment/](https://docs.djangoproject.com/en/stable/howto/deployment/)

## 🎯 Success Checklist

- [ ] Backend deployed to Railway
- [ ] Database migrations completed
- [ ] Superuser created
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] User registration working
- [ ] Business creation working
- [ ] Review system working
- [ ] File uploads working
- [ ] Email/SMS working
- [ ] CORS configured properly
- [ ] SSL certificates active
- [ ] Monitoring set up

## 🚀 Ready for Production!

Your FEM Family Business Directory is now deployed and ready for production use!
