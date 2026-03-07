const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

// ========== GENERATE ACCESS TOKEN ==========

const generateAccessToken = (userId, email) => {
  
  // Create payload (data to store in token)
  const payload = {
    userId: userId,
    email: email,
    type: 'access'  // Token type identifier
  };

  // Create and sign token
  const token = jwt.sign(
    payload,                              // Data to encode
    process.env.JWT_ACCESS_SECRET,        // Secret key
    { expiresIn: process.env.JWT_ACCESS_EXPIRE }  // Expiration time (15m)
  );

  return token;
};

// ========== GENERATE REFRESH TOKEN ==========

const generateRefreshToken = async (userId, email) => {
  
  // Create payload
  const payload = {
    userId: userId,
    email: email,
    type: 'refresh'
  };

  // Create and sign token
  const token = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }  // 30 days
  );

  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);  // Add 30 days

  // Save refresh token to database
  await RefreshToken.create({
    user: userId,
    token: token,
    expiresAt: expiresAt
  });

  return token;
};


// ========== VERIFY ACCESS TOKEN ==========

const verifyAccessToken = (token) => {
  
  try {
    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Check if it's an access token
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;  // Returns { userId, email, type, iat, exp }

  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};


// ========== VERIFY REFRESH TOKEN ==========

const verifyRefreshToken = async (token) => {
  
  try {
    // 1. Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // 2. Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // 3. Check if token exists in database (not revoked)
    const storedToken = await RefreshToken.findOne({ token });

    if (!storedToken) {
      throw new Error('Refresh token not found or revoked');
    }

    return decoded;

  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};


// ========== REVOKE REFRESH TOKEN (For Logout) ==========

const revokeRefreshToken = async (token) => {
  
  try {
    // Delete token from database
    await RefreshToken.deleteOne({ token });
    return true;

  } catch (error) {
    throw new Error('Error revoking token');
  }
};


// ========== REVOKE ALL USER TOKENS (Logout from all devices) ==========

const revokeAllUserTokens = async (userId) => {
  
  try {
    // Delete all refresh tokens for this user
    await RefreshToken.deleteMany({ user: userId });
    return true;

  } catch (error) {
    throw new Error('Error revoking tokens');
  }
};


module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
};  