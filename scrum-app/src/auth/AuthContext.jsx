import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
    initializeDefaultUsers,
    verifyPassword,
    generateSessionToken,
    sanitizeInput,
} from './authUtils';
import { checkRateLimit, recordFailedAttempt, recordSuccess } from './rateLimiter';

const AuthContext = createContext(null);

const SESSION_KEY = 'scrumpro_session';
const REMEMBER_KEY = 'scrumpro_remember';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const expiryTimerRef = useRef(null);

    // ─── Restore session on mount ───
    useEffect(() => {
        async function restoreSession() {
            try {
                // Initialize default users on first load
                await initializeDefaultUsers();

                // Check for existing session
                const sessionRaw =
                    sessionStorage.getItem(SESSION_KEY) ||
                    localStorage.getItem(REMEMBER_KEY);

                if (sessionRaw) {
                    const session = JSON.parse(sessionRaw);
                    if (session.expiresAt > Date.now()) {
                        setUser(session.user);
                        scheduleAutoLogout(session.expiresAt);
                    } else {
                        // Session expired — clean up
                        sessionStorage.removeItem(SESSION_KEY);
                        localStorage.removeItem(REMEMBER_KEY);
                    }
                }
            } catch (err) {
                console.error('Session restore failed:', err);
            }
            setLoading(false);
        }

        restoreSession();

        return () => {
            if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        };
    }, []);

    const scheduleAutoLogout = useCallback((expiresAt) => {
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        const remaining = expiresAt - Date.now();
        if (remaining > 0) {
            expiryTimerRef.current = setTimeout(() => {
                logout();
            }, remaining);
        }
    }, []);

    // ─── Login ───
    const login = useCallback(async (username, password, rememberMe = false) => {
        // Rate limit check
        const rateCheck = checkRateLimit();
        if (!rateCheck.allowed) {
            return {
                success: false,
                error: `Too many failed attempts. Try again in ${rateCheck.lockoutSeconds} seconds.`,
                lockoutSeconds: rateCheck.lockoutSeconds,
            };
        }

        // Sanitize inputs
        const cleanUsername = sanitizeInput(username).toLowerCase();
        const cleanPassword = password; // Don't sanitize password (may contain special chars)

        if (!cleanUsername) {
            return { success: false, error: 'Username is required' };
        }
        if (!cleanPassword) {
            return { success: false, error: 'Password is required' };
        }

        // Load users
        const usersRaw = localStorage.getItem('scrumpro_users');
        if (!usersRaw) {
            return { success: false, error: 'Authentication system not initialized' };
        }

        const users = JSON.parse(usersRaw);
        const matchedUser = users.find(u => u.username.toLowerCase() === cleanUsername);

        if (!matchedUser) {
            const result = recordFailedAttempt();
            return {
                success: false,
                error: result.remainingAttempts > 0
                    ? `Invalid credentials. ${result.remainingAttempts} attempts remaining.`
                    : `Account locked. Try again in ${result.lockoutSeconds} seconds.`,
                lockoutSeconds: result.lockoutSeconds,
                remainingAttempts: result.remainingAttempts,
            };
        }

        // Verify password
        const isValid = await verifyPassword(cleanPassword, matchedUser.salt, matchedUser.passwordHash);

        if (!isValid) {
            const result = recordFailedAttempt();
            return {
                success: false,
                error: result.remainingAttempts > 0
                    ? `Invalid credentials. ${result.remainingAttempts} attempts remaining.`
                    : `Account locked. Try again in ${result.lockoutSeconds} seconds.`,
                lockoutSeconds: result.lockoutSeconds,
                remainingAttempts: result.remainingAttempts,
            };
        }

        // Success — create session
        recordSuccess();

        const expiryHours = rememberMe ? 720 : 8; // 30 days or 8 hours
        const sessionToken = await generateSessionToken(matchedUser.id, expiryHours);

        const sessionData = {
            user: {
                id: matchedUser.id,
                username: matchedUser.username,
                displayName: matchedUser.displayName,
                role: matchedUser.role,
            },
            token: sessionToken.token,
            expiresAt: sessionToken.expiresAt,
        };

        // Store session
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        if (rememberMe) {
            localStorage.setItem(REMEMBER_KEY, JSON.stringify(sessionData));
        }

        setUser(sessionData.user);
        scheduleAutoLogout(sessionToken.expiresAt);

        return { success: true };
    }, [scheduleAutoLogout]);

    // ─── Logout ───
    const logout = useCallback(() => {
        setUser(null);
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context.
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}

export default AuthContext;
