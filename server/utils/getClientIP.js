const { ipKeyGenerator } = require('express-rate-limit');

// Get real client IP
const getClientIP = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim(); // real client IP
    }
    // Safe helper (handles IPv6 properly)
    return ipKeyGenerator(req); // Fallback
};

module.exports = getClientIP;