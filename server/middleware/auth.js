const { verifyAccessToken } = require('../utils/jwt');

// Middleware to protect routes with JWT
const authenticateJWT = (req, res, next) => {

  try {
    // Get token from cookies
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // 3. Verify token
    const decoded = verifyAccessToken(accessToken);

    // 4. Attach user data to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    // 5. Continue to next middleware/route
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
};

module.exports = { authenticateJWT };

