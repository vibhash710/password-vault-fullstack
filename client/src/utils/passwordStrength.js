export const calculatePasswordStrength = (password) => {
    if (!password) {
        return {
            score: 0,
            level: 'none',
            color: 'gray',
            percentage: 0,
            feedback: [],
            checks: {
                length: false,
                uppercase: false,
                lowercase: false,
                numbers: false,
                symbols: false
            }
        };
    }

    let score = 0;
    const feedback = [];
    
    const checks = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password),
        veryLong: password.length >= 16,
        superLong: password.length >= 20
    };

    // Scoring system
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 5;
    
    if (checks.uppercase) score += 15;
    if (checks.lowercase) score += 15;
    if (checks.numbers) score += 15;
    if (checks.symbols) score += 20;

    // Additional points for variety
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.8) score += 10;

    // Check for common patterns (reduce score)
    const commonPatterns = [
        /(.)\1{2,}/, // Repeated characters
        /^[a-z]+$/, // All lowercase
        /^[A-Z]+$/, // All uppercase
        /^[0-9]+$/, // All numbers
        /123|234|345|456|567|678|789|890/,
        /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i,
        /password|admin|user|login|welcome|qwerty|letmein|monkey|dragon|master|shadow/i
    ];

    for (const pattern of commonPatterns) {
        if (pattern.test(password)) {
            score -= 15;
            break;
        }
    }

    // Generate feedback
    if (!checks.length) {
        feedback.push('Use at least 12 characters');
    }
    if (!checks.uppercase) {
        feedback.push('Add uppercase letters (A-Z)');
    }
    if (!checks.lowercase) {
        feedback.push('Add lowercase letters (a-z)');
    }
    if (!checks.numbers) {
        feedback.push('Add numbers (0-9)');
    }
    if (!checks.symbols) {
        feedback.push('Add symbols (!@#$%^&*)');
    }

    // Positive feedback
    if (password.length >= 16) {
        feedback.push('✓ Great length!');
    }
    if (checks.symbols && checks.numbers && checks.uppercase && checks.lowercase) {
        feedback.push('✓ Good character variety!');
    }

    // Determine level
    let level = 'weak';
    let color = 'red';
    
    if (score >= 85) {
        level = 'very strong';
        color = 'emerald';
    } else if (score >= 70) {
        level = 'strong';
        color = 'green';
    } else if (score >= 50) {
        level = 'medium';
        color = 'yellow';
    } else if (score >= 25) {
        level = 'fair';
        color = 'orange';
    }

    // Cap score at 100
    score = Math.min(100, Math.max(0, score));

    return {
        score,
        level,
        color,
        percentage: score,
        feedback: feedback.slice(0, 3),
        checks: {
            length: checks.length,
            uppercase: checks.uppercase,
            lowercase: checks.lowercase,
            numbers: checks.numbers,
            symbols: checks.symbols
        }
    };
};