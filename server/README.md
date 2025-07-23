# MediLinka Server

Backend server for the MediLinka Healthcare Management System, built with Node.js, Express, and WebSocket support for real-time video calling.

## Features

- **RESTful API** for healthcare management
- **WebSocket Signaling Server** for video calls
- **JWT Authentication** with role-based access
- **SQLite Database** with Sequelize ORM
- **Real-time Notifications** 
- **File Upload Support**
- **Rate Limiting & Security**
- **Comprehensive Logging**

## Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

\`\`\`bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed

# Start development server
npm run dev
\`\`\`

The server will start on `http://localhost:5000` with WebSocket signaling available at `ws://localhost:5000/signaling`.

## Environment Variables

Create a `.env` file in the server directory:

\`\`\`env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_PATH=./uploads
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/doctors` - Get all doctors
- `PATCH /api/users/:id/approval` - Approve/reject user

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Book appointment (patient)
- `POST /api/appointments/doctor-create` - Create appointment (doctor)
- `PATCH /api/appointments/:id/status` - Update appointment status
- `PATCH /api/appointments/:id` - Update appointment details
- `GET /api/appointments/:id/meeting` - Get meeting details

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription
- `PATCH /api/prescriptions/:id/status` - Update prescription status

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Health & Status
- `GET /api/health` - Server health check
- `GET /api/signaling/status` - WebSocket server status

## WebSocket Signaling

The signaling server handles real-time communication for video calls:

### Connection
\`\`\`javascript
const ws = new WebSocket('ws://localhost:5000/signaling')
\`\`\`

### Authentication
\`\`\`javascript
ws.send(JSON.stringify({
  type: 'auth',
  from: 'user-id',
  to: 'server',
  data: { userId: 'user-id' },
  messageId: 'unique-message-id'
}))
\`\`\`

### Message Types
- `auth` - Authenticate user
- `heartbeat` - Keep connection alive
- `call-initiation` - Start a call
- `call-answer` - Answer a call
- `call-rejection` - Reject a call
- `call-end` - End a call
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `webrtc-ice-candidate` - ICE candidate

## Database Schema

### Users
- `id` - UUID primary key
- `name` - Full name
- `email` - Email address (unique)
- `password` - Hashed password
- `role` - User role (patient, doctor, pharmacist, admin, hub)
- `isApproved` - Approval status
- `specialization` - Doctor specialization
- `licenseNumber` - Professional license
- `phone` - Phone number
- `dateOfBirth` - Date of birth
- `gender` - Gender
- `address` - Address
- `medicalHistory` - Medical history (JSON)
- `allergies` - Known allergies (JSON)

### Appointments
- `id` - UUID primary key
- `patientId` - Patient reference
- `doctorId` - Doctor reference
- `appointmentDate` - Scheduled date/time
- `type` - Appointment type (video, in-person)
- `status` - Status (pending, confirmed, completed, cancelled)
- `symptoms` - Patient symptoms
- `diagnosis` - Doctor diagnosis
- `notes` - Appointment notes
- `meetingId` - Video meeting ID
- `meetingUrl` - Video meeting URL
- `duration` - Duration in minutes
- `fee` - Consultation fee

### Prescriptions
- `id` - UUID primary key
- `appointmentId` - Appointment reference
- `patientId` - Patient reference
- `doctorId` - Doctor reference
- `medications` - Prescribed medications (JSON)
- `instructions` - Usage instructions
- `status` - Status (pending, filled, cancelled)
- `validUntil` - Prescription expiry

## Scripts

\`\`\`bash
# Development
npm run dev          # Start with nodemon
npm start           # Start production server

# Database
npm run migrate     # Run migrations
npm run migrate:undo # Undo last migration
npm run seed        # Seed database
npm run seed:undo   # Undo seeds
npm run reset-db    # Reset and reseed database

# Testing & Quality
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
\`\`\`

## Development

### Project Structure
\`\`\`
server/
├── config/
│   └── database.js         # Database configuration
├── middleware/
│   ├── auth.js            # Authentication middleware
│   └── validation.js      # Request validation
├── migrations/            # Database migrations
├── models/               # Sequelize models
├── routes/               # API routes
├── seeders/              # Database seeders
├── utils/                # Utility functions
├── signaling-server.js   # WebSocket signaling server
└── index.js             # Main server file
\`\`\`

### Adding New Routes

1. Create route file in `routes/`
2. Add middleware and validation
3. Import and use in `index.js`

Example:
\`\`\`javascript
// routes/example.js
const express = require('express')
const { authenticateToken } = require('../middleware/auth')
const router = express.Router()

router.get('/', authenticateToken, async (req, res) => {
  // Route logic here
})

module.exports = router
\`\`\`

### Database Migrations

Create new migration:
\`\`\`bash
npx sequelize-cli migration:generate --name migration-name
\`\`\`

Run migrations:
\`\`\`bash
npm run migrate
\`\`\`

## Monitoring

The server provides several monitoring endpoints:

- `/api/health` - Overall server health
- `/api/signaling/status` - WebSocket signaling status
- Console logs for debugging

## Security Considerations

1. **JWT Secrets**: Use strong, unique JWT secrets
2. **Rate Limiting**: Configured for API endpoints
3. **CORS**: Configured for frontend domain
4. **Input Validation**: All inputs are validated
5. **WebSocket Security**: Authentication required for signaling

## Troubleshooting

### WebSocket Connection Issues

**Problem**: WebSocket fails to connect
\`\`\`
❌ WebSocket connection to 'ws://localhost:5000/signaling' failed
\`\`\`

**Solutions**:
1. Ensure server is running on correct port
2. Check firewall settings
3. Verify WebSocket path `/signaling`
4. Check browser console for CORS errors

**Problem**: Authentication failures
\`\`\`
❌ Authentication failed: User not found
\`\`\`

**Solutions**:
1. Verify user exists in database
2. Check user ID format (should be UUID)
3. Ensure database connection is working

### Database Issues

**Problem**: Migration errors
\`\`\`
❌ Unable to connect to the database
\`\`\`

**Solutions**:
1. Check database file permissions
2. Verify `DATABASE_URL` environment variable
3. Ensure SQLite is installed
4. Run `npm run migrate` to create tables

### Performance Issues

**Problem**: High CPU usage during video calls

**Solutions**:
1. Monitor connected users with `/api/signaling/status`
2. Check for memory leaks in WebSocket connections
3. Implement connection cleanup in production
4. Consider using Redis for session storage in clusters

### Logs and Debugging

Enable detailed logging:
\`\`\`javascript
// Set environment variable
DEBUG=medilinka:*

// Or in code
console.log('🔍 Debug info:', data)
\`\`\`

Common log messages:
- `✅ User authenticated: Dr. Smith (user-123)` - Successful auth
- `📞 Call initiated: user-1 -> user-2` - Call started
- `🔄 WebRTC message relayed: webrtc-offer` - Signaling working
- `💔 Heartbeat timeout for user: user-123` - Connection lost

## License

MIT License - see LICENSE file for details.
