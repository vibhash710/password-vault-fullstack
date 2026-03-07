import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const handleOAuthCallback = async () => {
            try {
                const loginStatus = searchParams.get('login');
                const error = searchParams.get('error');

                // ERROR CASE
                if (error) {
                    navigate('/signin', {
                        replace: true,
                        state: { error }
                    });
                    return;
                }

                // SUCCESS CASE
                if (loginStatus === 'success') {
                    const user = await login();

                    if (!user || !user.masterPasswordSet) {
                        navigate('/setup-master-password', {
                            replace: true,
                            state: { success: 'Login successful!' }
                        });
                    } else {
                        navigate('/', {
                            replace: true,
                            state: { success: 'Login successful!' }
                        });
                    }

                    return;
                }

                // Fallback
                navigate('/signin', {
                    replace: true,
                    state: { error: 'Authentication failed. Please try again.' }
                });

            } catch (err) {
                console.error('OAuth callback error:', err);

                navigate('/signin', {
                    replace: true,
                    state: { error: 'Authentication failed. Please try again.' }
                });
            }
        };

        handleOAuthCallback();
    }, []);

    return null;
};

export default AuthCallback;