import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

const PasswordStrengthIndicator = ({ password, strength, showDetails = true }) => {
    if (!password) return null;

    const getColorClasses = (color) => {
        const colors = {
            red: 'bg-red-500 text-red-700 dark:text-red-400',
            orange: 'bg-orange-500 text-orange-700 dark:text-orange-400',
            yellow: 'bg-yellow-500 text-yellow-700 dark:text-yellow-400',
            green: 'bg-green-500 text-green-700 dark:text-green-400',
            emerald: 'bg-emerald-500 text-emerald-700 dark:text-emerald-400',
            gray: 'bg-gray-300 text-gray-600 dark:text-gray-400'
        };
        return colors[color] || colors.gray;
    };

    const getTextColorClass = (color) => {
        const colors = {
            red: 'text-red-600 dark:text-red-400',
            orange: 'text-orange-600 dark:text-orange-400',
            yellow: 'text-yellow-600 dark:text-yellow-400',
            green: 'text-green-600 dark:text-green-400',
            emerald: 'text-emerald-600 dark:text-emerald-400',
            gray: 'text-gray-600 dark:text-gray-400'
        };
        return colors[color] || colors.gray;
    };

    const getBgColorClass = (color) => {
        const colors = {
            red: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            orange: 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
            yellow: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
            green: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
            emerald: 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
            gray: 'bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
        };
        return colors[color] || colors.gray;
    };

    return (
        <div className="space-y-3">
            {/* Strength Bar */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Password Strength
                    </span>
                    <span className={`text-xs font-bold uppercase ${getTextColorClass(strength.color)}`}>
                        {strength.level}
                    </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${getColorClasses(strength.color).split(' ')[0]}`}
                        style={{ width: `${strength.percentage}%` }}
                    />
                </div>
            </div>

            {showDetails && (
                <>
                    {/* Requirements Checklist */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-1.5">
                            {strength.checks.length ? (
                                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            ) : (
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className={`text-xs ${strength.checks.length ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-500'}`}>
                                12+ characters
                            </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                            {strength.checks.uppercase ? (
                                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            ) : (
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className={`text-xs ${strength.checks.uppercase ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-500'}`}>
                                Uppercase (A-Z)
                            </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                            {strength.checks.lowercase ? (
                                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            ) : (
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className={`text-xs ${strength.checks.lowercase ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-500'}`}>
                                Lowercase (a-z)
                            </span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                            {strength.checks.numbers ? (
                                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            ) : (
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className={`text-xs ${strength.checks.numbers ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-500'}`}>
                                Numbers (0-9)
                            </span>
                        </div>

                        <div className="flex items-center space-x-1.5 col-span-2">
                            {strength.checks.symbols ? (
                                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            ) : (
                                <X className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span className={`text-xs ${strength.checks.symbols ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-500'}`}>
                                Symbols (!@#$%^&*)
                            </span>
                        </div>
                    </div>

                    {/* Feedback */}
                    {strength.feedback.length > 0 && (
                        <div className={`p-3 border rounded-lg ${getBgColorClass(strength.color)}`}>
                            <div className="flex items-start space-x-2">
                                <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getTextColorClass(strength.color)}`} />
                                <div className="flex-1">
                                    <ul className="space-y-1">
                                        {strength.feedback.map((item, index) => (
                                            <li key={index} className={`text-xs ${getTextColorClass(strength.color)}`}>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;