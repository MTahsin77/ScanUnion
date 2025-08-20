# Event Scanning System - Frontend

React/Next.js frontend for the Students' Union Event Scanning System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on port 8000

### Installation
```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env.local

# Start development server
npm run dev
```

The frontend will be available at: http://localhost:9002

## 🔧 Configuration

### Environment Variables
Create `.env.local` file with:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME="Event Scanning System"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

## 📱 Features

### Admin Interface
- Event management dashboard
- User management
- Real-time scanning analytics
- Export capabilities

### Scanner Interface
- PIN-based login
- Event selection
- Student ID scanning
- Offline support

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with React 18
- **Styling**: TailwindCSS with Radix UI components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **API**: Custom API client for Django backend integration

## 📜 Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── scan/              # Scanner interface pages
│   │   └── login/             # Authentication pages
│   ├── components/            # React components
│   │   ├── admin/             # Admin-specific components
│   │   ├── auth/              # Authentication components
│   │   ├── scan/              # Scanner-specific components
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utilities and configurations
│       ├── api.ts             # Django API client
│       ├── types.ts           # TypeScript type definitions
│       └── utils.ts           # Helper functions
├── public/                    # Static assets
└── package.json
```

## 🔗 API Integration

The frontend communicates with the Django backend through a custom API client (`src/lib/api.ts`) that handles:

- Authentication (JWT tokens for admins, PIN for scanners)
- Error handling and retry logic
- Request/response transformation
- CORS configuration

## 🎨 UI Components

Built with:
- **Radix UI**: Accessible component primitives
- **TailwindCSS**: Utility-first CSS framework
- **Custom components**: Tailored for the event scanning workflow

## 🔐 Authentication

Two types of authentication:
1. **Admin Users**: Email/password with JWT tokens
2. **Scanner Users**: PIN-based authentication

Authentication state is managed through localStorage and automatically included in API requests.

## 📊 Features Overview

### Admin Dashboard
- Live event statistics
- Scanner performance metrics
- User management tools
- Event creation and editing

### Scanner Interface
- Simple PIN login
- Event selection tiles
- Real-time scan feedback
- Offline scan queue

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend is running on port 8000
   - Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check JWT token expiration

3. **CORS Errors**
   - Ensure backend CORS settings include frontend URL
   - Check browser console for specific CORS errors

4. **Build Errors**
   - Run `npm run typecheck` to identify TypeScript issues
   - Check for missing dependencies with `npm install`

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
1. Set production API URL in environment variables
2. Configure proper CORS origins in Django backend
3. Set up SSL/HTTPS for production use

## 🤝 Development

### Code Style
- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting (configure in your editor)

### Component Development
- Use TypeScript for all components
- Follow React best practices
- Implement proper error boundaries
- Add loading states for async operations

## 📚 Documentation

- [Main Project README](../README.md)
- [Backend Documentation](../backend/README.md)
- [Django Migration Guide](../DJANGO_MIGRATION.md)
