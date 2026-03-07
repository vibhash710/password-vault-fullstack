const calculatePasswordStrength = (password) => {
    
    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;  // Lowercase
    if (/[A-Z]/.test(password)) score++;  // Uppercase
    if (/[0-9]/.test(password)) score++;  // Numbers
    if (/[^a-zA-Z0-9]/.test(password)) score++;  // Special characters

    // Determine strength
    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    return 'strong';
};

const validatePassword = (password) => {
    
    if (!password) {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }

    // Optional: Enforce strong passwords
    const strength = calculatePasswordStrength(password);
    if (strength === 'weak') {
        return { 
            valid: false, 
            message: 'Password is too weak. Use a mix of uppercase, lowercase, numbers, and symbols' 
        };
    }

    return { valid: true, message: 'Password is valid' };
};

module.exports = {
    calculatePasswordStrength,
    validatePassword
};