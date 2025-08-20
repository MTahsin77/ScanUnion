# Django Backend Migration Guide

This document outlines the complete migration from Next.js API routes to a Django REST Framework backend for the Students' Union Event Scanning System.

## 🎯 Migration Overview

### What Changed
- **Backend**: Migrated from Next.js API routes to Django REST Framework
- **Database**: Still uses MySQL, but now managed by Django ORM instead of Prisma
- **Authentication**: 
  - Admin users: JWT tokens instead of NextAuth
  - Scanner users: Still PIN-based but managed by Django
- **API Structure**: RESTful endpoints with proper HTTP methods and status codes

### What Stayed the Same
- **Frontend**: React/Next.js with TailwindCSS
- **Database Schema**: Same tables and relationships
- **User Experience**: Identical functionality and UI

## 🚀 Setup Instructions

### 1. Backend Setup (Django)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env
# Edit .env with your database credentials

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver 8000
```

### 2. Frontend Setup

```bash
# In the root directory, update environment file
cp env.example .env.local
# Edit .env.local to point to Django backend: NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api"

# Install dependencies (if needed)
npm install

# Start Next.js development server
npm run dev
```

## 📡 API Endpoints Comparison

### Authentication

| Old (Next.js) | New (Django) | Method | Description |
|---------------|--------------|---------|-------------|
| `/api/auth/login` | `/api/auth/login/` | POST | Login for both admin and scanner users |
| `/api/auth/change-password` | `/api/auth/change-password/` | POST | Change password for admin users |
| N/A | `/api/auth/profile/` | GET | Get current user profile |

### Users Management

| Old (Next.js) | New (Django) | Method | Description |
|---------------|--------------|---------|-------------|
| `/api/users` | `/api/users/` | GET | List all users |
| `/api/users` | `/api/users/` | POST | Create new user |
| `/api/users/[id]` | `/api/users/{id}/` | GET | Get user details |
| `/api/users/[id]` | `/api/users/{id}/` | PUT | Update user |
| `/api/users/[id]` | `/api/users/{id}/` | DELETE | Delete user |

### Events Management

| Old (Next.js) | New (Django) | Method | Description |
|---------------|--------------|---------|-------------|
| `/api/events` | `/api/events/` | GET | List events |
| `/api/events` | `/api/events/` | POST | Create event |
| `/api/events/[id]` | `/api/events/{id}/` | GET | Get event with stats |
| `/api/events/[id]` | `/api/events/{id}/` | PUT | Update event |
| `/api/events/[id]` | `/api/events/{id}/` | DELETE | Delete event |

### Scan Logs

| Old (Next.js) | New (Django) | Method | Description |
|---------------|--------------|---------|-------------|
| `/api/scan-logs` | `/api/scan-logs/` | GET | List scan logs |
| `/api/scan-logs` | `/api/scan-logs/` | POST | Create scan log |
| N/A | `/api/scan-logs/{id}/` | GET | Get scan log details |

## 🔧 Key Technical Changes

### 1. Authentication
- **Admin Users**: Now use JWT tokens stored in localStorage
- **Scanner Users**: PIN-based authentication (no tokens needed)
- **Authorization Headers**: Admin requests include `Authorization: Bearer <token>`

### 2. Data Format Changes
- **Field Names**: Some fields use snake_case (e.g., `is_first_login` instead of `isFirstLogin`)
- **IDs**: Still use custom UUID-like strings
- **Timestamps**: ISO format with timezone information

### 3. Error Handling
- **HTTP Status Codes**: Proper REST status codes (200, 201, 400, 401, 404, 500)
- **Error Format**: `{"error": "Error message"}` or `{"detail": "Error message"}`

### 4. Frontend Changes
- **API Client**: New `@/lib/api.ts` utility for making requests
- **Page Components**: Converted from server to client components
- **Loading States**: Added proper loading and error states

## 🗂️ File Structure Changes

### New Backend Files
```
backend/
├── manage.py
├── requirements.txt
├── env.example
├── run.py                 # Quick start script
├── core/
│   ├── settings.py        # Django configuration
│   ├── urls.py           # URL routing
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── users/            # User management
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── authentication.py
│   │   └── permissions.py
│   ├── events/           # Event management
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   └── scans/           # Scan logging
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
```

### Modified Frontend Files
```
src/
├── lib/
│   └── api.ts           # New API client utility
├── app/
│   ├── admin/
│   │   ├── page.tsx     # Now client component
│   │   ├── events/page.tsx
│   │   └── settings/page.tsx
│   └── scan/
│       └── events/
│           ├── page.tsx
│           └── [id]/page.tsx
└── components/
    ├── auth/            # Updated authentication components
    ├── admin/           # Updated admin components
    └── scan/            # Updated scanner components
```

## 🧪 Testing the Migration

### 1. Start Both Servers
```bash
# Terminal 1: Django Backend
cd backend
source venv/bin/activate
python manage.py runserver 8000

# Terminal 2: Next.js Frontend
npm run dev
```

### 2. Test Admin Flow
1. Go to `http://localhost:9002/login`
2. Click "Are you an Admin?"
3. Login with admin credentials
4. Test event creation, user management, etc.

### 3. Test Scanner Flow
1. Go to `http://localhost:9002/login`
2. Enter scanner PIN
3. Select event and test scanning

### 4. API Testing
Use tools like Postman or curl to test API endpoints directly:

```bash
# Test scanner login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'

# Test admin login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Test events list (with auth token)
curl -X GET http://localhost:8000/api/events/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔄 Migration Benefits

### Performance
- **Reduced latency**: Direct database queries instead of Next.js serverless functions
- **Better caching**: Django's built-in caching mechanisms
- **Optimized queries**: Django ORM query optimization

### Scalability
- **Separate concerns**: Frontend and backend can be scaled independently
- **Database pooling**: Better connection management
- **Production ready**: Django's mature ecosystem

### Development
- **API versioning**: Easier to version and maintain APIs
- **Admin interface**: Django admin for data management
- **Testing**: Better testing tools and frameworks

### Security
- **CORS handling**: Proper CORS configuration
- **Authentication**: Robust JWT implementation
- **Permissions**: Role-based access control

## 🚨 Potential Issues & Solutions

### CORS Issues
If you see CORS errors:
1. Check `CORS_ALLOWED_ORIGINS` in Django settings
2. Ensure frontend URL is included
3. Verify `CORS_ALLOW_CREDENTIALS = True`

### Authentication Issues
If JWT tokens aren't working:
1. Check token expiration in Django settings
2. Verify Authorization header format: `Bearer <token>`
3. Ensure localStorage is storing tokens correctly

### Database Issues
If migrations fail:
1. Ensure MySQL server is running
2. Check database credentials in `.env`
3. Create database manually if needed: `CREATE DATABASE event_scanning;`

## 📚 Next Steps

1. **Remove Old Code**: Delete Next.js API routes and Prisma files
2. **Environment Setup**: Configure production environment variables
3. **Deployment**: Set up Django production deployment (gunicorn, nginx)
4. **Monitoring**: Add logging and monitoring for the Django backend
5. **Testing**: Write comprehensive tests for API endpoints

## 🆘 Support

If you encounter issues during migration:
1. Check the Django server logs for detailed error messages
2. Verify environment variables are correctly set
3. Ensure both frontend and backend are running on correct ports
4. Check browser developer tools for network request failures

The migration maintains all existing functionality while providing a more robust, scalable backend architecture.
