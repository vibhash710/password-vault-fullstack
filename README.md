# 🔐 Password Vault

A secure, full-stack password management application built with the MERN stack. Features end-to-end encryption, AI-powered password generation, and comprehensive security analytics.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://www.passwordvault.site)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

### Core Functionality
- 🔒 **End-to-End Encryption** - AES-256-GCM encryption for all passwords
- 🔑 **Master Password Protection** - Separate master password for vault access
- 📧 **Email Verification** - OTP-based account verification
- 🔄 **Password Reset** - Secure OTP-based password recovery
- 🔐 **OAuth Integration** - Sign in with Google & GitHub

### Password Management
- ➕ **CRUD Operations** - Create, read, update, delete passwords
- 🔍 **Smart Search** - Real-time password filtering
- 📁 **Categories** - Organize by Social, Banking, Work, Shopping, Education, Other
- 🎨 **Favicon Display** - Visual site identification
- 📊 **Strength Indicator** - Real-time password strength analysis

### Security Features
- 🔐 **Zero-Knowledge Architecture** - Server never sees unencrypted passwords
- 🤖 **AI Password Generator** - Gemini-powered contextual password generation
- 🔑 **JWT Authentication** – Secure session management with access & refresh tokens
- 🍪 **Secure Cookies** – HTTP-only cookies prevent token theft via XSS
- ♻️ **Automatic Token Refresh** – Keeps sessions active without manual login
- 📈 **Health Dashboard** - Analyze weak, reused, and old passwords
- 🔒 **Vault Session Lock** - Auto-lock after 15 minutes of inactivity
- 🛡️ **Rate Limiting** - Protection against brute force attacks

## 🔐 Security Architecture

### Encryption Flow

1. **Master Password** → PBKDF2 (100k iterations) → **Encryption Key**
2. **Password** + **Encryption Key** → AES-256-GCM → **Encrypted Password**
3. **Encrypted Password** → Stored in MongoDB
4. **Master Password** → bcrypt (10 rounds) → Stored hash (never reversible)

### Authentication

- **Access Token**: 15-minute expiry, HTTP-only cookie
- **Refresh Token**: 30-day expiry, HTTP-only cookie
- **SameSite**: `none` (production), `lax` (development)
- **Secure**: `true` (HTTPS only in production)

### Rate Limiting

- General: 400 requests / 15 min
- Auth operations: 10 attempts / 15 min
- Email operations: 3 emails / 1 hour
- OTP verification: 10 attempts / 15 min
- OTP resend: 2 requests / 5 min
- Password operations: 150 operations / 15 min

## 🎨 Features Overview

### Password Health Dashboard

Analyzes your entire vault for:
- **Weak passwords** (score < 60)
- **Reused passwords** (same password used multiple times)
- **Old passwords** (not updated in 90+ days)
- **Health score** (0-100 based on vault security)

### AI Password Generator

- **Context-aware generation** using Google Gemini
- **Customizable options**: length, character types
- **Three variants**: AI memorable, random strong, AI complex
- **Real-time strength calculation**

### Vault Session Management

- **One-time unlock** with master password
- **Session-based access** (no repeated prompts)
- **Auto-lock** after 15 minutes of inactivity
- **Manual lock** option
- **Activity tracking** (mouse, keyboard, scroll)

## 🚀 Live Demo

**Frontend:** [https://www.passwordvault.site](https://www.passwordvault.site)  
**Backend API:** [https://api.passwordvault.site](https://api.passwordvault.site)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** – HTTP client for API requests
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM

### Security & Authentication
- **bcrypt** - Password hashing (10 rounds)
- **JWT** - Authentication tokens
- **Passport.js** - OAuth strategies
- **Crypto (AES-256-GCM)** - Password encryption
- **PBKDF2** - Key derivation (100,000 iterations)
- **Express Rate Limit** – API abuse protection

### Services
- **Resend** - Email delivery
- **Google Gemini API** - Password generation
- **Google Favicon API** - Dynamic favicon fetching for stored sites

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Namecheap** - Domain & DNS

## 📋 Prerequisites

Before running this project locally, make sure you have the following:

- **Node.js** ≥ 18.0.0
- **MongoDB Atlas account** (or local MongoDB instance)
- **Resend API key** (for email delivery)
- **Google Gemini API key** (for AI password generation)

Optional (for OAuth login):

- **Google OAuth credentials**
- **GitHub OAuth credentials**

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/vibhash710/password-vault-fullstack.git
cd password-vault-fullstack
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Secrets
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/oauth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/oauth/github/callback

# Frontend URL
CLIENT_URL=http://localhost:5173

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

Start backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Visit: `http://localhost:5173`

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory: `client`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy

### Backend (Render)

1. Create new Web Service
2. Set root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables
6. Deploy

### Custom Domain

1. Add domain to Vercel & Render
2. Configure DNS records
3. Update `CLIENT_URL` and OAuth callbacks
4. Verify your domain in **Resend** and update `EMAIL_FROM` to use your domain
5. Wait for SSL certificates to be issued

## 📁 Project Structure
```
password-vault-fullstack/
├── client/ # Frontend (React + Vite)
│ ├── public/ # Static assets
│ ├── src/
│ │ ├── assets/ # Images and static resources
│ │ ├── components/ # Reusable React components
│ │ ├── context/ # React context providers
│ │ ├── hooks/ # Custom React hooks
│ │ ├── utils/ # Helper functions & API utilities
│ │ ├── App.jsx # Main application component
│ │ └── main.jsx # React entry point
│ ├── index.html
│ └── package.json

├── server/ # Backend (Node.js + Express)
│ ├── config/ # Configuration files (passport, etc.)
│ ├── middleware/ # Express middleware (auth, rate limiting)
│ ├── models/ # Mongoose database models
│ ├── routes/ # API route definitions
│ ├── services/ # Core services (email, password generator)
│ ├── utils/ # Utility helpers (encryption, JWT)
│ ├── server.js # Express server entry point
│ └── package.json

└── README.md
```

## 📄 API Documentation

### Authentication
```
POST   /api/auth/register              # Register new user  
POST   /api/auth/verify-email          # Verify email with OTP  
POST   /api/auth/resend-otp            # Resend email verification OTP  
POST   /api/auth/login                 # Login user  
POST   /api/auth/refresh               # Refresh access token  
POST   /api/auth/logout                # Logout user  
POST   /api/auth/logout-all            # Logout from all devices  
GET    /api/auth/me                    # Get current authenticated user  

POST   /api/auth/set-master-password   # Set vault master password  
POST   /api/auth/reset-vault           # Reset vault (delete all stored passwords)  
```

### Password Reset
```
POST   /api/auth/forgot-password       # Request password reset OTP  
POST   /api/auth/verify-reset-otp      # Verify password reset OTP  
POST   /api/auth/reset-password        # Reset account password  
POST   /api/auth/resend-reset-otp      # Resend password reset OTP  
```

### Password Management
```
GET    /api/passwords                  # Get all stored passwords (encrypted)  
POST   /api/passwords                  # Create new password  
POST   /api/passwords/verify-master    # Verify master password  

POST   /api/passwords/decrypt-all      # Decrypt all passwords (for health analysis)  
POST   /api/passwords/:id/decrypt      # Decrypt single password  

PUT    /api/passwords/:id              # Update password  
DELETE /api/passwords/:id              # Delete password  

GET    /api/passwords/search           # Filter passwords by category  
```

### Password Generator
```
POST   /api/generator/generate/random      # Generate random password  
POST   /api/generator/generate/ai          # Generate AI password  
POST   /api/generator/generate/suggestions # Generate multiple password suggestions  
POST   /api/generator/strength             # Calculate password strength  
```

### OAuth Authentication
```
GET    /api/oauth/google               # Initiate Google OAuth  
GET    /api/oauth/google/callback      # Google OAuth callback  

GET    /api/oauth/github               # Initiate GitHub OAuth  
GET    /api/oauth/github/callback      # GitHub OAuth callback
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Vibhash Mishra**

- Website: [www.passwordvault.site](https://www.passwordvault.site)
- GitHub: [@vibhash710](https://github.com/vibhash710)

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Vercel for frontend hosting
- Render for backend hosting
- Resend for email delivery
- Google Gemini for AI capabilities
- All open-source libraries used in this project

---

**Built with ❤️ using the MERN stack and modern security practices**