(function () {
    const API_BASE = 'http://127.0.0.1:8000/api/v1';
    const TOKEN_KEY = 'edumate_access_token';
    const USER_KEY = 'edumate_current_user';

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
        const formatted = formatErrorMessage(message);
        if (window.Toast && type === 'error' && typeof window.Toast.error === 'function') {
            window.Toast.error(formatted);
            return;
        }
        if (window.Toast && type === 'success' && typeof window.Toast.success === 'function') {
            window.Toast.success(formatted);
            return;
        }
        alert(formatted);
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

    function setAdminSession(student, token) {
        if (token) sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(student));
        sessionStorage.setItem('edumate_admin_logged', student.is_admin ? '1' : '0');
        sessionStorage.setItem('edumate_admin_email', student.email || '');
        sessionStorage.setItem('edumate_user_type', student.is_admin ? 'admin' : 'student');
        sessionStorage.setItem('edumate_logged', student.is_admin ? '0' : '1');
    }

    function clearAdminSession() {
        [TOKEN_KEY, USER_KEY, 'edumate_admin_logged', 'edumate_admin_email', 'edumate_user_type', 'edumate_logged'].forEach((key) => sessionStorage.removeItem(key));
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
        const response = await fetch(`${API_BASE}${path}`, {
            method: requestOptions.method || 'GET',
            headers,
            body: requestOptions.body,
        });
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
        if (typeof window.grecaptcha !== 'undefined') {
            const token = window.grecaptcha.getResponse();
            if (!token) throw new Error('CAPTCHA required');
            return token;
        }
        return 'test-pass';
    }

    async function fetchCurrentAdmin() {
        if (!getToken()) return null;
        const student = await apiFetch('/auth/me');
        if (!student || !student.is_admin) {
            throw new Error('Unauthorized admin access');
        }
        setAdminSession(student);
        return student;
    }

    const originalUpdateAdminProfile = typeof window.updateAdminProfile === 'function' ? window.updateAdminProfile : null;
    window.updateAdminProfile = function () {
        if (originalUpdateAdminProfile) originalUpdateAdminProfile();
        const user = getStoredUser();
        const adminName = document.getElementById('admin-name');
        if (adminName && user) {
            adminName.textContent = user.full_name || user.email;
        }
    };

    window.verifyAdminAndProceed = async function () {
        try {
            const user = await fetchCurrentAdmin();
            sessionStorage.setItem('edumate_admin_logged', '1');
            sessionStorage.setItem('edumate_admin_email', user.email || '');
            if (typeof window.updateAdminProfile === 'function') window.updateAdminProfile();
            if (typeof window.loadAllDashboardData === 'function') window.loadAllDashboardData();
            if (typeof window.navigateTo === 'function') window.navigateTo('dashboard');
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
            if (!data.student || !data.student.is_admin) {
                clearAdminSession();
                notify('This account is not an admin account', 'error');
                return;
            }
            setAdminSession(data.student, data.access_token);
            if (typeof window.grecaptcha !== 'undefined') {
                try { window.grecaptcha.reset(); } catch (_error) {}
            }
            if (window.logSecurityEvent) window.logSecurityEvent('Admin login successful', data.student.email);
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
                window.navigateTo('dashboard');
                if (typeof window.updateAdminProfile === 'function') window.updateAdminProfile();
            }
        } catch (_error) {
            clearAdminSession();
        }
    });
})();
