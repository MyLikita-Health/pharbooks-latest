# MediLinka Setup Guide

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Quick Setup

### 1. Clone and Install Dependencies

\`\`\`bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run setup:backend
\`\`\`

### 2. Database Setup

\`\`\`bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE medilinka_dev;
exit

# Copy environment file
cp server/.env.example server/.env

# Edit server/.env with your database credentials
# DB_USERNAME=root
# DB_PASSWORD=your_password
# DB_NAME=medilinka_dev
# DB_HOST=localhost
# DB_PORT=3306

# Run migrations and seed data
npm run setup:db
\`\`\`

### 3. Environment Configuration

\`\`\`bash
# Copy frontend environment file
cp .env.local.example .env.local

# Edit .env.local if needed (defaults should work)
\`\`\`

### 4. Start Development Servers

\`\`\`bash
# Start both frontend and backend
npm run dev:full

# OR start separately:
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
npm run dev:backend
\`\`\`

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medilinka.com | password123 |
| Doctor | dr.smith@medilinka.com | password123 |
| Pharmacist | pharmacist@medilinka.com | password123 |
| Patient | patient@medilinka.com | password123 |

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### User Management
- `GET /api/users` - Get all users (admin)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PATCH /api/users/:id/approval` - Approve/reject user

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Book appointment
- `PATCH /api/appointments/:id/status` - Update status

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription
- `PATCH /api/prescriptions/:id/status` - Update status

### Pharmacy
- `GET /api/pharmacy/orders` - Get pharmacy orders
- `POST /api/pharmacy/orders` - Create order
- `PATCH /api/pharmacy/orders/:id/status` - Update order

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

## Troubleshooting

### Database Connection Issues
\`\`\`bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1"
\`\`\`

### Port Conflicts
\`\`\`bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
\`\`\`

### Reset Database
\`\`\`bash
npm run setup:db
\`\`\`

## Production Deployment

### Environment Variables
Set these in production:
- `NODE_ENV=production`
- `JWT_SECRET=your-secure-secret`
- `DB_HOST=your-db-host`
- `DB_SSL=true`

### Build Commands
\`\`\`bash
# Frontend
npm run build
npm start

# Backend
cd server
npm start
\`\`\`
