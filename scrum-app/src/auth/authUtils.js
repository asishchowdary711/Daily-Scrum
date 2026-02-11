// ─── Password Hashing (Web Crypto API) ───

/**
 * Generate a cryptographically random salt (16 bytes, hex-encoded).
 */
export function generateSalt() {
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with SHA-256 using the Web Crypto API.
 * @param {string} password - The plaintext password.
 * @param {string} salt - Hex-encoded salt.
 * @returns {Promise<string>} Hex-encoded hash.
 */
export async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password + salt); // salt-password-salt sandwich
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Verify a password against a stored hash (constant-time comparison).
 * @param {string} password - The plaintext password to verify.
 * @param {string} salt - The stored salt.
 * @param {string} storedHash - The stored hash to compare against.
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, salt, storedHash) {
    const computed = await hashPassword(password, salt);
    // Constant-time comparison to prevent timing attacks
    if (computed.length !== storedHash.length) return false;
    let mismatch = 0;
    for (let i = 0; i < computed.length; i++) {
        mismatch |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return mismatch === 0;
}

// ─── Session Token ───

/**
 * Generate a signed session token.
 * @param {string} userId
 * @returns {Promise<{ token: string, expiresAt: number }>}
 */
export async function generateSessionToken(userId, expiryHours = 8) {
    const nonce = generateSalt();
    const timestamp = Date.now();
    const expiresAt = timestamp + expiryHours * 60 * 60 * 1000;
    const payload = `${userId}:${timestamp}:${nonce}`;

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(payload));
    const token = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return { token, expiresAt, userId, nonce };
}

// ─── Input Sanitization ───

/**
 * Sanitize user input to prevent XSS.
 * Strips script tags, HTML entities, and dangerous patterns.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')         // Strip all HTML tags
        .replace(/javascript:/gi, '')     // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '')       // Remove event handlers (onclick=, etc.)
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim();
}

// ─── Validation ───

/**
 * Validate email format.
 * @param {string} email
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return { valid: false, error: 'Email is required' };
    }
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
}

/**
 * Validate password strength.
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
 * @param {string} password
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePassword(password) {
    if (!password || password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one special character' };
    }
    return { valid: true };
}

/**
 * Validate username (alphanumeric, 3-20 chars).
 * @param {string} username
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUsername(username) {
    if (!username || username.trim().length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (username.length > 20) {
        return { valid: false, error: 'Username must be at most 20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true };
}

// ─── Default Users (Pre-hashed) ───

/**
 * Initialize default users with pre-computed salted hashes.
 * Called once on first load if no users exist in storage.
 */
export async function initializeDefaultUsers() {
    const storageKey = 'scrumpro_users';
    const existing = localStorage.getItem(storageKey);
    if (existing) return JSON.parse(existing);

    const users = [
        {
            id: 'user_001',
            username: 'admin',
            displayName: 'Admin',
            role: 'Scrum Master',
            salt: generateSalt(),
        },
        {
            id: 'user_002',
            username: 'asish',
            displayName: 'Asish V',
            role: 'Scrum Master',
            salt: generateSalt(),
        },
    ];

    const passwords = ['ScrumPro@2026', 'Scrum@123'];

    for (let i = 0; i < users.length; i++) {
        users[i].passwordHash = await hashPassword(passwords[i], users[i].salt);
    }

    localStorage.setItem(storageKey, JSON.stringify(users));
    return users;
}
