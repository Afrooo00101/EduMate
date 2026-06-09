// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDoZebcPthz70oxICYAMm4W43JGXVUkTZE",
    authDomain: "edumate-8b4c3.firebaseapp.com",
    projectId: "edumate-8b4c3",
    storageBucket: "edumate-8b4c3.firebasestorage.app",
    messagingSenderId: "962420815642",
    appId: "1:962420815642:web:a8f38ee45034fdefb31ea3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Admin emails (keeping for reference but not using for rules)
const ADMIN_EMAILS = ['admin@edumate.com', 'superadmin@edumate.com'];

// Simple input sanitizer + brute force & rate limiting guard
const LOGIN_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const LOGIN_LIMIT_MAX_ATTEMPTS = 5;
const LOGIN_LIMIT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const GLOBAL_RATE_WINDOW_MS = 60 * 1000; // 1 minute
const GLOBAL_RATE_MAX_PER_MIN = 60;      // 60 requests per minute per action

function sanitizeInput(value) {
    return (value || '').replace(/[<>]/g, '').trim();
}

function getWebLoginGuardState() {
    try {
        return JSON.parse(localStorage.getItem('edumate_login_guard_web') || '{}');
    } catch {
        return {};
    }
}

function saveWebLoginGuardState(state) {
    localStorage.setItem('edumate_login_guard_web', JSON.stringify(state));
}

function getWebLoginBucket(type) {
    const state = getWebLoginGuardState();
    if (!state[type]) {
        state[type] = { windowStart: Date.now(), count: 0, blockedUntil: 0 };
        saveWebLoginGuardState(state);
    }
    return state[type];
}

function canAttemptWebLogin(type) {
    const state = getWebLoginGuardState();
    const bucket = getWebLoginBucket(type);
    const now = Date.now();

    if (bucket.blockedUntil && now < bucket.blockedUntil) {
        const remaining = Math.ceil((bucket.blockedUntil - now) / 1000);
        return { allowed: false, message: `Too many failed attempts. Please wait ${remaining} seconds before trying again.` };
    }

    if (now - bucket.windowStart > LOGIN_LIMIT_WINDOW_MS) {
        bucket.windowStart = now;
        bucket.count = 0;
        bucket.blockedUntil = 0;
        state[type] = bucket;
        saveWebLoginGuardState(state);
    }

    return { allowed: true };
}

function registerFailedWebLogin(type, identifier) {
    const state = getWebLoginGuardState();
    const bucket = getWebLoginBucket(type);
    const now = Date.now();

    if (now - bucket.windowStart > LOGIN_LIMIT_WINDOW_MS) {
        bucket.windowStart = now;
        bucket.count = 0;
        bucket.blockedUntil = 0;
    }

    bucket.count += 1;

    if (bucket.count >= LOGIN_LIMIT_MAX_ATTEMPTS) {
        bucket.blockedUntil = now + LOGIN_LIMIT_COOLDOWN_MS;
        // Simple client-side log of brute force events
        const logs = JSON.parse(localStorage.getItem('edumate_login_fail_logs') || '[]');
        logs.push({ type, email: identifier || 'unknown', reason: 'brute_force', timestamp: new Date().toISOString() });
        localStorage.setItem('edumate_login_fail_logs', JSON.stringify(logs));
    }

    state[type] = bucket;
    saveWebLoginGuardState(state);
}

function resetWebLoginAttempts(type) {
    const state = getWebLoginGuardState();
    if (state[type]) {
        state[type].count = 0;
        state[type].blockedUntil = 0;
        state[type].windowStart = Date.now();
        saveWebLoginGuardState(state);
    }
}

// Generic per-action rate limiting (front-end approximation per IP)
function checkGlobalRateLimit(actionKey) {
    try {
        const raw = localStorage.getItem('edumate_rate_limits') || '{}';
        let state;
        try {
            state = JSON.parse(raw);
        } catch {
            state = {};
        }

        if (!state[actionKey]) {
            state[actionKey] = { windowStart: Date.now(), count: 0, blockedUntil: 0 };
        }

        const bucket = state[actionKey];
        const now = Date.now();

        if (bucket.blockedUntil && now < bucket.blockedUntil) {
            const remaining = Math.ceil((bucket.blockedUntil - now) / 1000);
            return { allowed: false, remaining };
        }

        if (now - bucket.windowStart > GLOBAL_RATE_WINDOW_MS) {
            bucket.windowStart = now;
            bucket.count = 0;
            bucket.blockedUntil = 0;
        }

        if (bucket.count >= GLOBAL_RATE_MAX_PER_MIN) {
            // Block for 5 minutes after exceeding 60 requests in a minute
            bucket.blockedUntil = now + 5 * 60 * 1000;
            state[actionKey] = bucket;
            localStorage.setItem('edumate_rate_limits', JSON.stringify(state));
            const remaining = Math.ceil((bucket.blockedUntil - now) / 1000);
            return { allowed: false, remaining };
        }

        bucket.count += 1;
        state[actionKey] = bucket;
        localStorage.setItem('edumate_rate_limits', JSON.stringify(state));

        return { allowed: true };
    } catch (e) {
        console.warn('Rate limit check failed:', e);
        return { allowed: true };
    }
}

function normalizePopupMessage(message, fallback = 'Something went wrong.') {
    const text = String(message || fallback).replace(/\s+/g, ' ').trim();
    if (!text) return fallback;
    if (/127\.0\.0\.1|localhost|failed to fetch|networkerror|load failed/i.test(text)) {
        return 'We could not connect to the server right now. Please try again in a moment.';
    }
    if (/request timed out|timeout/i.test(text)) {
        return 'The request took too long. Please try again.';
    }
    return text;
}

function ensurePopupStyles() {
    if (document.getElementById('edumate-popup-style')) return;
    const style = document.createElement('style');
    style.id = 'edumate-popup-style';
    style.textContent = `
        .edumate-popup-stack{position:fixed;top:20px;right:20px;display:grid;gap:12px;z-index:5000;max-width:min(92vw,380px)}
        .edumate-popup{position:relative;overflow:hidden;padding:14px 16px 14px 18px;border-radius:18px;color:#fff;
            backdrop-filter:blur(18px);box-shadow:0 18px 45px rgba(15,23,42,.22);border:1px solid rgba(255,255,255,.18);
            animation:edumatePopupIn .28s ease}
        .edumate-popup::after{content:'';position:absolute;inset:auto 0 0 0;height:3px;background:rgba(255,255,255,.32)}
        .edumate-popup.success{background:linear-gradient(135deg,rgba(5,150,105,.96),rgba(16,185,129,.94))}
        .edumate-popup.error{background:linear-gradient(135deg,rgba(220,38,38,.97),rgba(248,113,113,.92))}
        .edumate-popup.warning{background:linear-gradient(135deg,rgba(217,119,6,.97),rgba(251,191,36,.92))}
        .edumate-popup.info{background:linear-gradient(135deg,rgba(37,99,235,.97),rgba(96,165,250,.92))}
        .edumate-popup-title{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;opacity:.78;margin-bottom:4px;font-weight:700}
        .edumate-popup-message{font-size:.97rem;line-height:1.45;font-weight:600;padding-right:18px}
        .edumate-popup-close{position:absolute;top:10px;right:10px;border:none;background:transparent;color:#fff;font-size:1rem;cursor:pointer;opacity:.82}
        .edumate-popup-hide{animation:edumatePopupOut .22s ease forwards}
        @keyframes edumatePopupIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes edumatePopupOut{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(-6px) scale(.98)}}
    `;
    document.head.appendChild(style);
}

function showNotification(message, type = 'info', duration = 3000) {
    ensurePopupStyles();
    let stack = document.getElementById('edumate-popup-stack');
    if (!stack) {
        stack = document.createElement('div');
        stack.id = 'edumate-popup-stack';
        stack.className = 'edumate-popup-stack';
        document.body.appendChild(stack);
    }

    const popup = document.createElement('div');
    popup.className = `edumate-popup ${type || 'info'}`;
    popup.innerHTML = `
        <button class="edumate-popup-close" type="button" aria-label="Close">×</button>
        <div class="edumate-popup-title">${type || 'info'}</div>
        <div class="edumate-popup-message">${normalizePopupMessage(message)}</div>
    `;
    popup.querySelector('.edumate-popup-close')?.addEventListener('click', () => popup.remove());
    stack.appendChild(popup);

    setTimeout(() => {
        if (!popup.parentNode) return;
        popup.classList.add('edumate-popup-hide');
        setTimeout(() => popup.remove(), 220);
    }, duration);
}

const Toast = {
    show: showNotification,
    success(message) { showNotification(message, 'success'); },
    error(message) { showNotification(message, 'error'); },
    warning(message) { showNotification(message, 'warning'); },
    info(message) { showNotification(message, 'info'); }
};

// Client-side security logging
function logClientSecurityEvent(eventType, details) {
    try {
        const logs = JSON.parse(localStorage.getItem('edumate_client_security_logs') || '[]');
        logs.unshift({
            type: eventType,
            details,
            timestamp: new Date().toISOString()
        });
        // Keep last 200 events
        if (logs.length > 200) logs.length = 200;
        localStorage.setItem('edumate_client_security_logs', JSON.stringify(logs));
    } catch (e) {
        console.warn('Failed to log security event:', e);
    }
}

// Login handler - Updated with new rules
async function handleLogin() {
    if (window.handleLogin && window.handleLogin !== handleLogin) {
        return await window.handleLogin.apply(this, arguments);
    }
    const msg = 'The login system is still initializing or backend_api.js failed to load. Please refresh the page.';
    console.error(msg);
    if (typeof Toast !== 'undefined') Toast.error(msg);
    else alert(msg);
}

// Handle social login - Disabled with new rules
async function handleSocialLogin(providerType) {
    Toast.error('Social login is currently disabled. Please use your @sut.edu.eg email to login.');
    return;
}

// Handle forgot password - Disabled with new rules
async function handleForgotPassword() {
    Toast.error('Password reset is disabled. Please use the standard passwords: sut12345 for students, admin123 for admins');
    setTimeout(() => showLogin(), 2000);
}

// Check session on load
function checkSession() {
    if (window.checkSession && window.checkSession !== checkSession) {
        return window.checkSession.apply(this, arguments);
    }
    console.warn('checkSession is handled by backend_api.js');
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('edumate_theme', isDark ? 'dark' : 'light');
    
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.textContent = isDark ? '☀️' : '🌙';
    }
}

// Update theme icon
function updateThemeIcon() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        const isDark = document.body.classList.contains('dark-theme');
        toggle.textContent = isDark ? '☀️' : '🌙';
    }
}

// Load theme
const savedTheme = localStorage.getItem('edumate_theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
} else if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
}

// Export for global use
window.handleLogin = handleLogin;
window.handleSocialLogin = handleSocialLogin;
window.handleForgotPassword = handleForgotPassword;
window.toggleTheme = toggleTheme;
window.checkSession = checkSession;
window.showNotification = showNotification;
window.Toast = Toast;
window.alert = function (message) {
    showNotification(message, 'info');
};

