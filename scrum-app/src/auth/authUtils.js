// Password Hashing (Web Crypto API)

export function generateSalt() {
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export async function verifyPassword(password, salt, storedHash) {
    const computed = await hashPassword(password, salt);
    if (computed.length !== storedHash.length) return false;
    let mismatch = 0;
    for (let i = 0; i < computed.length; i++) {
        mismatch |= computed.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return mismatch === 0;
}

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

export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim();
}

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
