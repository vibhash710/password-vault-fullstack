const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const {
    generateRandomPassword,
    generateAIPassword,
    calculatePasswordStrength,
    generatePasswordSuggestions
} = require('../services/passwordGenerator');

const rateLimit = require('express-rate-limit');
const generatorLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 generations per 15 minutes
    message: {
        success: false,
        message: 'Too many password generation requests, please try again later'
    }
});

const validateLength = (length) => {
    if (length && (length < 8 || length > 32)) {
        return {
            valid: false,
            message: 'Password length must be between 8 and 32'
        };
    }

    return { valid: true };
};

// ========== GENERATE RANDOM PASSWORD ==========

router.post('/generate/random', authenticateJWT, generatorLimiter, async (req, res) => {
    try {
        const options = req.body;

        const validation = validateLength(options.length);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        const password = generateRandomPassword(options);
        const strength = calculatePasswordStrength(password);

        res.json({
            success: true,
            password,
            strength,
            type: 'random'
        });

    } catch (error) {
        console.error('Random password generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate password',
            error: error.message
        });
    }
});

// ========== GENERATE AI PASSWORD ==========

router.post('/generate/ai', authenticateJWT, generatorLimiter, async (req, res) => {
    try {
        const { context, ...options } = req.body;

        const validation = validateLength(options.length);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        const password = await generateAIPassword(context, options);
        const strength = calculatePasswordStrength(password);

        res.json({
            success: true,
            password,
            strength,
            type: 'ai',
            context: context || 'general'
        });

    } catch (error) {
        console.error('AI password generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate AI password',
            error: error.message
        });
    }
});

// ========== GENERATE PASSWORD SUGGESTIONS ==========

router.post('/generate/suggestions', authenticateJWT, generatorLimiter, async (req, res) => {
    try {
        const { context, options = {}, count = 3 } = req.body;

        const validation = validateLength(options.length);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        const suggestions = await generatePasswordSuggestions(context, options, count);

        res.json({
            success: true,
            suggestions,
            context: context || 'general'
        });

    } catch (error) {
        console.error('Suggestions generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate suggestions',
            error: error.message
        });
    }
});

// ========== CALCULATE PASSWORD STRENGTH ==========

router.post('/strength', authenticateJWT, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        const strength = calculatePasswordStrength(password);

        res.json({
            success: true,
            strength
        });

    } catch (error) {
        console.error('Strength calculation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate strength',
            error: error.message
        });
    }
});

module.exports = router;