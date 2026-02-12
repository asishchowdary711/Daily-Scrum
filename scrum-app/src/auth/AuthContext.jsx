/* eslint-disable react-refresh/only-export-components */
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

    const logout = useCallback(() => {
        setUser(null);
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    }, []);

    const scheduleAutoLogout = useCallback((expiresAt) => {
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        const remaining = expiresAt - Date.now();
        if (remaining > 0) {
            expiryTimerRef.current = setTimeout(() => {
                logout();
            }, remaining);
        }
    }, [logout]);

    useEffect(() => {
        async function restoreSession() {
            try {
                await initializeDefaultUsers();

                const sessionRaw =
                    sessionStorage.getItem(SESSION_KEY)
                    || localStorage.getItem(REMEMBER_KEY);

                if (!sessionRaw) return;

                try {
                    const session = JSON.parse(sessionRaw);
                    if (session.expiresAt > Date.now() && session.user) {
                        setUser(session.user);
                        scheduleAutoLogout(session.expiresAt);
                    } else {
                        sessionStorage.removeItem(SESSION_KEY);
                        localStorage.removeItem(REMEMBER_KEY);
                    }
                } catch {
                    sessionStorage.removeItem(SESSION_KEY);
                    localStorage.removeItem(REMEMBER_KEY);
                }
            } catch (err) {
                console.error('Session restore failed:', err);
            } finally {
                setLoading(false);
            }
        }

        restoreSession();

        return () => {
            if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        };
    }, [scheduleAutoLogout]);

    const login = useCallback(async (username, password, rememberMe = false) => {
        const rateCheck = checkRateLimit();
        if (!rateCheck.allowed) {
            return {
                success: false,
                error: `Too many failed attempts. Try again in ${rateCheck.lockoutSeconds} seconds.`,
                lockoutSeconds: rateCheck.lockoutSeconds,
            };
        }

        const cleanUsername = sanitizeInput(username).toLowerCase();
        const cleanPassword = password;

        if (!cleanUsername) return { success: false, error: 'Username is required' };
        if (!cleanPassword) return { success: false, error: 'Password is required' };

        const usersRaw = localStorage.getItem('scrumpro_users');
        if (!usersRaw) {
            return { success: false, error: 'Authentication system not initialized' };
        }

        let users;
        try {
            users = JSON.parse(usersRaw);
        } catch {
            localStorage.removeItem('scrumpro_users');
            await initializeDefaultUsers();
            return { success: false, error: 'Authentication data was corrupted and has been reset. Please try again.' };
        }

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

        recordSuccess();

        const expiryHours = rememberMe ? 720 : 8;
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

        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        if (rememberMe) {
            localStorage.setItem(REMEMBER_KEY, JSON.stringify(sessionData));
        } else {
            localStorage.removeItem(REMEMBER_KEY);
        }

        setUser(sessionData.user);
        scheduleAutoLogout(sessionToken.expiresAt);

        return { success: true };
    }, [scheduleAutoLogout]);

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

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}

