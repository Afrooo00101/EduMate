(function () {
    const API_BASE = 'http://127.0.0.1:8000/api/v1';
    const TOKEN_KEY = 'edumate_access_token';
    const USER_KEY = 'edumate_current_user';
    const DEFAULT_AVATAR = 'https://via.placeholder.com/110/2563eb/FFFFFF?text=U';

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

    function notify(message, type) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type || 'info');
            return;
        }
        if (window.Toast && typeof window.Toast.error === 'function' && type === 'error') {
            window.Toast.error(message);
            return;
        }
        if (window.Toast && typeof window.Toast.success === 'function' && type === 'success') {
            window.Toast.success(message);
            return;
        }
        alert(message);
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
        sessionStorage.setItem(USER_KEY, JSON.stringify(student));
        syncLegacyUser(student);
    }

    function clearSession() {
        [TOKEN_KEY, USER_KEY, 'edumate_logged', 'edumate_admin_logged', 'edumate_username', 'edumate_user_email', 'edumate_user_type', 'edumate_major_name'].forEach((key) => sessionStorage.removeItem(key));
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

        const response = await fetch(`${API_BASE}${path}`, {
            method: requestOptions.method || 'GET',
            headers,
            body: requestOptions.body,
        });

        if (response.status === 401) {
            clearSession();
        }
        if (!response.ok) {
            let detail = `Request failed (${response.status})`;
            try {
                const data = await response.json();
                detail = data.detail || detail;
            } catch (_error) {}
            throw new Error(detail);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

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
        if (typeof window.grecaptcha !== 'undefined') {
            const token = window.grecaptcha.getResponse();
            if (required && !token) throw new Error('CAPTCHA required');
            return token || 'test-pass';
        }
        return 'test-pass';
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

    async function performLogin(email, password, remember, options) {
        const loginOptions = options || {};
        const captchaToken = loginOptions.captchaToken || getCaptchaToken(loginOptions.requireCaptcha !== false);
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            auth: false,
            body: JSON.stringify({ email, password, captcha_token: captchaToken }),
        });

        setSession(data.student, data.access_token);
        if (remember) localStorage.setItem('edumate_remember', email);
        if (typeof window.grecaptcha !== 'undefined') {
            try { window.grecaptcha.reset(); } catch (_error) {}
        }
        if (typeof window.updateSidebarFromStorage === 'function') window.updateSidebarFromStorage();
        if (typeof window.applyStoredProfileToUI === 'function') window.applyStoredProfileToUI();
        if (typeof window.logActivity === 'function') window.logActivity('signed_in', 'Signed in to EduMate');
        return data.student;
    }

    async function handleBackendLogin(redirectMode) {
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
            notify(error.message || 'Login failed', 'error');
        }
    }

    window.handleLogin = function () { return handleBackendLogin('index-page'); };
    window.attemptLogin = function () { return handleBackendLogin('home-page'); };

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

        const studentCode = String(document.getElementById('info-username')?.value || temp.username || '').trim();
        const fullName = String(document.getElementById('info-fullname')?.value || temp.name || '').trim();
        const email = String(document.getElementById('info-email')?.value || temp.email || '').trim();
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
            await performLogin(email, temp.password, true, { requireCaptcha: false, captchaToken: 'test-pass' });
            notify('Account created successfully', 'success');
            if (typeof window.navigateTo === 'function') window.navigateTo('dashboard');
        } catch (error) {
            notify(error.message || 'Registration failed', 'error');
        }
    };

    window.updateSidebarFromStorage = function () {
        const user = getStoredUser();
        const profileName = document.getElementById('profile-name');
        const profilePic = document.getElementById('profile-pic');
        if (profileName) profileName.textContent = user ? user.full_name : 'Guest';
        if (profilePic) profilePic.src = user?.profile_image_url || DEFAULT_AVATAR;
        const userName = document.getElementById('user-name');
        if (userName && user) userName.textContent = user.full_name || user.student_code;
    };

    window.applyStoredProfileToUI = function () {
        const user = getStoredUser();
        if (!user) return;
        const avatar = document.getElementById('profile-avatar-large');
        if (avatar) avatar.src = user.profile_image_url || DEFAULT_AVATAR;
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

        const studentCode = String(document.getElementById('profile-username-input')?.value || currentUser.student_code || '').trim();
        const fullName = String(document.getElementById('profile-name-input')?.value || currentUser.full_name || '').trim();
        const email = String(document.getElementById('profile-email-input')?.value || currentUser.email || '').trim();
        const majorName = String(document.getElementById('profile-major-input')?.value || getMajorLabel(currentUser) || '').trim();
        const graduationYearValue = String(document.getElementById('profile-gradyear-input')?.value || currentUser.graduation_year || '').trim();
        const skillsSummary = String(document.getElementById('profile-skills-input')?.value || currentUser.skills_summary || '').trim();
        const avatarUrl = document.getElementById('profile-avatar-large')?.src || currentUser.profile_image_url || DEFAULT_AVATAR;

        try {
            const majorId = await resolveMajorId(majorName);
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
            container.innerHTML = `<div class="card" style="text-align:center;color:var(--muted);padding:40px"><p>No backend internships found for ${position || 'this position'}.</p></div>`;
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

    window.loadInternshipsByPosition = async function (position) {
        const resolvedPosition = position || String(document.getElementById('jobPositionSelect')?.value || '').trim();
        if (!resolvedPosition) {
            if (legacyLoadInternshipsByPosition) return legacyLoadInternshipsByPosition(position);
            return;
        }
        try {
            const items = await apiFetch(`/internships?position=${encodeURIComponent(resolvedPosition)}`);
            if ((!items || !items.length) && legacyLoadInternshipsByPosition) return legacyLoadInternshipsByPosition(resolvedPosition);
            renderInternshipSearch(items || [], resolvedPosition);
        } catch (error) {
            if (legacyLoadInternshipsByPosition) return legacyLoadInternshipsByPosition(resolvedPosition);
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
        const feedback = document.getElementById('ats-feedback');
        if (!feedback) return;
        try {
            const result = await apiFetch('/resume/ats-check', { method: 'POST', body: JSON.stringify(collectResumePayload()) });
            feedback.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center"><strong>ATS Score</strong><span>${result.score}/100</span></div>
                <div style="margin-top:12px"><strong>Strengths</strong><ul>${result.strengths.map((item) => `<li>${item}</li>`).join('')}</ul></div>
                <div style="margin-top:12px"><strong>Missing Keywords</strong><ul>${result.missing_keywords.map((item) => `<li>${item}</li>`).join('')}</ul></div>
            `;
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
})();


