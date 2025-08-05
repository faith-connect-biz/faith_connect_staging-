# FEM Family Business Directory

A comprehensive business directory platform built for the Faith Connect community, enabling members to discover, connect with, and support trusted businesses within their faith network.

## 🚀 Features

- **Business Directory**: Browse and search businesses by category, location, and ratings
- **User Authentication**: Secure login/registration with partnership number system
- **Business Registration**: Easy business listing creation for community members
- **Real-time Chat**: Direct communication between users and businesses
- **Review System**: Community-driven ratings and reviews
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Admin Dashboard**: Comprehensive management tools for administrators

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Query** for data fetching
- **Framer Motion** for animations
- **GSAP** for advanced animations
- **Axios** for API communication

### Backend
- **Django 4.2** with Python
- **Django REST Framework** for API
- **PostgreSQL** for database
- **JWT Authentication** for security
- **CORS** support for cross-origin requests

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fem-family-business-directory
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file in the backend directory with:
# SECRET_KEY=your-secret-key
# DEBUG=True
# DATABASE_URL=postgresql://username:password@localhost:5432/fem_business_db
# ALLOWED_HOSTS=localhost,127.0.0.1

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/api`

### 4. Database Setup

1. Create a PostgreSQL database named `fem_business_db`
2. Update the `DATABASE_URL` in your backend `.env` file
3. Run migrations: `python manage.py migrate`

## 📁 Project Structure

```
fem-family-business-directory/
├── src/                          # Frontend source code
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Base UI components (shadcn/ui)
│   │   ├── layout/              # Layout components (Navbar, Footer)
│   │   ├── home/                # Home page components
│   │   └── directory/           # Directory page components
│   ├── pages/                   # Page components
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API services
│   └── types/                   # TypeScript type definitions
├── backend/                     # Django backend
│   ├── core/                    # Django project settings
│   ├── business/                # Business app
│   ├── user_auth/               # Authentication app
│   ├── utils/                   # Utility functions
│   └── templates/               # Django templates
├── public/                      # Static assets
└── terraform/                   # Infrastructure as Code
```

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

#### Backend
```bash
python manage.py runserver     # Start development server
python manage.py migrate       # Run database migrations
python manage.py makemigrations # Create new migrations
python manage.py collectstatic # Collect static files
python manage.py createsuperuser # Create admin user
```

### Environment Variables

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_NAME=FEM Family Business Directory
VITE_APP_VERSION=1.0.0
```

#### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://username:password@localhost:5432/fem_business_db
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8080
```

## 🗄️ Database

The application uses PostgreSQL with the following main models:

- **User**: Authentication and user profiles
- **Business**: Business listings and information
- **Category**: Business categories
- **Review**: User reviews and ratings
- **Product**: Business products/services

## 🔐 Authentication

The application uses JWT-based authentication with:
- Partnership number as username
- Password-based authentication
- Token refresh mechanism
- Role-based access control (Community/Business users)

## 🎨 UI Components

The project uses a custom design system built with:
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible primitives
- **shadcn/ui** for pre-built components
- Custom color palette and typography

### Color Palette
- **FEM Navy**: Primary brand color
- **FEM Terracotta**: Secondary brand color
- **FEM Gold**: Accent color
- **FEM Dark Gray**: Text color

## 📱 Responsive Design

The application is built with a mobile-first approach:
- Responsive grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes
- Progressive Web App features

## 🧪 Testing

### Frontend Testing
```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm test:watch
```

### Backend Testing
```bash
# Run Django tests
python manage.py test

# Run specific app tests
python manage.py test business
python manage.py test user_auth
```

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**

### Backend Deployment
The backend can be deployed to:
- **Render** (recommended)
- **Heroku**
- **AWS EC2**
- **DigitalOcean**

See `DEPLOYMENT_STATUS_SUMMARY.md` for detailed deployment information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📚 Documentation

- [Quick Start Guide](./QUICK_START_GUIDE.md)
- [Backend Integration Guide](./BACKEND_INTEGRATION_GUIDE.md)
- [Database Structure](./DATABASE_STRUCTURE.md)
- [Deployment Guide](./AWS_SERVERLESS_DEPLOYMENT_GUIDE.md)
- [Collaboration Plan](./COLLABORATION_PLAN.md)

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 8080 (frontend)
   npx kill-port 8080
   
   # Kill process on port 8000 (backend)
   npx kill-port 8000
   ```

2. **Database connection issues**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

3. **CORS errors**
   - Check `CORS_ALLOWED_ORIGINS` in backend `.env`
   - Ensure frontend URL is included

4. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Clear Vite cache: `npm run dev -- --force`

## 📞 Support

For support and questions:
- Check the documentation files in the root directory
- Review existing issues on GitHub
- Contact the development team

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**Built with ❤️ for the Faith Connect community**



