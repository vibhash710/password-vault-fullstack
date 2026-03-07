const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    // User's name
    name: {
        type: String,
        required: true,
        trim: true
    },

    // User's email (unique for each user)
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    // User's password (will be hashed)
    password: {
        type: String,
        required: function () {
            // Only required if NOT an OAuth user
            return this.authProvider === 'local';
        },
        minlength: 6
    },

    // ========== MASTER PASSWORD FIELDS ==========

    masterPassword: {
        type: String,
    },

    encryptionSalt: {
        type: String,
    },

    // Has user completed master password setup?
    masterPasswordSet: {
        type: Boolean,
        default: false
    },

    // ========== OAUTH FIELDS ==========

    // How did user sign up? (local, google, github)
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },

    // User ID from OAuth provider (Google ID, GitHub ID)
    providerId: {
        type: String,
        sparse: true  // Allows multiple null values (for local users)
    },

    // User's profile picture from OAuth
    profilePicture: {
        type: String,
        default: null
    },

    // Is email verified? (OAuth emails are auto-verified)
    emailVerified: {
        type: Boolean,
        default: false
    },

    // ========== EMAIL VERIFICATION OTP FIELDS ==========

    emailVerificationOTP: {
        type: String
    },
    otpExpires: {
        type: Date
    },

    // ========== PASSWORD RESET OTP FIELDS ==========

    passwordResetOTP: {
        type: String
    },
    resetOtpExpires: {
        type: Date
    },

    // When was this user created?
    createdAt: {
        type: Date,
        default: Date.now   // Automatically sets current date/time
    },

});

// 🎯 MIDDLEWARE: Runs BEFORE saving user to database
// Hash password ONLY for local users
userSchema.pre('save', async function () {

    // "this" refers to the user document being saved
    const user = this;

    // Skip hashing for OAuth users (they don't have passwords)
    if (user.authProvider !== 'local') {
        return;
    }

    // Only hash the password if it's new or has been modified
    // (Don't hash again if user just updates their name)
    if (!user.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

// METHOD: Compare login password
userSchema.methods.comparePassword = async function (candidatePassword) {

    // candidatePassword = what user typed during login
    // this.password = hashed password stored in database

    try {
        // Returns true if match, false if not
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;

    } catch (error) {
        throw error;
    }
};

// METHOD: Compare master password
userSchema.methods.compareMasterPassword = async function (candidateMasterPassword) {
    if (!this.masterPassword) {
        return false;
    }
    return await bcrypt.compare(candidateMasterPassword, this.masterPassword);
};


// METHOD: Derive encryption key from password
userSchema.methods.deriveEncryptionKey = function (masterPassword) {
    // Use PBKDF2 to derive a key from password + salt
    return crypto.pbkdf2Sync(
        masterPassword,              // User's password (NOT hashed)
        this.encryptionSalt,         // Unique salt for this user
        100000,                      // Iterations
        32,                          // Key length (256 bits)
        'sha256'                     // Hash algorithm
    );
};

// METHOD: Generate Email Verification OTP
userSchema.methods.generateOTP = function () {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    this.emailVerificationOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // OTP expires in 10 minutes
    this.otpExpires = Date.now() + 10 * 60 * 1000;

    return otp; // Return plain OTP to send via email
};

// METHOD: Verify Email Verification OTP
userSchema.methods.verifyOTP = function (candidateOTP) {
    // Check if OTP has expired
    if (Date.now() > this.otpExpires) {
        return false;
    }

    // Hash the candidate OTP and compare
    const hashedOTP = crypto.createHash('sha256').update(candidateOTP).digest('hex');
    return hashedOTP === this.emailVerificationOTP;
};

// METHOD: Generate Password Reset OTP
userSchema.methods.generatePasswordResetOTP = function() {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before storing
    this.passwordResetOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    // OTP expires in 10 minutes
    this.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    
    return otp; // Return plain OTP to send via email
};

// METHOD: Verify Password Reset OTP
userSchema.methods.verifyPasswordResetOTP = function(candidateOTP) {
    // Check if OTP has expired
    if (Date.now() > this.resetOtpExpires) {
        return false;
    }
    
    // Hash the candidate OTP and compare
    const hashedOTP = crypto.createHash('sha256').update(candidateOTP).digest('hex');
    return hashedOTP === this.passwordResetOTP;
};

module.exports = mongoose.model('User', userSchema);