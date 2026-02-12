import React from 'react';
import { useAuth } from './AuthContext';
import LoginPage from '../components/LoginPage';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-app">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-10 h-10 rounded-full animate-spin border-[3px] border-t-transparent"
                        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
                    />
                    <p className="text-sm font-medium text-theme-muted">Validating session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return <LoginPage />;

    return children;
};

export default ProtectedRoute;
