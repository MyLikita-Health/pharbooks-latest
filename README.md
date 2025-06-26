# MediLinka - Telemedicine & Telepharmacy Platform

A comprehensive healthcare platform combining telemedicine and telepharmacy services for remote healthcare delivery.

## 🚀 Features

- **Role-based Authentication**: Patient, Doctor, Pharmacist, Admin
- **Telemedicine**: Video consultations, appointment booking
- **Telepharmacy**: Prescription management, medication delivery
- **Modern UI**: Glassmorphism design with blue color scheme
- **Responsive**: Mobile-first design approach

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **State Management**: React Context
- **Authentication**: JWT-based
- **Icons**: Lucide React

## 🏃‍♂️ Getting Started

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run development server**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 Demo Accounts

Use these credentials to test different user roles:

- **Admin**: `admin@medilinka.com`
- **Doctor**: `dr.smith@medilinka.com`
- **Pharmacist**: `pharmacist@medilinka.com`
- **Patient**: `patient@medilinka.com`

**Password for all accounts**: `password123`

## 📱 User Roles

### Patient
- Book appointments with doctors
- Join video consultations
- View prescriptions and medical records
- Track medication delivery

### Doctor
- Manage appointments and consultations
- Conduct video calls with patients
- Write e-prescriptions
- View patient records

### Pharmacist
- Verify incoming prescriptions
- Process medication orders
- Manage inventory
- Track deliveries

### Admin
- User management and approvals
- Platform analytics
- System monitoring
- Security management

## 🎨 Design Features

- **Blue Color Palette**: Primary blues with complementary colors
- **Glassmorphism**: Translucent cards with backdrop blur
- **Responsive Design**: Mobile-first approach
- **Modern Typography**: Clean Inter font
- **Smooth Animations**: Fade-in effects and transitions

## 🔧 Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
\`\`\`

## 📦 Project Structure

\`\`\`
medilinka-platform/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── patient/           # Patient dashboard
│   ├── doctor/            # Doctor dashboard
│   ├── pharmacist/        # Pharmacist dashboard
│   ├── admin/             # Admin dashboard
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── contexts/             # React contexts
├── hooks/               # Custom hooks
├── lib/                 # Utility functions
└── public/              # Static assets
\`\`\`

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@medilinka.com or create an issue in the repository.
