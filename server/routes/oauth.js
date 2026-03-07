const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { authLimiter } = require('../middleware/rateLimiter');

// ========== GOOGLE AUTHENTICATION ROUTES ==========

// Initiate Google OAuth
router.get('/google', authLimiter, passport.authenticate('google', {
        scope: ['profile', 'email']  // Request access to profile and email
    })
);

// Google callback route
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            return res.redirect(
                `${process.env.CLIENT_URL}/auth/callback?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`
            );
        }

        if (!user) {
            const message = info?.message || 'Authentication failed';
            return res.redirect(
                `${process.env.CLIENT_URL}/auth/callback?error=${encodeURIComponent(message)}`
            );
        }

        req.user = user;
        next();
    })(req, res, next);
},
    async (req, res) => {
        try {
            // Generate JWT tokens
            const accessToken = generateAccessToken(req.user._id, req.user.email);
            const refreshToken = await generateRefreshToken(req.user._id, req.user.email);

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

            res.redirect(`${process.env.CLIENT_URL}/auth/callback?login=success`);

        } catch (error) {
            res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=token_generation_failed`);
        }
    }
);

// ========== GITHUB AUTHENTICATION ROUTES ==========

// Initiate GitHub OAuth
router.get('/github', authLimiter, passport.authenticate('github', {
        scope: ['user:email']  // Request email access
    })
);

// GitHub callback route
router.get('/github/callback', (req, res, next) => {
    passport.authenticate('github', { session: false }, (err, user, info) => {
        if (err) {
            return res.redirect(
                `${process.env.CLIENT_URL}/auth/callback?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`
            );
        }

        if (!user) {
            const message = info?.message || 'Authentication failed';
            return res.redirect(
                `${process.env.CLIENT_URL}/auth/callback?error=${encodeURIComponent(message)}`
            );
        }

        req.user = user;
        next();
    })(req, res, next);
},
    async (req, res) => {
        try {
            const accessToken = generateAccessToken(req.user._id, req.user.email);
            const refreshToken = await generateRefreshToken(req.user._id, req.user.email);

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

            res.redirect(`${process.env.CLIENT_URL}/auth/callback?login=success`);
        } catch (error) {
            res.redirect(`${process.env.CLIENT_URL}/auth/callback?error=github_auth_failed`);
        }
    }
);

module.exports = router;