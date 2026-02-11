/**
 * Rate Limiter — Brute-force protection for login attempts.
 *
 * - Max 5 failed attempts per 15-minute window
 * - Progressive lockout: 30s → 60s → 5min → 15min
 * - Stored in sessionStorage (resets on browser close)
 */

const STORAGE_KEY = 'scrumpro_rate_limit';
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Progressive lockout durations in seconds
const LOCKOUT_TIERS = [30, 60, 300, 900]; // 30s, 1m, 5m, 15m

function getState() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setState(state) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createFreshState() {
    return {
        attempts: 0,
        windowStart: Date.now(),
        lockoutUntil: 0,
        lockoutCount: 0,
    };
}

/**
 * Check if a login attempt is allowed.
 * @returns {{ allowed: boolean, remainingAttempts: number, lockoutSeconds: number }}
 */
export function checkRateLimit() {
    let state = getState();

    if (!state) {
        state = createFreshState();
        setState(state);
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockoutSeconds: 0 };
    }

    const now = Date.now();

    // Check if currently locked out
    if (state.lockoutUntil > now) {
        const lockoutSeconds = Math.ceil((state.lockoutUntil - now) / 1000);
        return { allowed: false, remainingAttempts: 0, lockoutSeconds };
    }

    // Check if the window has expired — reset
    if (now - state.windowStart > WINDOW_MS) {
        state = createFreshState();
        setState(state);
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockoutSeconds: 0 };
    }

    const remaining = Math.max(0, MAX_ATTEMPTS - state.attempts);
    return { allowed: remaining > 0, remainingAttempts: remaining, lockoutSeconds: 0 };
}

/**
 * Record a failed login attempt.
 * @returns {{ allowed: boolean, remainingAttempts: number, lockoutSeconds: number }}
 */
export function recordFailedAttempt() {
    let state = getState() || createFreshState();
    const now = Date.now();

    // Reset window if expired
    if (now - state.windowStart > WINDOW_MS) {
        state = createFreshState();
    }

    state.attempts += 1;

    if (state.attempts >= MAX_ATTEMPTS) {
        // Apply progressive lockout
        const tierIndex = Math.min(state.lockoutCount, LOCKOUT_TIERS.length - 1);
        const lockoutDuration = LOCKOUT_TIERS[tierIndex] * 1000;
        state.lockoutUntil = now + lockoutDuration;
        state.lockoutCount += 1;
        state.attempts = 0; // Reset attempt counter for next window
        state.windowStart = now + lockoutDuration; // New window after lockout

        setState(state);
        return {
            allowed: false,
            remainingAttempts: 0,
            lockoutSeconds: LOCKOUT_TIERS[tierIndex],
        };
    }

    setState(state);
    return {
        allowed: true,
        remainingAttempts: MAX_ATTEMPTS - state.attempts,
        lockoutSeconds: 0,
    };
}

/**
 * Record a successful login (resets all counters).
 */
export function recordSuccess() {
    sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * Format lockout seconds into a human-readable string.
 * @param {number} seconds
 * @returns {string}
 */
export function formatLockoutTime(seconds) {
    if (seconds <= 0) return '';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
