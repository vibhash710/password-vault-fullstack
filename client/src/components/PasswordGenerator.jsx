import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { Wand2, RefreshCw, Settings, Sparkles } from 'lucide-react';

const PasswordGenerator = ({ onSelectPassword, onClose, currentSite = '' }) => {
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [useAI, setUseAI] = useState(true);

    // Generator options
    const [options, setOptions] = useState({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        memorable: true
    });

    const panelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(event.target)
            ) {
                // Call parent to close generator
                if (typeof onClose === 'function') {
                    onClose();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Extract context from current site
    const getContext = () => {
        if (!currentSite) return '';

        // Extract domain from URL
        const domain = currentSite.replace(/https?:\/\/(www\.)?/, '').split('/')[0].split('.')[0];
        return domain;
    };

    // Generate password
    const generatePassword = async () => {
        setLoading(true);

        try {
            const endpoint = useAI ? '/password-generator/generate/ai' : '/password-generator/generate/random';
            const payload = useAI
                ? { context: getContext(), ...options }
                : options;

            const response = await api.post(endpoint, payload);

            if (response.data.success) {
                setGeneratedPassword(response.data.password);
                setSuggestions([]);
                toast.success(useAI ? 'AI password generated!' : 'Random password generated!');
            }
        } catch (error) {
            console.error('Password generation error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Failed to generate password';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Generate multiple suggestions
    const generateSuggestions = async () => {
        setLoading(true);
        setSuggestions([]);

        try {
            const response = await api.post('/password-generator/generate/suggestions', {
                context: getContext(),
                options
            });

            if (response.data.success) {
                setSuggestions(response.data.suggestions);
                toast.success('Suggestions generated!');
            }
        } catch (error) {
            console.error('Suggestions error:', error);
            if (error.response?.status === 429) {
                return;
            }
            const message = error.response?.data?.message || 'Failed to generate suggestions';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Use password
    const usePassword = (password) => {
        onSelectPassword(password);
        toast.success('Password inserted!');
    };

    return (
        <div ref={panelRef} className="space-y-4">
            {/* Generator Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                    <Wand2 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Password Generator
                </h3>
                <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Options"
                >
                    <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
            </div>

            {/* AI Toggle */}
            <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                        AI-Powered Generation
                    </span>
                </div>
                <button
                    onClick={() => setUseAI(!useAI)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useAI ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useAI ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {/* Options Panel */}
            {showOptions && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                    {/* Length Slider */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Length: {options.length}
                        </label>
                        <input
                            type="range"
                            min="8"
                            max="32"
                            value={options.length}
                            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                            className="w-full"
                        />
                    </div>

                    {/* Character Options */}
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={options.includeUppercase}
                                onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
                                className="rounded"
                            />
                            <span>Uppercase (A-Z)</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={options.includeLowercase}
                                onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
                                className="rounded"
                            />
                            <span>Lowercase (a-z)</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={options.includeNumbers}
                                onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
                                className="rounded"
                            />
                            <span>Numbers (0-9)</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={options.includeSymbols}
                                onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
                                className="rounded"
                            />
                            <span>Symbols (!@#$)</span>
                        </label>
                    </div>

                    {useAI && (
                        <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                            <input
                                type="checkbox"
                                checked={options.memorable}
                                onChange={(e) => setOptions({ ...options, memorable: e.target.checked })}
                                className="rounded"
                            />
                            <span>Make it memorable</span>
                        </label>
                    )}
                </div>
            )}

            {/* Generate Button */}
            <button
                onClick={generatePassword}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Generating...</span>
                    </>
                ) : (
                    <>
                        {useAI ? <Sparkles className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                        <span>Generate Password</span>
                    </>
                )}
            </button>

            {/* Generated Password Display */}
            {generatedPassword && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                            Generated Password
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-sm font-mono text-slate-900 dark:text-white break-all">
                            {generatedPassword}
                        </code>
                        <button
                            onClick={() => usePassword(generatedPassword)}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Use
                        </button>
                    </div>
                </div>
            )}

            {/* Get Suggestions Button */}
            <button
                onClick={generateSuggestions}
                disabled={loading}
                className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
                Get 3 Suggestions
            </button>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Suggestions:
                    </h4>
                    {suggestions.map((item, index) => (
                        <div
                            key={index}
                            className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-lg"
                        >
                            <div className="flex items-center space-x-2">
                                <code className="flex-1 text-xs font-mono text-slate-900 dark:text-white break-all">
                                    {item.password}
                                </code>
                                <button
                                    onClick={() => usePassword(item.password)}
                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors"
                                >
                                    Use
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info */}
            {useAI && currentSite && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                        💡 <strong>AI Context:</strong> Generating password optimized for "{getContext()}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default PasswordGenerator;