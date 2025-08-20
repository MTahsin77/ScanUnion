# Event Scanning System - Django Backend

This is the Django backend for the Students' Union Event Scanning System.

## Features

- User management (Admins and Scanners)
- Event management with user assignments
- Scan logging with duplicate detection
- JWT authentication for admins
- PIN-based authentication for scanners
- RESTful API endpoints
- Real-time scanning statistics

## Technology Stack

- **Framework**: Django 5.0.6 with Django REST Framework
- **Database**: MySQL
- **Authentication**: JWT tokens (admins) + PIN-based (scanners)
- **CORS**: Configured for frontend integration

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy the environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` file with your database credentials and other settings.

### 4. Database Setup

Make sure MySQL is running and create the database:

```sql
CREATE DATABASE event_scanning;
```

Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

### 6. Run the Development Server

```bash
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Login (PIN for scanners, email/password for admins)
- `POST /api/auth/change-password/` - Change password (admins only)
- `GET /api/auth/profile/` - Get current user profile

### Users
- `GET /api/users/` - List users (admins only)
- `POST /api/users/` - Create user (admins only)
- `GET /api/users/{id}/` - Get user details (admins only)
- `PUT /api/users/{id}/` - Update user (admins only)
- `DELETE /api/users/{id}/` - Delete user (admins only)

### Events
- `GET /api/events/` - List events
- `POST /api/events/` - Create event (admins only)
- `GET /api/events/{id}/` - Get event details with stats
- `PUT /api/events/{id}/` - Update event (admins only)
- `DELETE /api/events/{id}/` - Delete event (admins only)

Query parameters:
- `?userId={id}` - Filter events by assigned user
- `?includeStats=true` - Include scanning statistics

### Scan Logs
- `GET /api/scan-logs/` - List scan logs
- `POST /api/scan-logs/` - Create scan log
- `GET /api/scan-logs/{id}/` - Get scan log details

Query parameters:
- `?eventId={id}` - Filter by event
- `?scannerId={id}` - Filter by scanner
- `?status={status}` - Filter by status (SUCCESS, DUPLICATE, ERROR)

## Authentication

### Admin Users
- Use JWT tokens for authentication
- Login with email and password
- Include `Authorization: Bearer <token>` header in requests

### Scanner Users
- Use PIN-based authentication
- Login with PIN only
- No additional headers required for subsequent requests

## Database Models

### User
- Manages both admin and scanner users
- PIN-based authentication for scanners
- Email/password authentication for admins
- Role-based permissions

### Event
- Event information and settings
- Status tracking (UPCOMING, ONGOING, COMPLETED)
- Scanner assignments with locations

### EventUser
- Junction table for event-user assignments
- Includes location information for each assignment

### ScanLog
- Records all scan attempts
- Automatic duplicate detection
- Status tracking (SUCCESS, DUPLICATE, ERROR)

## Development

### Adding New Features

1. Create new models in the appropriate app
2. Add serializers for API representation
3. Create views for API endpoints
4. Add URL patterns
5. Write tests
6. Update documentation

### Database Migrations

After model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Admin Interface

Access the Django admin at `http://localhost:8000/admin/` to manage data through a web interface.

## Production Deployment

1. Set `DEBUG=False` in environment
2. Configure proper `SECRET_KEY`
3. Set up proper database credentials
4. Configure static file serving
5. Set up proper CORS origins
6. Use a production WSGI server (gunicorn, uwsgi, etc.)

## API Testing

You can test the API using tools like:
- Postman
- curl
- Django REST Framework browsable API (when DEBUG=True)

Example login request:

```bash
# Scanner login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'

# Admin login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```
