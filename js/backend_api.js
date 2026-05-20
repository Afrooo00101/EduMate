(function () {
    const API_BASE = window.__EDUMATE_API_BASE__ || 'http://127.0.0.1:8001/api/v1';
    const TOKEN_KEY = 'edumate_access_token';
    const USER_KEY = 'edumate_current_user';
    const DEFAULT_AVATAR = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 110 110">
            <defs>
                <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#2563eb" />
                    <stop offset="100%" stop-color="#1d4ed8" />
                </linearGradient>
            </defs>
            <rect width="110" height="110" rx="55" fill="url(#avatarGradient)" />
            <circle cx="55" cy="42" r="18" fill="#ffffff" opacity="0.95" />
            <path d="M26 92c4-16 17-26 29-26s25 10 29 26" fill="#ffffff" opacity="0.95" />
        </svg>`
    )}`;
    const DEV_CAPTCHA_TOKEN = 'test-pass';
    const REQUEST_TIMEOUT_MS = 20000;

    const legacySearchCourses = typeof window.searchCourses === 'function' ? window.searchCourses : null;
    const legacyLoadInternshipsByPosition = typeof window.loadInternshipsByPosition === 'function' ? window.loadInternshipsByPosition : null;
    const legacyLoadPlanningData = typeof window.loadPlanningData === 'function' ? window.loadPlanningData : null;
    const legacySavePlannerData = typeof window.savePlannerData === 'function' ? window.savePlannerData : null;
    const legacySaveCareerRoadmap = typeof window.saveCareerRoadmap === 'function' ? window.saveCareerRoadmap : null;
    const legacyGenerateResumePreview = typeof window.generateResumePreview === 'function' ? window.generateResumePreview : null;
    const legacySaveGoals = typeof window.saveGoals === 'function' ? window.saveGoals : null;
    const legacySaveSkills = typeof window.saveSkills === 'function' ? window.saveSkills : null;

    let cachedMajors = null;
    let cachedCourses = [];
    let cachedSavedInternships = [];
    let latestATSResult = null;

    // --- CRITICAL ASSIGNMENTS MOVED TO TOP ---
    window.handleLogin = function () { return handleBackendLogin('index-page'); };
    window.attemptLogin = function () { return handleBackendLogin('home-page'); };
    // -----------------------------------------

    function normalizePopupMessage(message, fallback = 'Something went wrong.') {
        if (typeof message === 'object') {
            try { message = JSON.stringify(message); } catch (e) { message = String(message); }
        }
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

    function parseStudentIdentityFromEmail(email) {
        const normalized = String(email || '').trim().toLowerCase();
        const match = normalized.match(/^([a-z]+)(\d{3,})@sut\.edu\.eg$/i);
        if (!match) return null;
        const firstName = match[1];
        const studentCode = match[2];
        return {
            firstName,
            fullName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
            studentCode,
        };
    }

    function syncDerivedStudentFields(emailInputId, nameInputId, studentCodeInputId) {
        const emailElement = document.getElementById(emailInputId);
        const nameElement = document.getElementById(nameInputId);
        const codeElement = document.getElementById(studentCodeInputId);
        if (!emailElement || !nameElement || !codeElement) return;

        const parsed = parseStudentIdentityFromEmail(emailElement.value);
        if (parsed) {
            nameElement.value = parsed.fullName;
            codeElement.value = parsed.studentCode;
            nameElement.readOnly = true;
            codeElement.readOnly = true;
            nameElement.dataset.derived = '1';
            codeElement.dataset.derived = '1';
            return;
        }

        nameElement.readOnly = false;
        codeElement.readOnly = false;
        delete nameElement.dataset.derived;
        delete codeElement.dataset.derived;
    }

    function notify(message, type) {
        const friendlyMessage = normalizePopupMessage(message);
        if (typeof window.showNotification === 'function') {
            window.showNotification(friendlyMessage, type || 'info');
            return;
        }
        if (window.Toast && typeof window.Toast.error === 'function' && type === 'error') {
            window.Toast.error(friendlyMessage);
            return;
        }
        if (window.Toast && typeof window.Toast.success === 'function' && type === 'success') {
            window.Toast.success(friendlyMessage);
            return;
        }
        alert(friendlyMessage);
    }

    function getAvatarCacheKey(user) {
        const identity = user?.student_code || user?.email || 'guest';
        return `edumate_avatar_cache_${identity}`;
    }

    function buildInitialsAvatar(name) {
        const source = String(name || 'User').trim();
        const parts = source.split(/\s+/).filter(Boolean);
        const initials = (parts[0]?.[0] || 'U') + (parts[1]?.[0] || '');
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" viewBox="0 0 110 110">
                <defs>
                    <linearGradient id="avatarInitialsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#0f766e" />
                        <stop offset="100%" stop-color="#0ea5e9" />
                    </linearGradient>
                </defs>
                <rect width="110" height="110" rx="55" fill="url(#avatarInitialsGradient)" />
                <text x="55" y="63" text-anchor="middle" font-size="34" font-family="Inter, Arial, sans-serif" font-weight="700" fill="#ffffff">${initials.toUpperCase()}</text>
            </svg>`
        )}`;
    }

    function getCachedAvatar(user) {
        if (!user) return '';
        try {
            return localStorage.getItem(getAvatarCacheKey(user)) || '';
        } catch (_error) {
            return '';
        }
    }

    function cacheAvatarForUser(user, value) {
        if (!user) return;
        const src = String(value || '').trim();
        if (!src || src === DEFAULT_AVATAR) return;
        try {
            localStorage.setItem(getAvatarCacheKey(user), src);
        } catch (_error) {}
    }

    function normalizeAvatarUrl(value) {
        const src = String(value || '').trim();
        return src || DEFAULT_AVATAR;
    }

    function getPreferredAvatar(user, overrideValue) {
        const cached = getCachedAvatar(user);
        const direct = String(overrideValue || user?.profile_image_url || '').trim();
        return cached || direct || buildInitialsAvatar(user?.full_name);
    }

    function applyAvatarSource(imageElement, value, user) {
        if (!imageElement) return;
        imageElement.onerror = function () {
            imageElement.onerror = null;
            imageElement.src = buildInitialsAvatar(user?.full_name);
        };
        imageElement.src = normalizeAvatarUrl(value || getPreferredAvatar(user));
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

    function getMajorLabel(student) {
        return student?.major?.name || sessionStorage.getItem('edumate_major_name') || '';
    }

    function mapStudentToLegacy(student) {
        return {
            username: student.student_code,
            studentCode: student.student_code,
            name: student.full_name,
            email: student.email,
            major: getMajorLabel(student),
            gradYear: student.graduation_year || '',
            skills: student.skills_summary || '',
            profilePic: student.profile_image_url || DEFAULT_AVATAR,
            isAdmin: !!student.is_admin,
        };
    }

    function syncLegacyUser(student) {
        const mapped = mapStudentToLegacy(student);
        try {
            const users = JSON.parse(localStorage.getItem('edumate_users') || '{}');
            users[mapped.username] = {
                ...(users[mapped.username] || {}),
                username: mapped.username,
                name: mapped.name,
                email: mapped.email,
                major: mapped.major,
                gradYear: mapped.gradYear,
                skills: mapped.skills,
                profilePic: mapped.profilePic,
            };
            localStorage.setItem('edumate_users', JSON.stringify(users));
        } catch (_error) {}
        sessionStorage.setItem('edumate_username', mapped.username);
        sessionStorage.setItem('edumate_user_email', mapped.email || '');
        sessionStorage.setItem('edumate_user_type', mapped.isAdmin ? 'admin' : 'student');
        sessionStorage.setItem('edumate_logged', mapped.isAdmin ? '0' : '1');
        sessionStorage.setItem('edumate_admin_logged', mapped.isAdmin ? '1' : '0');
        sessionStorage.setItem('edumate_major_name', mapped.major || '');
    }

    function setSession(student, token) {
        if (token) {
            sessionStorage.setItem(TOKEN_KEY, token);
        }
        cacheAvatarForUser(student, student?.profile_image_url);
        sessionStorage.setItem(USER_KEY, JSON.stringify(student));
        syncLegacyUser(student);
    }

    function clearSession() {
        [TOKEN_KEY, USER_KEY, 'edumate_logged', 'edumate_admin_logged', 'edumate_username', 'edumate_user_email', 'edumate_user_type', 'edumate_major_name'].forEach((key) => sessionStorage.removeItem(key));
    }

    function buildApiBases() {
        const bases = [API_BASE];
        try {
            const url = new URL(API_BASE);
            if (url.port === '8001') bases.push(API_BASE.replace(':8001', ':8000'));
            if (url.port === '8000') bases.unshift(API_BASE.replace(':8000', ':8001'));
        } catch (_error) {}

        const variants = [];
        bases.forEach((base) => {
            variants.push(base);
            if (base.includes('127.0.0.1')) variants.push(base.replace('127.0.0.1', 'localhost'));
            if (base.includes('localhost')) variants.push(base.replace('localhost', '127.0.0.1'));
        });
        return [...new Set(variants)];
    }

    async function fetchWithTimeout(url, requestOptions, headers) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            return await fetch(url, {
                method: requestOptions.method || 'GET',
                headers,
                body: requestOptions.body,
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }
    }

    async function apiFetch(path, options) {
        const requestOptions = options || {};
        const headers = Object.assign({ Accept: 'application/json' }, requestOptions.headers || {});
        const token = getToken();
        const needsAuth = requestOptions.auth !== false;

        if (requestOptions.body !== undefined && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
        if (needsAuth && token) {
            headers.Authorization = `Bearer ${token}`;
        }

        let response = null;
        let lastNetworkError = null;
        for (const base of buildApiBases()) {
            try {
                response = await fetchWithTimeout(`${base}${path}`, requestOptions, headers);
                lastNetworkError = null;
                break;
            } catch (error) {
                lastNetworkError = error;
            }
        }

        if (!response) {
            throw new Error(
                lastNetworkError?.name === 'AbortError'
                    ? 'The request took too long. Please try again.'
                    : 'We could not connect to the server right now. Please try again in a moment.'
            );
        }

        if (response.status === 401) {
            clearSession();
        }
        if (!response.ok) {
            let detail = `Request failed (${response.status})`;
            try {
                const data = await response.json();
                if (data.detail) {
                    if (Array.isArray(data.detail)) {
                        detail = data.detail.map(err => {
                            const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
                            return `${field}: ${err.msg}`;
                        }).join(', ');
                    } else {
                        detail = data.detail;
                    }
                }
            } catch (_error) {}
            throw new Error(detail);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    window.apiFetch = apiFetch;

    async function resolveMajors() {
        if (cachedMajors) return cachedMajors;
        try {
            cachedMajors = await apiFetch('/majors', { auth: false });
        } catch (_error) {
            cachedMajors = [];
        }
        return cachedMajors;
    }

    async function resolveMajorId(value) {
        const name = String(value || '').trim().toLowerCase();
        if (!name) return null;
        const majors = await resolveMajors();
        const matched = majors.find((major) => major.name.toLowerCase() === name);
        return matched ? matched.id : null;
    }

    function getCaptchaToken(required) {
        const isLocalApi = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(API_BASE);
        
        // --- LOCAL DEV BYPASS ---
        if (required && isLocalApi) {
            console.log('Local API detected, using DEV_CAPTCHA_TOKEN');
            return DEV_CAPTCHA_TOKEN;
        }
        // -------------------------

        if (typeof window.grecaptcha !== 'undefined') {
            try {
                const token = window.grecaptcha.getResponse();
                if (required && !token) throw new Error('CAPTCHA required. Please solve the puzzle below.');
                return token || '';
            } catch (e) {
                if (required) throw new Error('CAPTCHA verification failed: ' + e.message);
                return '';
            }
        }
        
        if (required) throw new Error('CAPTCHA service is not available (ad-blocker?)');
        return '';
    }

    async function refreshCurrentUser() {
        if (!getToken()) return null;
        try {
            const student = await apiFetch('/auth/me');
            setSession(student);
            return student;
        } catch (_error) {
            return getStoredUser();
        }
    }

    function toRelativeTime(dateValue) {
        const created = new Date(dateValue);
        const seconds = Math.max(1, Math.floor((Date.now() - created.getTime()) / 1000));
        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function appendChatBubble(output, side, label, text) {
        if (!output) return;
        output.classList.add('chat-thread');
        const row = document.createElement('div');
        row.className = `chat-message-row ${side}`;
        row.innerHTML = `
            <div class="chat-bubble">
                <span class="chat-bubble-label">${escapeHtml(label)}</span>
                <div>${escapeHtml(text)}</div>
            </div>
        `;
        output.appendChild(row);
        output.scrollTop = output.scrollHeight;
    }

    function clampScore(value, max) {
        const number = Number(value) || 0;
        return Math.max(0, Math.min(number, max));
    }

    function escapeListItems(items) {
        return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    }

    function buildATSBreakdownRows(breakdown) {
        const metrics = [
            { key: 'skills', label: 'Skills Match', max: 30 },
            { key: 'experience', label: 'Experience Depth', max: 25 },
            { key: 'education', label: 'Education Coverage', max: 15 },
            { key: 'summary', label: 'Summary Quality', max: 15 },
            { key: 'contact', label: 'Contact Completeness', max: 15 },
        ];
        return metrics.map((metric) => {
            const score = clampScore(breakdown[metric.key], metric.max);
            const width = (score / metric.max) * 100;
            return `
                <div class="ats-breakdown-row">
                    <div class="ats-breakdown-head">
                        <span>${metric.label}</span>
                        <strong>${score}/${metric.max}</strong>
                    </div>
                    <div class="ats-breakdown-track">
                        <div class="ats-breakdown-fill" style="width:${width}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function openATSReport(result) {
        const modal = document.getElementById('ats-modal');
        const body = document.getElementById('ats-modal-body');
        if (!modal || !body) return;

        const breakdown = result.breakdown || {};
        const detectedSkills = result.detected_skills || [];
        const strengths = result.strengths || [];
        const missingKeywords = result.missing_keywords || [];
        const recommendations = result.recommendations || [];
        const totalScore = clampScore(result.score, 100);
        const scoreColor = totalScore >= 85 ? '#16a34a' : totalScore >= 65 ? '#2563eb' : totalScore >= 45 ? '#f59e0b' : '#ef4444';
        const ringStyle = `background:
            radial-gradient(closest-side, ${document.body.classList.contains('dark-theme') ? '#111827' : '#fff'} 71%, transparent 72% 100%),
            conic-gradient(${scoreColor} ${totalScore}%, rgba(148, 163, 184, 0.18) 0);`;

        body.innerHTML = `
            <div class="ats-report">
                <section class="ats-hero">
                    <div class="ats-score-panel">
                        <div class="ats-score-ring-wrap">
                            <div class="ats-score-ring" style="${ringStyle}">
                                <div class="ats-score-ring-value">
                                    <strong>${totalScore}</strong>
                                    <span>out of 100</span>
                                </div>
                            </div>
                        </div>
                        <div class="ats-grade-pill">${escapeHtml(result.grade || 'N/A')}</div>
                        <div class="ats-score-meta">
                            <div class="ats-mini-stat">
                                <span class="label">Keywords Found</span>
                                <span class="value">${detectedSkills.length}</span>
                            </div>
                            <div class="ats-mini-stat">
                                <span class="label">Gaps Found</span>
                                <span class="value">${missingKeywords.length}</span>
                            </div>
                            <div class="ats-mini-stat">
                                <span class="label">Strength Signals</span>
                                <span class="value">${strengths.length}</span>
                            </div>
                            <div class="ats-mini-stat">
                                <span class="label">Next Actions</span>
                                <span class="value">${recommendations.length}</span>
                            </div>
                        </div>
                    </div>
                    <div class="ats-summary-panel">
                        <h4 style="margin-top:0">Snapshot</h4>
                        <div class="ats-summary-grid">
                            <div class="ats-card">
                                <h4>What’s Working</h4>
                                ${strengths.length ? `<ul class="ats-list">${escapeListItems(strengths)}</ul>` : '<div class="ats-empty">No standout strengths detected yet.</div>'}
                            </div>
                            <div class="ats-card">
                                <h4>Immediate Fixes</h4>
                                ${recommendations.length ? `<ul class="ats-list">${escapeListItems(recommendations)}</ul>` : '<div class="ats-empty">Your resume already covers the main ATS checks.</div>'}
                            </div>
                        </div>
                        <div class="ats-card" style="margin-top:12px">
                            <h4>Detected Skills</h4>
                            ${detectedSkills.length ? `<div class="ats-chip-list">${detectedSkills.map((skill) => `<span class="ats-chip">${escapeHtml(skill)}</span>`).join('')}</div>` : '<div class="ats-empty">No recognizable skills were detected from the current resume data.</div>'}
                        </div>
                    </div>
                </section>
                <section class="ats-breakdown-card">
                    <h4>Score Breakdown</h4>
                    <div class="ats-breakdown-bars">${buildATSBreakdownRows(breakdown)}</div>
                </section>
                <section class="ats-insights-grid">
                    <div class="ats-card">
                        <h4>Missing Keywords</h4>
                        ${missingKeywords.length ? `<ul class="ats-list">${escapeListItems(missingKeywords)}</ul>` : '<div class="ats-empty">No major keyword gaps detected.</div>'}
                    </div>
                    <div class="ats-card">
                        <h4>Recommendations</h4>
                        ${recommendations.length ? `<ul class="ats-list">${escapeListItems(recommendations)}</ul>` : '<div class="ats-empty">No additional fixes suggested right now.</div>'}
                    </div>
                    <div class="ats-card">
                        <h4>Readiness Notes</h4>
                        <ul class="ats-list">
                            <li>Use the breakdown bars to focus the weakest resume section first.</li>
                            <li>Add missing keywords naturally inside experience, projects, and skills.</li>
                            <li>Re-run the report after each resume update to track progress.</li>
                        </ul>
                    </div>
                </section>
            </div>
        `;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    window.openATSReport = function () {
        if (!latestATSResult) return;
        openATSReport(latestATSResult);
    };

    window.closeATSReport = function () {
        const modal = document.getElementById('ats-modal');
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    async function performLogin(email, password, remember, options) {
        const loginOptions = options || {};
        const captchaToken = loginOptions.captchaToken || getCaptchaToken(loginOptions.requireCaptcha !== false);
        console.log('Login attempt with options:', loginOptions);
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            auth: false,
            body: JSON.stringify({ email, password, captcha_token: captchaToken }),
        });
        console.log('Login API response:', data);

        if (data.user && (data.user.role === 'admin' || data.user.role === 'advisor')) {
            console.log('Admin/Advisor detected. Redirecting to:', data.user.role === 'advisor' ? 'advisor.html' : 'admin.html');
            sessionStorage.setItem('edumate_admin_logged', '1');
            sessionStorage.setItem('edumate_admin_email', data.user.email || '');
            sessionStorage.setItem('edumate_user_type', data.user.role);
            sessionStorage.setItem('edumate_admin_token', data.access_token);
            sessionStorage.setItem('edumate_admin_user', JSON.stringify(data.user));
            window.location.href = data.user.role === 'advisor' ? 'advisor.html' : 'admin.html';
            return;
        }
        setSession(data.user?.student || data.user, data.access_token);
        if (remember) localStorage.setItem('edumate_remember', email);
        if (typeof window.grecaptcha !== 'undefined') {
            try { window.grecaptcha.reset(); } catch (_error) {}
        }
        if (typeof window.updateSidebarFromStorage === 'function') window.updateSidebarFromStorage();
        if (typeof window.applyStoredProfileToUI === 'function') window.applyStoredProfileToUI();
        if (typeof window.logActivity === 'function') window.logActivity('signed_in', 'Signed in to EduMate');
        return data.user?.student || data.user;
    }

    async function handleBackendLogin(redirectMode) {
        console.log('handleBackendLogin called with mode:', redirectMode);
        const email = String(document.getElementById('login-email')?.value || '').trim();
        const password = String(document.getElementById('login-password')?.value || '').trim();
        const remember = !!document.getElementById('remember-me')?.checked;

        if (!email || !password) {
            notify('Please enter both email and password', 'error');
            return;
        }

        try {
            const student = await performLogin(email, password, remember, { requireCaptcha: true });
            notify('Login successful', 'success');
            if (redirectMode === 'home-page') {
                if (typeof window.navigateTo === 'function') window.navigateTo('dashboard');
            } else {
                window.location.href = student.is_admin ? 'admin.html' : 'home.html';
            }
        } catch (error) {
            console.error('Login error:', error);
            notify(error.message || 'Login failed', 'error');
            alert('Login Error: ' + (error.message || 'Unknown error'));
        }
    }

    async function performSocialLogin(socialProfile) {
        const email = String(socialProfile?.email || '').trim().toLowerCase();
        if (!email.endsWith('@sut.edu.eg')) {
            throw new Error('Only @sut.edu.eg email addresses are allowed');
        }
        const data = await apiFetch('/auth/social-login', {
            method: 'POST',
            auth: false,
            body: JSON.stringify({
                email,
                full_name: String(socialProfile?.name || '').trim() || null,
                provider: String(socialProfile?.provider || 'social').trim().toLowerCase(),
                provider_uid: String(socialProfile?.providerUid || socialProfile?.uid || '').trim() || null,
                profile_image_url: String(socialProfile?.picture || '').trim() || null,
                id_token: String(socialProfile?.idToken || '').trim() || null,
            }),
        });

        if (data.user && (data.user.role === 'admin' || data.user.role === 'advisor')) {
            sessionStorage.setItem('edumate_admin_token', data.access_token);
            sessionStorage.setItem('edumate_admin_user', JSON.stringify(data.user));
            sessionStorage.setItem('edumate_admin_logged', '1');
            sessionStorage.setItem('edumate_admin_email', data.user.email || '');
            sessionStorage.setItem('edumate_user_type', data.user.role);
            window.location.href = data.user.role === 'advisor' ? 'advisor.html' : 'admin.html';
            return;
        }
        setSession(data.user?.student || data.user, data.access_token);
        if (typeof window.updateSidebarFromStorage === 'function') window.updateSidebarFromStorage();
        if (typeof window.applyStoredProfileToUI === 'function') window.applyStoredProfileToUI();
        if (typeof window.logActivity === 'function') {
            window.logActivity('social_signed_in', `Signed in with ${socialProfile?.provider || 'social login'}`);
        }
        return data.user?.student || data.user;
    }

    async function firebaseSocialLogin(providerType) {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            throw new Error('Social login is not available right now');
        }

        let provider;
        if (providerType === 'google') {
            provider = new firebase.auth.GoogleAuthProvider();
        } else if (providerType === 'github') {
            provider = new firebase.auth.GithubAuthProvider();
        } else if (providerType === 'microsoft') {
            provider = new firebase.auth.OAuthProvider('microsoft.com');
        } else {
            throw new Error('Unsupported social provider');
        }

        const result = await firebase.auth().signInWithPopup(provider);
        const socialUser = result.user;
        const idToken = socialUser ? await socialUser.getIdToken() : '';
        return performSocialLogin({
            email: socialUser?.email || '',
            name: socialUser?.displayName || '',
            picture: socialUser?.photoURL || '',
            provider: providerType,
            providerUid: socialUser?.uid || '',
            idToken,
        });
    }
    window.handleSocialLogin = async function (providerType) {
        try {
            const student = await firebaseSocialLogin(providerType);
            notify('Login successful', 'success');
            window.location.href = student.is_admin ? 'admin.html' : 'home.html';
            return student;
        } catch (error) {
            notify(error.message || 'Social login failed', 'error');
            try {
                if (typeof firebase !== 'undefined' && firebase.auth) await firebase.auth().signOut();
            } catch (_error) {}
            return null;
        }
    };
    window.firebaseLogin = async function (providerType) {
        try {
            await firebaseSocialLogin(providerType);
            notify('Login successful', 'success');
            if (typeof window.navigateTo === 'function') window.navigateTo('dashboard');
        } catch (error) {
            notify(error.message || 'Social login failed', 'error');
            try {
                if (typeof firebase !== 'undefined' && firebase.auth) await firebase.auth().signOut();
            } catch (_error) {}
        }
    };

    window.checkSession = function () {
        const token = getToken();
        if (!token) return;
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPath === 'index.html' || currentPath === '') window.location.href = 'home.html';
    };

    window.loginUser = function () {
        const student = getStoredUser();
        if (!student) {
            notify('Please sign in first', 'error');
            return;
        }
        setSession(student);
        if (typeof window.navigateTo === 'function') window.navigateTo('dashboard');
    };

    window.signOut = async function () {
        try {
            if (getToken()) await apiFetch('/auth/logout', { method: 'POST' });
        } catch (_error) {}
        clearSession();
        if (typeof window.navigateTo === 'function') window.navigateTo('login');
        if (window.location.pathname.toLowerCase().includes('home.html')) {
            setTimeout(() => { window.location.href = 'index.html'; }, 100);
        }
    };

    window.completeRegistration = async function () {
        const temp = JSON.parse(sessionStorage.getItem('edumate_temp_registration') || '{}');
        if (!temp || !temp.username) {
            notify('Registration data missing', 'error');
            return;
        }

        const email = String(document.getElementById('info-email')?.value || temp.email || '').trim();
        const parsedIdentity = parseStudentIdentityFromEmail(email);
        const studentCode = String(document.getElementById('info-username')?.value || parsedIdentity?.studentCode || temp.username || '').trim();
        const fullName = String(document.getElementById('info-fullname')?.value || parsedIdentity?.fullName || temp.name || '').trim();
        const majorName = String(document.getElementById('info-major')?.value || '').trim();
        const graduationYearValue = String(document.getElementById('info-gradyear')?.value || '').trim();
        const skillsSummary = String(document.getElementById('info-skills')?.value || '').trim();

        if (!studentCode || !fullName || !email || !temp.password) {
            notify('Please complete all required fields', 'error');
            return;
        }

        try {
            const majorId = await resolveMajorId(majorName);
            await apiFetch('/auth/register', {
                method: 'POST',
                auth: false,
                body: JSON.stringify({
                    student_code: studentCode,
                    full_name: fullName,
                    email,
                    password: temp.password,
                    major_id: majorId,
                    graduation_year: graduationYearValue ? Number(graduationYearValue) : null,
                    skills_summary: skillsSummary || null,
                }),
            });
            sessionStorage.setItem('edumate_major_name', majorName || '');
            sessionStorage.removeItem('edumate_temp_registration');
            notify('Account created successfully', 'success');
            if (typeof window.navigateTo === 'function') window.navigateTo('login');
        } catch (error) {
            notify(error.message || 'Registration failed', 'error');
        }
    };

    window.updateSidebarFromStorage = function () {
        const user = getStoredUser();
        const profileName = document.getElementById('profile-name');
        const profilePic = document.getElementById('profile-pic');
        if (profileName) profileName.textContent = user ? user.full_name : 'Guest';
        applyAvatarSource(profilePic, getPreferredAvatar(user), user);
        const userName = document.getElementById('user-name');
        if (userName && user) userName.textContent = user.full_name || user.student_code;
    };

    window.applyStoredProfileToUI = function () {
        const user = getStoredUser();
        if (!user) return;
        const avatar = document.getElementById('profile-avatar-large');
        applyAvatarSource(avatar, getPreferredAvatar(user), user);
        const mappings = {
            'profile-name-input': user.full_name,
            'profile-username-input': user.student_code,
            'profile-email-input': user.email,
            'profile-major-input': getMajorLabel(user),
            'profile-gradyear-input': user.graduation_year,
            'profile-skills-input': user.skills_summary,
        };
        Object.keys(mappings).forEach((id) => {
            const element = document.getElementById(id);
            if (element) element.value = mappings[id] || '';
        });
        syncDerivedStudentFields('profile-email-input', 'profile-name-input', 'profile-username-input');
        const userName = document.getElementById('user-name');
        if (userName) userName.textContent = user.full_name || user.student_code;
        if (typeof window.updateProfileCompletion === 'function') window.updateProfileCompletion();
    };

    window.saveProfileEdits = async function () {
        const currentUser = getStoredUser();
        if (!currentUser) {
            notify('Please sign in first', 'error');
            return;
        }

        const email = String(document.getElementById('profile-email-input')?.value || currentUser.email || '').trim();
        const parsedIdentity = parseStudentIdentityFromEmail(email);
        const studentCode = String(document.getElementById('profile-username-input')?.value || parsedIdentity?.studentCode || currentUser.student_code || '').trim();
        const fullName = String(document.getElementById('profile-name-input')?.value || parsedIdentity?.fullName || currentUser.full_name || '').trim();
        const majorName = String(document.getElementById('profile-major-input')?.value || getMajorLabel(currentUser) || '').trim();
        const graduationYearValue = String(document.getElementById('profile-gradyear-input')?.value || currentUser.graduation_year || '').trim();
        const skillsSummary = String(document.getElementById('profile-skills-input')?.value || currentUser.skills_summary || '').trim();
        const avatarUrl = normalizeAvatarUrl(
            document.getElementById('profile-avatar-large')?.src || getPreferredAvatar(currentUser)
        );

        try {
            const majorId = await resolveMajorId(majorName);
            cacheAvatarForUser(currentUser, avatarUrl);
            const updated = await apiFetch('/users/me', {
                method: 'PUT',
                body: JSON.stringify({
                    student_code: studentCode,
                    full_name: fullName,
                    email,
                    major_id: majorId,
                    graduation_year: graduationYearValue ? Number(graduationYearValue) : null,
                    skills_summary: skillsSummary || null,
                    profile_image_url: avatarUrl || null,
                }),
            });
            sessionStorage.setItem('edumate_major_name', majorName || '');
            setSession(updated);
            window.applyStoredProfileToUI();
            notify('Profile saved successfully', 'success');
        } catch (error) {
            notify(error.message || 'Failed to save profile', 'error');
        }
    };

    window.applyAvatarSource = applyAvatarSource;
    window.getPreferredAvatar = getPreferredAvatar;
    window.DEFAULT_AVATAR = DEFAULT_AVATAR;

    window.sendAIChatMessage = async function () {
        const input = document.getElementById('ai-chat-input');
        const output = document.getElementById('ai-chat-output');
        if (!input || !output) return;
        const message = input.value.trim();
        if (!message) return;

        try {
            const data = await apiFetch('/assistant/chat/me', {
                method: 'POST',
                body: JSON.stringify({ message, channel: 'chat' }),
            });
            appendChatBubble(output, 'user', 'You', message);
            appendChatBubble(output, 'ai', 'AI', data.assistant_message);
            input.value = '';
        } catch (error) {
            notify(error.message || 'Unable to reach AI assistant', 'error');
        }
    };

    window.sendAIPopupMessage = async function () {
        const input = document.getElementById('ai-popup-input');
        const output = document.getElementById('ai-popup-output');
        if (!input || !output) return;
        const message = input.value.trim();
        if (!message) return;

        try {
            const data = await apiFetch('/assistant/chat/me', {
                method: 'POST',
                body: JSON.stringify({ message, channel: 'popup' }),
            });
            appendChatBubble(output, 'user', 'You', message);
            appendChatBubble(output, 'ai', 'AI', data.assistant_message);
            input.value = '';
        } catch (error) {
            notify(error.message || 'Unable to reach AI assistant', 'error');
        }
    };
    function renderCourseResults(items, query) {
        const container = document.getElementById('courses-container');
        const searchInfo = document.getElementById('search-info');
        const paginationControls = document.getElementById('pagination-controls');
        if (!container) return;
        if (searchInfo) {
            searchInfo.style.display = 'block';
            searchInfo.textContent = `${items.length} course result(s) for "${query}"`;
        }
        if (paginationControls) paginationControls.style.display = 'none';
        if (!items.length) {
            container.innerHTML = '<div class="card" style="grid-column:1/-1;text-align:center;padding:40px"><h3 style="margin-bottom:10px">No backend courses found</h3><p style="color:var(--muted)">Seed the course table or try another search term.</p></div>';
            return;
        }
        container.innerHTML = items.map((course) => `
            <div class="card" style="display:flex;flex-direction:column;gap:12px;height:100%">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
                    <span class="course-category">${course.code}</span>
                    <span style="color:var(--muted);font-size:0.9rem">${course.credits} credits</span>
                </div>
                <h3 style="margin:0">${course.name}</h3>
                <p style="color:var(--muted);flex:1">${course.description || 'No description available.'}</p>
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <button class="btn" onclick="saveBackendCourse(${course.id})">Save Course</button>
                    <button class="link-btn" onclick="addCourseToPlanning(${course.id})">Add to Planning</button>
                </div>
            </div>
        `).join('');
    }

    window.searchCourses = async function (query, page) {
        const resolvedQuery = query || String(document.getElementById('course-search-input')?.value || '').trim();
        if (!resolvedQuery) {
            if (legacySearchCourses) return legacySearchCourses(query, page);
            return;
        }
        try {
            const items = await apiFetch(`/courses/search?q=${encodeURIComponent(resolvedQuery)}`, { auth: false });
            cachedCourses = items || [];
            if (!cachedCourses.length && legacySearchCourses) return legacySearchCourses(resolvedQuery, page);
            renderCourseResults(cachedCourses, resolvedQuery);
        } catch (error) {
            if (legacySearchCourses) return legacySearchCourses(resolvedQuery, page);
            notify(error.message || 'Unable to search courses', 'error');
        }
    };

    window.saveBackendCourse = async function (courseId) {
        const course = cachedCourses.find((item) => item.id === Number(courseId));
        if (!course) {
            notify('Course not found', 'error');
            return;
        }
        try {
            await apiFetch('/courses/saved/me', {
                method: 'POST',
                body: JSON.stringify({
                    external_id: String(course.id),
                    title: course.name,
                    provider: getMajorLabel(getStoredUser()) || 'EduMate',
                    category: 'academic',
                    difficulty: 'intermediate',
                    duration: `${course.credits} credits`,
                    progress: 0,
                    enrolled: false,
                    description: course.description || null,
                    image_url: null,
                    course_url: null,
                    source: 'database',
                }),
            });
            notify('Course saved successfully', 'success');
            window.logActivity('saved', `Saved course ${course.name}`);
        } catch (error) {
            notify(error.message || 'Failed to save course', 'error');
        }
    };

    window.addCourseToPlanning = async function (courseId) {
        try {
            await apiFetch('/planning/me/courses', {
                method: 'POST',
                body: JSON.stringify({
                    course_id: Number(courseId),
                    semester: 'Planned',
                    grade: null,
                    status: 'planned',
                }),
            });
            notify('Course added to planning', 'success');
            window.logActivity('planned', 'Added course to planning');
        } catch (error) {
            notify(error.message || 'Failed to add course to planning', 'error');
        }
    };

    window.saveCustomCourse = async function (itemData) {
        try {
            const item = JSON.parse(decodeURIComponent(itemData));
            await apiFetch('/courses/saved/me', {
                method: 'POST',
                body: JSON.stringify({
                    external_id: item.cacheId || item.link || null,
                    title: item.title || 'Course',
                    provider: typeof window.extractPlatform === 'function' ? window.extractPlatform(item.link || '', item.title || '') : 'Online Course',
                    category: 'custom',
                    difficulty: 'beginner',
                    duration: 'Self-paced',
                    progress: 0,
                    enrolled: true,
                    description: item.snippet || 'Course from search results',
                    image_url: typeof window.getImageFromItem === 'function' ? window.getImageFromItem(item) : null,
                    course_url: item.link || null,
                    source: 'search',
                }),
            });
            notify('Course saved successfully', 'success');
        } catch (error) {
            notify(error.message || 'Error saving course', 'error');
        }
    };

    window.viewSavedCourses = async function () {
        const container = document.getElementById('courses-container');
        if (!container) return;
        try {
            const items = await apiFetch('/courses/saved/me');
            localStorage.setItem('edumate_custom_courses', JSON.stringify(items || []));
            if (!items.length) {
                container.innerHTML = '<div class="card" style="grid-column:1/-1;text-align:center;padding:60px 40px;"><h3 style="margin-bottom:10px;">No Saved Courses Yet</h3><p style="color:var(--muted);">Search for courses and save them to your collection.</p></div>';
                return;
            }
            container.innerHTML = items.map((course) => `
                <div class="card course-card" style="display:flex;flex-direction:column;gap:12px;height:100%">
                    <span class="course-category">${course.provider || 'Saved Course'}</span>
                    <h3 style="margin:0">${course.title}</h3>
                    <p style="color:var(--muted);flex:1">${course.description || 'No description available.'}</p>
                    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                        ${course.course_url ? `<a class="btn" href="${course.course_url}" target="_blank" rel="noopener noreferrer">Open</a>` : ''}
                        <button class="link-btn" onclick="removeCustomCourse(${course.id})">Remove</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            notify(error.message || 'Unable to load saved courses', 'error');
        }
    };

    window.removeCustomCourse = async function (courseId) {
        try {
            await apiFetch(`/courses/saved/me/${courseId}`, { method: 'DELETE' });
            notify('Course removed from your list', 'info');
            window.viewSavedCourses();
        } catch (error) {
            notify(error.message || 'Failed to remove course', 'error');
        }
    };

    window.addCustomCourse = async function () {
        const title = String(document.getElementById('new-course-title')?.value || '').trim();
        const provider = String(document.getElementById('new-course-provider')?.value || '').trim();
        const category = String(document.getElementById('new-course-category')?.value || '').trim();
        const duration = String(document.getElementById('new-course-duration')?.value || '').trim();
        const link = String(document.getElementById('new-course-link')?.value || '').trim();

        if (!title || !provider || !duration) {
            notify('Please fill in all required fields', 'error');
            return;
        }

        try {
            await apiFetch('/courses/saved/me', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    provider,
                    category,
                    difficulty: 'beginner',
                    duration,
                    progress: 0,
                    enrolled: true,
                    description: 'Custom course added by user',
                    image_url: null,
                    course_url: link || null,
                    source: 'custom',
                }),
            });
            if (typeof window.closeCourseModal === 'function') window.closeCourseModal();
            notify(`Course "${title}" added successfully`, 'success');
            window.viewSavedCourses();
        } catch (error) {
            notify(error.message || 'Failed to add custom course', 'error');
        }
    };

    function renderInternshipSearch(items, position) {
        const container = document.getElementById('InternshipsContainer');
        if (!container) return;
        if (!items.length) {
            const label = position ? getInternshipPositionLabel(position) : 'this position';
            container.innerHTML = `<div class="card" style="text-align:center;color:var(--muted);padding:40px"><p>No internships found for ${label}. Try another career track.</p></div>`;
            return;
        }
        container.innerHTML = items.map((item) => `
            <div class="card event-card" style="margin-bottom:20px;padding:20px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
                    <div>
                        <h3 style="margin:0 0 8px">${item.position}</h3>
                        <div style="color:var(--muted);margin-bottom:8px">${item.company_name}${item.location ? ` • ${item.location}` : ''}</div>
                        <p style="color:var(--muted)">${item.description || 'No description available.'}</p>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end">
                        <button class="btn" onclick="saveBackendInternship(${item.id}, '${String(position || '').replace(/'/g, "\\'")}')">Save</button>
                        <button class="link-btn" onclick="applyBackendInternship(${item.id})">Apply</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function getInternshipPositionLabel(position) {
        const labels = {
            software: 'Software Development',
            marketing: 'Marketing',
            finance: 'Finance',
            hr: 'Human Resources',
            sales: 'Sales',
            design: 'Design',
            data: 'Data',
            project: 'Project Management',
        };
        return labels[position] || position || 'this position';
    }

    function runLocalInternshipSearch(position) {
        const fallback = window.loadInternshipsFromSearch || legacyLoadInternshipsByPosition;
        if (typeof fallback === 'function') return fallback(position);
        renderInternshipSearch([], position);
        return null;
    }

    window.loadInternshipsByPosition = async function (position) {
        const resolvedPosition = position || String(document.getElementById('jobPositionSelect')?.value || '').trim();
        if (!resolvedPosition) {
            return runLocalInternshipSearch(position);
        }
        try {
            const items = await apiFetch(`/internships?position=${encodeURIComponent(resolvedPosition)}`);
            if (!items || !items.length) return runLocalInternshipSearch(resolvedPosition);
            renderInternshipSearch(items || [], resolvedPosition);
        } catch (error) {
            const fallbackResult = runLocalInternshipSearch(resolvedPosition);
            if (fallbackResult !== null) return fallbackResult;
            notify(error.message || 'Unable to load internships', 'error');
        }
    };

    window.saveBackendInternship = async function (internshipId, positionCode) {
        try {
            const items = await apiFetch(`/internships?position=${encodeURIComponent(positionCode || '')}`);
            const internship = (items || []).find((item) => item.id === Number(internshipId));
            if (!internship) throw new Error('Internship not found');
            await apiFetch('/internships/saved/me', {
                method: 'POST',
                body: JSON.stringify({
                    title: internship.position,
                    company_name: internship.company_name,
                    position_code: positionCode || internship.position,
                    match_score: 80,
                    match_reason: internship.description || 'Matched from internship search',
                    salary: null,
                    apply_url: null,
                    status: 'saved',
                }),
            });
            notify('Job saved successfully', 'success');
        } catch (error) {
            notify(error.message || 'Error saving job', 'error');
        }
    };

    window.applyBackendInternship = async function (internshipId) {
        try {
            await apiFetch('/internships/applications/me', {
                method: 'POST',
                body: JSON.stringify({ internship_id: Number(internshipId), application_date: new Date().toISOString().slice(0, 10) }),
            });
            notify('Internship application recorded', 'success');
            window.logActivity('applied', 'Applied for an internship');
        } catch (error) {
            notify(error.message || 'Failed to apply for internship', 'error');
        }
    };

    window.saveJob = async function (itemData, position) {
        try {
            const item = JSON.parse(decodeURIComponent(itemData));
            await apiFetch('/internships/saved/me', {
                method: 'POST',
                body: JSON.stringify({
                    title: item.title || 'Internship',
                    company_name: item.company || item.displayLink || 'Unknown Company',
                    position_code: position || null,
                    match_score: 75,
                    match_reason: item.snippet || null,
                    salary: null,
                    apply_url: item.link || null,
                    status: 'saved',
                }),
            });
            notify('Job saved successfully', 'success');
        } catch (error) {
            notify(error.message || 'Error saving job', 'error');
        }
    };

    window.viewSavedInternships = async function () {
        const container = document.getElementById('InternshipsContainer');
        if (!container) return;
        try {
            cachedSavedInternships = await apiFetch('/internships/saved/me');
            localStorage.setItem('savedInternships', JSON.stringify(cachedSavedInternships || []));
            if (!cachedSavedInternships.length) {
                container.innerHTML = '<div class="card" style="text-align:center;color:var(--muted);padding:40px"><p>No saved internships yet. Search and save internships to see them here.</p></div>';
                return;
            }
            container.innerHTML = cachedSavedInternships.map((item) => `
                <div class="card event-card" style="margin-bottom:20px;padding:20px;border:2px solid var(--primary-light);border-radius:8px;background:var(--light)">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
                        <h3 style="margin:0;font-size:1.1em;color:var(--dark);flex:1">${item.title}</h3>
                        <span style="background:var(--primary);color:white;padding:2px 10px;border-radius:12px;font-size:0.8em;margin-left:10px">${item.status}</span>
                    </div>
                    <p style="color:var(--muted);line-height:1.6;margin-bottom:10px;font-size:0.95em">${item.match_reason || ''}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:15px;padding-top:15px;border-top:1px solid var(--border-light)">
                        <div style="font-size:0.85em;color:var(--muted)">${item.company_name}</div>
                        <div style="display:flex;gap:10px;flex-wrap:wrap">
                            <select onchange="updateInternshipstatus(${item.id}, this.value)" style="padding:6px 12px;border-radius:4px;border:1px solid var(--border);background:white">
                                <option value="saved" ${item.status === 'saved' ? 'selected' : ''}>Saved</option>
                                <option value="applied" ${item.status === 'applied' ? 'selected' : ''}>Applied</option>
                                <option value="interview" ${item.status === 'interview' ? 'selected' : ''}>Interview</option>
                                <option value="rejected" ${item.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                            <button onclick="removeSavedJob(${item.id})" style="background:var(--error);color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:0.9em">Remove</button>
                            ${item.apply_url ? `<a href="${item.apply_url}" target="_blank" rel="noopener noreferrer" style="background:var(--primary);color:white;text-decoration:none;padding:8px 16px;border-radius:4px;font-size:0.9em">View Job</a>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            notify(error.message || 'Unable to load saved internships', 'error');
        }
    };

    window.updateInternshipstatus = async function (savedId, status) {
        try {
            await apiFetch(`/internships/saved/me/${savedId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
            notify(`Job status updated to ${status}`, 'success');
            window.viewSavedInternships();
        } catch (error) {
            notify(error.message || 'Failed to update job status', 'error');
        }
    };

    window.removeSavedJob = async function (savedId) {
        try {
            await apiFetch(`/internships/saved/me/${savedId}`, { method: 'DELETE' });
            notify('Job removed from saved list', 'info');
            window.viewSavedInternships();
        } catch (error) {
            notify(error.message || 'Failed to remove job', 'error');
        }
    };
    function collectResumePayload() {
        return {
            full_name: String(document.getElementById('res-name')?.value || '').trim() || null,
            title: String(document.getElementById('res-title')?.value || '').trim() || null,
            email: String(document.getElementById('res-email')?.value || '').trim() || null,
            phone: String(document.getElementById('res-phone')?.value || '').trim() || null,
            location: String(document.getElementById('res-location')?.value || '').trim() || null,
            linkedin: String(document.getElementById('res-linkedin')?.value || '').trim() || null,
            github: String(document.getElementById('res-github')?.value || '').trim() || null,
            skills: String(document.getElementById('res-skills')?.value || '').trim() || null,
            summary: String(document.getElementById('res-summary')?.value || '').trim() || null,
            template_name: document.querySelector('input[name="template"]:checked')?.value || 'modern',
            education_json: JSON.stringify(Array.from(document.querySelectorAll('.education-entry')).map((el) => ({ degree: el.children[0]?.value || '', school: el.children[1]?.value || '', year: el.children[2]?.value || '' }))),
            experience_json: JSON.stringify(Array.from(document.querySelectorAll('.experience-entry')).map((el) => ({ title: el.children[0]?.value || '', company: el.children[1]?.value || '', dates: el.children[2]?.value || '', desc: el.children[3]?.value || '' }))),
            projects_json: JSON.stringify(Array.from(document.querySelectorAll('#projects-container > div')).map((el) => ({ name: el.children[0]?.value || '', tech: el.children[1]?.value || '', desc: el.children[2]?.value || '' }))),
        };
    }

    function hydrateResumeForm(profile) {
        if (!profile) return;
        if (window.resumeData) {
            window.resumeData.name = profile.full_name || '';
            window.resumeData.title = profile.title || '';
            window.resumeData.email = profile.email || '';
            window.resumeData.phone = profile.phone || '';
            window.resumeData.location = profile.location || '';
            window.resumeData.linkedin = profile.linkedin || '';
            window.resumeData.github = profile.github || '';
            window.resumeData.skills = profile.skills || '';
            window.resumeData.summary = profile.summary || '';
            window.resumeData.education = JSON.parse(profile.education_json || '[]');
            window.resumeData.experience = JSON.parse(profile.experience_json || '[]');
            window.resumeData.projects = JSON.parse(profile.projects_json || '[]');
        }
        const mappings = {
            'res-name': profile.full_name,
            'res-title': profile.title,
            'res-email': profile.email,
            'res-phone': profile.phone,
            'res-location': profile.location,
            'res-linkedin': profile.linkedin,
            'res-github': profile.github,
            'res-skills': profile.skills,
            'res-summary': profile.summary,
        };
        Object.keys(mappings).forEach((id) => {
            const element = document.getElementById(id);
            if (element) element.value = mappings[id] || '';
        });
        const templateRadio = document.querySelector(`input[name="template"][value="${profile.template_name || 'modern'}"]`);
        if (templateRadio) templateRadio.checked = true;
        if (profile.ats_score !== undefined && profile.ats_score !== null) {
            renderATSFeedback({
                score: profile.ats_score,
                grade: profile.ats_score >= 85 ? 'Excellent' : profile.ats_score >= 65 ? 'Good' : profile.ats_score >= 45 ? 'Fair' : 'Poor',
                strengths: ['Latest saved ATS score'],
                missing_keywords: [],
                detected_skills: [],
                recommendations: [],
                breakdown: { skills: 0, experience: 0, education: 0, summary: 0, contact: 0 },
            });
        }
    }

    function renderATSFeedback(result) {
        const feedback = document.getElementById('ats-feedback');
        const openReportButton = document.getElementById('open-ats-report-btn');
        if (!feedback) return;
        latestATSResult = result;
        if (openReportButton) {
            openReportButton.style.display = 'inline-flex';
            openReportButton.textContent = `Open ATS Report (${clampScore(result.score, 100)}/100)`;
        }
        // feedback.style.display = 'block';
        // feedback.innerHTML = `
        //     <p style="margin:0;color:var(--muted)">ATS report is ready. Use the button next to Preview Resume to open the full popup report.</p>
        // `;
        openATSReport(result);
    }

    window.saveResumeData = async function () {
        const payload = collectResumePayload();
        try {
            const profile = await apiFetch('/resume/profile/me', { method: 'PUT', body: JSON.stringify(payload) });
            localStorage.setItem('edumate_resume', JSON.stringify(window.resumeData || {}));
            hydrateResumeForm(profile);
            notify('Resume saved', 'success');
            if (typeof window.generateResumePreview === 'function') window.generateResumePreview();
        } catch (error) {
            notify(error.message || 'Failed to save resume', 'error');
        }
    };

    window.generateResumePreview = async function () {
        const content = document.getElementById('resume-content');
        if (!content) return;
        try {
            const preview = await apiFetch('/resume/preview', { method: 'POST', body: JSON.stringify(collectResumePayload()) });
            content.innerHTML = preview.html;
        } catch (error) {
            if (legacyGenerateResumePreview) return legacyGenerateResumePreview();
            notify(error.message || 'Failed to generate resume preview', 'error');
        }
    };

    window.checkATSCompatibility = async function () {
        try {
            const result = await apiFetch('/resume/ats-check', { method: 'POST', body: JSON.stringify(collectResumePayload()) });
            renderATSFeedback(result);
        } catch (error) {
            notify(error.message || 'Failed to check ATS compatibility', 'error');
        }
    };

    async function syncPlanningState() {
        await apiFetch('/planning/state/me', {
            method: 'PUT',
            body: JSON.stringify({
                career_path: document.querySelector('.planning-chip.active')?.textContent?.trim() || 'Cyber Security',
                mode: document.querySelector('.planning-tab-btn.active')?.dataset?.tab || 'preview',
                semesters_json: localStorage.getItem('edumate_planner'),
                taken_subjects_json: localStorage.getItem('edumate_taken_subjects'),
                grades_json: localStorage.getItem('edumate_grades'),
                roadmap_json: localStorage.getItem('edumate_roadmap'),
                goals_json: localStorage.getItem('edumate_goals'),
                skills_progress_json: localStorage.getItem('edumate_skills'),
            }),
        });
    }

    window.loadPlanningData = async function () {
        try {
            const state = await apiFetch('/planning/state/me');
            if (state?.semesters_json) localStorage.setItem('edumate_planner', state.semesters_json);
            if (state?.roadmap_json) localStorage.setItem('edumate_roadmap', state.roadmap_json);
            if (state?.goals_json) localStorage.setItem('edumate_goals', state.goals_json);
            if (state?.skills_progress_json) localStorage.setItem('edumate_skills', state.skills_progress_json);
            if (state?.grades_json) localStorage.setItem('edumate_grades', state.grades_json);
        } catch (_error) {}
        if (legacyLoadPlanningData) legacyLoadPlanningData();
    };

    window.savePlannerData = async function () {
        if (legacySavePlannerData) legacySavePlannerData();
        try {
            await syncPlanningState();
        } catch (error) {
            notify(error.message || 'Failed to sync planner', 'error');
        }
    };

    window.saveCareerRoadmap = async function () {
        if (legacySaveCareerRoadmap) legacySaveCareerRoadmap();
        try {
            await syncPlanningState();
        } catch (error) {
            notify(error.message || 'Failed to sync roadmap', 'error');
        }
    };

    window.saveGoals = async function () {
        if (legacySaveGoals) legacySaveGoals();
        try { await syncPlanningState(); } catch (_error) {}
    };

    window.saveSkills = async function () {
        if (legacySaveSkills) legacySaveSkills();
        try { await syncPlanningState(); } catch (_error) {}
    };

    window.loadDashboardStats = async function () {
        try {
            const dashboard = await apiFetch('/analytics/dashboard/me');
            const careerScore = document.getElementById('career-score');
            if (careerScore) careerScore.textContent = dashboard.stats.career_score;
            const skillGrowth = document.getElementById('skill-growth');
            if (skillGrowth) skillGrowth.textContent = `+${dashboard.stats.skill_growth}%`;
            const learningTime = document.getElementById('learning-time');
            if (learningTime) learningTime.textContent = `${dashboard.stats.learning_time_hours}h`;
            const profileProgress = document.getElementById('profile-progress');
            if (profileProgress) profileProgress.style.width = `${dashboard.stats.profile_completion}%`;
            const profilePercentage = document.getElementById('profile-percentage');
            if (profilePercentage) profilePercentage.textContent = `${dashboard.stats.profile_completion}%`;
            const upcoming = document.getElementById('upcoming-events');
            if (upcoming) {
                upcoming.innerHTML = dashboard.upcoming_events.map((event) => `
                    <div class="activity-item">
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            <div>
                                <div style="font-weight:600">${event.title}</div>
                                <div style="font-size:0.85rem;color:var(--muted)">${event.date_label}</div>
                            </div>
                            <span class="course-category">${event.type}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            notify(error.message || 'Failed to load dashboard stats', 'error');
        }
    };

    window.loadRecentActivity = async function () {
        const container = document.getElementById('recent-activity');
        if (!container) return;
        try {
            const items = await apiFetch('/analytics/activity/me');
            localStorage.setItem('edumate_activity', JSON.stringify(items || []));
            if (!items.length) {
                container.innerHTML = '<div class="activity-item">No recent activity yet.</div>';
                return;
            }
            container.innerHTML = items.map((item) => `
                <div class="activity-item">
                    <div style="display:flex;align-items:center;gap:10px">
                        <span style="color:#2563eb">•</span>
                        <div>
                            <div style="font-weight:600">${item.text}</div>
                            <div style="font-size:0.85rem;color:var(--muted)">${toRelativeTime(item.created_at)}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            notify(error.message || 'Failed to load recent activity', 'error');
        }
    };

    window.logActivity = function (action, text) {
        const arr = JSON.parse(localStorage.getItem('edumate_activity') || '[]');
        arr.unshift({ action, text, created_at: new Date().toISOString() });
        localStorage.setItem('edumate_activity', JSON.stringify(arr.slice(0, 20)));
        if (!getToken()) return;
        apiFetch('/analytics/activity/me', { method: 'POST', body: JSON.stringify({ action, text }) }).catch(() => {});
    };

    document.addEventListener('DOMContentLoaded', async function () {
        const rememberedEmail = localStorage.getItem('edumate_remember');
        const rememberInput = document.getElementById('remember-me');
        const emailInput = document.getElementById('login-email');
        if (rememberedEmail && rememberInput && emailInput && !emailInput.value) {
            emailInput.value = rememberedEmail;
            rememberInput.checked = true;
        }

        [
            ['reg-email', 'reg-name', 'reg-username'],
            ['info-email', 'info-fullname', 'info-username'],
            ['profile-email-input', 'profile-name-input', 'profile-username-input'],
        ].forEach(([emailId, nameId, codeId]) => {
            const emailElement = document.getElementById(emailId);
            if (!emailElement) return;
            const sync = function () { syncDerivedStudentFields(emailId, nameId, codeId); };
            emailElement.addEventListener('input', sync);
            emailElement.addEventListener('change', sync);
            sync();
        });

        if (getToken()) {
            const student = await refreshCurrentUser();
            if (student) {
                window.updateSidebarFromStorage();
                window.applyStoredProfileToUI();
                if (document.getElementById('resume-form')) {
                    try {
                        const profile = await apiFetch('/resume/profile/me');
                        hydrateResumeForm(profile);
                    } catch (_error) {}
                }
                if (document.getElementById('dashboard')) {
                    window.loadDashboardStats();
                    window.loadRecentActivity();
                }
                if (document.getElementById('planning')) {
                    window.loadPlanningData();
                }
            }
        }
    });

    // ══════════════════════════════════════════════════════════════════
    //  STUDENT ↔ ADVISOR CHAT
    // ══════════════════════════════════════════════════════════════════

    let studentChatPollInterval = null;

    async function loadStudentAdvisorMessages() {
        const area = document.getElementById('studentChatMessages');
        if (!area) return;
        try {
            const messages = await apiFetch('/chat/student/messages');
            renderStudentChatMessages(messages);
            // Update unread badge (now cleared because we fetched)
            updateStudentChatBadge(0);
        } catch (e) {
            area.innerHTML = `<div style="text-align:center;color:var(--muted);padding:20px">${escapeHtml(e.message || 'Could not load messages')}</div>`;
        }
    }

    function renderStudentChatMessages(messages) {
        const area = document.getElementById('studentChatMessages');
        if (!area) return;
        if (!messages || !messages.length) {
            area.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:0.9rem;margin-top:20px">No messages yet. Say hello! 👋</div>';
            return;
        }
        area.innerHTML = messages.map(m => {
            const isSent = m.sender_role === 'student';
            const bubbleStyle = isSent
                ? 'background:var(--primary);color:white;border-bottom-right-radius:4px'
                : 'background:rgba(255,255,255,0.07);color:var(--text);border-bottom-left-radius:4px';
            const wrapAlign = isSent ? 'justify-content:flex-end' : 'justify-content:flex-start';
            const timeAlign = isSent ? 'text-align:right' : 'text-align:left';
            const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
            <div style="display:flex;${wrapAlign};width:100%">
                <div style="max-width:min(72%,680px)">
                    <div style="padding:10px 14px;border-radius:14px;font-size:0.9rem;line-height:1.5;word-break:break-word;${bubbleStyle}">${escapeHtml(m.content)}</div>
                    <div style="font-size:0.7rem;color:var(--muted);margin-top:4px;${timeAlign}">${time}</div>
                </div>
            </div>`;
        }).join('');
        area.scrollTop = area.scrollHeight;
    }

    async function loadStudentAdvisorInfo() {
        const nameEl = document.getElementById('studentAdvisorName');
        const avatarEl = document.getElementById('studentAdvisorAvatar');
        try {
            const advisor = await apiFetch('/chat/student/advisor');
            if (advisor && advisor.advisor_id) {
                const advisorName = advisor.advisor_name || advisor.advisor_email || 'Your Advisor';
                if (nameEl) nameEl.textContent = advisorName;
                if (avatarEl) avatarEl.textContent = advisorName.slice(0, 2).toUpperCase();
            } else {
                if (nameEl) nameEl.textContent = 'No advisor assigned';
                if (avatarEl) avatarEl.textContent = '--';
            }
        } catch (e) {
            if (nameEl) nameEl.textContent = e.message && e.message.includes('No advisor') ? 'No advisor assigned' : 'Academic Advisor';
            if (avatarEl && e.message && e.message.includes('No advisor')) avatarEl.textContent = '--';
        }
    }

    async function updateStudentUnreadBadge() {
        try {
            const data = await apiFetch('/chat/student/unread-count');
            updateStudentChatBadge(data.unread || 0);
        } catch (_e) {}
    }

    function updateStudentChatBadge(count) {
        const badge = document.getElementById('student-chat-badge');
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    window.studentSendMessage = async function () {
        const input = document.getElementById('studentChatInput');
        if (!input) return;
        const content = input.value.trim();
        if (!content) return;
        input.disabled = true;
        try {
            await apiFetch('/chat/student/messages', {
                method: 'POST',
                body: JSON.stringify({ content }),
            });
            input.value = '';
            input.style.height = 'auto';
            await loadStudentAdvisorMessages();
        } catch (e) {
            if (typeof window.showNotification === 'function') {
                window.showNotification(e.message || 'Failed to send message', 'error');
            } else {
                alert(e.message || 'Failed to send message');
            }
        } finally {
            input.disabled = false;
            input.focus();
        }
    };

    function startStudentChatPolling() {
        stopStudentChatPolling();
        studentChatPollInterval = setInterval(async () => {
            await loadStudentAdvisorMessages();
        }, 5000);
    }

    function stopStudentChatPolling() {
        if (studentChatPollInterval) { clearInterval(studentChatPollInterval); studentChatPollInterval = null; }
    }

    // Expose student chat functions globally so home_script.js runPageInit can call them
    window.loadStudentAdvisorInfo = loadStudentAdvisorInfo;
    window.loadStudentAdvisorMessages = loadStudentAdvisorMessages;
    window.startStudentChatPolling = startStudentChatPolling;
    window.stopStudentChatPolling = stopStudentChatPolling;

    // Setup Enter key for student chat
    document.addEventListener('DOMContentLoaded', () => {
        const inp = document.getElementById('studentChatInput');
        if (inp) {
            inp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    window.studentSendMessage();
                }
            });
            inp.addEventListener('input', () => {
                inp.style.height = 'auto';
                inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
            });
        }

        // Poll unread count every 30s while logged in (student portal)
        setInterval(() => {
            if (getToken() && document.getElementById('student-chat-badge')) {
                updateStudentUnreadBadge();
            }
        }, 30000);
    });

})();
