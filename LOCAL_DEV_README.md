# FEM Connect - Local Development Setup

## 🚀 Quick Start

### 1. Run the Local Development Server
```bash
python3 run_local.py
```

Or use the standard Django command:
```bash
python3 manage.py runserver --settings=core.settings.dev
```

### 2. Access the Application
- **Main App**: http://127.0.0.1:8000
- **Admin Panel**: http://127.0.0.1:8000/admin
- **API Endpoints**: http://127.0.0.1:8000/api/

## 🔧 Development Features

### Email & SMS Simulation
- **Emails**: Printed to console (no live emails sent)
- **SMS**: Simulated (no live SMS sent)
- **OTP**: Generated and displayed in console for testing

### Database
- **SQLite**: Uses `db.sqlite3` file
- **No external database required**
- **All migrations applied**

### CORS
- **Localhost**: Enabled for ports 3000, 5173, 8080
- **Frontend**: Can connect from any local port

## 📱 Testing OTP System

### Registration Flow
1. Register a new user via API
2. Check console for OTP code
3. Use the OTP to verify the account
4. No live SMS/email will be sent

### Console Output Example
```
📧 Simulated: Token 123456 sent to email user@example.com
📱 Simulated: OTP 123456 sent to +1234567890
```

## 🛠️ Configuration

### Settings File
- **Development**: `core/settings/dev.py`
- **Overrides**: Email backend, SMS simulation, local CORS

### Environment Variables
- **Not required** for local development
- **All services simulated** by default

## 🧹 Cleanup

### Unverified Accounts
- Unverified users remain in database
- Can be cleaned up later with cron jobs
- No immediate cleanup needed for development

### Database
- **SQLite file**: `db.sqlite3`
- **Can be deleted** to start fresh
- **Migrations will recreate** all tables

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Database Issues
```bash
# Reset database
rm db.sqlite3
python3 manage.py migrate --settings=core.settings.dev
```

### Import Errors
```bash
# Install dependencies
pip3 install -r requirements.txt
```

## 📝 Notes

- **No live services** configured
- **All external APIs disabled**
- **Perfect for development and testing**
- **Production settings** in separate files
