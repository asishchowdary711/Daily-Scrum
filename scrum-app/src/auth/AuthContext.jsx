import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
    initializeDefaultUsers,
    verifyPassword,
    generateSessionToken,
    verifySessionSignature,
    generateHMACKey,
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
    // In-memory HMAC key — lost on page reload → forces re-auth (Finding 1)
    const hmacKeyRef = useRef(null);

    // ─── Restore session on mount ───
    useEffect(() => {
        async function restoreSession() {
            try {
                // Generate ephemeral HMAC key for this browser session
                hmacKeyRef.current = await generateHMACKey();

                // Initialize default users on first load
                await initializeDefaultUsers();

                // Check for existing session
                let sessionRaw = null;

                try {
                    const sessionStr = sessionStorage.getItem(SESSION_KEY);
                    if (sessionStr) { sessionRaw = JSON.parse(sessionStr); }
                } catch {
                    sessionStorage.removeItem(SESSION_KEY);
                }

                if (!sessionRaw) {
                    try {
                        const rememberStr = localStorage.getItem(REMEMBER_KEY);
                        if (rememberStr) { sessionRaw = JSON.parse(rememberStr); }
                    } catch {
                        localStorage.removeItem(REMEMBER_KEY);
                    }
                }

                if (sessionRaw && sessionRaw.expiresAt > Date.now() && sessionRaw.user) {
                    // Validate HMAC signature if present (Finding 1)
                    if (sessionRaw.signature && sessionRaw.payload) {
                        const valid = await verifySessionSignature(
                            sessionRaw.payload,
                            sessionRaw.signature,
                            hmacKeyRef.current
                        );
                        if (!valid) {
                            // Signature doesn't match this session's key — reject
                            // This is expected on page reload (new key generated)
                            sessionStorage.removeItem(SESSION_KEY);
                            localStorage.removeItem(REMEMBER_KEY);
                            setLoading(false);
                            return;
                        }
                    } else {
                        // Legacy session without signature — reject it (force re-login)
                        sessionStorage.removeItem(SESSION_KEY);
                        localStorage.removeItem(REMEMBER_KEY);
                        setLoading(false);
                        return;
                    }

                    setUser(sessionRaw.user);
                    scheduleAutoLogout(sessionRaw.expiresAt);
                } else if (sessionRaw) {
                    // Expired — clean up
                    sessionStorage.removeItem(SESSION_KEY);
                    localStorage.removeItem(REMEMBER_KEY);
                }
            } catch (err) {
                console.error('Session restore failed:', err);
                sessionStorage.removeItem(SESSION_KEY);
                localStorage.removeItem(REMEMBER_KEY);
            }
            setLoading(false);
        }

        restoreSession();

        return () => {
            if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const scheduleAutoLogout = useCallback((expiresAt) => {
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        const remaining = expiresAt - Date.now();
        if (remaining > 0) {
            expiryTimerRef.current = setTimeout(() => {
                logout();
            }, remaining);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

        // Load users (Finding 6: guarded JSON.parse)
        const usersRaw = localStorage.getItem('scrumpro_users');
        if (!usersRaw) {
            return { success: false, error: 'Authentication system not initialized' };
        }

        let users;
        try {
            users = JSON.parse(usersRaw);
            if (!Array.isArray(users)) throw new Error('Invalid user data format');
        } catch {
            localStorage.removeItem('scrumpro_users');
            // Re-initialize
            users = await initializeDefaultUsers();
            if (!users || users.length === 0) {
                return { success: false, error: 'Authentication data corrupted. Please reload the page.' };
            }
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

        // Success — create HMAC-signed session (Finding 1)
        recordSuccess();

        const expiryHours = rememberMe ? 720 : 8; // 30 days or 8 hours
        const sessionToken = await generateSessionToken(matchedUser.id, hmacKeyRef.current, expiryHours);

        const sessionData = {
            user: {
                id: matchedUser.id,
                username: matchedUser.username,
                displayName: matchedUser.displayName,
                role: matchedUser.role,
            },
            token: sessionToken.token,
            signature: sessionToken.signature,
            payload: sessionToken.payload,
            expiresAt: sessionToken.expiresAt,
        };

        // Store session + clear stale remember-me if not checked (Finding 3)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        if (rememberMe) {
            localStorage.setItem(REMEMBER_KEY, JSON.stringify(sessionData));
        } else {
            localStorage.removeItem(REMEMBER_KEY); // Finding 3: explicit cleanup
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
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}

export default AuthContext;
