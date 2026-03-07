const crypto = require('crypto');

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';

const encrypt = (text, key) => {
    try {
        // Create a random IV (makes encryption different every time)
        const iv = crypto.randomBytes(16);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get authentication tag (used to detect tampering)
        const authTag = cipher.getAuthTag();

        // Return: iv:authTag:encryptedData (all in hex)
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed');
    }
};

const decrypt = (encryptedText, key) => {
    try {
        // Split the encrypted text into components
        const parts = encryptedText.split(':');
        
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted text format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        // Decrypt the text
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;

    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Decryption failed - incorrect key or corrupted data');
    }
};

module.exports = {
    encrypt,
    decrypt
};