# MySQL Database Setup Guide (MAMP)

## Prerequisites
- MAMP installed and running
- Node.js and npm installed

## 1. Install Dependencies

```bash
npm install prisma @prisma/client bcryptjs
npm install -D @types/bcryptjs
```

## 2. MAMP Configuration

### Start MAMP Services
1. Open MAMP application
2. Click "Start Servers" to start Apache and MySQL
3. Note the MySQL port (usually 8889 for MAMP)

### Access phpMyAdmin
- Open browser and go to: `http://localhost:8888/phpMyAdmin/`
- Default credentials: Username: `root`, Password: `root`

## 3. Create Database in phpMyAdmin

1. In phpMyAdmin, click "Databases" tab
2. Create new database: `scanunion_db`
3. Set collation to: `utf8mb4_unicode_ci`

## 4. Environment Variables

Create a `.env.local` file in the root directory with:

```env
# MAMP Database Configuration
DATABASE_URL="mysql://root:root@localhost:8889/scanunion_db"

# NextAuth.js Configuration (if using authentication)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
```

**Note**: MAMP typically uses:
- Username: `root`
- Password: `root` 
- Port: `8889` (not the standard 3306)

## 4. Generate Prisma Client

```bash
npx prisma generate
```

## 5. Run Database Migrations

```bash
npx prisma db push
```

## 6. Seed the Database (Optional)

```bash
npx prisma db seed
```

This will create:
- Default admin user (admin@scanunion.com / admin123)
- Sample scanner users with PINs
- Sample events
- Sample scan logs

## 7. View Database (Optional)

```bash
npx prisma studio
```

## Database Schema Overview

### Tables:
- **users**: Admin and scanner users with authentication
- **events**: Event information and settings
- **event_users**: User assignments to events with locations
- **scan_logs**: Individual scan records with timestamps

### Key Features:
- Role-based access (ADMIN/USER)
- Event-user assignments with optional locations
- Comprehensive scan logging
- First-login password change tracking
- Cascading deletes for data integrity

## Backup and Restore

### Backup:
```bash
mysqldump -u username -p scanunion_db > backup.sql
```

### Restore:
```bash
mysql -u username -p scanunion_db < backup.sql
```
