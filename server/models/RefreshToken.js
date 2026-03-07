const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  
  // Which user does this token belong to?
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to User model
    required: true
  },

  // The actual refresh token string
  token: {
    type: String,
    required: true,
    unique: true
  },

  // When does this token expire?
  expiresAt: {
    type: Date,
    required: true
  },

  // When was this token created?
  createdAt: {
    type: Date,
    default: Date.now
  }

});

// Automatically delete expired tokens
// MongoDB will remove documents where expiresAt < current time
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);