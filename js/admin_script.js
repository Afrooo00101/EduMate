let currentPage = 'dashboard';
let activityChart = null;
let growthChart = null;
let featurePieChart = null;
let cachedAdminUsers = [];
let cachedSecurityLogs = [];
let cachedAnalyticsEvents = [];
let cachedIpRules = [];
let cachedCountryAccess = { mode: 'allow_all', blocked_countries: [] };
let cachedAdvisors = [];
let assigningStudentId = null;
const ADMIN_EVENTS_PATH = '/admin/platform-events';

function notify(message, type = 'info') {
    if (window.edumateAdminNotify) {
        window.edumateAdminNotify(message, type);
        return;
    }
    alert(message);
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function adminApi(path, options) {
    if (typeof window.edumateAdminApiFetch !== 'function') {
        throw new Error('Admin API is not ready');
    }
    return window.edumateAdminApiFetch(path, options);
}

function updateActiveNavItem(pageId) {
    document.querySelectorAll('.nav-links a').forEach((link) => {
        link.style.background = 'transparent';
        link.style.color = 'var(--muted)';
    });

    const activeLink = document.querySelector(`.nav-links a[onclick="navigateTo('${pageId}')"]`);
    if (activeLink) {
        activeLink.style.background = 'rgba(99, 102, 241, 0.1)';
        activeLink.style.color = 'var(--primary)';
    }
}

function updateAdminProfile() {
    const adminName = document.getElementById('admin-name');
    if (adminName) {
        adminName.textContent = sessionStorage.getItem('edumate_admin_email') || 'Admin';
    }
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('edumate_admin_theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    updateThemeIcon();
}

function renderUnavailable(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div style="color:var(--muted);padding:12px 0;">${escapeHtml(message)}</div>`;
    }
}

function formatDateTime(value) {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
}

function formatDate(value) {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
}

function userStatus(user) {
    if (!user?.is_active) return 'Blocked';
    const lastSeen = getUserLastSeen(user);
    if (!lastSeen) return 'Offline';
    return (Date.now() - lastSeen.getTime()) <= 15 * 60 * 1000 ? 'Online' : 'Offline';
}

function userStatusClass(user) {
    return userStatus(user) === 'Online' ? 'status-active' : 'status-blocked';
}

function getUserIp(user) {
    const relatedLogs = cachedSecurityLogs
        .filter((item) => item.identifier && item.identifier === user?.email && item.ip_address)
        .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
    return relatedLogs[0]?.ip_address || 'N/A';
}

function getUserLastSeen(user) {
    const candidates = [];
    if (user?.last_login) candidates.push(new Date(user.last_login));
    cachedAnalyticsEvents
        .filter((item) => item.student_id === user?.id)
        .forEach((item) => candidates.push(new Date(item.created_at)));
    cachedSecurityLogs
        .filter((item) => item.identifier && item.identifier === user?.email)
        .forEach((item) => candidates.push(new Date(item.created_at)));
    const validDates = candidates.filter((value) => !Number.isNaN(value.getTime()));
    if (!validDates.length) return null;
    validDates.sort((left, right) => right.getTime() - left.getTime());
    return validDates[0];
}

function groupCounts(items, getKey) {
    return items.reduce((acc, item) => {
        const key = getKey(item);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
}

function getLastSevenDaysCounts(items) {
    const counts = [];
    const labels = [];
    for (let index = 6; index >= 0; index -= 1) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - index);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        counts.push(items.filter((item) => {
            const created = new Date(item.created_at);
            return created >= date && created < nextDate;
        }).length);
    }
    return { labels, counts };
}

async function fetchAdminData() {
    const results = await Promise.allSettled([
        adminApi('/admin/users'),
        adminApi('/admin/security-logs'),
        adminApi(ADMIN_EVENTS_PATH),
    ]);

    const [usersResult, logsResult, eventsResult] = results;
    const failures = [];

    if (usersResult.status === 'fulfilled') {
        cachedAdminUsers = Array.isArray(usersResult.value) ? usersResult.value : [];
    } else {
        cachedAdminUsers = [];
        failures.push(`users: ${usersResult.reason?.message || 'request failed'}`);
    }

    if (logsResult.status === 'fulfilled') {
        cachedSecurityLogs = Array.isArray(logsResult.value) ? logsResult.value : [];
    } else {
        cachedSecurityLogs = [];
        failures.push(`security logs: ${logsResult.reason?.message || 'request failed'}`);
    }

    if (eventsResult.status === 'fulfilled') {
        cachedAnalyticsEvents = Array.isArray(eventsResult.value) ? eventsResult.value : [];
    } else {
        cachedAnalyticsEvents = [];
        failures.push(`analytics events: ${eventsResult.reason?.message || 'request failed'}`);
    }

    return failures;
}

async function loadAllDashboardData() {
    try {
        const failures = await fetchAdminData();
        updateLastUpdated();
        loadTotalUsers();
        loadTotalSearches();
        loadActiveUsers();
        loadAvgSessionTime();
        loadUserActivityChart();
        loadCountryStats();
        loadTopSearches();
        loadTopFeatures();
        loadCourseInterest();
        loadBlockedIPs();
        loadBlockedRegions();
        loadRecentUsers();
        if (failures.length) {
            notify(`Dashboard loaded with partial data: ${failures.join(' | ')}`, 'warning');
        }
    } catch (error) {
        notify(error.message || 'Failed to load admin dashboard', 'error');
    }
}

function updateLastUpdated() {
    const element = document.getElementById('last-updated');
    if (element) {
        element.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    }
}

function loadTotalUsers() {
    const element = document.getElementById('total-users');
    if (element) element.textContent = String(cachedAdminUsers.length);
}

function loadTotalSearches() {
    const element = document.getElementById('total-searches');
    if (element) element.textContent = String(cachedAnalyticsEvents.length);
}

function loadActiveUsers() {
    const element = document.getElementById('active-today');
    if (!element) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = [...cachedAnalyticsEvents, ...cachedSecurityLogs].filter((item) => new Date(item.created_at) >= today).length;
    element.textContent = String(count);
}

function loadAvgSessionTime() {
    const sessionElement = document.getElementById('avg-session');
    const analyticsElement = document.getElementById('avg-time-analytics');
    if (sessionElement) sessionElement.textContent = 'N/A';
    if (analyticsElement) analyticsElement.textContent = 'N/A';
}

function loadUserActivityChart() {
    const canvas = document.getElementById('userActivityChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const combined = [...cachedAnalyticsEvents, ...cachedSecurityLogs];
    const chartData = getLastSevenDaysCounts(combined);

    if (activityChart) activityChart.destroy();
    activityChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Events',
                data: chartData.counts,
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                tension: 0.35,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
            },
        },
    });
}

function loadCountryStats() {
    renderUnavailable('country-stats', 'Country and region analytics are not available from the backend yet.');
}

function loadTopSearches() {
    const container = document.getElementById('top-searches');
    if (!container) return;
    const counts = Object.entries(groupCounts(cachedAnalyticsEvents, (item) => item.event_type || 'unknown'))
        .sort((left, right) => right[1] - left[1])
        .slice(0, 10);

    if (!counts.length) {
        container.innerHTML = '<div style="color:var(--muted)">No analytics events recorded yet.</div>';
        return;
    }

    container.innerHTML = counts.map(([label, count]) => `
        <div class="search-item">
            <span class="search-term">${escapeHtml(label)}</span>
            <span class="search-count">${count}</span>
        </div>
    `).join('');
}

function loadTopFeatures() {
    const container = document.getElementById('top-features');
    if (!container) return;
    const counts = Object.entries(groupCounts(cachedAnalyticsEvents, (item) => item.source || 'web'))
        .sort((left, right) => right[1] - left[1]);

    if (!counts.length) {
        container.innerHTML = '<div style="color:var(--muted)">No feature usage data available yet.</div>';
        return;
    }

    container.innerHTML = counts.map(([label, count]) => `
        <div class="feature-item">
            <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:1.1rem">•</span>
                <span class="search-term">${escapeHtml(label)}</span>
            </div>
            <span class="search-count">${count}</span>
        </div>
    `).join('');
}

function loadCourseInterest() {
    ['cs', 'engineering', 'business', 'medicine', 'science', 'arts', 'law'].forEach((id) => {
        const countNode = document.getElementById(`${id}-count`);
        const progressNode = document.getElementById(`${id}-progress`);
        if (countNode) countNode.textContent = '0';
        if (progressNode) progressNode.style.width = '0%';
    });
}

function loadBlockedIPs() {
    const container = document.getElementById('ip-rules-list');
    if (!container) return;
    if (!cachedIpRules.length) {
        container.innerHTML = '<div style="color:var(--muted)">No IP rules configured.</div>';
        return;
    }

    container.innerHTML = cachedIpRules.map((rule) => `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:10px;border-bottom:1px solid var(--border);gap:10px">
            <div>
                <div style="font-weight:600">${escapeHtml(rule.ip_address)}</div>
                <div style="font-size:0.85rem;color:var(--muted)">${escapeHtml(rule.reason || 'No reason provided')}</div>
            </div>
            <button class="link-btn" style="padding:4px 8px" onclick="removeIPRule(${rule.id})">Remove</button>
        </div>
    `).join('');
}

function loadBlockedRegions() {
    const container = document.getElementById('country-access-list');
    const select = document.getElementById('country-access');
    if (select) {
        select.value = cachedCountryAccess.mode || 'allow_all';
    }
    if (!container) return;

    const blockedCountries = Array.isArray(cachedCountryAccess.blocked_countries)
        ? cachedCountryAccess.blocked_countries
        : [];
    if (cachedCountryAccess.mode !== 'block_specific') {
        container.innerHTML = '<div style="color:var(--muted)">All countries are currently allowed.</div>';
        return;
    }
    if (!blockedCountries.length) {
        container.innerHTML = '<div style="color:var(--muted)">Block specific mode is enabled, but no countries are blocked yet.</div>';
        return;
    }

    container.innerHTML = blockedCountries.map((country) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--border);gap:10px">
            <div style="font-weight:600">${escapeHtml(country)}</div>
            <button class="link-btn" style="padding:4px 8px" onclick="removeBlockedCountry('${escapeHtml(country)}')">Remove</button>
        </div>
    `).join('');
}

function loadRecentUsers() {
    const container = document.getElementById('recent-users-list');
    if (!container) return;
    const users = [...cachedAdminUsers]
        .sort((left, right) => {
            const rightSeen = getUserLastSeen(right)?.getTime() || 0;
            const leftSeen = getUserLastSeen(left)?.getTime() || 0;
            return rightSeen - leftSeen || (Number(right.id) - Number(left.id));
        })
        .slice(0, 5);
    if (!users.length) {
        container.innerHTML = '<div style="color:var(--muted)">No users found.</div>';
        return;
    }

    container.innerHTML = users.map((user) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--border)">
            <div>
                <div style="font-weight:600">${escapeHtml(user.full_name || user.student_code || user.email)}</div>
                <div style="font-size:0.85rem;color:var(--muted)">${escapeHtml(formatDateTime(getUserLastSeen(user)) || 'No recent activity')}</div>
            </div>
            <span class="user-status ${userStatusClass(user)}">${userStatus(user)}</span>
        </div>
    `).join('');
}

async function loadUsersData() {
    try {
        await fetchAdminData();
        renderUsersTable(cachedAdminUsers);
    } catch (error) {
        notify(error.message || 'Failed to load users', 'error');
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map((user) => `
        <tr>
            <td>${escapeHtml(user.full_name || user.student_code || 'Unknown user')}</td>
            <td>${escapeHtml(user.email || 'N/A')}</td>
            <td>${escapeHtml(getUserIp(user))}</td>
            <td>${escapeHtml(formatDateTime(user.last_login))}</td>
            <td><span class="user-status ${userStatusClass(user)}">${userStatus(user)}</span></td>
            <td>
                <button class="link-btn" style="padding:4px 8px;margin-right:5px" onclick="viewUserDetails(${user.id})">View</button>
                <button class="link-btn" style="padding:4px 8px;margin-right:5px" onclick="openAssignAdvisor(${user.id})">Assign</button>
                <button class="link-btn" style="padding:4px 8px" onclick="toggleUserBlock(${user.id})">${user.is_active ? 'Block' : 'Unblock'}</button>
            </td>
        </tr>
    `).join('');
}

async function loadAnalytics() {
    try {
        cachedAnalyticsEvents = await adminApi(ADMIN_EVENTS_PATH);

        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const dailyActive = cachedAnalyticsEvents.filter((item) => new Date(item.created_at) >= today).length;
        const weeklyActive = cachedAnalyticsEvents.filter((item) => new Date(item.created_at) >= weekAgo).length;
        const monthlyActive = cachedAnalyticsEvents.filter((item) => new Date(item.created_at) >= monthAgo).length;

        const dailyNode = document.getElementById('daily-active');
        const weeklyNode = document.getElementById('weekly-active');
        const monthlyNode = document.getElementById('monthly-active');
        if (dailyNode) dailyNode.textContent = String(dailyActive);
        if (weeklyNode) weeklyNode.textContent = String(weeklyActive);
        if (monthlyNode) monthlyNode.textContent = String(monthlyActive);

        loadUserGrowthChart();
        loadFeaturePieChart();
    } catch (error) {
        const dailyNode = document.getElementById('daily-active');
        const weeklyNode = document.getElementById('weekly-active');
        const monthlyNode = document.getElementById('monthly-active');
        if (dailyNode) dailyNode.textContent = '0';
        if (weeklyNode) weeklyNode.textContent = '0';
        if (monthlyNode) monthlyNode.textContent = '0';
        notify(`Failed to load analytics events: ${error.message || 'request failed'}`, 'error');
    }
}

function loadUserGrowthChart() {
    const canvas = document.getElementById('userGrowthChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const labels = [];
    const data = [];
    for (let offset = 11; offset >= 0; offset -= 1) {
        const date = new Date();
        date.setMonth(date.getMonth() - offset);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        data.push(cachedAnalyticsEvents.filter((item) => {
            const created = new Date(item.created_at);
            return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
        }).length);
    }

    if (growthChart) growthChart.destroy();
    growthChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Events',
                data,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                tension: 0.35,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
            },
        },
    });
}

function loadFeaturePieChart() {
    const canvas = document.getElementById('featurePieChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const entries = Object.entries(groupCounts(cachedAnalyticsEvents, (item) => item.event_type || 'unknown'))
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5);

    if (featurePieChart) featurePieChart.destroy();
    featurePieChart = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: entries.map(([label]) => label),
            datasets: [{
                data: entries.map(([, count]) => count),
                backgroundColor: ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
            },
        },
    });
}

async function loadSecurityData() {
    try {
        const [logs, ipRules, countryAccess] = await Promise.all([
            adminApi('/admin/security-logs'),
            adminApi('/admin/ip-rules'),
            adminApi('/admin/country-access'),
        ]);
        cachedSecurityLogs = Array.isArray(logs) ? logs : [];
        cachedIpRules = Array.isArray(ipRules) ? ipRules : [];
        cachedCountryAccess = countryAccess || { mode: 'allow_all', blocked_countries: [] };
        loadBlockedIPs();
        loadBlockedRegions();
        loadSecurityLogs();
    } catch (error) {
        notify(error.message || 'Failed to load security data', 'error');
    }
}

function loadSecurityLogs() {
    const container = document.getElementById('security-logs');
    if (!container) return;

    if (!cachedSecurityLogs.length) {
        container.innerHTML = '<div style="color:var(--muted)">No security logs found.</div>';
        return;
    }

    container.innerHTML = cachedSecurityLogs.map((log) => `
        <div class="log-item">
            <span class="log-time">${formatDateTime(log.created_at)}</span>
            <span class="log-level log-info">${escapeHtml(log.event_type || 'event').toUpperCase()}</span>
            <span>${escapeHtml(log.details || 'No details')}</span>
            <div style="font-size:0.8rem;color:var(--muted);margin-top:4px">
                IP: ${escapeHtml(log.ip_address || 'N/A')} | Identifier: ${escapeHtml(log.identifier || 'N/A')}
            </div>
        </div>
    `).join('');
}

async function loadSystemLogs() {
    try {
        cachedSecurityLogs = await adminApi('/admin/security-logs');
        const container = document.getElementById('system-logs');
        if (!container) return;
        container.innerHTML = cachedSecurityLogs.map((log) => `
            <div class="log-item">
                <span class="log-time">${formatDateTime(log.created_at)}</span>
                <span class="log-level log-info">${escapeHtml(log.event_type || 'event').toUpperCase()}</span>
                <span>${escapeHtml(log.details || 'No details')}</span>
            </div>
        `).join('');
    } catch (error) {
        notify(error.message || 'Failed to load logs', 'error');
    }
}

async function loadAdminSettings() {
    const maintenanceNode = document.getElementById('maintenance-mode');
    const timeoutNode = document.getElementById('session-timeout');
    const attemptsNode = document.getElementById('max-login-attempts');
    try {
        const settings = await adminApi('/admin/settings');
        cachedCountryAccess.mode = settings.country_access_mode || cachedCountryAccess.mode || 'allow_all';
        if (maintenanceNode) {
            maintenanceNode.checked = !!settings.maintenance_mode;
            maintenanceNode.disabled = false;
        }
        if (timeoutNode) {
            timeoutNode.value = settings.session_timeout_minutes ?? 30;
            timeoutNode.disabled = false;
        }
        if (attemptsNode) {
            attemptsNode.value = settings.max_login_attempts ?? 5;
            attemptsNode.disabled = false;
        }
    } catch (error) {
        if (maintenanceNode) maintenanceNode.disabled = true;
        if (timeoutNode) timeoutNode.disabled = true;
        if (attemptsNode) attemptsNode.disabled = true;
        notify(error.message || 'Failed to load admin settings', 'error');
    }
    await loadAdminUsers();
}

async function loadAdminUsers() {
    try {
        cachedAdminUsers = await adminApi('/admin/users');
        const container = document.getElementById('admin-users-list');
        if (!container) return;
        const admins = cachedAdminUsers.filter((user) => user.is_admin);
        if (!admins.length) {
            container.innerHTML = '<div style="color:var(--muted)">No admin users found.</div>';
            return;
        }
        container.innerHTML = admins.map((user) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--border)">
                <div>
                    <div style="font-weight:600">${escapeHtml(user.full_name || user.email)}</div>
                    <div style="font-size:0.85rem;color:var(--muted)">${escapeHtml(user.email || '')}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                    <span class="user-status status-active">Admin</span>
                    <button class="link-btn" style="padding:4px 8px" onclick="deleteAdminUser(${user.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        notify(error.message || 'Failed to load admin users', 'error');
    }
}

function searchUsers() {
    const searchTerm = String(document.getElementById('user-search')?.value || '').trim().toLowerCase();
    const filter = document.getElementById('user-filter')?.value || 'all';
    const filtered = cachedAdminUsers.filter((user) => {
        const matchesSearch = !searchTerm || [user.full_name, user.student_code, user.email]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(searchTerm));

        if (!matchesSearch) return false;
        if (filter === 'online') return userStatus(user) === 'Online';
        if (filter === 'offline') return userStatus(user) === 'Offline';
        if (filter === 'blocked') return userStatus(user) === 'Blocked';
        return true;
    });
    renderUsersTable(filtered);
}

function viewUserDetails(userId) {
    const user = cachedAdminUsers.find((item) => item.id === Number(userId));
    if (!user) {
        notify('User not found', 'error');
        return;
    }
    const details = [
        `Name: ${user.full_name || 'N/A'}`,
        `Student Code: ${user.student_code || 'N/A'}`,
        `Email: ${user.email || 'N/A'}`,
        `IP: ${getUserIp(user)}`,
        `Graduation Year: ${user.graduation_year || 'N/A'}`,
        `Last Login: ${formatDateTime(user.last_login)}`,
        `Skills: ${user.skills_summary || 'N/A'}`,
        `Status: ${userStatus(user)}`,
        `Role: ${user.is_admin ? 'Admin' : 'Student'}`,
    ].join('\n');
    alert(details);
}

async function toggleUserBlock(userId) {
    try {
        const updatedUser = await adminApi(`/admin/users/${userId}/toggle-active`, { method: 'POST' });
        cachedAdminUsers = cachedAdminUsers.map((user) => user.id === updatedUser.id ? updatedUser : user);
        cachedSecurityLogs = await adminApi('/admin/security-logs');
        renderUsersTable(cachedAdminUsers);
        loadRecentUsers();
        notify(`User ${updatedUser.is_active ? 'unblocked' : 'blocked'} successfully`, 'success');
    } catch (error) {
        notify(error.message || 'Failed to update user status', 'error');
    }
}

function exportLogs() {
    const payload = JSON.stringify(cachedSecurityLogs, null, 2);
    const link = document.createElement('a');
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(payload)}`;
    link.download = `edumate_security_logs_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
}

function unsupportedAdminAction(actionName) {
    notify(`${actionName} is not available from this admin view.`, 'warning');
}

function blockIP() { showAddIPRule(); }
function unblockIP() { unsupportedAdminAction('Bulk IP unblocking'); }
function blockCountry() { updateCountryAccess(); }
function unblockRegion() { unsupportedAdminAction('Bulk country unblocking'); }
async function updateCountryAccess() {
    const select = document.getElementById('country-access');
    const mode = select?.value || 'allow_all';
    let blockedCountries = cachedCountryAccess.blocked_countries || [];

    if (mode === 'block_specific') {
        const existing = blockedCountries.join(', ');
        const input = prompt('Enter blocked countries separated by commas:', existing);
        if (input === null) return;
        blockedCountries = input.split(',').map((item) => item.trim()).filter(Boolean);
    } else {
        blockedCountries = [];
    }

    try {
        cachedCountryAccess = await adminApi('/admin/country-access', {
            method: 'PUT',
            body: JSON.stringify({
                mode,
                blocked_countries: blockedCountries,
            }),
        });
        loadBlockedRegions();
        notify('Country access updated successfully', 'success');
    } catch (error) {
        notify(error.message || 'Failed to update country access', 'error');
    }
}
async function showAddIPRule() {
    const ipAddress = prompt('Enter the IP address to block:');
    if (!ipAddress) return;
    const reason = prompt('Enter an optional reason for this IP rule:');

    try {
        const rule = await adminApi('/admin/ip-rules', {
            method: 'POST',
            body: JSON.stringify({
                ip_address: ipAddress.trim(),
                reason: reason ? reason.trim() : null,
            }),
        });
        cachedIpRules = [rule, ...cachedIpRules.filter((item) => item.id !== rule.id)];
        loadBlockedIPs();
        notify('IP rule saved successfully', 'success');
    } catch (error) {
        notify(error.message || 'Failed to save IP rule', 'error');
    }
}
function viewAllCourseInterests() { navigateTo('analytics'); }
function blockUser() { unsupportedAdminAction('User blocking'); }
async function removeIPRule(ruleId) {
    try {
        await adminApi(`/admin/ip-rules/${ruleId}`, { method: 'DELETE' });
        cachedIpRules = cachedIpRules.filter((rule) => rule.id !== Number(ruleId));
        loadBlockedIPs();
        notify('IP rule removed successfully', 'success');
    } catch (error) {
        notify(error.message || 'Failed to remove IP rule', 'error');
    }
}
async function removeBlockedCountry(countryName) {
    const remaining = (cachedCountryAccess.blocked_countries || []).filter((item) => item !== countryName);
    try {
        cachedCountryAccess = await adminApi('/admin/country-access', {
            method: 'PUT',
            body: JSON.stringify({
                mode: remaining.length ? 'block_specific' : 'allow_all',
                blocked_countries: remaining,
            }),
        });
        loadBlockedRegions();
        notify('Country removed successfully', 'success');
    } catch (error) {
        notify(error.message || 'Failed to update country access', 'error');
    }
}
async function saveAdminSettings() {
    const maintenanceNode = document.getElementById('maintenance-mode');
    const timeoutNode = document.getElementById('session-timeout');
    const attemptsNode = document.getElementById('max-login-attempts');
    const payload = {
        maintenance_mode: !!maintenanceNode?.checked,
        session_timeout_minutes: Number(timeoutNode?.value || 30),
        max_login_attempts: Number(attemptsNode?.value || 5),
        country_access_mode: cachedCountryAccess.mode || document.getElementById('country-access')?.value || 'allow_all',
    };
    try {
        const saved = await adminApi('/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
        if (saved && typeof saved === 'object') {
            cachedCountryAccess.mode = saved.country_access_mode || cachedCountryAccess.mode;
        }
        notify('Admin settings saved successfully', 'success');
    } catch (error) {
        notify(error.message || 'Failed to save admin settings', 'error');
    }
}

async function showAddAdmin() {
    const fullName = prompt('Enter the full name for the new admin user:');
    if (!fullName) return;
    const email = prompt('Enter the admin email (@sut.edu.eg):');
    if (!email) return;
    const password = prompt('Enter the password for the new admin user:');
    if (!password) return;

    try {
        const newAdmin = await adminApi('/admin/admin-users', {
            method: 'POST',
            body: JSON.stringify({
                full_name: fullName.trim(),
                email: email.trim().toLowerCase(),
                password: password.trim(),
            }),
        });
        cachedAdminUsers.push(newAdmin);
        await loadAdminUsers();
        notify('Admin user created successfully', 'success');
    } catch (error) {
        notify(error.message || 'Failed to create admin user', 'error');
    }
}
async function deleteAdminUser(userId) {
    const target = cachedAdminUsers.find((item) => item.id === Number(userId));
    if (!target) {
        notify('Admin user not found', 'error');
        return;
    }
    if (!confirm(`Delete admin account ${target.email}?`)) {
        return;
    }

    try {
        await adminApi(`/admin/admin-users/${userId}`, { method: 'DELETE' });
        cachedAdminUsers = cachedAdminUsers.filter((item) => item.id !== Number(userId));
        await loadAdminUsers();
        notify('Admin user deleted successfully', 'success');
    } catch (error) {
        notify(error.message || 'Failed to delete admin user', 'error');
    }
}
function logSecurityEvent() {}
function resetLoginAttempts() {}
function registerFailedLogin() {}

function runPageInit(id) {
    if (id === 'dashboard') loadAllDashboardData();
    if (id === 'users') loadUsersData();
    if (id === 'analytics') loadAnalytics();
    if (id === 'security') loadSecurityData();
    if (id === 'logs') loadSystemLogs();
    if (id === 'settings') loadAdminSettings();
    if (id === 'courses' && typeof loadCourses === 'function') loadCourses();
    if (id === 'requests' && typeof loadRequests === 'function') loadRequests();
    if (id === 'advisors') loadAdvisorsData();
    if (id === 'meeting-slots') loadMeetingSlotsAdmin();
    if (id === 'advisor-students') loadAdvisorStudentsData();
}

function navigateTo(id) {
    const logged = sessionStorage.getItem('edumate_admin_logged') === '1';
    const protectedPages = new Set(['dashboard', 'users', 'analytics', 'security', 'logs', 'settings', 'courses', 'requests', 'advisors', 'meeting-slots', 'advisor-students']);
    if (protectedPages.has(id) && !logged) {
        id = 'login';
    }

    const next = document.getElementById(id);
    if (!next) return;

    const header = document.querySelector('.header');
    if (header) {
        header.style.display = (id === 'login') ? 'none' : 'flex';
    }

    document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
    next.classList.add('active');
    updateActiveNavItem(id);
    window.scrollTo(0, 0);
    currentPage = id;
    runPageInit(id);
}

function initializeApp() {
    updateThemeIcon();
    updateAdminProfile();
    const userType = sessionStorage.getItem('edumate_user_type');
    
    // Hide/Show links based on role
    const adminOnlyLinks = ['users', 'analytics', 'security', 'logs', 'settings', 'advisors'];
    const advisorOnlyLinks = ['advisor-students'];
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        const onclick = link.getAttribute('onclick');
        if (!onclick) return;
        const pageMatch = onclick.match(/'(.*?)'/);
        if (!pageMatch) return;
        const page = pageMatch[1];
        
        if (userType === 'advisor') {
            if (adminOnlyLinks.includes(page)) link.style.display = 'none';
            if (advisorOnlyLinks.includes(page)) link.style.display = 'block';
        } else if (userType === 'admin') {
            if (advisorOnlyLinks.includes(page)) link.style.display = 'none';
            if (adminOnlyLinks.includes(page)) link.style.display = 'block';
        }
    });

    if (sessionStorage.getItem('edumate_admin_logged') === '1') {
        const startPage = (userType === 'advisor') ? 'advisor-students' : 'dashboard';
        navigateTo(startPage);
    } else {
        navigateTo('login');
    }
}

function setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    document.getElementById('user-search')?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') searchUsers();
    });
    document.getElementById('analytics-period')?.addEventListener('change', loadAnalytics);
    
    // Add Advisor Button
    document.getElementById('addAdvisorBtn')?.addEventListener('click', () => {
        if (typeof showAddAdvisor === 'function') showAddAdvisor();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const storedTheme = localStorage.getItem('edumate_admin_theme');
    if (storedTheme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
    }

    setupEventListeners();
    initializeApp();
});

window.navigateTo = navigateTo;
window.updateAdminProfile = updateAdminProfile;
window.loadAllDashboardData = loadAllDashboardData;
window.refreshDashboard = loadAllDashboardData;
window.loadAnalytics = loadAnalytics;
window.searchUsers = searchUsers;
window.viewUserDetails = viewUserDetails;
window.exportLogs = exportLogs;
window.blockIP = blockIP;
window.unblockIP = unblockIP;
window.blockCountry = blockCountry;
window.unblockRegion = unblockRegion;
window.updateCountryAccess = updateCountryAccess;
window.showAddIPRule = showAddIPRule;
window.removeIPRule = removeIPRule;
window.removeBlockedCountry = removeBlockedCountry;
window.viewAllCourseInterests = viewAllCourseInterests;
window.blockUser = blockUser;
window.toggleUserBlock = toggleUserBlock;
window.saveAdminSettings = saveAdminSettings;
window.showAddAdmin = showAddAdmin;
window.deleteAdminUser = deleteAdminUser;
window.logSecurityEvent = logSecurityEvent;
window.resetLoginAttempts = resetLoginAttempts;
window.registerFailedLogin = registerFailedLogin;
window.openAddCourse = typeof openAddCourse === 'function' ? openAddCourse : function(){};
window.openEditCourse = typeof openEditCourse === 'function' ? openEditCourse : function(){};
window.saveCourse = typeof saveCourse === 'function' ? saveCourse : function(){};
window.deleteCourse = typeof deleteCourse === 'function' ? deleteCourse : function(){};
window.closeCourseModal = typeof closeCourseModal === 'function' ? closeCourseModal : function(){};
window.openAddRequest = typeof openAddRequest === 'function' ? openAddRequest : function(){};
window.submitNewRequest = typeof submitNewRequest === 'function' ? submitNewRequest : function(){};
window.deleteRequest = typeof deleteRequest === 'function' ? deleteRequest : function(){};
window.closeRequestAddModal = typeof closeRequestAddModal === 'function' ? closeRequestAddModal : function(){};
window.closeModalReq = typeof closeModalReq === 'function' ? closeModalReq : function(){};

/* ===== ADVISORS LOGIC ===== */
async function loadAdvisorsData() {
    try {
        cachedAdvisors = await adminApi('/advisors');
        renderAdvisorsTable();
    } catch (e) {
        notify('Failed to load advisors', 'error');
    }
}

function renderAdvisorsTable() {
    const wrap = document.getElementById('advisorsTableWrap');
    if (!wrap) return;
    if (!cachedAdvisors.length) {
        wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No advisors found.</div>';
        return;
    }
    let html = `<table><thead><tr>
        <th>Code</th><th>Name</th><th>Email</th><th>Department</th><th>Status</th><th>Actions</th>
    </tr></thead><tbody>`;
    cachedAdvisors.forEach(a => {
        html += `<tr>
            <td><span class="badge" style="background:var(--primary)">${escapeHtml(a.employee_code)}</span></td>
            <td style="font-weight:600">${escapeHtml(a.full_name)}</td>
            <td>${escapeHtml(a.email)}</td>
            <td>${escapeHtml(a.department || '—')}</td>
            <td><span class="user-status ${a.is_active ? 'status-active' : 'status-blocked'}">${a.is_active ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="link-btn" onclick="viewAdvisorStudents(${a.id})">Students</button>
                    <button class="link-btn" onclick="editAdvisor(${a.id})">Edit</button>
                    <button class="link-btn" style="border-color:${a.is_active ? '#EF4444' : '#10B981'};color:${a.is_active ? '#EF4444' : '#10B981'}" onclick="toggleAdvisorStatus(${a.id})">${a.is_active ? 'Block' : 'Unblock'}</button>
                </div>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
}

async function loadMeetingSlotsAdmin() {
    try {
        if (!cachedAdvisors.length) cachedAdvisors = await adminApi('/advisors');
        const advisorSelect = document.getElementById('slotAdvisorSelect');
        if (advisorSelect) {
            advisorSelect.innerHTML = '<option value="">Select advisor...</option>' + cachedAdvisors
                .filter(a => a.is_active)
                .map(a => `<option value="${a.user_id}">${escapeHtml(a.full_name)} (${escapeHtml(a.employee_code)})</option>`)
                .join('');
        }

        const slots = await adminApi('/advising/slots');
        renderMeetingSlotsAdmin(slots);
    } catch (e) {
        const wrap = document.getElementById('adminMeetingSlotsWrap');
        if (wrap) wrap.innerHTML = '<div style="color:#ef4444;padding:20px;text-align:center">Failed to load meeting slots.</div>';
    }
}

function renderMeetingSlotsAdmin(slots) {
    const wrap = document.getElementById('adminMeetingSlotsWrap');
    if (!wrap) return;
    if (!Array.isArray(slots) || !slots.length) {
        wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No active meeting slots yet.</div>';
        return;
    }
    wrap.innerHTML = `<table><thead><tr>
        <th>Advisor</th><th>Day</th><th>Time</th><th>Room</th><th>Status</th>
    </tr></thead><tbody>${slots.map(slot => `
        <tr>
            <td style="font-weight:600">${escapeHtml(slot.advisor_name || 'Advisor')}</td>
            <td>${escapeHtml(slot.day_of_week)}</td>
            <td>${escapeHtml(slot.start_time)} - ${escapeHtml(slot.end_time)}</td>
            <td>${escapeHtml(slot.location || 'TBA')}</td>
            <td><span class="user-status status-active">Active</span></td>
        </tr>`).join('')}</tbody></table>`;
}

async function submitAdvisorSlot() {
    const advisorUserId = Number(document.getElementById('slotAdvisorSelect')?.value || 0);
    const day = document.getElementById('slotDay')?.value || '';
    const startTime = document.getElementById('slotStartTime')?.value || '';
    const location = document.getElementById('slotLocation')?.value.trim() || '';
    if (!advisorUserId || !day || !startTime || !location) {
        notify('Please select advisor, day, time, and room.', 'warning');
        return;
    }
    try {
        await adminApi('/advising/admin/slots', {
            method: 'POST',
            body: JSON.stringify({
                advisor_user_id: advisorUserId,
                day_of_week: day,
                start_time: startTime,
                location
            })
        });
        notify('Meeting slot saved', 'success');
        await loadMeetingSlotsAdmin();
    } catch (e) {
        notify(e.message || 'Failed to save meeting slot', 'error');
    }
}

function showAddAdvisor() {
    document.getElementById('advisorModalTitle').textContent = 'Add New Advisor';
    document.getElementById('edit-advisor-id').value = '';
    document.getElementById('adv-name').value = '';
    document.getElementById('adv-email').value = '';
    document.getElementById('adv-code').value = '';
    document.getElementById('adv-dept').value = '';
    document.getElementById('adv-pass').value = '';
    document.getElementById('adv-pass-wrap').style.display = 'block';
    document.getElementById('advisorModalBtn').textContent = 'Create Advisor';
    document.getElementById('addAdvisorModal').style.display = 'flex';
}

function editAdvisor(id) {
    const a = cachedAdvisors.find(x => x.id === id);
    if (!a) return;
    
    document.getElementById('advisorModalTitle').textContent = 'Edit Advisor';
    document.getElementById('edit-advisor-id').value = a.id;
    document.getElementById('adv-name').value = a.full_name;
    document.getElementById('adv-email').value = a.email;
    document.getElementById('adv-code').value = a.employee_code;
    document.getElementById('adv-dept').value = a.department || '';
    document.getElementById('adv-pass-wrap').style.display = 'none'; // Don't allow password change here for now
    document.getElementById('advisorModalBtn').textContent = 'Save Changes';
    document.getElementById('addAdvisorModal').style.display = 'flex';
}

function closeAddAdvisorModal() {
    document.getElementById('addAdvisorModal').style.display = 'none';
}

async function submitAdvisorForm() {
    const id = document.getElementById('edit-advisor-id').value;
    const fullName = document.getElementById('adv-name').value.trim();
    const email = document.getElementById('adv-email').value.trim();
    const empCode = document.getElementById('adv-code').value.trim();
    const dept = document.getElementById('adv-dept').value.trim();
    
    const payload = {
        full_name: fullName,
        email: email,
        employee_code: empCode,
        department: dept || null
    };

    if (!fullName || !email || !empCode) {
        notify('Please fill in all required fields', 'error');
        return;
    }

    try {
        if (id) {
            // Update
            await adminApi(`/advisors/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            notify('Advisor updated successfully', 'success');
        } else {
            // Create
            const password = document.getElementById('adv-pass').value.trim();
            if (!password) { notify('Password is required for new advisors', 'error'); return; }
            payload.password = password;
            await adminApi('/advisors', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            notify('Advisor created successfully', 'success');
        }
        
        closeAddAdvisorModal();
        await loadAdvisorsData();
    } catch (e) {
        notify(e.message || 'Failed to save advisor', 'error');
    }
}

async function toggleAdvisorStatus(id) {
    const a = cachedAdvisors.find(x => x.id === id);
    if (!a) return;
    try {
        await adminApi(`/advisors/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ is_active: !a.is_active })
        });
        notify(`Advisor ${a.is_active ? 'blocked' : 'unblocked'}`, 'success');
        await loadAdvisorsData();
    } catch (e) {
        notify(e.message || 'Failed to update status', 'error');
    }
}

async function viewAdvisorStudents(advisorId) {
    const advisor = cachedAdvisors.find(a => a.id === advisorId);
    if (!advisor) return;
    
    document.getElementById('advisorStudentsModalTitle').textContent = `Students of ${advisor.full_name}`;
    const body = document.getElementById('advisorStudentsModalBody');
    body.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted)">Loading students...</div>';
    document.getElementById('advisorStudentsModal').style.display = 'flex';
    
    try {
        const students = await adminApi(`/advisors/${advisorId}/students`);
        renderAdvisorStudentsInModal(advisorId, students);
    } catch (e) {
        body.innerHTML = `<div style="text-align:center;padding:20px;color:#EF4444">${e.message || 'Failed to load students'}</div>`;
    }
}

function renderAdvisorStudentsInModal(advisorId, students) {
    const body = document.getElementById('advisorStudentsModalBody');
    let html = `
        <div style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center">
            <h4 style="margin:0">Assigned Students (${students.length})</h4>
            <button class="btn" style="padding:6px 12px; font-size:0.85rem" onclick="showAddStudentToAdvisor(${advisorId})">+ Add Student</button>
        </div>
    `;
    
    if (!students.length) {
        html += '<div style="text-align:center;padding:20px;color:var(--muted);border:1px dashed var(--border);border-radius:8px">No students assigned.</div>';
    } else {
        html += '<table style="width:100%;font-size:0.85rem"><thead><tr><th>Name</th><th>Code</th><th>Action</th></tr></thead><tbody>';
        students.forEach(s => {
            html += `<tr>
                <td style="font-weight:600">${escapeHtml(s.full_name)}</td>
                <td>${escapeHtml(s.student_code)}</td>
                <td>
                    <button class="link-btn" style="border-color:#EF4444;color:#EF4444;padding:2px 6px" onclick="removeStudentFromAdvisor(${advisorId}, ${s.id})">Remove</button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
    }
    
    body.innerHTML = html;
}

async function removeStudentFromAdvisor(advisorId, studentId) {
    if (!confirm('Are you sure you want to remove this student from this advisor?')) return;
    try {
        await adminApi(`/advisors/${advisorId}/assign/${studentId}`, { method: 'DELETE' });
        notify('Student removed successfully', 'success');
        // Refresh the list in modal
        const students = await adminApi(`/advisors/${advisorId}/students`);
        renderAdvisorStudentsInModal(advisorId, students);
    } catch (e) {
        notify(e.message || 'Failed to remove student', 'error');
    }
}

async function showAddStudentToAdvisor(advisorId) {
    const body = document.getElementById('advisorStudentsModalBody');
    body.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted)">Loading unassigned students...</div>';
    
    try {
        const allStudents = await adminApi('/admin/users');
        const unassigned = allStudents.filter(s => !s.advisor_id);
        
        let html = `
            <div style="margin-bottom:15px; display:flex; align-items:center; gap:10px">
                <button class="link-btn" style="padding:4px 8px" onclick="viewAdvisorStudents(${advisorId})">← Back</button>
                <h4 style="margin:0">Add Student to Advisor</h4>
            </div>
        `;
        
        if (!unassigned.length) {
            html += '<div style="text-align:center;padding:20px;color:var(--muted)">No unassigned students found.</div>';
        } else {
            html += '<div style="max-height:300px; overflow-y:auto"><table style="width:100%;font-size:0.85rem"><thead><tr><th>Name</th><th>Code</th><th>Action</th></tr></thead><tbody>';
            unassigned.forEach(s => {
                html += `<tr>
                    <td style="font-weight:600">${escapeHtml(s.full_name)}</td>
                    <td>${escapeHtml(s.student_code)}</td>
                    <td>
                        <button class="link-btn" style="border-color:#10B981;color:#10B981;padding:2px 6px" onclick="addStudentToAdvisor(${advisorId}, ${s.id})">Add</button>
                    </td>
                </tr>`;
            });
            html += '</tbody></table></div>';
        }
        body.innerHTML = html;
    } catch (e) {
        notify(e.message || 'Failed to load students', 'error');
    }
}

async function addStudentToAdvisor(advisorId, studentId) {
    try {
        await adminApi(`/advisors/${advisorId}/assign/${studentId}`, { method: 'POST' });
        notify('Student assigned successfully', 'success');
        // Go back to the student list
        viewAdvisorStudents(advisorId);
    } catch (e) {
        notify(e.message || 'Failed to assign student', 'error');
    }
}

function closeAdvisorStudentsModal() {
    document.getElementById('advisorStudentsModal').style.display = 'none';
}

async function openAssignAdvisor(userId) {
    assigningStudentId = userId;
    const user = cachedAdminUsers.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('assignStudentInfo').textContent = `Assigning advisor for: ${user.full_name || user.email}`;
    
    try {
        if (!cachedAdvisors.length) {
            cachedAdvisors = await adminApi('/advisors');
        }
        const select = document.getElementById('advisorSelect');
        select.innerHTML = '<option value="">Select Advisor</option>';
        cachedAdvisors.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = `${a.full_name} (${a.employee_code})`;
            if (user.advisor_id === a.id) opt.selected = true;
            select.appendChild(opt);
        });
        document.getElementById('assignAdvisorModal').style.display = 'flex';
    } catch (e) {
        notify('Failed to load advisors list', 'error');
    }
}

function closeAssignAdvisorModal() {
    document.getElementById('assignAdvisorModal').style.display = 'none';
}

async function submitAssignment() {
    const advisorId = document.getElementById('advisorSelect').value;
    if (!advisorId) { notify('Please select an advisor', 'warning'); return; }
    
    try {
        await adminApi(`/advisors/${advisorId}/assign/${assigningStudentId}`, { method: 'POST' });
        notify('Advisor assigned successfully', 'success');
        closeAssignAdvisorModal();
        await loadUsersData();
    } catch (e) {
        notify(e.message || 'Failed to assign advisor', 'error');
    }
}

async function loadAdvisorStudentsData() {
    try {
        const students = await adminApi('/advisors/my-students');
        renderAdvisorStudentsTable(students);
    } catch (e) {
        notify('Failed to load your students', 'error');
    }
}

function renderAdvisorStudentsTable(students) {
    const wrap = document.getElementById('advisorStudentsWrap');
    if (!wrap) return;
    if (!students.length) {
        wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No students assigned to you yet.</div>';
        return;
    }
    let html = `<table><thead><tr>
        <th>Code</th><th>Name</th><th>Email</th><th>GPA</th><th>Action</th>
    </tr></thead><tbody>`;
    students.forEach(s => {
        html += `<tr>
            <td><span class="badge" style="background:var(--primary)">${escapeHtml(s.student_code)}</span></td>
            <td style="font-weight:600">${escapeHtml(s.full_name)}</td>
            <td>${escapeHtml(s.email)}</td>
            <td>${s.gpa || '—'}</td>
            <td><button class="link-btn" onclick="viewStudentCourses(${s.id})">Courses</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
}

async function viewStudentCourses(studentId) {
    try {
        const enrollments = await adminApi(`/advisors/students/${studentId}/courses`);
        const user = cachedAdminUsers.find(u => u.id === studentId) || { full_name: 'Student' };
        
        const modal = document.getElementById('academicRecordModal');
        const title = document.getElementById('academicRecordTitle');
        const body = document.getElementById('academicRecordBody');
        
        title.innerText = `${user.full_name || user.name || 'Student'}'s Academic Record`;
        
        if (!enrollments.length) {
            body.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted)">No academic records found.</div>';
        } else {
            // Split courses: Finished (has grade or completed status) vs Ongoing/Planned
            const finished = enrollments.filter(e => e.grade || ['completed', 'finished', 'passed', 'failed'].includes(String(e.status).toLowerCase()));
            const current = enrollments.filter(e => !finished.includes(e));
            
            let html = '<div style="display:grid;gap:25px">';
            
            // Current & Planned section
            html += `<div><h3 style="color:var(--primary);margin-bottom:12px;font-size:1.1rem;border-bottom:1px solid var(--border);padding-bottom:5px">Current & Planned Courses</h3>`;
            if (current.length) {
                html += `<table style="width:100%;border-collapse:collapse;font-size:0.9rem">
                    <thead><tr style="color:var(--muted);font-size:0.75rem;text-transform:uppercase">
                        <th style="text-align:left;padding:8px">Code</th>
                        <th style="text-align:left;padding:8px">Course</th>
                        <th style="text-align:left;padding:8px">Semester</th>
                        <th style="text-align:left;padding:8px">Status</th>
                    </tr></thead><tbody>`;
                current.forEach(e => {
                    const statusColor = String(e.status).toLowerCase() === 'enrolled' ? '#8B5CF6' : '#6B7280';
                    html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                        <td style="padding:10px 8px;font-weight:600">${escapeHtml(e.course.code)}</td>
                        <td style="padding:10px 8px">${escapeHtml(e.course.name)}</td>
                        <td style="padding:10px 8px">${escapeHtml(e.semester)}</td>
                        <td style="padding:10px 8px"><span class="badge" style="background:${statusColor}">${escapeHtml(e.status)}</span></td>
                    </tr>`;
                });
                html += '</tbody></table>';
            } else {
                html += '<p style="color:var(--muted);font-size:0.9rem">No current or planned courses.</p>';
            }
            html += '</div>';
            
            // Completed section
            html += `<div><h3 style="color:#10B981;margin-bottom:12px;font-size:1.1rem;border-bottom:1px solid var(--border);padding-bottom:5px">Completed Courses (Transcript)</h3>`;
            if (finished.length) {
                html += `<table style="width:100%;border-collapse:collapse;font-size:0.9rem">
                    <thead><tr style="color:var(--muted);font-size:0.75rem;text-transform:uppercase">
                        <th style="text-align:left;padding:8px">Code</th>
                        <th style="text-align:left;padding:8px">Course</th>
                        <th style="text-align:left;padding:8px">Grade</th>
                        <th style="text-align:left;padding:8px">Semester</th>
                    </tr></thead><tbody>`;
                finished.forEach(e => {
                    const grade = String(e.grade || '—').toUpperCase();
                    const gradeColor = grade === 'F' ? '#EF4444' : (['A', 'A+', 'A-'].includes(grade) ? '#10B981' : '#F59E0B');
                    html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                        <td style="padding:10px 8px;font-weight:600">${escapeHtml(e.course.code)}</td>
                        <td style="padding:10px 8px">${escapeHtml(e.course.name)}</td>
                        <td style="padding:10px 8px"><strong style="color:${gradeColor};font-size:1.1rem">${escapeHtml(grade)}</strong></td>
                        <td style="padding:10px 8px">${escapeHtml(e.semester)}</td>
                    </tr>`;
                });
                html += '</tbody></table>';
            } else {
                html += '<p style="color:var(--muted);font-size:0.9rem">No completed courses yet.</p>';
            }
            html += '</div></div>';
            body.innerHTML = html;
        }
        
        modal.style.display = 'flex';
    } catch (e) {
        console.error(e);
        notify('Failed to load student academic record', 'error');
    }
}

function closeAcademicRecordModal() {
    document.getElementById('academicRecordModal').style.display = 'none';
}

window.closeAcademicRecordModal = closeAcademicRecordModal;

window.submitAdvisorForm = submitAdvisorForm;
window.editAdvisor = editAdvisor;
window.toggleAdvisorStatus = toggleAdvisorStatus;
window.viewAdvisorStudents = viewAdvisorStudents;
window.closeAdvisorStudentsModal = closeAdvisorStudentsModal;
window.removeStudentFromAdvisor = removeStudentFromAdvisor;
window.showAddStudentToAdvisor = showAddStudentToAdvisor;
window.addStudentToAdvisor = addStudentToAdvisor;
window.showAddAdvisor = showAddAdvisor;
window.closeAddAdvisorModal = closeAddAdvisorModal;
window.openAssignAdvisor = openAssignAdvisor;
window.closeAssignAdvisorModal = closeAssignAdvisorModal;
window.submitAssignment = submitAssignment;
window.viewStudentCourses = viewStudentCourses;
window.loadMeetingSlotsAdmin = loadMeetingSlotsAdmin;
window.submitAdvisorSlot = submitAdvisorSlot;
