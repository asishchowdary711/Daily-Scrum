import React from 'react';
import { useAuth } from './AuthContext';
import LoginPage from '../components/LoginPage';

/**
 * Protected route wrapper.
 * Shows LoginPage if not authenticated, loading spinner if checking session.
 */
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f1117]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Validating session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return children;
};

export default ProtectedRoute;
