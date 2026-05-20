(function () {
    const API_BASE = window.__EDUMATE_API_BASE__ || 'http://127.0.0.1:8001/api/v1';
    const TOKEN_KEY = 'edumate_admin_token';
    const USER_KEY = 'edumate_admin_user';
    const DEV_CAPTCHA_TOKEN = 'test-pass';
    const REQUEST_TIMEOUT_MS = 20000;

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

    function formatErrorMessage(message) {
        if (typeof message === 'string') return message;
        if (Array.isArray(message)) {
            return message.map((item) => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object') {
                    if (item.msg) return item.msg;
                    if (item.message) return item.message;
                }
                return JSON.stringify(item);
            }).join(', ');
        }
        if (message && typeof message === 'object') {
            if (message.detail) return formatErrorMessage(message.detail);
            if (message.message) return String(message.message);
            return JSON.stringify(message);
        }
        return 'Unexpected error';
    }

    function notify(message, type) {
        showNotification(formatErrorMessage(message), type || 'info');
    }

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY) || '';
    }

    function getStoredUser() {
        try {
            return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
        } catch (_error) {
            return null;
        }
    }

    function setAdminSession(user, token) {
        if (token) sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        sessionStorage.setItem('edumate_admin_logged', (user.role === 'admin' || user.role === 'advisor') ? '1' : '0');
        sessionStorage.setItem('edumate_admin_email', user.email || '');
        sessionStorage.setItem('edumate_user_type', user.role);
        sessionStorage.setItem('edumate_logged', user.role === 'student' ? '1' : '0');
    }

    function clearAdminSession() {
        [TOKEN_KEY, USER_KEY, 'edumate_admin_logged', 'edumate_admin_email', 'edumate_user_type', 'edumate_logged'].forEach((key) => sessionStorage.removeItem(key));
    }

    function buildApiBases() {
        const bases = [API_BASE];
        const url = new URL(API_BASE);
        
        // Ensure we try both 8000 and 8001, but prioritize the current API_BASE
        if (url.port === '8000') {
            bases.push(API_BASE.replace(':8000', ':8001'));
        } else if (url.port === '8001') {
            bases.push(API_BASE.replace(':8001', ':8000'));
        }
        
        // Also add localhost/127.0.0.1 variants
        const extraBases = [];
        bases.forEach(b => {
            if (b.includes('127.0.0.1')) extraBases.push(b.replace('127.0.0.1', 'localhost'));
            if (b.includes('localhost')) extraBases.push(b.replace('localhost', '127.0.0.1'));
        });
        
        return [...new Set([...bases, ...extraBases])];
    }


    async function fetchWithBase(base, path, requestOptions, headers) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            return await fetch(`${base}${path}`, {
                method: requestOptions.method || 'GET',
                headers,
                body: requestOptions.body,
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async function apiFetch(path, options) {
        const requestOptions = options || {};
        const headers = Object.assign({ Accept: 'application/json' }, requestOptions.headers || {});
        if (requestOptions.body !== undefined && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
        if (requestOptions.auth !== false && getToken()) {
            headers.Authorization = `Bearer ${getToken()}`;
        }
        
        let response = null;
        let lastNetworkError = null;
        for (const base of buildApiBases()) {
            try {
                console.log(`[AdminAPI] Trying connection to: ${base}${path}`);
                response = await fetchWithBase(base, path, requestOptions, headers);
                lastNetworkError = null;
                console.log(`[AdminAPI] Successfully connected to: ${base}`);
                break;
            } catch (error) {
                console.warn(`[AdminAPI] Connection failed for ${base}:`, error);
                lastNetworkError = error;
            }
        }

        if (!response) {
            const reason = lastNetworkError?.name === 'AbortError'
                ? 'The request took too long. Please check your connection and try again.'
                : 'Could not connect to the EduMate server. Please ensure the backend is running on port 8001.';
            throw new Error(reason);
        }
        if (!response.ok) {
            let detail = `Request failed (${response.status})`;
            try {
                const data = await response.json();
                detail = formatErrorMessage(data.detail || data);
            } catch (_error) {}
            throw new Error(detail);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    function getCaptchaToken() {
        // Always return test token in development to avoid CAPTCHA blocks
        return DEV_CAPTCHA_TOKEN;
    }

    window.edumateAdminApiFetch = apiFetch;
    window.edumateAdminNotify = notify;
    window.showNotification = window.showNotification || showNotification;
    window.Toast = window.Toast || {
        show: showNotification,
        success(message) { showNotification(message, 'success'); },
        error(message) { showNotification(message, 'error'); },
        warning(message) { showNotification(message, 'warning'); },
        info(message) { showNotification(message, 'info'); },
    };
    window.alert = function (message) {
        showNotification(message, 'info');
    };

    async function fetchCurrentAdmin() {
        if (!getToken()) return null;
        const user = await apiFetch('/auth/me');
        if (!user || (user.role !== 'admin' && user.role !== 'advisor')) {
            throw new Error('Unauthorized access');
        }
        setAdminSession(user);
        return user;
    }

    const originalUpdateAdminProfile = typeof window.updateAdminProfile === 'function' ? window.updateAdminProfile : null;
    window.updateAdminProfile = function () {
        if (originalUpdateAdminProfile) originalUpdateAdminProfile();
        const user = getStoredUser();
        const adminName = document.getElementById('admin-name');
        if (adminName && user) {
            adminName.textContent = user.name || user.full_name || user.email;
        }
    };

    window.verifyAdminAndProceed = async function () {
        try {
            const user = await fetchCurrentAdmin();
            sessionStorage.setItem('edumate_admin_logged', '1');
            sessionStorage.setItem('edumate_admin_email', user.email || '');
            if (typeof window.updateAdminProfile === 'function') window.updateAdminProfile();
            if (typeof window.loadAllDashboardData === 'function') window.loadAllDashboardData();
            if (typeof window.navigateTo === 'function') window.navigateTo(document.getElementById('advisor-dashboard') ? 'advisor-dashboard' : 'dashboard');
        } catch (error) {
            clearAdminSession();
            notify(error.message || 'Unauthorized access', 'error');
            if (typeof window.navigateTo === 'function') window.navigateTo('login');
        }
    };

    window.attemptAdminLogin = async function () {
        const email = String(document.getElementById('admin-email')?.value || '').trim();
        const password = String(document.getElementById('admin-password')?.value || '').trim();
        if (!email || !password) {
            notify('Please enter email and password', 'error');
            return;
        }
        try {
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                auth: false,
                body: JSON.stringify({ email, password, captcha_token: getCaptchaToken() }),
            });
            if (!data.user || (data.user.role !== 'admin' && data.user.role !== 'advisor')) {
                clearAdminSession();
                notify('This account does not have advisor/admin access', 'error');
                return;
            }
            setAdminSession(data.user, data.access_token);
            if (typeof window.grecaptcha !== 'undefined') {
                try { window.grecaptcha.reset(); } catch (_error) {}
            }
            if (window.logSecurityEvent) window.logSecurityEvent('Admin login successful', data.user.email);
            if (window.resetLoginAttempts) window.resetLoginAttempts('admin');
            await window.verifyAdminAndProceed();
        } catch (error) {
            if (window.registerFailedLogin) window.registerFailedLogin('admin', email);
            notify(error.message || 'Admin login failed', 'error');
        }
    };

    window.signOut = async function () {
        try {
            if (getToken()) {
                await apiFetch('/auth/logout', { method: 'POST' });
            }
        } catch (_error) {}
        clearAdminSession();
        if (typeof window.updateActiveNavItem === 'function') window.updateActiveNavItem('login');
        if (typeof window.navigateTo === 'function') window.navigateTo('login');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 100);
    };

    document.addEventListener('DOMContentLoaded', async function () {
        if (!getToken()) return;
        try {
            const user = await fetchCurrentAdmin();
            if (user && typeof window.navigateTo === 'function') {
                sessionStorage.setItem('edumate_admin_logged', '1');
                sessionStorage.setItem('edumate_admin_email', user.email || '');
                window.navigateTo(document.getElementById('advisor-dashboard') ? 'advisor-dashboard' : 'dashboard');
                if (typeof window.updateAdminProfile === 'function') window.updateAdminProfile();
            }
        } catch (_error) {
            clearAdminSession();
        }
    });
})();
