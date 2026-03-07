const express = require('express');
const router = express.Router();
const Password = require('../models/Password');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');
const { calculatePasswordStrength } = require('../utils/passwordStrength');
const { passwordOperationsLimiter } = require('../middleware/rateLimiter');

// ========== ALL ROUTES REQUIRE AUTHENTICATION ==========

router.use(authenticateJWT);
router.use(passwordOperationsLimiter);

// ========== VERIFY MASTER PASSWORD ==========

router.post('/verify-master', async (req, res) => {
    try {
        const { masterPassword } = req.body;

        if (!masterPassword) {
            return res.status(400).json({
                success: false,
                message: 'Master password is required'
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMasterPasswordCorrect = await user.compareMasterPassword(masterPassword);

        if (!isMasterPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect master password'
            });
        }

        return res.json({
            success: true,
            message: 'Master password verified'
        });

    } catch (error) {
        console.error('Verify Master Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying master password'
        });
    }
});

// ========== CREATE PASSWORD ==========

router.post('/', async (req, res) => {
    try {
        const { site, username, password, category, masterPassword } = req.body;

        if (!site || !username || !password || !masterPassword) {
            return res.status(400).json({
                success: false,
                message: 'Site, username, password, and master password are required'
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMasterPasswordCorrect = await user.compareMasterPassword(masterPassword);

        if (!isMasterPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect master password'
            });
        }

        const encryptionKey = user.deriveEncryptionKey(masterPassword);

        const encryptedPassword = encrypt(password, encryptionKey);

        const strength = calculatePasswordStrength(password);

        const newPassword = await Password.create({
            userId: req.user.userId,
            site,
            username,
            encryptedPassword,
            category: category || 'other',
            strength
        });

        res.status(201).json({
            success: true,
            message: 'Password saved successfully',
            password: {
                _id: newPassword._id,
                category: newPassword.category,
                strength: newPassword.strength,
                createdAt: newPassword.createdAt
            }
        });

    } catch (error) {
        console.error('Save Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving password',
            error: error.message
        });
    }
});


// ========== GET ALL PASSWORDS (ENCRYPTED) ==========

router.get('/', async (req, res) => {
    try {
        const passwords = await Password.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: passwords.length,
            passwords: passwords.map(pwd => ({
                _id: pwd._id,
                site: pwd.site,
                username: pwd.username,
                encryptedPassword: pwd.encryptedPassword,
                category: pwd.category,
                strength: pwd.strength,
                createdAt: pwd.createdAt,
                updatedAt: pwd.updatedAt,
                lastAccessed: pwd.lastAccessed
            }))
        });

    } catch (error) {
        console.error('Get Passwords Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching passwords',
            error: error.message
        });
    }
});

// ========== DECRYPT ALL PASSWORDS (FOR HEALTH ANALYSIS) ==========

router.post('/decrypt-all', async (req, res) => {
    try {
        const { masterPassword } = req.body;

        if (!masterPassword) {
            return res.status(400).json({
                success: false,
                message: 'Master password is required'
            });
        }

        // Find user
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify master password
        const isMasterPasswordCorrect = await user.compareMasterPassword(masterPassword);

        if (!isMasterPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect master password'
            });
        }

        // Derive encryption key ONCE
        const encryptionKey = user.deriveEncryptionKey(masterPassword);

        // Fetch all passwords
        const passwords = await Password.find({ userId: req.user.userId });

        // Decrypt all
        const decryptedPasswords = passwords.map(pwd => ({
            _id: pwd._id,
            site: pwd.site,
            username: pwd.username,
            password: decrypt(pwd.encryptedPassword, encryptionKey),
            updatedAt: pwd.updatedAt
        }));

        res.json({
            success: true,
            passwords: decryptedPasswords
        });

    } catch (error) {
        console.error('Decrypt All Error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to decrypt passwords'
        });
    }
});

// ========== GET SINGLE PASSWORD (DECRYPTED) ==========

router.post('/:id/decrypt', async (req, res) => {
    try {
        const { masterPassword } = req.body;
        const passwordId = req.params.id;

        if (!masterPassword) {
            return res.status(400).json({
                success: false,
                message: 'Master password is required'
            });
        }

        const passwordEntry = await Password.findOne({
            _id: passwordId,
            userId: req.user.userId
        });

        if (!passwordEntry) {
            return res.status(404).json({
                success: false,
                message: 'Password not found'
            });
        }

        const user = await User.findById(req.user.userId);

        const isMasterPasswordCorrect = await user.compareMasterPassword(masterPassword);

        if (!isMasterPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect master password'
            });
        }

        const encryptionKey = user.deriveEncryptionKey(masterPassword);

        const password = decrypt(passwordEntry.encryptedPassword, encryptionKey);

        passwordEntry.lastAccessed = Date.now();
        await passwordEntry.save();

        res.json({
            success: true,
            password: {
                _id: passwordEntry._id,
                site: passwordEntry.site,
                username: passwordEntry.username,
                password,
                category: passwordEntry.category,
                strength: passwordEntry.strength,
                createdAt: passwordEntry.createdAt,
                updatedAt: passwordEntry.updatedAt,
                lastAccessed: passwordEntry.lastAccessed
            }
        });

    } catch (error) {
        console.error('Decrypt Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error decrypting password',
            error: error.message
        });
    }
});

// ========== UPDATE PASSWORD ==========

router.put('/:id', async (req, res) => {
    try {
        const { site, username, password, category, masterPassword } = req.body;
        const passwordId = req.params.id;

        if (!masterPassword) {
            return res.status(400).json({
                success: false,
                message: 'Master password is required'
            });
        }

        const passwordEntry = await Password.findOne({
            _id: passwordId,
            userId: req.user.userId
        });

        if (!passwordEntry) {
            return res.status(404).json({
                success: false,
                message: 'Password not found'
            });
        }

        const user = await User.findById(req.user.userId);
        const isMasterPasswordCorrect = await user.compareMasterPassword(masterPassword);

        if (!isMasterPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect master password'
            });
        }

        const encryptionKey = user.deriveEncryptionKey(masterPassword);

        if (site) passwordEntry.site = site;
        if (username) passwordEntry.username = username;
        if (password) {
            passwordEntry.encryptedPassword = encrypt(password, encryptionKey);
            passwordEntry.strength = calculatePasswordStrength(password);
        }
        if (category) passwordEntry.category = category;

        passwordEntry.updatedAt = Date.now();
        await passwordEntry.save();

        res.json({
            success: true,
            message: 'Password updated successfully',
            password: {
                _id: passwordEntry._id,
                category: passwordEntry.category,
                strength: passwordEntry.strength,
                updatedAt: passwordEntry.updatedAt
            }
        });

    } catch (error) {
        console.error('Update Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating password',
            error: error.message
        });
    }
});


// ========== DELETE PASSWORD ==========

router.delete('/:id', async (req, res) => {
    try {
        const { masterPassword } = req.body;
        const passwordId = req.params.id;

        if (!masterPassword) {
            return res.status(400).json({
                success: false,
                message: 'Master password is required for deletion'
            });
        }

        const user = await User.findById(req.user.userId);
        const isMasterPasswordCorrect = await user.compareMasterPassword(masterPassword);

        if (!isMasterPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect master password'
            });
        }

        const result = await Password.findOneAndDelete({
            _id: passwordId,
            userId: req.user.userId
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Password not found'
            });
        }

        res.json({
            success: true,
            message: 'Password deleted successfully'
        });

    } catch (error) {
        console.error('Delete Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting password',
            error: error.message
        });
    }
});


// ========== SEARCH PASSWORDS ==========

router.get('/search', async (req, res) => {
    try {
        const { category } = req.query;

        let query = { userId: req.user.userId };

        if (category && category !== 'all') {
            query.category = category;
        }

        const passwords = await Password.find(query)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: passwords.length,
            passwords: passwords.map(pwd => ({
                _id: pwd._id,
                site: pwd.site,
                username: pwd.username,
                encryptedPassword: pwd.encryptedPassword,
                category: pwd.category,
                strength: pwd.strength,
                createdAt: pwd.createdAt,
                updatedAt: pwd.updatedAt
            }))
        });

    } catch (error) {
        console.error('Search Passwords Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching passwords',
            error: error.message
        });
    }
});

module.exports = router;