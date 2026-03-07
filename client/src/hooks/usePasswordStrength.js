import { useState, useEffect } from 'react';
import { calculatePasswordStrength } from '../utils/passwordStrength';

const usePasswordStrength = (password) => {
    const [strength, setStrength] = useState({
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
    });

    useEffect(() => {
        const result = calculatePasswordStrength(password);
        setStrength(result);
    }, [password]);

    return strength;
};

export default usePasswordStrength;