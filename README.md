# Students' Union Event Scanning System

A comprehensive event management and attendance tracking system with a modern web interface for administrators and a simple scanning interface for event staff.

## 🎯 Features

### For Administrators
- **Event Management**: Create, edit, and manage events with full details
- **User Management**: Manage scanner users and admin accounts
- **Live Dashboard**: Real-time scanning statistics and analytics
- **Performance Analytics**: Track scanner performance and attendance trends
- **User Assignment**: Assign scanners to specific events and locations

### For Scanner Users
- **PIN-based Login**: Quick and secure access with 4-6 digit PINs
- **Event Selection**: View assigned events and start scanning
- **Student ID Scanning**: Manual entry with duplicate detection
- **Real-time Feedback**: Immediate confirmation of scan results
- **Offline Support**: Local storage for when network is unavailable

## 🏗️ Architecture

This system uses a modern separated architecture:

- **Frontend**: Next.js React application with TailwindCSS
- **Backend**: Django REST Framework API
- **Database**: MySQL for data persistence
- **Authentication**: JWT tokens for admins, PIN-based for scanners

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- MAMP (or MySQL 8.0+)

### 1. Start MAMP
1. Install and start MAMP
2. Create a new database called `event_scanning` in phpMyAdmin
3. Note the MySQL port (usually 8889 for MAMP)

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env if needed (MAMP defaults are pre-configured)
python manage.py migrate
python manage.py runserver 8000
```

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
cp env.example .env.local
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:9002
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **MAMP phpMyAdmin**: http://localhost/phpMyAdmin/ (usually)

## 📖 Documentation

- [**Django Migration Guide**](./DJANGO_MIGRATION.md) - Complete migration documentation
- [**Backend README**](./backend/README.md) - Django backend setup and API docs
- [**Frontend README**](./frontend/README.md) - Frontend setup and development guide

## 🔧 Development

### Running Both Servers
```bash
# Terminal 1: Django Backend
cd backend
source venv/bin/activate
python manage.py runserver 8000

# Terminal 2: Next.js Frontend  
cd frontend
npm run dev
```

### Project Structure
```
event-scanning-system/
├── frontend/           # Next.js React application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # Django REST API
│   ├── apps/          # Django applications
│   ├── core/          # Django settings
│   └── requirements.txt # Backend dependencies
├── README.md          # This file
└── DJANGO_MIGRATION.md # Migration documentation
```

## 🎨 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Django 5.0.6 with Django REST Framework
- **UI Framework**: TailwindCSS with Radix UI components
- **Database**: MySQL with Django ORM
- **Charts**: Recharts for data visualization
- **Authentication**: JWT for admins, PIN-based for scanners
- **Forms**: React Hook Form with Zod validation

## 📱 User Interfaces

### Admin Interface
- Modern dashboard with event analytics
- Comprehensive user and event management
- Real-time scanning statistics
- Export capabilities for attendance data

### Scanner Interface
- Clean, mobile-optimized design
- Large touch targets for quick interaction
- Visual feedback for scan results
- Offline-capable for reliability

## 🔐 Security Features

- **Role-based Access Control**: Separate permissions for admins and scanners
- **JWT Authentication**: Secure token-based auth for admin users
- **PIN Security**: Simple but effective scanner authentication
- **CORS Protection**: Proper cross-origin request handling
- **Input Validation**: Comprehensive validation on both frontend and backend

## 🚀 Deployment

### Production Checklist
1. **Database**: Set up production MySQL instance
2. **Django**: Configure for production (DEBUG=False, proper SECRET_KEY)
3. **Frontend**: Build and deploy Next.js application
4. **CORS**: Configure proper allowed origins
5. **SSL**: Enable HTTPS for security
6. **Environment Variables**: Set all required production variables

## 📊 API Documentation

The Django backend provides a comprehensive REST API:

- **Authentication**: `/api/auth/` - Login, logout, profile management
- **Users**: `/api/users/` - User CRUD operations
- **Events**: `/api/events/` - Event management with statistics
- **Scan Logs**: `/api/scan-logs/` - Attendance tracking

See the [Backend README](./backend/README.md) for detailed API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the [Django Migration Guide](./DJANGO_MIGRATION.md)
2. Review the [Backend Documentation](./backend/README.md)
3. Check existing issues in the repository
4. Create a new issue with detailed information

## 🔄 Migration Notes

This project was migrated from a Next.js full-stack application to a separated Django backend + Next.js frontend architecture. See [DJANGO_MIGRATION.md](./DJANGO_MIGRATION.md) for complete migration details and benefits.
