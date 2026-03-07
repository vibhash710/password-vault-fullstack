const { GoogleGenAI } = require('@google/genai');
const crypto = require('crypto');

// Initialize Gemini
const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// ========== TRADITIONAL PASSWORD GENERATOR ==========

const generateRandomPassword = (options = {}) => {
    const {
        length = 16,
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSymbols = true,
        excludeSimilar = true,
        excludeAmbiguous = true
    } = options;

    const uppercase = excludeSimilar
        ? 'ABCDEFGHJKMNPQRSTUVWXYZ'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const lowercase = excludeSimilar
        ? 'abcdefghjkmnpqrstuvwxyz'
        : 'abcdefghijklmnopqrstuvwxyz';

    const numbers = excludeSimilar
        ? '23456789'
        : '0123456789';

    const symbols = excludeAmbiguous
        ? '!@#$%^&*-_+=?'
        : '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    let password = [];

    const getRandomChar = (set) =>
        set[crypto.randomInt(set.length)];

    // Guarantee at least one character from each selected type
    if (includeUppercase) {
        password.push(getRandomChar(uppercase));
        charset += uppercase;
    }

    if (includeLowercase) {
        password.push(getRandomChar(lowercase));
        charset += lowercase;
    }

    if (includeNumbers) {
        password.push(getRandomChar(numbers));
        charset += numbers;
    }

    if (includeSymbols) {
        password.push(getRandomChar(symbols));
        charset += symbols;
    }

    if (charset.length === 0) {
        throw new Error('At least one character type must be included');
    }

    // Fill remaining characters
    while (password.length < length) {
        password.push(getRandomChar(charset));
    }

    // Shuffle password
    for (let i = password.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
};

// ========== AI-POWERED PASSWORD GENERATOR (GEMINI) ==========

const generateAIPassword = async (context = '', options = {}) => {
    const {
        length = 16,
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSymbols = true,
        memorable = true
    } = options;

    const requirements = [];

    if (includeUppercase) requirements.push("uppercase letters (A-Z)");
    if (includeLowercase) requirements.push("lowercase letters (a-z)");
    if (includeNumbers) requirements.push("numbers (0-9)");
    if (includeSymbols) requirements.push("symbols (!@#$%^&*-_+=?)");

    if (requirements.length === 0) {
        throw new Error("At least one character type must be selected");
    }

    const requirementText = requirements.join(", ");

    try {
        const prompt = `You are a strict password generator.

Return ONLY the password string. No explanations.

Rules:
- Password length must be EXACTLY ${length} characters.
- Allowed character types: ${requirementText}
- No spaces.
- No new lines.
- No additional text.

Context: ${context || 'general use'}

Use the context as inspiration for the password theme.
If possible, include a short fragment (3-5 characters) inspired by the context.
Do NOT exceed the required length when using context.

${memorable ? 'Make it memorable using short words or patterns but keep the total length exactly ' + length + ' characters.' : 'Maximize randomness and complexity.'}

Before responding:
1. Count the characters.
2. Ensure the password length is exactly ${length}.
3. Ensure there are no spaces.
4. Ensure only allowed character types are used.

If any rule fails, regenerate internally.

Return ONLY the password.
`;

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            generationConfig: {
                temperature: 0.2
            }
        });

        let password = response.text.trim();

        // Clean up any markdown, quotes, or extra characters
        password = password.replace(/```/g, '');
        password = password.replace(/[`'"]/g, '');
        password = password.replace(/\n/g, '');
        password = password.replace(/\s/g, '');
        password = password.trim();

        // Validate length (must be between 8-32 characters)
        if (password.length !== length) {
            console.warn(`AI generated invalid length (${password.length}), falling back to random`);
            return generateRandomPassword(options);
        }

        // Validate it contains required characters
        if (includeUppercase && !/[A-Z]/.test(password)) {
            return generateRandomPassword(options);
        }

        if (includeLowercase && !/[a-z]/.test(password)) {
            return generateRandomPassword(options);
        }

        if (includeNumbers && !/[0-9]/.test(password)) {
            return generateRandomPassword(options);
        }

        if (includeSymbols && !/[^A-Za-z0-9]/.test(password)) {
            return generateRandomPassword(options);
        }

        if (!includeSymbols && /[^A-Za-z0-9]/.test(password)) {
            return generateRandomPassword(options);
        }

        if (!includeUppercase && /[A-Z]/.test(password)) {
            return generateRandomPassword(options);
        }

        if (!includeLowercase && /[a-z]/.test(password)) {
            return generateRandomPassword(options);
        }

        if (!includeNumbers && /[0-9]/.test(password)) {
            return generateRandomPassword(options);
        }

        console.log('Gemini AI password generated successfully');
        return password;

    } catch (error) {
        console.error('Gemini password generation failed:', error.message);
        console.log('Falling back to random password generator');

        // Fallback to traditional generator
        return generateRandomPassword(options);
    }
};

// ========== PASSWORD STRENGTH CALCULATOR ==========

const calculatePasswordStrength = (password) => {
    let strength = 0;
    const checks = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password),
        longLength: password.length >= 16,
        veryLongLength: password.length >= 20
    };

    // Calculate strength score
    if (checks.length) strength += 20;
    if (checks.uppercase) strength += 15;
    if (checks.lowercase) strength += 15;
    if (checks.numbers) strength += 15;
    if (checks.symbols) strength += 20;
    if (checks.longLength) strength += 10;
    if (checks.veryLongLength) strength += 5;

    // Determine level
    let level = 'weak';
    let color = 'red';

    if (strength >= 80) {
        level = 'strong';
        color = 'green';
    } else if (strength >= 60) {
        level = 'medium';
        color = 'yellow';
    }

    return {
        strength,
        level,
        color,
        checks
    };
};

// ========== GENERATE MULTIPLE SUGGESTIONS ==========

const generatePasswordSuggestions = async (context = '', options = {}, count = 3) => {
    try {
        const aiMemorable = generateAIPassword(context, {
            ...options,
            memorable: true
        });

        const aiComplex = generateAIPassword(context, {
            ...options,
            memorable: false
        });

        const random = Promise.resolve(
            generateRandomPassword(options)
        );

        const [p1, p2, p3] = await Promise.all([
            aiMemorable,
            random,
            aiComplex
        ]);

        const suggestions = [p1, p2, p3];

        return suggestions.map(password => ({
            password,
            strength: calculatePasswordStrength(password)
        }));

    } catch (error) {
        console.error('Failed to generate suggestions:', error);

        // Fallback to 3 random passwords
        const fallbackPasswords = [
            generateRandomPassword(options),
            generateRandomPassword(options),
            generateRandomPassword(options)
        ];

        return fallbackPasswords.map(password => ({
            password,
            strength: calculatePasswordStrength(password)
        }));
    }
};

module.exports = {
    generateRandomPassword,
    generateAIPassword,
    calculatePasswordStrength,
    generatePasswordSuggestions
};