// Get real client IP
const getClientIP = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        const ips = forwardedFor.split(',');
        return ips[0].trim(); // First IP = real user IP
    }
    return req.ip; // Fallback
};

module.exports = getClientIP;