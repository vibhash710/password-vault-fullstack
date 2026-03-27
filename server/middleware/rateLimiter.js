const rateLimit = require('express-rate-limit');

// Get real client IP
const getClientIP = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        const ips = forwardedFor.split(',');
        return ips[0].trim(); // First IP = real user IP
    }
    return req.ip; // Fallback
};

// ========== GENERAL API RATE LIMITER ==========

// Applies to all routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 400, // Maximum requests allowed per IP in that window
    keyGenerator: getClientIP,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    // Return rate limit info
    standardHeaders: true,
    legacyHeaders: false,
});

// ========== STRICT AUTH LIMITER ==========

// For login/register - prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    keyGenerator: getClientIP,
    skipSuccessfulRequests: false, // Count successful requests
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ========== EMAIL LIMITER ==========

// For email sending (OTP, verification, password reset)
const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    keyGenerator: getClientIP,
    skipSuccessfulRequests: false,
    message: {
        success: false,
        message: 'Too many email requests, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ========== PASSWORD RESET LIMITER ==========

// Stricter for password reset to prevent abuse
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    keyGenerator: getClientIP,
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again after 1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ========== OTP VERIFICATION LIMITER ==========

// Prevent OTP brute force
const otpVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    keyGenerator: getClientIP,
    message: {
        success: false,
        message: 'Too many verification attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ========== PASSWORD OPERATIONS LIMITER ==========

// For vault password CRUD operations
const passwordOperationsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150,
    keyGenerator: getClientIP,
    message: {
        success: false,
        message: 'Too many password operations, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ========== RESEND LIMITER ==========

// For resending OTP/emails - very strict
const resendLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 2,
    keyGenerator: getClientIP,
    message: {
        success: false,
        message: 'Too many resend requests, please wait 5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    emailLimiter,
    passwordResetLimiter,
    otpVerificationLimiter,
    passwordOperationsLimiter,
    resendLimiter
};