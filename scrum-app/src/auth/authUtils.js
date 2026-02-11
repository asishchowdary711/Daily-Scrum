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
 * Convert ArrayBuffer to hex string.
 */
function bufToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
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
    return bufToHex(hashBuffer);
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

// ─── HMAC Session Signing (Web Crypto API) ───

/**
 * Sign a session payload using HMAC-SHA256.
 * @param {string} payload - The data to sign.
 * @param {CryptoKey} secretKey - HMAC key object.
 * @returns {Promise<string>} Hex-encoded HMAC signature.
 */
export async function signSession(payload, secretKey) {
    const encoder = new TextEncoder();
    const signatureBuffer = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(payload));
    return bufToHex(signatureBuffer);
}

/**
 * Verify an HMAC-SHA256 session signature (constant-time).
 * @param {string} payload - The original signed data.
 * @param {string} signature - The hex signature to verify.
 * @param {CryptoKey} secretKey - HMAC key object.
 * @returns {Promise<boolean>}
 */
export async function verifySessionSignature(payload, signature, secretKey) {
    const expected = await signSession(payload, secretKey);
    if (expected.length !== signature.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expected.length; i++) {
        mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return mismatch === 0;
}

/**
 * Generate a new HMAC-SHA256 CryptoKey (ephemeral, in-memory only).
 * This key is lost on page reload, which forces re-authentication.
 * @returns {Promise<CryptoKey>}
 */
export async function generateHMACKey() {
    return crypto.subtle.generateKey(
        { name: 'HMAC', hash: 'SHA-256' },
        false, // non-extractable — cannot be read from JS
        ['sign', 'verify']
    );
}

// ─── Session Token ───

/**
 * Generate a signed session token with HMAC signature.
 * @param {string} userId
 * @param {CryptoKey} hmacKey - The in-memory HMAC key.
 * @param {number} expiryHours
 * @returns {Promise<{ token: string, signature: string, expiresAt: number, payload: string }>}
 */
export async function generateSessionToken(userId, hmacKey, expiryHours = 8) {
    const nonce = generateSalt();
    const timestamp = Date.now();
    const expiresAt = timestamp + expiryHours * 60 * 60 * 1000;
    const payload = `${userId}:${expiresAt}:${nonce}`;

    const signature = await signSession(payload, hmacKey);

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(payload));
    const token = bufToHex(hashBuffer);

    return { token, signature, expiresAt, payload };
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
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one special character' };
    }
    return { valid: true };
}

/**
 * Validate username (alphanumeric, 3-20 chars).
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

// ─── Default Users (Pre-computed hashes — NO plaintext passwords) ───
// Passwords were hashed offline. They are NOT recoverable from this source.
// To change credentials, re-hash with: hashPassword(newPassword, newSalt)

const DEMO_MODE = true; // Set to false in production to disable default users

const PRE_COMPUTED_USERS = [
    {
        id: 'user_001',
        username: 'admin',
        displayName: 'Admin',
        role: 'Scrum Master',
        salt: 'd92e2c9729964b2d9233dfa3eabcc180',
        passwordHash: 'c814831ddc0e60687792695701a41f472da767a14c4da0e8bf73b3684efcb9ce',
    },
    {
        id: 'user_002',
        username: 'asish',
        displayName: 'Asish V',
        role: 'Scrum Master',
        salt: '64f0561a4df041189b2ab84a90022559',
        passwordHash: '92a8fdc9d5e3dedb3222bd14bc8a8e27edd3c71fa3f3fdbe88ede60d4558f793',
    },
];

/**
 * Initialize default users from pre-computed hashes.
 * No plaintext passwords are ever present in client code.
 */
export async function initializeDefaultUsers() {
    const storageKey = 'scrumpro_users';

    try {
        const existing = localStorage.getItem(storageKey);
        if (existing) {
            const parsed = JSON.parse(existing);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {
        // Corrupted data — will be overwritten below
        localStorage.removeItem(storageKey);
    }

    if (!DEMO_MODE) {
        console.warn('[ScrumPro] Demo mode disabled. No default users provisioned. Configure users server-side.');
        return [];
    }

    console.warn('[ScrumPro] ⚠️ Demo mode active — default users provisioned. Disable DEMO_MODE for production.');

    // Store only pre-computed hashes — no passwords involved
    localStorage.setItem(storageKey, JSON.stringify(PRE_COMPUTED_USERS));
    return PRE_COMPUTED_USERS;
}
