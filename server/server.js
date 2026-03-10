require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db')
const passport = require('./config/passport');
const { generalLimiter } = require('./middleware/rateLimiter');

connectDB();

const app = express();

app.set('trust proxy', 1);

// ========== MIDDLEWARE ==========

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL, process.env.CLIENT_URL_ALT]
    : ["http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Initialize Passport (for OAuth)
app.use(passport.initialize());

//Apply general rate limiter to all routes
app.use(generalLimiter);

app.use((req, res, next) => {
  res.on('finish', () => {
    // Log only when rate limit actually blocks request
    if (res.statusCode === 429) {
      console.warn(
        `Rate limit exceeded | IP: ${req.ip} | Route: ${req.originalUrl}`
      );
    }
  });

  next();
});

// ========== ROUTES ==========

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const oauthRoutes = require('./routes/oauth');
app.use('/api/oauth', oauthRoutes);

const passwordsRoutes = require('./routes/passwords');
app.use('/api/passwords', passwordsRoutes);

const passwordGeneratorRoutes = require('./routes/passwordGenerator');
app.use('/api/password-generator', passwordGeneratorRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Password Vault API is running!' });
});

// ========== ERROR HANDLING ==========

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========== START SERVER ==========

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});