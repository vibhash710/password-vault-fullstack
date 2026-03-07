import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        fetchUser();
    }, []);

    // Check authentication status
    const fetchUser = async () => {
        try {
            // Verify with backend (cookies sent automatically)
            const response = await api.get('/auth/me');

            if (response.data.success) {
                setUser(response.data.user);
                return response.data.user;
            } else {
                setUser(null);
                return null;
            }
        } catch (error) {
            // If access token expired, interceptor will try refresh
            // If refresh fails, it redirects to /signin
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const login = async () => {
        // Cookies already set by backend
        const user = await fetchUser();
        return user;
    };

    // Logout function
    const logout = async () => {
        try {
            // Call backend to clear cookies
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        fetchUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};