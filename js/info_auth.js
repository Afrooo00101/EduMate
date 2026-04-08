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

// Toast notification system
const Toast = {
    container: document.getElementById('toast-container'),
    
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'âœ…',
            error: 'âŒ',
            warning: 'âš ï¸',
            info: 'â„¹ï¸'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">âœ•</button>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },
    
    success(message) {
        this.show(message, 'success');
    },
    
    error(message) {
        this.show(message, 'error');
    },
    
    warning(message) {
        this.show(message, 'warning');
    },
    
    info(message) {
        this.show(message, 'info');
    }
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
    console.warn('handleLogin is handled by backend_api.js');
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
        toggle.textContent = isDark ? 'â˜€ï¸' : 'ðŸŒ™';
    }
}

// Update theme icon
function updateThemeIcon() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        const isDark = document.body.classList.contains('dark-theme');
        toggle.textContent = isDark ? 'â˜€ï¸' : 'ðŸŒ™';
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

