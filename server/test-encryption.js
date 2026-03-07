const crypto = require('crypto');
const { encrypt, decrypt } = require('./utils/encryption');

// Simulate deriving a key (like we do from master password)
const testPassword = 'MyMasterPassword123!';
const testSalt = crypto.randomBytes(32).toString('hex');

// Derive encryption key
const encryptionKey = crypto.pbkdf2Sync(
    testPassword,
    testSalt,
    100000,
    32,
    'sha256'
);

console.log('🔑 Encryption Key (hex):', encryptionKey.toString('hex'));
console.log('');

// Test data
const originalText = 'MyFacebookPassword456!';

console.log('📝 Original Text:', originalText);

// Encrypt
const encrypted = encrypt(originalText, encryptionKey);
console.log('🔒 Encrypted:', encrypted);
console.log('');

// Decrypt
const decrypted = decrypt(encrypted, encryptionKey);
console.log('🔓 Decrypted:', decrypted);
console.log('');

// Verify
if (originalText === decrypted) {
    console.log('✅ SUCCESS: Encryption/Decryption works correctly!');
} else {
    console.log('❌ FAIL: Decrypted text does not match original');
}