const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendVerificationOTP, sendPasswordResetOTP } = require('../utils/emailService');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens
} = require('../utils/jwt');
const { authenticateJWT } = require('../middleware/auth');
const { validatePassword } = require('../utils/passwordStrength');
const {
    authLimiter,
    emailLimiter,
    passwordResetLimiter,
    otpVerificationLimiter,
    resendLimiter
} = require('../middleware/rateLimiter');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');

// ========== REGISTER ROUTE ==========

router.post('/register', authLimiter, emailLimiter, async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Backend validation (in case frontend bypassed)
        const validation = validatePassword(password);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = new User({ name, email, password, emailVerified: false });

        const otp = user.generateOTP();

        await user.save();

        // Send verification email
        try {
            await sendVerificationOTP(email, otp, name);
            console.log(`Verification OTP sent to ${email}`);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for verification code.',
            requiresVerification: true,
            email: email
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
});

// VERIFY EMAIL WITH OTP
router.post('/verify-email', otpVerificationLimiter, async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Verify OTP
        const isValidOTP = user.verifyOTP(otp);

        if (!isValidOTP) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark email as verified
        user.emailVerified = true;
        user.emailVerificationOTP = undefined; // Clear OTP
        user.otpExpires = undefined;

        await user.save();

        // Auto-login after verification
        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = await generateRefreshToken(user._id, user.email);

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Email verified successfully!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified
            }
        });

    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying email',
            error: error.message
        });
    }
});

// RESEND OTP
router.post('/resend-otp', resendLimiter, emailLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Generate new OTP
        const otp = user.generateOTP();
        await user.save();

        // Send email
        await sendVerificationOTP(email, otp, user.name);

        res.json({
            success: true,
            message: 'Verification code sent to your email'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending verification code',
            error: error.message
        });
    }
});

// ========== LOGIN ROUTE ==========

router.post('/login', authLimiter, async (req, res) => {

    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (user.authProvider !== 'local') {
            return res.status(400).json({
                success: false,
                message: `Email already registered with ${user.authProvider}.`
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in.'
            });
        }

        // Verify password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // LOGIN SUCCESS! Generate tokens
        const accessToken = generateAccessToken(user._id, user.email);
        const refreshToken = await generateRefreshToken(user._id, user.email);

        // Set httpOnly cookies instead of sending in response body
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Send tokens in response
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
});


// ========== REFRESH TOKEN ROUTE ==========

router.post('/refresh', async (req, res) => {

    try {
        // Get refresh token from cookies
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = await verifyRefreshToken(refreshToken);

        // Generate new access token
        const newAccessToken = generateAccessToken(decoded.userId, decoded.email);

        // Set new access token as cookie
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Access token refreshed',
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('Token Refresh Error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token',
            error: error.message
        });
    }
});

// ========== GET CURRENT USER ==========

router.get('/me', authenticateJWT, async (req, res) => {

    res.set('Cache-Control', 'no-store');

    try {
        // Get user from database (exclude password)
        const user = await User.findById(req.user.userId).select('-password -encryptionSalt -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                authProvider: user.authProvider,
                profilePicture: user.profilePicture,
                emailVerified: user.emailVerified,
                masterPasswordSet: user.masterPasswordSet,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
});

// ========== SET MASTER PASSWORD ==========

router.post('/set-master-password', authLimiter, authenticateJWT, async (req, res) => {
    try {
        const { masterPassword } = req.body;

        // Validation
        if (!masterPassword || masterPassword.length < 12) {
            return res.status(400).json({
                success: false,
                message: 'Master password must be at least 12 characters'
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.masterPasswordSet) {
            return res.status(400).json({
                success: false,
                message: 'Master password already set. Cannot be changed.'
            });
        }

        // Hash and store master password
        const salt = await bcrypt.genSalt(10);
        user.masterPassword = await bcrypt.hash(masterPassword, salt);

        // Generate encryption salt
        user.encryptionSalt = crypto.randomBytes(32).toString('hex');
        user.masterPasswordSet = true;

        await user.save();

        console.log('Master password set for user:', user.email);

        res.json({
            success: true,
            message: 'Master password set successfully'
        });

    } catch (error) {
        console.error('Set master password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting master password',
            error: error.message
        });
    }
});

// ========== REQUEST PASSWORD RESET ==========

router.post('/forgot-password', passwordResetLimiter, emailLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset code.'
            });
        }

        // Only allow password reset for local auth users
        if (user.authProvider !== 'local') {
            return res.status(400).json({
                success: false,
                message: `This account uses ${user.authProvider} authentication. Please sign in with ${user.authProvider}.`
            });
        }

        // Generate password reset OTP
        const otp = user.generatePasswordResetOTP();
        await user.save();

        // Send email
        try {
            await sendPasswordResetOTP(email, otp, user.name);
            console.log(`Password reset OTP sent to ${email}`);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send reset code. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'Password reset code sent to your email',
            email: email
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing request',
            error: error.message
        });
    }
});

// ========== VERIFY RESET OTP ==========

router.post('/verify-reset-otp', otpVerificationLimiter, async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP
        const isValidOTP = user.verifyPasswordResetOTP(otp);

        if (!isValidOTP) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // OTP is valid
        res.json({
            success: true,
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error('Verify reset OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: error.message
        });
    }
});

// ========== RESET PASSWORD ==========

router.post('/reset-password', passwordResetLimiter, async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP, and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP one more time
        const isValidOTP = user.verifyPasswordResetOTP(otp);

        if (!isValidOTP) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;

        // Clear reset OTP fields
        user.passwordResetOTP = undefined;
        user.resetOtpExpires = undefined;

        await user.save();

        console.log(`Password reset successful for ${email}`);

        res.json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
});

// ========== RESEND PASSWORD RESET OTP ==========

router.post('/resend-reset-otp', resendLimiter, emailLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists, a new code has been sent.'
            });
        }

        // Generate new OTP
        const otp = user.generatePasswordResetOTP();
        await user.save();

        // Send email
        await sendPasswordResetOTP(email, otp, user.name);

        res.json({
            success: true,
            message: 'New password reset code sent to your email'
        });

    } catch (error) {
        console.error('Resend reset OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending reset code',
            error: error.message
        });
    }
});

// ========== LOGOUT ROUTE ==========

router.post('/logout', async (req, res) => {

    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Revoke refresh token
        await revokeRefreshToken(refreshToken);

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout',
            error: error.message
        });
    }
});


// ========== LOGOUT FROM ALL DEVICES ==========

router.post('/logout-all', authenticateJWT, async (req, res) => {

    try {
        // Revoke all refresh tokens for this user
        await revokeAllUserTokens(req.user.userId);

        res.json({
            success: true,
            message: 'Logged out from all devices successfully'
        });

    } catch (error) {
        console.error('Logout All Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
});


// ========== RESET VAULT (for forgotten master password) =========

router.post('/reset-vault', authLimiter, authenticateJWT, async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { confirmEmail } = req.body;

        const user = await User.findById(req.user.userId).session(session);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify user confirmed their email
        if (confirmEmail !== user.email) {
            return res.status(400).json({
                success: false,
                message: 'Email confirmation does not match'
            });
        }

        // Delete all passwords for this user
        const Password = require('../models/Password');
        const deleteResult = await Password.deleteMany({ userId: user._id }).session(session);

        console.log(`Deleted ${deleteResult.deletedCount} passwords for user: ${user.email}`);

        // Reset master password fields
        user.masterPassword = null;
        user.encryptionSalt = null;
        user.masterPasswordSet = false;

        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        console.log('Vault reset successful for user:', user.email);

        res.json({
            success: true,
            message: 'Vault reset successfully. All passwords deleted.',
            passwordsDeleted: deleteResult.deletedCount
        });

    } catch (error) {
        console.error('Reset vault error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting vault',
            error: error.message
        });
    }
});

module.exports = router;