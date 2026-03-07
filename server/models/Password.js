const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({

    // Which user owns this password?
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true  // Index for faster queries
    },

    site: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },

    // Encrypted
    encryptedPassword: {
        type: String,
        required: true
    },

    // Optional: Category/tag (not encrypted, for filtering)
    category: {
        type: String,
        enum: ['social', 'banking', 'work', 'shopping', 'entertainment', 'education', 'other'],
        default: 'other'
    },

    // Password strength (calculated on backend)
    strength: {
        type: String,
        enum: ['weak', 'medium', 'strong'],
        default: 'medium'
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },

    lastAccessed: {
        type: Date,
        default: Date.now
    }

});

// Update 'updatedAt' before saving
passwordSchema.pre('save', function() {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Password', passwordSchema);