(function() {
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDoZebcPthz70oxICYAMm4W43JGXVUkTZE",
    authDomain: "edumate-8b4c3.firebaseapp.com",
    projectId: "edumate-8b4c3",
    storageBucket: "edumate-8b4c3.firebasestorage.app",
    messagingSenderId: "962420815642",
    appId: "1:962420815642:web:a8f38ee45034fdefb31ea3"
};

// Initialize Firebase with safety check
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
    } catch (e) { console.warn('Firebase init failed:', e); }
} else {
    console.warn('Firebase SDK not found');
}

// API HELPER - Using unified backend_api.js version if available
const apiFetch = (path, options) => {
    if (window.apiFetch && window.apiFetch !== apiFetch) return window.apiFetch(path, options);
    // Fallback if backend_api.js not loaded
    const API_BASE = window.__EDUMATE_API_BASE__ || 'http://127.0.0.1:8001/api/v1';
    const headers = { Accept: 'application/json', ...(options?.headers || {}) };
    const token = localStorage.getItem('edumate_access_token') || sessionStorage.getItem('edumate_access_token');
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options?.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    return fetch(`${API_BASE}${path}`, {
        method: options?.method || 'GET',
        headers,
        body: options?.body
    }).then(async res => {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error(data?.detail || `Request failed (${res.status})`);
        return data;
    });
};


// ============================================
// PLANNING - switchPlanningView
// ============================================

function switchPlanningView(view) {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.planning-view').forEach(v => v.classList.remove('active'));
    
    const btnMap = { 'plan': 1, 'preview': 2, 'summer': 3, 'academic-plan': 4 };
    const btn = document.querySelector(`.toggle-btn:nth-child(${btnMap[view]})`);
    if (btn) btn.classList.add('active');
    
    const viewEl = document.getElementById(`planning-${view}-view`);
    if (viewEl) viewEl.classList.add('active');

    if (view === 'plan') loadStudyPlan();
    if (view === 'preview') loadCareerTimeline();
    if (view === 'summer') loadMySummerRequests();
    if (view === 'academic-plan') {
        const storedUserStr = sessionStorage.getItem('edumate_current_user');
        let major = 'Computer Science'; // fallback
        
        if (storedUserStr) {
            try {
                const userObj = JSON.parse(storedUserStr);
                major = userObj.major?.name || sessionStorage.getItem('edumate_major_name') || major;
            } catch (e) {}
        } else {
            major = sessionStorage.getItem('edumate_major_name') || major;
        }
        
        let color = '#60a5fa'; // CS color
        if (major.toLowerCase().includes('cyber')) {
            color = '#34d399'; // Cyber color
            major = 'Cyber Security';
        } else if (major.toLowerCase().includes('data')) {
            color = '#c084fc'; // DS color
            major = 'Data Science';
        } else {
            major = 'Computer Science';
        }
        
        switchCurriculumMajor(major);
        
        const titleEl = document.getElementById('academic-curriculum-title');
        if (titleEl) {
            titleEl.innerHTML = `<i class="fas fa-file-invoice" style="color: var(--primary); margin-right:8px;"></i>New Regulation <span style="color:${color}">(${major})</span> Courses`;
        }
        
        loadCurriculumMap();
    }
}

// ============================================
// STUDY PLAN (Plan View) - Fetches semesters from DB
// ============================================

async function loadStudyPlan() {
    const container = document.getElementById('semester-cards-container');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);grid-column:1/-1;">Loading your plan...</div>';

    try {
        const data = await apiFetch('/planning/career-path/me');
        hydrateCourseGradesFromSemesters(data.semesters || []);
        
        const badge = document.getElementById('career-badge-display');
        if (badge) {
            badge.innerHTML = `🛡️ ${data.career_path || 'Academic Path'}`;
        }
        updateDatabaseGpaDisplays(data.current_gpa);
        
        if (!data.semesters || !data.semesters.length) {
            container.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted);grid-column:1/-1;">No study plan data found.</div>';
            return;
        }

        container.innerHTML = data.semesters.map(s => {
            const totalCredits = s.courses.reduce((a, c) => a + (c.credits || 0), 0);
            
            return `
            <div class="semester-item" data-semester="${s.level}" data-semester-name="${s.semester_name}" data-semester-season="${s.semester}">
                <div class="semester-head">
                    <div class="sem-info">
                        <h3>Level ${s.level} - ${s.semester_name}</h3>
                        <span class="credit-sum">${totalCredits} credits</span>
                    </div>
                    <div class="sem-status-badge ${s.status}">${s.status.toUpperCase()}</div>
                </div>
                <div class="semester-content">
                    ${s.courses.map(c => `
                        <div class="course-row" data-course-id="${c.id}">
                            <span class="course-name">
                                <i class="fas fa-circle" style="color:${c.status === 'completed' ? '#10b981' : c.status === 'in-progress' ? '#f59e0b' : '#94a3b8'}"></i> 
                                <span class="course-code">${c.code}:</span> ${c.name}
                            </span>
                            <span class="course-credits">${c.credits} cr</span>
                            <div class="course-actions">
                                ${c.status === 'completed' ? `<span class="grade-badge" style="background:#10b981; color:white; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:600;">${c.grade || ''}</span>` : ''}
                                <button class="grade-btn" title="Set Grade" onclick="showGradeModal(this.closest('.course-row'))">
                                    <i class="fas fa-star"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="semester-actions">
                    <button class="add-course-btn" onclick="showSemesterGradeModal(this.closest('.semester-item'))">
                        <i class="fas fa-star"></i> put grades
                    </button>
                    <button class="add-course-btn" onclick="showAddSubjectModal(this)">
                        <i class="fas fa-plus-circle"></i> add subject
                    </button>
                </div>
            </div>`;
        }).join('');

        // Update overall stats
        updatePlanningHeaderStats(data);
        updateGPADisplay();
        updateSemesterGPADisplays();
        addFinalGPADisplay();

    } catch (e) {
        console.error('Study plan error:', e);
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#ef4444;grid-column:1/-1;">Failed to load study plan.</div>';
    }
}

function updatePlanningHeaderStats(data) {
    const totalCredits = data.semesters.reduce((a, s) => a + s.total_credits, 0);
    const earnedCredits = data.semesters.reduce((a, s) => a + s.completed_credits, 0);
    const remainingCredits = 128 - earnedCredits; // Assuming 128 is total
    
    const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    
    set('total-credits', totalCredits);
    set('earned-credits', earnedCredits);
    set('remaining-credits', Math.max(0, remainingCredits));
    set('remaining-credits-display', Math.max(0, remainingCredits));
    
    const progress = Math.min(Math.round((earnedCredits / 128) * 100), 100);
    set('progress-percentage', progress + '%');
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = progress + '%';
    
    const coursesLeft = Math.ceil(remainingCredits / 3);
    set('courses-left', Math.max(0, coursesLeft));
}

function updateDatabaseGpaDisplays(gpa) {
    const numericGpa = Number(gpa);
    if (!Number.isFinite(numericGpa)) return;

    const formatted = numericGpa.toFixed(2);
    ['current-gpa', 'preview-gpa-val'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = formatted;
    });
}

// ============================================
// CAREER PATH - Fetches from /planning/career-path/me
// ============================================

async function loadCareerTimeline() {
    const timeline = document.getElementById('career-timeline');
    if (!timeline) return;
    timeline.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);">Loading your academic journey...</div>';

    try {
        const data = await apiFetch('/planning/career-path/me');
        
        // Update stats
        const total = data.semesters.reduce((a, s) => a + s.courses.length, 0);
        const completed = data.semesters.reduce((a, s) => a + s.courses.filter(c => c.status === 'completed').length, 0);
        
        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        const html = (id, val) => { const e = document.getElementById(id); if (e) e.innerHTML = val; };
        
        el('path-total-courses', total);
        el('path-completed-courses', completed);
        el('path-progress-percent', `${data.total_progress}%`);
        el('preview-major-name', data.career_path || 'Your Major');
        el('preview-done-count', `${completed} / ${total}`);
        el('preview-progress-text', `${data.total_progress}% Complete`);
        updateDatabaseGpaDisplays(data.current_gpa);

        // Update Career Path Badge and Name
        html('career-badge-display', `🛡️ ${data.career_path || 'Academic Path'}`);
        el('career-name-display', data.career_path || 'Academic Path');

        const bar = document.getElementById('preview-main-progress-bar');
        if (bar) bar.style.width = `${data.total_progress}%`;

        // Render vertical timeline
        if (!data.semesters.length) {
            timeline.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted);">No study plan found. Ask your advisor to set up your curriculum.</div>';
            return;
        }

        timeline.innerHTML = data.semesters.map(s => {
            const statusClass = s.status === 'completed' ? 'completed' : s.status === 'in-progress' ? 'in-progress' : 'upcoming';
            const pct = s.total_credits > 0 ? Math.round(s.completed_credits / s.total_credits * 100) : 0;
            
            // Map Level/Semester to Semester Number
            let semLabel = `Semester ${(s.level - 1) * 2 + (s.semester_name === 'Spring' ? 2 : 1)}`;
            if (s.semester_name === 'Summer') semLabel = `Summer ${s.level}`;

            const allCompleted = s.courses.every(c => c.status === 'completed');
            const anyCompleted = s.courses.some(c => c.status === 'completed');
            const semBadge = allCompleted ? 'COMPLETED' : anyCompleted ? 'IN PROGRESS' : 'UPCOMING';

            return `
            <div class="timeline-vertical-item">
                <div class="timeline-vertical-header">
                    <span class="timeline-icon">${allCompleted ? '✅' : anyCompleted ? '🔄' : '⏳'}</span>
                    <span class="timeline-title">${semLabel}</span>
                    <div style="margin-left:auto;display:flex;align-items:center;gap:8px;">
                        <span style="font-size:0.75rem;color:var(--muted);">${pct}% done</span>
                        <span class="timeline-badge ${statusClass}">${semBadge}</span>
                    </div>
                </div>
                <div class="timeline-vertical-content">
                    ${s.courses.map(c => {
                        const isDone = c.status === 'completed';
                        const dotColor = isDone ? '#10b981' : c.status === 'in_progress' || c.status === 'enrolled' ? '#f59e0b' : '#6b7280';
                        const courseIcon = isDone ? '✅' : c.status === 'in_progress' || c.status === 'enrolled' ? '🔄' : '📘';
                        return `
                        <div class="timeline-course-row" style="opacity:${isDone ? '1' : '0.65'}">
                            <span class="course-icon">${courseIcon}</span>
                            <div class="course-info-row">
                                <div class="course-name-row">${c.code} – ${c.name}</div>
                                <div class="course-meta-row">${c.credits} CH
                                    ${isDone && c.grade ? `• Grade: <strong style="color:#10b981">${c.grade}</strong>` : ''}
                                    ${!isDone ? `• <em style="color:#94a3b8">${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</em>` : ''}
                                </div>
                            </div>
                            <span class="course-status-dot" style="
                                width:10px;height:10px;border-radius:50%;margin-left:auto;flex-shrink:0;
                                background:${dotColor}
                            "></span>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }).join('');

    } catch (e) {
        console.error('Career timeline error:', e);
        if (timeline) timeline.innerHTML = '<div style="text-align:center;padding:2rem;color:#ef4444;">Failed to load career path. Make sure you are logged in.</div>';
    }
}

// ============================================
// ACADEMIC PLAN - Grouped by Semester
// ============================================

async function loadAcademicPlan() {
    const container = document.getElementById('academic-plan-container');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);"><i class="fas fa-spinner fa-spin"></i> Loading academic plan...</div>';

    try {
        const [planRows, careerData] = await Promise.all([
            apiFetch('/planning/study-plan'),
            apiFetch('/planning/career-path/me').catch(() => ({ semesters: [] }))
        ]);

        if (!planRows || !planRows.length) {
            container.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--muted);">No academic plan data found for your major.</div>';
            return;
        }

        // 1. Build a map of all courses the student has interacted with (taken, planned, etc.)
        const studentCourseMap = {}; // course_id -> status/grade/semester
        (careerData.semesters || []).forEach(s => {
            s.courses.forEach(c => {
                studentCourseMap[c.id] = { 
                    status: c.status, 
                    grade: c.grade, 
                    semester: c.semester,
                    icon: c.icon,
                    course: c.course // backend includes course details here
                };
            });
        });

        // 2. Group everything by Semester (Level + Semester Name)
        const grouped = {};
        const getGroup = (level, semester) => {
            const key = `${level}_${semester}`;
            if (!grouped[key]) {
                grouped[key] = { level, semester, courses: [], extra: [] };
            }
            return grouped[key];
        };

        // Track which courses from study_plan we've already added
        const planCourseIds = new Set();

        // Add all courses from the official Study Plan
        planRows.forEach(row => {
            if (!row.course) return;
            planCourseIds.add(row.course_id);
            
            const g = getGroup(row.level || 1, row.semester);
            const sc = studentCourseMap[row.course_id];
            
            g.courses.push({
                id: row.course_id,
                code: row.course.code,
                name: row.course.name,
                credits: row.course.credits,
                status: sc ? sc.status : 'upcoming',
                grade: sc ? sc.grade : null,
                is_in_plan: true
            });
        });

        // Add extra courses the student took that are NOT in the official plan
        Object.keys(studentCourseMap).forEach(cid => {
            const id = parseInt(cid);
            if (!planCourseIds.has(id)) {
                const sc = studentCourseMap[cid];
                // Try to find which semester this "extra" course belongs to
                // If it has a semester string like "Fall", we can try to guess level 1
                let level = 1;
                let semName = sc.semester || 'Fall';
                
                // If the semester is "Semester 3", we can guess Level 2 Fall
                if (semName.startsWith('Semester ')) {
                    const semNum = parseInt(semName.replace('Semester ', ''));
                    level = Math.ceil(semNum / 2);
                    semName = (semNum % 2 === 0) ? 'Spring' : 'Fall';
                }

                const g = getGroup(level, semName);
                g.courses.push({
                    id: id,
                    code: sc.course?.code || 'N/A',
                    name: sc.course?.name || 'Extra Course',
                    credits: sc.course?.credits || 0,
                    status: sc.status,
                    grade: sc.grade,
                    is_in_plan: false
                });
            }
        });

        // Sort semesters
        const sortedKeys = Object.keys(grouped).sort((a, b) => {
            const [aL, aS] = a.split('_');
            const [bL, bS] = b.split('_');
            if (parseInt(aL) !== parseInt(bL)) return parseInt(aL) - parseInt(bL);
            const order = { 'Fall': 1, 'Spring': 2, 'Summer': 3 };
            return (order[aS] || 99) - (order[bS] || 99);
        });

        let totalCH = 0;
        container.innerHTML = sortedKeys.map(key => {
            const g = grouped[key];
            const semCH = g.courses.reduce((a, c) => a + (c.credits || 0), 0);
            totalCH += semCH;

            let semLabel = `Semester ${(g.level - 1) * 2 + (g.semester === 'Spring' ? 2 : 1)}`;
            if (g.semester === 'Summer') semLabel = `Summer ${g.level}`;

            return `
            <div class="semester-group" style="margin-bottom:30px; background:rgba(255,255,255,0.02); border-radius:15px; border:1px solid var(--border); overflow:hidden;">
                <div class="semester-header" style="background:rgba(255,255,255,0.03); padding:12px 20px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border);">
                    <div style="font-weight:700; color:var(--primary); font-size:1rem;">
                        <i class="fas fa-layer-group"></i> ${semLabel} <span style="font-weight:400; font-size:0.8rem; color:var(--muted); margin-left:10px;">(${g.semester})</span>
                    </div>
                    <div style="font-size:0.85rem; color:var(--muted);">
                        ${g.courses.length} Courses | Total CH: ${semCH.toFixed(2)}
                    </div>
                </div>
                <div class="semester-table-wrapper" style="overflow-x:auto;">
                    <table style="width:100%; border-collapse:collapse; font-size:0.85rem; min-width:650px;">
                        <thead>
                            <tr style="background:rgba(0,0,0,0.2); color:var(--primary); text-align:left;">
                                <th style="padding:12px 20px;">Course Code</th>
                                <th style="padding:12px 20px;">Course Title (EN)</th>
                                <th style="padding:12px 20px; text-align:center;">Credit Hours</th>
                                <th style="padding:12px 20px; text-align:center;">Status</th>
                                <th style="padding:12px 20px; text-align:center;">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${g.courses.map(c => {
                                const isDone = c.status === 'completed';
                                const isInProgress = c.status === 'in_progress' || c.status === 'enrolled';
                                const isPlanned = c.status === 'planned';
                                
                                const statusColor = isDone ? '#10b981' : isInProgress ? '#f59e0b' : isPlanned ? '#3b82f6' : '#94a3b8';
                                const statusLabel = isDone ? 'Completed' : isInProgress ? 'In Progress' : isPlanned ? 'Planned' : 'Upcoming';
                                
                                return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                    <td style="padding:12px 20px; color:var(--primary); font-weight:600;">
                                        ${c.code || 'N/A'}
                                        ${!c.is_in_plan ? '<span title="Elective/Extra" style="font-size:0.6rem; color:#f59e0b; margin-left:5px;">[+]</span>' : ''}
                                    </td>
                                    <td style="padding:12px 20px; color:#cbd5e1;">${c.name || '---'}</td>
                                    <td style="padding:12px 20px; text-align:center; color:#94a3b8;">${(c.credits || 0).toFixed(2)}</td>
                                    <td style="padding:12px 20px; text-align:center;">
                                        <span style="color:${statusColor}; background:${statusColor}15; padding:3px 10px; border-radius:12px; font-size:0.75rem; font-weight:600;">
                                            ${statusLabel}
                                        </span>
                                    </td>
                                    <td style="padding:12px 20px; text-align:center; color:${isDone ? '#10b981' : 'var(--muted)'}; font-weight:${isDone ? '700' : '400'}; font-size:0.95rem;">
                                        ${c.grade || (isDone ? 'N/A' : '--')}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        }).join('');

        const totalEl = document.getElementById('academic-total-ch');
        if (totalEl) totalEl.textContent = totalCH.toFixed(2);

    } catch (e) {
        console.error('Academic plan error:', e);
        container.innerHTML = `<div style="text-align:center;padding:2rem;color:#ef4444;">Failed to load academic plan: ${e.message}</div>`;
    }
}

async function loadMySummerRequests() {
    const container = document.getElementById('summer-requests-list');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--muted);">Loading...</div>';

    try {
        const requests = await apiFetch('/planning/requests/me');

        if (!requests || !requests.length) {
            container.innerHTML = `
                <div style="text-align:center;padding:3rem;color:var(--muted);">
                    <div style="font-size:2.5rem;margin-bottom:1rem;">☀️</div>
                    <div style="font-weight:600;margin-bottom:0.5rem;">No requests yet</div>
                    <div style="font-size:0.875rem;">Click "New Request" to request a summer course</div>
                </div>`;
            return;
        }

        container.innerHTML = requests.map(r => {
            const statusColor = r.status === 'approved' ? '#10b981' : r.status === 'rejected' ? '#ef4444' : '#f59e0b';
            const statusIcon = r.status === 'approved' ? '✅' : r.status === 'rejected' ? '❌' : '⏳';
            const courseName = r.course ? `${r.course.code} – ${r.course.name}` : `Course #${r.course_id}`;
            const date = r.requested_at ? new Date(r.requested_at).toLocaleDateString() : 'N/A';

            return `
            <div class="request-card" style="
                background:var(--card);border:1px solid var(--border);border-radius:12px;
                padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;font-size:0.95rem;margin-bottom:4px;">${courseName}</div>
                    <div style="font-size:0.8rem;color:var(--muted);display:flex;gap:12px;flex-wrap:wrap;">
                        <span>📅 ${r.semester || 'Summer'}</span>
                        <span>🕐 Requested: ${date}</span>
                        ${r.reason ? `<span>📝 ${r.reason.substring(0, 50)}${r.reason.length > 50 ? '...' : ''}</span>` : ''}
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
                    <div style="
                        background:${statusColor}20;color:${statusColor};
                        padding:4px 12px;border-radius:999px;font-size:0.8rem;font-weight:600;
                        border:1px solid ${statusColor}40;white-space:nowrap;">
                        ${statusIcon} ${r.status.toUpperCase()}
                    </div>
                    ${r.status === 'pending' ? `
                        <button onclick="cancelSummerRequest(${r.id})" 
                            style="background:none;border:1px solid #ef4444;color:#ef4444;
                            padding:3px 10px;border-radius:6px;font-size:0.75rem;cursor:pointer;">
                            Cancel
                        </button>` : ''}
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        console.error('Load requests error:', e);
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#ef4444;">Failed to load requests. Make sure you are logged in.</div>';
    }
}

async function showSummerRequestModal() {
    const modal = document.getElementById('summer-request-modal');
    if (modal) modal.classList.add('active');
    await loadCoursesForRequestDropdown();
}

function closeSummerRequestModal() {
    const modal = document.getElementById('summer-request-modal');
    if (modal) modal.classList.remove('active');
}

async function loadCoursesForRequestDropdown() {
    const select = document.getElementById('summer-request-course-id');
    if (!select) return;
    select.innerHTML = '<option value="">Loading courses...</option>';

    try {
        // Try recommended first, fallback to all courses
        let courses = [];
        try {
            courses = await apiFetch('/planning/summer-courses/me');
        } catch {}

        if (!courses || !courses.length) {
            courses = await apiFetch('/planning/courses');
        }

        if (courses && courses.length) {
            select.innerHTML = '<option value="">Select a course...</option>' +
                courses.map(c => {
                    const prereqNote = c.prerequisite_met === false ? ` (Needs: ${c.prerequisite?.code || 'prereq'})` : '';
                    const disabled = c.prerequisite_met === false ? 'disabled' : '';
                    const name = c.code ? `${c.code} – ${c.name}${prereqNote}` : `${c.name}${prereqNote}`;
                    return `<option value="${c.id}" ${disabled}>${name}</option>`;
                }).join('');
        } else {
            select.innerHTML = '<option value="">No courses available</option>';
        }
    } catch (e) {
        console.error('Course dropdown error:', e);
        select.innerHTML = '<option value="">Error loading courses</option>';
    }
}

async function submitSummerRequest() {
    const courseId = document.getElementById('summer-request-course-id')?.value;
    const semester = document.getElementById('summer-request-semester')?.value || 'Summer 2026';
    const reason = document.getElementById('summer-request-reason')?.value || '';

    if (!courseId) {
        showNotification('Please select a course', 'error');
        return;
    }

    const btn = document.querySelector('#summer-request-modal .btn[onclick="submitSummerRequest()"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

    try {
        await apiFetch('/planning/summer-courses/request', {
            method: 'POST',
            body: JSON.stringify({ course_id: parseInt(courseId), semester, reason })
        });
        showNotification('Request submitted! Admin will review it.', 'success');
        closeSummerRequestModal();
        loadMySummerRequests();
    } catch (e) {
        console.error('Submit request error:', e);
        showNotification('Failed to submit request. Make sure you are logged in.', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Submit Request'; }
    }
}

async function cancelSummerRequest(requestId) {
    if (!confirm('Cancel this summer course request?')) return;
    try {
        await apiFetch(`/planning/requests/${requestId}`, { method: 'DELETE' });
        showNotification('Request cancelled', 'info');
        loadMySummerRequests();
    } catch (e) {
        showNotification('Failed to cancel request', 'error');
    }
}

async function requestSummerCourse(courseId, courseName) {
    // Pre-fill modal with this course
    const modal = document.getElementById('summer-request-modal');
    if (modal) modal.classList.add('active');
    await loadCoursesForRequestDropdown();
    const select = document.getElementById('summer-request-course-id');
    if (select) select.value = courseId;
}

function viewAllSummerCourses() {
    switchPlanningView('summer');
}

// ============================================
// ADVISOR CHAT - Real human-to-admin messaging
// ============================================

async function loadAdvisorChat() {
    const container = document.getElementById('advisor-chat-messages');
    if (!container) return;

    try {
        const messages = await apiFetch('/planning/advisor-messages');

        if (!messages || !messages.length) {
            container.innerHTML = `
                <div class="advisor-message ai" style="display:flex;gap:10px;margin-bottom:12px;">
                    <div class="advisor-avatar ai-avatar">🎓</div>
                    <div class="advisor-bubble">Hello! I'm your Academic Advisor. How can I help you with your studies today? You can ask me about courses, prerequisites, summer programs, or graduation requirements.</div>
                </div>`;
            return;
        }

        container.innerHTML = messages.map(m => {
            const isStudent = m.sender_role === 'student';
            const time = m.created_at ? new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
            return `
            <div class="chat-msg-row ${isStudent ? 'student' : 'advisor'}">
                <div class="chat-avatar">${isStudent ? '👤' : '🎓'}</div>
                <div class="chat-bubble-container">
                    <div class="chat-bubble">${m.content}</div>
                    ${time ? `<div class="chat-time">${time}</div>` : ''}
                </div>
            </div>`;
        }).join('');
        container.scrollTop = container.scrollHeight;
    } catch (e) {
        console.error('Load advisor chat error:', e);
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#ef4444;">Failed to load messages. Make sure you are logged in.</div>';
    }
}

async function sendAdvisorMessage() {
    const input = document.getElementById('advisor-chat-input');
    if (!input) return;
    const content = input.value.trim();
    if (!content) return;

    input.value = '';

    // Optimistically render
    const container = document.getElementById('advisor-chat-messages');
    if (container) {
        const div = document.createElement('div');
        div.className = 'chat-msg-row student';
        div.innerHTML = `
            <div class="chat-avatar">👤</div>
            <div class="chat-bubble-container">
                <div class="chat-bubble">${content}</div>
            </div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    try {
        await apiFetch('/planning/advisor-messages', {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        // Reload to get proper server-side data
        setTimeout(() => loadAdvisorChat(), 500);
    } catch (e) {
        console.error('Send advisor message error:', e);
        showNotification('Failed to send message. Make sure you are logged in.', 'error');
    }
}

function sendAdvisorQuickMessage(text) {
    const input = document.getElementById('advisor-chat-input');
    if (input) { input.value = text; sendAdvisorMessage(); }
}

function loadAdvisorSuggestions() {
    // No-op - suggestions are now static chips in HTML
}


// Load resume data from localStorage
if (localStorage.getItem('edumate_resume')) {
    resumeData = JSON.parse(localStorage.getItem('edumate_resume'));
}

// Internships Data
const InternshipsData = [
    { 
        title: 'Software Engineer', 
        company: 'Iskraemco', 
        match: 92, 
        reason: 'Strong Python + SQL skills', 
        salary: '$65K - $85K',
        applyUrl: 'https://iskraemeco.com/' 
    },
    { 
        title: 'Frontend Developer', 
        company: 'Amazon', 
        match: 88, 
        reason: 'JavaScript experience', 
        salary: '$70K - $90K',
        applyUrl: 'https://www.amazon.Internships/en/Internships/123456/frontend-developer' 
    },
    { 
        title: 'Data Analyst', 
        company: 'e&', 
        match: 85, 
        reason: 'Analytical skills', 
        salary: '$60K - $80K',
        applyUrl: 'https://www.eand.com.eg/StaticFiles/career/#/home' 
    }
];

// Courses Data
const coursesData = {
    tech: [
        {
            id: 1,
            title: "Full Stack Web Development",
            provider: "Coursera",
            category: "tech",
            difficulty: "beginner",
            duration: "12 weeks",
            progress: 75,
            enrolled: true,
            description: "Learn HTML, CSS, JavaScript, React, Node.js and MongoDB",
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            link: "https://www.coursera.org/specializations/full-stack-react"
        },
        {
            id: 2,
            title: "Python for Data Science",
            provider: "edX",
            category: "tech",
            difficulty: "intermediate",
            duration: "8 weeks",
            progress: 40,
            enrolled: true,
            description: "Master Python, NumPy, Pandas, and data visualization",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            link: "https://www.edx.org/course/python-for-data-science"
        },
        {
            id: 3,
            title: "Machine Learning Fundamentals",
            provider: "Udacity",
            category: "tech",
            difficulty: "advanced",
            duration: "16 weeks",
            progress: 20,
            enrolled: true,
            description: "Learn algorithms, neural networks, and AI principles",
            image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            link: "https://www.udacity.com/course/intro-to-machine-learning--ud120"
        }
    ],
    business: [
        {
            id: 4,
            title: "Digital Marketing Strategy",
            provider: "Google",
            category: "business",
            difficulty: "beginner",
            duration: "6 weeks",
            progress: 0,
            enrolled: false,
            description: "Learn SEO, social media, and content marketing",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            link: "https://learndigital.withgoogle.com/digitalgarage"
        }
    ],
    "soft-skills": [
        {
            id: 5,
            title: "Effective Communication",
            provider: "LinkedIn Learning",
            category: "soft-skills",
            difficulty: "beginner",
            duration: "4 weeks",
            progress: 0,
            enrolled: false,
            description: "Improve your professional communication skills",
            image: "https://images.unsplash.com/photo-1551836026-d5c2c0b4d1c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            link: "https://www.linkedin.com/learning"
        }
    ],
    career: [
        {
            id: 6,
            title: "Job Interview Mastery",
            provider: "Udemy",
            category: "career",
            difficulty: "intermediate",
            duration: "5 weeks",
            progress: 0,
            enrolled: false,
            description: "Ace your interviews with confidence",
            image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
            link: "https://www.udemy.com/course/job-interview-mastery"
        }
    ]
};

// ===============================
// COURSES FUNCTIONS WITH PAGINATION
// ===============================

const COURSES_API_KEY = 'AIzaSyBkyGUHoOohj6VSZYbRLUa4mysfRgV5FTY';
const COURSES_CX = 'c77318ddf11b04d7d';

let currentSearchResults = [];
let currentPage = 1;
let itemsPerPage = 9;
let currentSearchQuery = '';

async function searchCourses(query = null, page = 1) {
    if (!query) {
        query = document.getElementById('course-search-input')?.value.trim();
    }
    
    const container = document.getElementById('courses-container');
    const searchInfo = document.getElementById('search-info');
    const paginationControls = document.getElementById('pagination-controls');
    
    if (!container) return;
    
    if (!query) {
        container.innerHTML = `
            <div class="card" style="grid-column: 1/-1; text-align:center; color:var(--muted); padding:40px">
                <p>Please enter a search term to find courses</p>
            </div>
        `;
        if (searchInfo) searchInfo.style.display = 'none';
        if (paginationControls) paginationControls.style.display = 'none';
        return;
    }
    
    currentSearchQuery = query;
    currentPage = page;
    
    container.innerHTML = `
        <div class="card" style="grid-column: 1/-1; text-align:center; padding:40px">
            <div class="loading-spinner" style="margin:0 auto 20px;"></div>
            <p>Searching for "${query}" courses...</p>
        </div>
    `;
    
    const searchQuery = `${query} course OR tutorial OR "online learning" OR certification -site:pinterest.* -site:amazon.*`;
    
    try {
        const startIndex = (page - 1) * itemsPerPage + 1;
        const result = await searchGoogleCourses(searchQuery, startIndex);
        
        if (container) {
            if (result.items.length === 0) {
                container.innerHTML = `
                    <div class="card" style="grid-column: 1/-1; background:var(--light-warning); border:1px solid var(--warning); padding:30px; text-align:center">
                        <h3 style="color:var(--dark-warning); margin-top:0">No Courses Found</h3>
                        <p style="color:var(--muted); margin-bottom:20px">
                            No courses found for "${query}". Try different keywords or browse categories above.
                        </p>
                        <button onclick="quickSearch('programming')" class="link-btn">
                            Try Programming Courses
                        </button>
                    </div>
                `;
                if (searchInfo) searchInfo.style.display = 'none';
                if (paginationControls) paginationControls.style.display = 'none';
            } else {
                currentSearchResults = result.items;
                
                container.innerHTML = result.items.map((item, index) => {
                    const cleanTitle = item.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
                    const cleanSnippet = item.snippet.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
                    const platform = extractPlatform(item.link, cleanTitle);
                    
                    let imageUrl = 'https://via.placeholder.com/300x180/8B5CF6/FFFFFF?text=Course';
                    if (item.pagemap && item.pagemap.cse_thumbnail && item.pagemap.cse_thumbnail.length > 0) {
                        imageUrl = item.pagemap.cse_thumbnail[0].src;
                    } else if (item.pagemap && item.pagemap.cse_image && item.pagemap.cse_image.length > 0) {
                        imageUrl = item.pagemap.cse_image[0].src;
                    }
                    
                    return `
                    <div class="card course-card" style="display:flex; flex-direction:column; height:100%; margin:0; padding:0; overflow:hidden; border:1px solid var(--border); border-radius:12px;">
                        <div style="position:relative; height:160px; overflow:hidden; background:#f5f5f5;">
                            <img src="${imageUrl}" 
                                 alt="${cleanTitle}" 
                                 style="width:100%; height:100%; object-fit:cover;"
                                 onerror="this.src='https://via.placeholder.com/300x160/8B5CF6/FFFFFF?text=' + encodeURIComponent('${platform}')">
                            <span style="position:absolute; top:12px; right:12px; background:var(--primary); color:white; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:600;">
                                #${(page - 1) * itemsPerPage + index + 1}
                            </span>
                        </div>
                        
                        <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                <span class="course-category" style="display:inline-block;">${platform}</span>
                            </div>
                            
                            <h3 style="margin:0 0 10px; font-size:1.1rem; line-height:1.4; font-weight:600;">${cleanTitle}</h3>
                            
                            <p style="color:var(--muted); line-height:1.5; margin-bottom:20px; font-size:0.9rem; flex:1;">
                                ${cleanSnippet.length > 120 ? cleanSnippet.substring(0, 120) + '...' : cleanSnippet}
                            </p>
                            
                            <div style="display:flex; gap:10px; align-items:center; margin-top:auto;">
                                <button onclick="saveCustomCourse('${encodeURIComponent(JSON.stringify(item))}')" 
                                        class="link-btn" 
                                        style="flex:1; padding:10px; font-size:0.9rem;">
                                    📌 Save
                                </button>
                                <a href="${item.link}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   class="btn" 
                                   style="flex:1; text-align:center; text-decoration:none; padding:10px; font-size:0.9rem;">
                                    View →
                                </a>
                            </div>
                        </div>
                    </div>
                `}).join('');
                
                if (result.searchInformation?.totalResults) {
                    const totalResults = parseInt(result.searchInformation.totalResults);
                    const totalPages = Math.ceil(totalResults / itemsPerPage);
                    setupPagination(totalPages, page, query);
                } else {
                    const hasMore = result.items.length === itemsPerPage;
                    setupSimplePagination(hasMore, page, query);
                }
            }
        }
        
        return result.items;
        
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        
        if (container) {
            container.innerHTML = `
                <div class="card" style="grid-column: 1/-1; background:var(--light-error); border:1px solid var(--error); padding:30px; text-align:center">
                    <h3 style="color:var(--dark-error); margin-top:0">Error Loading Courses</h3>
                    <p style="color:var(--muted); margin-bottom:20px">
                        ${error.message.includes('quota') ? 
                            'Search quota exceeded. Please try again later.' : 
                            'Failed to load courses. Please check your internet connection.'}
                    </p>
                    <button onclick="searchCourses('${query}')" 
                            class="btn" 
                            style="background:var(--error); color:white">
                        Retry Search
                    </button>
                </div>
            `;
        }
        
        if (searchInfo) searchInfo.style.display = 'none';
        if (paginationControls) paginationControls.style.display = 'none';
        
        return null;
    }
}

async function searchGoogleCourses(query, startIndex = 1) {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${COURSES_API_KEY}&cx=${COURSES_CX}&start=${startIndex}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || "Google API error");
        }
        
        return {
            items: data.items || [],
            searchInformation: data.searchInformation || {},
            queries: data.queries || {}
        };
        
    } catch (error) {
        console.error("Search error:", error.message);
        throw error;
    }
}

function setupPagination(totalPages, currentPage, query) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;
    
    paginationControls.style.display = 'flex';
    
    let paginationHTML = '';
    
    paginationHTML += `
        <button class="btn" 
                onclick="searchCourses('${query}', ${currentPage - 1})"
                ${currentPage === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            ← Previous
        </button>
    `;
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="${i === currentPage ? 'btn' : 'link-btn'}" 
                    onclick="searchCourses('${query}', ${i})"
                    style="min-width:40px;">
                ${i}
            </button>
        `;
    }
    
    paginationHTML += `
        <button class="btn" 
                onclick="searchCourses('${query}', ${currentPage + 1})"
                ${currentPage === totalPages ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            Next →
        </button>
    `;
    
    paginationControls.innerHTML = paginationHTML;
}

function setupSimplePagination(hasMore, currentPage, query) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;
    
    paginationControls.style.display = 'flex';
    
    let paginationHTML = '';
    
    paginationHTML += `
        <button class="btn" 
                onclick="searchCourses('${query}', ${currentPage - 1})"
                ${currentPage === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            ← Previous
        </button>
    `;
    
    paginationHTML += `
        <span style="padding:10px 20px; background:var(--card); border-radius:12px;">
            Page ${currentPage}
        </span>
    `;
    
    paginationHTML += `
        <button class="btn" 
                onclick="searchCourses('${query}', ${currentPage + 1})"
                ${!hasMore ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            Next →
        </button>
    `;
    
    paginationControls.innerHTML = paginationHTML;
}

function quickSearch(topic) {
    document.getElementById('course-search-input').value = topic;
    searchCourses(topic, 1);
}

function extractPlatform(url, title) {
    url = url.toLowerCase();
    
    if (url.includes('coursera.org')) return 'Coursera';
    if (url.includes('udemy.com')) return 'Udemy';
    if (url.includes('edx.org')) return 'edX';
    if (url.includes('udacity.com')) return 'Udacity';
    if (url.includes('khanacademy.org')) return 'Khan Academy';
    if (url.includes('linkedin.com/learning')) return 'LinkedIn Learning';
    if (url.includes('pluralsight.com')) return 'Pluralsight';
    if (url.includes('skillshare.com')) return 'Skillshare';
    if (url.includes('codecademy.com')) return 'Codecademy';
    if (url.includes('freecodecamp.org')) return 'freeCodeCamp';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('mit.edu')) return 'MIT OpenCourseWare';
    if (url.includes('stanford.edu')) return 'Stanford Online';
    if (url.includes('harvard.edu')) return 'Harvard Online';
    
    if (title.includes('Coursera')) return 'Coursera';
    if (title.includes('Udemy')) return 'Udemy';
    if (title.includes('edX')) return 'edX';
    
    return 'Online Course';
}

function saveCustomCourse(itemData) {
    if (window.saveCustomCourse && window.saveCustomCourse !== saveCustomCourse) {
        return window.saveCustomCourse.apply(this, arguments);
    }
    console.warn('saveCustomCourse is handled by backend_api.js');
}

function getImageFromItem(item) {
    if (item.pagemap && item.pagemap.cse_thumbnail && item.pagemap.cse_thumbnail.length > 0) {
        return item.pagemap.cse_thumbnail[0].src;
    } else if (item.pagemap && item.pagemap.cse_image && item.pagemap.cse_image.length > 0) {
        return item.pagemap.cse_image[0].src;
    }
    return `https://via.placeholder.com/300x180/8B5CF6/FFFFFF?text=Course`;
}

// Initialize Application
function initializeApp() {
    const storedTheme = localStorage.getItem('edumate_theme');
    if (storedTheme === 'dark') document.body.classList.add('dark-theme');
    updateThemeIcon();
    
    initCoursesPage();
    updateSidebarFromStorage();
    applyStoredProfileToUI();
    setupEventListeners();

    // Fetch real stats from DB
    updatePlanningHeaderStats();
    
    const logged = sessionStorage.getItem('edumate_logged') === '1';
    const seenWelcome = localStorage.getItem('edumate_seen_welcome') === '1';
    
    if (!logged && !seenWelcome) {
        navigateTo('welcome');
        localStorage.setItem('edumate_seen_welcome', '1');
    } else if (logged) {
        navigateTo('dashboard');
    } else {
        navigateTo('login');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    document.getElementById('ai-chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAIChatMessage();
    });
    
    document.getElementById('ai-popup-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAIPopupMessage();
    });
    
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('aiPopup');
        const bubble = document.getElementById('aiBubble');
        if (popup?.classList.contains('active') && !popup.contains(e.target) && !bubble.contains(e.target)) {
            popup.classList.remove('active');
        }
    });
}

function viewSavedCourses() {
    if (window.viewSavedCourses && window.viewSavedCourses !== viewSavedCourses) {
        return window.viewSavedCourses.apply(this, arguments);
    }
    console.warn('viewSavedCourses is handled by backend_api.js');
}

function removeCustomCourse(courseId) {
    if (window.removeCustomCourse && window.removeCustomCourse !== removeCustomCourse) {
        return window.removeCustomCourse.apply(this, arguments);
    }
    console.warn('removeCustomCourse is handled by backend_api.js');
}

// Theme Functions
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('edumate_theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
}

// Sidebar Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    if (!sidebar || !mainContent) return;
    
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    
    if (isMobile) {
        sidebar.classList.toggle('active');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('shifted');
    }
}

// Authentication Functions
function attemptLogin() {
    if (window.attemptLogin && window.attemptLogin !== attemptLogin) {
        return window.attemptLogin.apply(this, arguments);
    }
    console.warn('attemptLogin is handled by backend_api.js');
}

function firebaseLogin(providerType) {
    let provider;
    if (providerType === 'google') {
        provider = new firebase.auth.GoogleAuthProvider();
    } else if (providerType === 'github') {
        provider = new firebase.auth.GithubAuthProvider();
    } else if (providerType === 'microsoft') {
        provider = new firebase.auth.OAuthProvider('microsoft.com');
    }
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            integrateSocialUser({
                email: user.email || `${user.providerData[0].uid}@${providerType}.com`,
                name: user.displayName || `${providerType} User`,
                picture: user.photoURL,
                method: providerType
            });
        }).catch((error) => {
            console.error(error);
            alert("Login Failed: " + error.message);
        });
}

function integrateSocialUser(socialUser) {
    const email = socialUser.email;
    const name = socialUser.name;
    const picture = socialUser.picture;
    
    let foundUsername = null;
    for (const k of Object.keys(users)) {
        if (users[k].email && users[k].email.toLowerCase() === email.toLowerCase()) {
            foundUsername = users[k].username;
            break;
        }
    }
    
    if (foundUsername) {
        loginUser(foundUsername, true);
    } else {
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        let newUsername = baseUsername;
        let counter = 1;
        while (users[newUsername]) {
            newUsername = baseUsername + counter;
            counter++;
        }
        
        const newUser = {
            username: newUsername,
            name: name,
            email: email,
            password: `auth-${socialUser.method}-user`, 
            profilePic: picture,
            education: '', major: '', gradYear: '', skills: '' 
        };
        
        users[newUsername] = newUser;
        localStorage.setItem('edumate_users', JSON.stringify(users));
        loginUser(newUsername, true);
        alert(`Account created via ${socialUser.method}!`);
    }
}

function loginUser(username, remember = false) {
    if (window.loginUser && window.loginUser !== loginUser) {
        return window.loginUser.apply(this, arguments);
    }
    console.warn('loginUser is handled by backend_api.js');
}

function signOut() {
    if (window.signOut && window.signOut !== signOut) {
        return window.signOut.apply(this, arguments);
    }
    console.warn('signOut is handled by backend_api.js');
}

// Registration Functions
function startRegistration() {
    const email = document.getElementById('reg-email')?.value.trim() || '';
    const parsed = String(email).trim().toLowerCase().match(/^([a-z]+)(\d{3,})@sut\.edu\.eg$/i);
    const name = document.getElementById('reg-name')?.value.trim() || (parsed ? `${parsed[1].charAt(0).toUpperCase()}${parsed[1].slice(1).toLowerCase()}` : '');
    const username = document.getElementById('reg-username')?.value.trim() || (parsed ? parsed[2] : '');
    const password = document.getElementById('reg-password')?.value || '';
    const confirm = document.getElementById('reg-password-confirm')?.value || '';
    
    if (!name || !username || !email || !password || !confirm) { 
        alert('Please fill all fields.'); 
        return; 
    }
    if (password !== confirm) { 
        alert('Passwords do not match.'); 
        return; 
    }
    if (users[username]) { 
        alert('ID already exists.');
        return; 
    }
    
    const temp = { 
        username, name, email, password, 
        profilePic: 'https://via.placeholder.com/110/6C5CE7/FFFFFF?text=U', 
        major: '', gradYear: '', skills: ''
    };
    sessionStorage.setItem('edumate_temp_registration', JSON.stringify(temp));
    fillInfoPageFromTemp();
    navigateTo('info');
}

function fillInfoPageFromTemp() {
    const temp = JSON.parse(sessionStorage.getItem('edumate_temp_registration') || '{}');
    if (!temp) return;
    document.getElementById('info-fullname').value = temp.name || '';
    document.getElementById('info-username').value = temp.username || '';
    document.getElementById('info-email').value = temp.email || '';
    if (document.getElementById('info-email')) {
        document.getElementById('info-email').dispatchEvent(new Event('input'));
    }
}

function previewInfoAvatar(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => { 
            document.getElementById('info-avatar-preview').src = e.target.result; 
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function completeRegistration() {
    if (window.completeRegistration && window.completeRegistration !== completeRegistration) {
        return window.completeRegistration.apply(this, arguments);
    }
    console.warn('completeRegistration is handled by backend_api.js');
}

// Profile Functions
function updateSidebarFromStorage() {
    if (window.updateSidebarFromStorage && window.updateSidebarFromStorage !== updateSidebarFromStorage) {
        return window.updateSidebarFromStorage.apply(this, arguments);
    }
    console.warn('updateSidebarFromStorage is handled by backend_api.js');
}

function applyStoredProfileToUI() {
    if (window.applyStoredProfileToUI && window.applyStoredProfileToUI !== applyStoredProfileToUI) {
        return window.applyStoredProfileToUI.apply(this, arguments);
    }
    console.warn('applyStoredProfileToUI is handled by backend_api.js');
}

function changeProfileAvatar(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const avatarUrl = e.target.result;
        const profileAvatar = document.getElementById('profile-avatar-large');
        const sidebarAvatar = document.getElementById('profile-pic');
        if (typeof window.applyAvatarSource === 'function') {
            window.applyAvatarSource(profileAvatar, avatarUrl);
            window.applyAvatarSource(sidebarAvatar, avatarUrl);
            return;
        }
        if (profileAvatar) profileAvatar.src = avatarUrl;
        if (sidebarAvatar) sidebarAvatar.src = avatarUrl;
    };
    reader.readAsDataURL(input.files[0]);
}

function saveProfileEdits() {
    if (window.saveProfileEdits && window.saveProfileEdits !== saveProfileEdits) {
        return window.saveProfileEdits.apply(this, arguments);
    }
    console.warn('saveProfileEdits is handled by backend_api.js');
}

// AI Chat Functions
function toggleAIPopup() {
    const popup = document.getElementById('aiPopup');
    popup.classList.toggle('active');
}

function sendAIChatMessage() {
    if (window.sendAIChatMessage && window.sendAIChatMessage !== sendAIChatMessage) {
        return window.sendAIChatMessage.apply(this, arguments);
    }
    console.warn('sendAIChatMessage is handled by backend_api.js');
}

function sendAIPopupMessage() {
    if (window.sendAIPopupMessage && window.sendAIPopupMessage !== sendAIPopupMessage) {
        return window.sendAIPopupMessage.apply(this, arguments);
    }
    console.warn('sendAIPopupMessage is handled by backend_api.js');
}

function generateAIResponse(input) {
    const lower = input.toLowerCase();
    if (lower.includes('faculty') || lower.includes('university')) {
        return 'Based on your profile, I recommend applying to Computer Science programs at top universities. Focus on your Python and SQL skills in applications!';
    }
    if (lower.includes('resume') || lower.includes('ats')) {
        return 'Your resume looks good! Add these keywords: "Agile", "React", "Cloud Computing" to improve ATS scores by 15%.';
    }
    if (lower.includes('job') || lower.includes('interview')) {
        return 'For software engineering roles, practice LeetCode medium problems and prepare STAR method answers for behavioral questions.';
    }
    if (lower.includes('hello') || lower.includes('hi')) {
        return 'Hello! How can I help you with your career today?';
    }
    return `Great question about "${input}"! I recommend focusing on building real projects and networking on LinkedIn. Need specific advice?`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Google Custom Search API Configuration for Internships
const API_KEY_job = "AIzaSyDzgj4pFPecvaeqxJNMLxWu1iKJrO79sgs";
const CX_job = "952a53415707d42ae";

async function searchGoogleInternships(query, startIndex = 1) {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${API_KEY_job}&cx=${CX_job}&start=${startIndex}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || "Google API error");
        }
        
        return {
            items: data.items || [],
            searchInformation: data.searchInformation || {},
            queries: data.queries || {}
        };
        
    } catch (error) {
        console.error("Search error:", error.message);
        throw error;
    }
}

async function loadInternshipsByPosition(position = null) {
    const positionSelect = document.getElementById("jobPositionSelect");
    
    if (!position) {
        position = positionSelect ? positionSelect.value : null;
    }
    
    const container = document.getElementById("InternshipsContainer");
    
    if (!position) {
        console.log("No position selected");
        if (container) {
            container.innerHTML = `
                <div class="card" style="text-align:center;color:var(--muted);padding:40px">
                    <p>Please select a position to see relevant job opportunities</p>
                </div>
            `;
        }
        return null;
    }

    console.log(`Selected position: ${position}`);
    
    if (container) {
        container.innerHTML = `
            <div class="card" style="text-align:center;padding:40px">
                <div style="
                    border: 3px solid var(--muted);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p>Searching for ${getPositionName(position)} Internships...</p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
    }

    const queries = {
        software: "software developer Internships Egypt entry level remote",
        marketing: "marketing specialist Internships Egypt digital marketing",
        finance: "finance analyst Internships Egypt accounting banking",
        hr: "human resources Internships Egypt recruitment HR specialist",
        sales: "sales Internships Egypt business development account executive",
        design: "graphic designer Internships Egypt UI UX designer",
        data: "data analyst Internships Egypt business intelligence",
        project: "project manager Internships Egypt IT construction"
    };

    const enhancedQueries = {
        software: "(software developer OR software engineer OR frontend OR backend) Internships Egypt (junior OR entry level OR fresh graduate) 2024",
        marketing: "(marketing specialist OR digital marketing OR social media) Internships Egypt",
        finance: "(financial analyst OR accountant OR banking) Internships Egypt (entry level OR junior)",
        hr: "(human resources OR HR OR recruitment) Internships Egypt",
        sales: "(sales executive OR business development OR account manager) Internships Egypt",
        design: "(graphic designer OR UI designer OR UX designer) Internships Egypt",
        data: "(data analyst OR business intelligence OR data scientist) Internships Egypt",
        project: "(project manager OR project coordinator) Internships Egypt (IT OR construction)"
    };

    const searchQuery = enhancedQueries[position] || queries[position] || `${position} Internships Egypt`;
    console.log(`Searching for: ${searchQuery}`);

    try {
        const result = await searchGoogleInternships(searchQuery);
        
        console.log(`Found ${result.items.length} results for ${position}:`);
        
        result.items.forEach((item, index) => {
            console.log(`\n--- Result ${index + 1} ---`);
            console.log(`Title: ${item.title}`);
            console.log(`Description: ${item.snippet}`);
            console.log(`Link: ${item.link}`);
        });

        if (container) {
            if (result.items.length === 0) {
                container.innerHTML = `
                    <div class="card" style="background:var(--light-warning);border:1px solid var(--warning);padding:30px;text-align:center">
                        <h3 style="color:var(--dark-warning);margin-top:0">No Internships Found</h3>
                        <p style="color:var(--muted);margin-bottom:20px">
                            No Internships found for ${getPositionName(position)}. 
                            Try a different position or check back later.
                        </p>
                        <button onclick="retryInternshipsearch('${position}')" class="btn" style="background:var(--warning);color:white">
                            Try Again
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = result.items.map((item, index) => {
                    const cleanTitle = item.title.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
                    const cleanSnippet = item.snippet.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
                    const domain = extractDomain(item.link);
                    
                    return `
                    <div class="card event-card" style="margin-bottom:20px;padding:20px;border:1px solid var(--border);border-radius:8px">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:15px">
                            <h3 style="margin:0;font-size:1.1em;color:var(--dark);flex:1">${cleanTitle}</h3>
                            <span style="background:var(--primary);color:white;padding:2px 10px;border-radius:12px;font-size:0.8em;margin-left:10px">
                                #${index + 1}
                            </span>
                        </div>
                        
                        <p style="color:var(--muted);line-height:1.6;margin-bottom:15px;font-size:0.95em">
                            ${cleanSnippet}
                        </p>
                        
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:15px;padding-top:15px;border-top:1px solid var(--border-light)">
                            <span style="font-size:0.85em;color:var(--muted); padding:10px">
                                ${domain}
                            </span>
                            <div style="display:flex;gap:10px">
                                <button onclick="saveJob('${encodeURIComponent(JSON.stringify(item))}', '${position}')" 
                                        style="background:var(--primary);color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:0.9em">
                                    Save Job
                                </button>
                                <a href="${item.link}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   style="background:var(--success);color:white;text-decoration:none;padding:8px 16px;border-radius:4px;font-size:0.9em">
                                    Apply Now
                                </a>
                            </div>
                        </div>
                    </div>
                `}).join("");
                
                const statsDiv = document.createElement('div');
                statsDiv.style.cssText = `
                    background: var(--light);
                    padding: 12px 20px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    font-size: 0.9em;
                    color: var(--muted);
                    border: 1px solid var(--border-light);
                `;
                statsDiv.innerHTML = `
                    <span>Found ${result.items.length} job opportunities in ${result.searchInformation?.formattedSearchTime || 'unknown'} seconds</span>
                    ${result.searchInformation?.totalResults ? 
                        `<span style="margin-left:15px">• Total available: ${result.searchInformation.totalResults}</span>` : ''}
                `;
                container.insertBefore(statsDiv, container.firstChild);
            }
        }

        return result.items;

    } catch (error) {
        console.error("Error fetching Internships:", error.message);
        
        if (container) {
            container.innerHTML = `
                <div class="card" style="background:var(--light-error);border:1px solid var(--error);padding:30px;text-align:center">
                    <h3 style="color:var(--dark-error);margin-top:0">Error Loading Internships</h3>
                    <p style="color:var(--muted);margin-bottom:20px">
                        ${error.message.includes('quota') ? 
                            'Search quota exceeded. Please try again later.' : 
                            'Failed to load job opportunities. Please check your internet connection.'}
                    </p>
                    <button onclick="loadInternshipsByPosition('${position}')" 
                            class="btn" 
                            style="background:var(--error);color:white">
                        Retry Search
                    </button>
                </div>
            `;
        }
        
        return null;
    }
}

function getPositionName(positionCode) {
    const positionNames = {
        software: "Software Developer",
        marketing: "Marketing Specialist",
        finance: "Finance Analyst",
        hr: "Human Resources",
        sales: "Sales",
        design: "Designer",
        data: "Data Analyst",
        project: "Project Manager"
    };
    return positionNames[positionCode] || positionCode;
}

function extractDomain(url) {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return domain.length > 30 ? domain.substring(0, 27) + '...' : domain;
    } catch {
        const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
        return match ? match[1].substring(0, 30) : url.substring(0, 30);
    }
}

function saveJob(itemData, position) {
    if (window.saveJob && window.saveJob !== saveJob) {
        return window.saveJob.apply(this, arguments);
    }
    console.warn('saveJob is handled by backend_api.js');
}

function retryInternshipsearch(position) {
    loadInternshipsByPosition(position);
}

function viewSavedInternships() {
    if (window.viewSavedInternships && window.viewSavedInternships !== viewSavedInternships) {
        return window.viewSavedInternships.apply(this, arguments);
    }
    console.warn('viewSavedInternships is handled by backend_api.js');
}

function updateInternshipstatus(index, status) {
    if (window.updateInternshipstatus && window.updateInternshipstatus !== updateInternshipstatus) {
        return window.updateInternshipstatus.apply(this, arguments);
    }
    console.warn('updateInternshipstatus is handled by backend_api.js');
}

function removeSavedJob(index) {
    if (window.removeSavedJob && window.removeSavedJob !== removeSavedJob) {
        return window.removeSavedJob.apply(this, arguments);
    }
    console.warn('removeSavedJob is handled by backend_api.js');
}

// ===============================
// RESUME FUNCTIONS
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('edumate_resume');
    if (saved) {
        try {
            resumeData = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading resume data:', e);
        }
    }
});

function showResumeForm() {
    const form = document.getElementById('resume-form');
    if (form) form.style.display = 'block';
    loadResumeDataIntoForm();
}

function loadResumeDataIntoForm() {
    if (!resumeData) return;
    
    document.getElementById('res-name').value = resumeData.name || '';
    document.getElementById('res-title').value = resumeData.title || '';
    document.getElementById('res-email').value = resumeData.email || '';
    document.getElementById('res-phone').value = resumeData.phone || '';
    document.getElementById('res-location').value = resumeData.location || '';
    document.getElementById('res-linkedin').value = resumeData.linkedin || '';
    document.getElementById('res-github').value = resumeData.github || '';
    document.getElementById('res-skills').value = resumeData.skills || '';
    document.getElementById('res-summary').value = resumeData.summary || '';
    
    const eduContainer = document.getElementById('education-container');
    const expContainer = document.getElementById('experience-container');
    const projContainer = document.getElementById('projects-container');
    
    if (eduContainer) eduContainer.innerHTML = '';
    if (expContainer) expContainer.innerHTML = '';
    if (projContainer) projContainer.innerHTML = '';
    
    if (resumeData.education && resumeData.education.length > 0) {
        resumeData.education.forEach(e => addEducation(e));
    } else {
        addEducation();
    }
    
    if (resumeData.experience && resumeData.experience.length > 0) {
        resumeData.experience.forEach(e => addExperience(e));
    } else {
        addExperience();
    }
    
    if (resumeData.projects && resumeData.projects.length > 0) {
        resumeData.projects.forEach(e => addProject(e));
    }
}

function addEducation(entry = {}) {
    const container = document.getElementById('education-container');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'education-entry';
    div.style = 'border:1px dashed #ccc;padding:12px;border-radius:8px;margin-bottom:10px';
    div.innerHTML = `
        <input placeholder="Degree" class="input" value="${entry.degree || ''}" style="margin-bottom:8px">
        <input placeholder="University" class="input" value="${entry.school || ''}" style="margin-bottom:8px">
        <input placeholder="Year (e.g. 2022 – 2026)" class="input" value="${entry.year || ''}">
        <button class="link-btn" style="color:#ef4444;margin-top:8px" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

function addExperience(entry = {}) {
    const container = document.getElementById('experience-container');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'experience-entry';
    div.style = 'border:1px dashed #ccc;padding:12px;border-radius:8px;margin-bottom:10px';
    div.innerHTML = `
        <input placeholder="Job Title" class="input" value="${entry.title || ''}" style="margin-bottom:8px">
        <input placeholder="Company" class="input" value="${entry.company || ''}" style="margin-bottom:8px">
        <input placeholder="Dates" class="input" value="${entry.dates || ''}" style="margin-bottom:8px">
        <textarea placeholder="Key achievements..." class="input" rows="3">${entry.desc || ''}</textarea>
        <button class="link-btn" style="color:#ef4444;margin-top:8px" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

function addProject(entry = {}) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    const div = document.createElement('div');
    div.style = 'border:1px dashed #ccc;padding:12px;border-radius:8px;margin-bottom:10px';
    div.innerHTML = `
        <input placeholder="Project Name" class="input" value="${entry.name || ''}" style="margin-bottom:8px">
        <input placeholder="Tech Stack" class="input" value="${entry.tech || ''}" style="margin-bottom:8px">
        <textarea placeholder="Description" class="input" rows="2">${entry.desc || ''}</textarea>
        <button class="link-btn" style="color:#ef4444;margin-top:8px" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

function saveResumeData() {
    if (window.saveResumeData && window.saveResumeData !== saveResumeData) {
        return window.saveResumeData.apply(this, arguments);
    }
    console.warn('saveResumeData is handled by backend_api.js');
}

function generateResumePreview() {
    if (window.generateResumePreview && window.generateResumePreview !== generateResumePreview) {
        return window.generateResumePreview.apply(this, arguments);
    }
    console.warn('generateResumePreview is handled by backend_api.js');
}

function generateModernTemplate() {
    return `
    <div style="max-width:800px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2d2d2d;line-height:1.5">
        <header style="text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:4px solid #6C5CE7">
            <h1 style="margin:0;font-size:2.8em;color:#6C5CE7">${resumeData.name || 'Your Name'}</h1>
            <p style="margin:10px 0;font-size:1.2em;color:#555">${resumeData.title || 'Professional Title'}</p>
            <p style="margin:5px 0;color:#666">
                ${resumeData.email || 'email@example.com'} • ${resumeData.phone || '+20 123 456 7890'} • ${resumeData.location || 'City, Country'}<br>
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a> • ` : ''}
                ${resumeData.github ? `<a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:#6C5CE7;text-decoration:none" target="_blank">GitHub</a>` : ''}
            </p>
        </header>
        
        ${resumeData.summary ? `<h2 style="color:#6C5CE7;border-bottom:2px solid #6C5CE7;padding-bottom:5px">Summary</h2>
        <p style="margin-top:20px;font-size:1.1em">${resumeData.summary}</p>` : ''}

        ${resumeData.education.length ? `<h2 style="color:#6C5CE7;border-bottom:2px solid #6C5CE7;padding-bottom:5px">Education</h2>` : ''}
        ${resumeData.education.map(e => `
            <div style="margin-bottom:20px">
                <strong style="font-size:1.1em">${e.degree}</strong><br>
                <em>${e.school} • ${e.year}</em>
            </div>
        `).join('')}

        ${resumeData.experience.length ? `<h2 style="color:#6C5CE7;border-bottom:2px solid #6C5CE7;padding-bottom:5px">Experience</h2>` : ''}
        ${resumeData.experience.map(exp => `
            <div style="margin-bottom:20px">
                <div style="display:flex;justify-content:space-between">
                    <strong style="font-size:1.1em">${exp.title}</strong>
                    <span style="color:#666">${exp.dates}</span>
                </div>
                <em>${exp.company}</em>
                <ul style="margin:8px 0;padding-left:20px">
                    <li>${exp.desc.split('\n').join('</li><li>')}</li>
                </ul>
            </div>
        `).join('')}

        ${resumeData.projects.length ? `<h2 style="color:#6C5CE7;border-bottom:2px solid #6C5CE7;padding-bottom:5px">Projects</h2>` : ''}
        ${resumeData.projects.map(p => `
            <div style="margin-bottom:20px">
                <strong style="font-size:1.1em">${p.name}</strong> <span style="color:#666">(${p.tech})</span><br>
                <p>${p.desc}</p>
            </div>
        `).join('')}

        <h2 style="color:#6C5CE7;border-bottom:2px solid #6C5CE7;padding-bottom:5px">Skills</h2>
        <p style="background:#f0f4ff;padding:12px;border-radius:8px;font-weight:500">
            ${resumeData.skills || 'Python, JavaScript, React, SQL, Git, AWS'}
        </p>
    </div>`;
}

function generateElegantTemplate() {
    return generateModernTemplate().replace(/#6C5CE7/g, '#1E293B');
}

function generateCreativeTemplate() {
    return `
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:40px;min-height:100vh">
        <div style="background:rgba(255,255,255,0.95);color:#222;padding:40px;border-radius:16px">
            ${generateModernTemplate()}
        </div>
    </div>`;
}

function generateClassicTemplate() {
    return `
    <div style="max-width:900px;margin:auto;font-family:Arial;line-height:1.5;color:#333">
        <div style="display:grid;grid-template-columns:1fr 2fr;gap:25px">
            <div style="padding-right:15px;border-right:2px solid #ddd">
                <h2>${resumeData.name || 'Your Name'}</h2>
                <p>${resumeData.title || 'Professional Title'}</p>
                <hr>

                <h3>Contact</h3>
                <p>${resumeData.email || 'email@example.com'}<br>${resumeData.phone || '+20 123 456 7890'}<br>${resumeData.location || 'City, Country'}</p>
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a> • ` : ''}
                ${resumeData.github ? `<a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:#6C5CE7;text-decoration:none" target="_blank">GitHub</a>` : ''}

                <h3>Skills</h3>
                <ul style="padding-left:20px">${(resumeData.skills || '').split(',').map(s => `<li>${s}</li>`).join('')}</ul>
            </div>

            <div>
                ${resumeData.summary ? `<h3>Summary</h3><p>${resumeData.summary}</p>` : ''}
                
                <h3>Education</h3>
                ${resumeData.education.map(e => `
                <p>
                    <strong>${e.degree}</strong><br>
                    ${e.school} – ${e.year}
                </p>`).join('')}

                <h3>Experience</h3>
                ${resumeData.experience.map(exp => `
                <div style="margin-bottom:15px">
                    <strong>${exp.title}</strong> — ${exp.company}<br>
                    <small>${exp.dates}</small>
                    <ul>${exp.desc.split('\n').map(d => `<li>${d}</li>`).join('')}</ul>
                </div>`).join('')}
                
                ${resumeData.projects.length ? `<h3>Projects</h3>
                ${resumeData.projects.map(p => `
                <div style="margin-bottom:15px">
                    <strong>${p.name} (${p.tech})</strong><br>
                    <p>${p.desc}</p>
                </div>`).join('')}` : ''}
            </div>
        </div>
    </div>`;
}

function generateCompactTemplate() {
    return `
    <div style="max-width:760px;margin:auto;font-family:Arial;line-height:1.4;color:#222">
        <h1 style="margin:0">${resumeData.name || 'Your Name'}</h1>
        <p>${resumeData.title || 'Professional Title'}</p>
        <p>${resumeData.email || 'email@example.com'} • ${resumeData.phone || '+20 123 456 7890'} • ${resumeData.location || 'City, Country'}<br>
            ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a> • ` : ''}
            ${resumeData.github ? `<a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:#6C5CE7;text-decoration:none" target="_blank">GitHub</a>` : ''}
        </p>

        ${resumeData.summary ? `<h3>Summary</h3><p>${resumeData.summary}</p>` : ''}

        <h3>Experience</h3>
        ${resumeData.experience.map(exp => `
            <p><strong>${exp.title}</strong>, ${exp.company} (${exp.dates})<br>
            ${exp.desc}</p>
        `).join('')}

        <h3>Education</h3>
        ${resumeData.education.map(e => `
            <p><strong>${e.degree}</strong> — ${e.school} (${e.year})</p>
        `).join('')}
        
        ${resumeData.projects.length ? `<h3>Projects</h3>
        ${resumeData.projects.map(p => `
            <p><strong>${p.name}</strong> (${p.tech})<br>${p.desc}</p>
        `).join('')}` : ''}

        <h3>Skills</h3>
        <p>${resumeData.skills}</p>
    </div>`;
}

function generateHarvardTemplate() {
    return `
    <div style="font-family: Inter, sans-serif; border-left: 6px solid #a30000; padding: 25px 30px; max-width: 820px; margin: auto;">
        <h1 style="font-size: 32px; margin-bottom: 8px; color: #a30000;">${resumeData.name || 'Your Name'}</h1>
        <p style="color: #333; font-size: 15px;">
            ${resumeData.email || 'email@example.com'} | ${resumeData.phone || '+20 123 456 7890'} | ${resumeData.location || 'City, Country'}
        </p>

        ${resumeData.summary ? `<h2 style="margin-top: 28px; color: #a30000;">Summary</h2>
        <p>${resumeData.summary}</p>` : ''}
        
        <h2 style="margin-top: 28px; color: #a30000;">Experience</h2>
        ${resumeData.experience.map(exp => `
            <div style="margin-bottom: 20px;">
                <strong>${exp.title}</strong>, ${exp.company} (${exp.dates})<br>
                <p>${exp.desc}</p>
            </div>
        `).join('')}

        <h2 style="margin-top: 28px; color: #a30000;">Education</h2>
        ${resumeData.education.map(e => `
            <div style="margin-bottom: 15px;">
                <strong>${e.degree}</strong><br>${e.school}<br>${e.year}
            </div>
        `).join('')}
        
        ${resumeData.projects.length ? `<h2 style="margin-top: 28px; color: #a30000;">Projects</h2>
        ${resumeData.projects.map(p => `
            <div style="margin-bottom: 15px;">
                <strong>${p.name}</strong> (${p.tech})<br>
                <p>${p.desc}</p>
            </div>
        `).join('')}` : ''}

        <h2 style="margin-top: 28px; color: #a30000;">Skills</h2>
        <ul style="columns: 2; margin-top: 5px;">
            ${(resumeData.skills || '').split(",").map(s => `<li>${s.trim()}</li>`).join("")}
        </ul>
    </div>`;
}

function generateSidebarTemplate() {
    return `
    <div style="display:flex;max-width:1000px;margin:auto;font-family:Arial">
        <div style="width:290px; height:100%;background:#111827;color:white;padding:25px">
            <h2 style="margin-top:0">${resumeData.name || 'Your Name'}</h2>
            <p>${resumeData.title || 'Professional Title'}</p>
            <hr style="border-color:#444">

            <h3>Contact</h3>
            <p>
                ${resumeData.email || 'email@example.com'}<br>
                ${resumeData.phone || '+20 123 456 7890'}<br>
                ${resumeData.location || 'City, Country'}<br><br>
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a><br>` : ''}
                ${resumeData.github ? `<a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:#6C5CE7;text-decoration:none" target="_blank">GitHub</a>` : ''}
            </p>

            <h3>Skills</h3>
            <ul style="padding-left:20px">${(resumeData.skills || '').split(',').map(s => `<li>${s}</li>`).join('')}</ul>
        </div>

        <div style="padding:30px;flex:1">
            ${resumeData.summary ? `<h3>Summary</h3><p>${resumeData.summary}</p>` : ''}
            
            <h3>Experience</h3>
            ${resumeData.experience.map(exp => `
                <div style="margin-bottom:15px">
                    <strong>${exp.title}</strong>, ${exp.company}<br>
                    <small>${exp.dates}</small>
                    <ul>${exp.desc.split('\n').map(d => `<li>${d}</li>`).join('')}</ul>
                </div>
            `).join('')}

            <h3>Education</h3>
            ${resumeData.education.map(e => `
                <p><strong>${e.degree}</strong><br>${e.school} — ${e.year}</p>
            `).join('')}

            ${resumeData.projects.length ? `<h3>Projects</h3>
            ${resumeData.projects.map(p => `
                <div style="margin-bottom:15px">
                    <strong>${p.name} (${p.tech})</strong><br>
                    <p>${p.desc}</p>
                </div>    
            `).join('')}` : ''}
        </div>
    </div>`;
}

function generateMinimalHeaderTemplate() {
    return `
    <div style="max-width:850px;margin:0 auto;font-family:'Georgia',serif;line-height:1.55;color:#222;">
        <div style="background:#2f2f2f;color:white;text-align:center;padding:60px 20px 40px;
                    clip-path: polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%);">
            <h1 style="font-size:3em;margin:0;letter-spacing:3px;">${resumeData.name || 'Your Name'}</h1>
            <p style="margin-top:10px;font-size:1.1em;letter-spacing:1px;">${resumeData.title || 'Professional Title'}</p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 2fr;gap:40px;padding:40px 20px;">
            <div>
                <h3 style="font-weight:bold;margin-bottom:8px;">PERSONAL</h3>
                <p>
                    ${resumeData.email || 'email@example.com'}<br>
                    ${resumeData.phone || '+20 123 456 7890'}<br>
                    ${resumeData.location || 'City, Country'}
                </p>

                <h3 style="margin-top:25px;">CONTACT</h3>
                <p>
                    <strong>Email:</strong> ${resumeData.email || 'email@example.com'}<br>
                    ${resumeData.linkedin ? `<strong>LinkedIn:</strong> <a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a><br>` : ''}
                    ${resumeData.github ? `<strong>GitHub:</strong> <a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:#6C5CE7;text-decoration:none" target="_blank">GitHub</a>` : ''}
                </p>

                <h3 style="margin-top:25px;">SKILLS</h3>
                <ul style="padding-left:20px;">
                    ${(resumeData.skills || '').split(',').map(s => `<li>${s.trim()}</li>`).join('')}
                </ul>
            </div>

            <div>
                ${resumeData.summary ? `<h3>SUMMARY</h3><p>${resumeData.summary}</p>` : ''}
                
                <h3>EXPERIENCE</h3>
                ${resumeData.experience.map(exp => `
                    <div style="margin-bottom:20px;">
                        <strong>${exp.title}</strong> — ${exp.company}<br>
                        <em>${exp.dates}</em>
                        <p style="margin-top:8px;">${exp.desc}</p>
                    </div>
                `).join('')}

                <h3 style="margin-top:30px;">EDUCATION</h3>
                ${resumeData.education.map(e => `
                    <p><strong>${e.degree}</strong><br>${e.school} — ${e.year}</p>
                `).join('')}
                
                ${resumeData.projects.length ? `<h3 style="margin-top:30px;">PROJECTS</h3>
                ${resumeData.projects.map(p => `
                    <div style="margin-bottom:15px">
                        <strong>${p.name} (${p.tech})</strong><br>
                        <p>${p.desc}</p>
                    </div>    
                `).join('')}` : ''}
            </div>
        </div>
    </div>`;
}

function generateSidebarPhotoTemplate() {
    return `
    <div style="max-width:1200px;margin:0 auto;font-family:Arial, sans-serif;display:grid;
                grid-template-columns:260px 1fr;min-height:1000px;">
        <div style="background:#0f1c2e;color:white;padding:60px;text-align:center;">
            <div style="width:130px;height:130px;border-radius:50%;overflow:hidden;
                        margin:0 auto 25px;background:#ddd;border:4px solid white;"></div>

            <h3>Contact</h3>
            <p>
                ${resumeData.location || 'City, Country'}<br>
                ${resumeData.phone || '+20 123 456 7890'}<br>
                ${resumeData.email || 'email@example.com'}
            </p>

            <h3 style="margin-top:25px;">Skills</h3>
            <ul style="text-align:left;line-height:1.6;">
                ${(resumeData.skills || '').split(',').map(s => `<li>${s.trim()}</li>`).join('')}
            </ul>

            <h3 style="margin-top:25px;">Links</h3>
            <p>
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:white;text-decoration:none" target="_blank">LinkedIn</a><br>` : ''}
                ${resumeData.github ? `<a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:white;text-decoration:none" target="_blank">GitHub</a>` : ''}
            </p>
        </div>

        <div style="padding:50px;">
            <h1 style="margin:0;font-size:2.4em;">${resumeData.name || 'Your Name'}</h1>
            <p style="font-size:1.2em;color:#555;">${resumeData.title || 'Professional Title'}</p>

            ${resumeData.summary ? `<h2 style="margin-top:30px;">Profile</h2><p>${resumeData.summary}</p>` : ''}

            <h2>Work Experience</h2>
            ${resumeData.experience.map(exp => `
                <div style="margin-bottom:20px;">
                    <strong>${exp.title}</strong>, ${exp.company}
                    <span style="float:right;color:#555">${exp.dates}</span>
                    <p>${exp.desc}</p>
                </div>
            `).join('')}

            <h2>Education</h2>
            ${resumeData.education.map(e => `
                <p><strong>${e.degree}</strong><br>${e.school} — ${e.year}</p>
            `).join('')}
            
            ${resumeData.projects.length ? `<h2>Projects</h2>
            ${resumeData.projects.map(p => `
                <div style="margin-bottom:15px">
                    <strong>${p.name} (${p.tech})</strong><br>
                    <p>${p.desc}</p>
                </div>    
            `).join('')}` : ''}
        </div>
    </div>`;
}

function generateSoftPinkTemplate() {
    return `
    <div style="max-width:850px;margin:0 auto;font-family:'Inter',sans-serif;line-height:1.6;color:#222;">
        <div style="background:#f4e6df;padding:40px;text-align:center;border-radius:8px 8px 0 0;">
            <h1 style="letter-spacing:2px;margin:0;font-size:2.5em;">${resumeData.name || 'Your Name'}</h1>
            <p style="margin-top:8px;font-size:1.1em;">${resumeData.title || 'Professional Title'}</p>
            <p>
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a> • ` : ''}
                ${resumeData.github ? `<a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:#6C5CE7;text-decoration:none" target="_blank">GitHub</a>` : ''}
            </p>
        </div>

        <div style="padding:40px;background:white;">
            <div style="display:grid;grid-template-columns:1fr 2fr;gap:40px;">
                <div>
                    <h3>CONTACT</h3>
                    <p>
                        ${resumeData.email || 'email@example.com'}<br>
                        ${resumeData.phone || '+20 123 456 7890'}<br>
                        ${resumeData.location || 'City, Country'}
                    </p>

                    <h3>EDUCATION</h3>
                    ${resumeData.education.map(e => `
                        <p><strong>${e.degree}</strong><br>${e.school}<br>${e.year}</p>
                    `).join('')}

                    <h3>SKILLS</h3>
                    <ul style="padding-left:20px;">
                        ${(resumeData.skills || '').split(',').map(s => `<li>${s.trim()}</li>`).join('')}
                    </ul>
                </div>

                <div>
                    ${resumeData.summary ? `<h3>SUMMARY</h3><p>${resumeData.summary}</p>` : ''}
                    
                    <h3>PROFESSIONAL EXPERIENCE</h3>
                    ${resumeData.experience.map(exp => `
                        <div style="margin-bottom:20px;">
                            <strong>${exp.title}</strong>, ${exp.company}<br>
                            <em>${exp.dates}</em>
                            <p>${exp.desc}</p>
                        </div>
                    `).join('')}
                    
                    ${resumeData.projects.length ? `<h3>PROJECTS</h3>
                    ${resumeData.projects.map(p => `
                        <div style="margin-bottom:20px;">
                            <strong>${p.name} (${p.tech})</strong><br>
                            <p>${p.desc}</p>
                        </div>
                    `).join('')}` : ''}
                </div>
            </div>
        </div>
    </div>`;
}

function generateBlueProfessionalTemplate() {
    return `
    <div style="font-family:Arial, sans-serif; color:#1e293b; line-height:1.5;">
        <div style="background:#1d4ed8; color:white; padding:30px; text-align:center;">
            <h1 style="margin:0; font-size:32px;">${resumeData.name || 'Your Name'}</h1>
            <p style="margin:5px 0; font-size:18px;">${resumeData.title || 'Professional Title'}</p>
            <p style="font-size:14px;">
                ${resumeData.email || 'email@example.com'} | ${resumeData.phone || '+20 123 456 7890'} | ${resumeData.location || 'City, Country'}
            </p>
        </div>
        <div style="padding:30px;">
            ${resumeData.summary ? `<h2 style="color:#1d4ed8; border-bottom:2px solid #1d4ed8;">Summary</h2>
            <p style="margin-bottom:20px;">${resumeData.summary}</p>` : ''}
            
            <h2 style="color:#1d4ed8; border-bottom:2px solid #1d4ed8;">Education</h2>
            ${resumeData.education.map(e => `
                <div style="margin-bottom:10px;">
                    <strong>${e.degree}</strong> — ${e.school} (${e.year})
                </div>
            `).join("")}

            <h2 style="color:#1d4ed8; border-bottom:2px solid #1d4ed8; margin-top:20px;">Experience</h2>
            ${resumeData.experience.map(exp => `
                <div style="margin-bottom:15px;">
                    <strong>${exp.title}</strong>, ${exp.company} — <em>${exp.dates}</em>
                    <p>${exp.desc}</p>
                </div>
            `).join("")}
            
            ${resumeData.projects.length > 0 ? `
            <h2 style="color:#1d4ed8; border-bottom:2px solid #1d4ed8; margin-top:20px;">Projects</h2>
            ${resumeData.projects.map(p => `
                <div style="margin-bottom:15px;">
                    <strong>${p.name}</strong> (${p.tech})
                    <p>${p.desc}</p>
                </div>
            `).join("")}
            ` : ""}

            <h2 style="color:#1d4ed8; border-bottom:2px solid #1d4ed8; margin-top:20px;">Skills</h2>
            <p>${resumeData.skills}</p>
        </div>
    </div>`;
}

function generateBlueModernHeaderTemplate() {
    return `
    <div style="font-family:Inter, sans-serif; line-height:1.6; color:#0f172a;">
        <header style="background:#3b82f6; color:white; padding:40px;">
            <h1 style="margin:0; font-size:34px;">${resumeData.name || 'Your Name'}</h1>
            <p style="margin:0; font-size:18px;">${resumeData.title || 'Professional Title'}</p>
            <p style="margin-top:10px; font-size:14px;">
                ${resumeData.email || 'email@example.com'} | ${resumeData.phone || '+20 123 456 7890'} | ${resumeData.location || 'City, Country'}
            </p>
        </header>
        <section style="padding:25px;">
            ${resumeData.summary ? `<h2 style="color:#3b82f6;">Summary</h2>
            <p>${resumeData.summary}</p>` : ''}
            
            <h2 style="color:#3b82f6;">Education</h2>
            ${resumeData.education.map(e => `
                <div><strong>${e.degree}</strong> — ${e.school} (${e.year})</div>
            `).join("")}

            <h2 style="color:#3b82f6; margin-top:20px;">Experience</h2>
            ${resumeData.experience.map(exp => `
                <div style="margin-bottom:12px;">
                    <strong>${exp.title}</strong>, ${exp.company}
                    <br><em>${exp.dates}</em>
                    <p>${exp.desc}</p>
                </div>
            `).join("")}
            
            ${resumeData.projects.length ? `
            <h2 style="color:#3b82f6; margin-top:20px;">Projects</h2>
            ${resumeData.projects.map(p => `
                <div>
                    <strong>${p.name}</strong> (${p.tech})
                    <p>${p.desc}</p>
                </div>
            `).join("")}
            ` : ""}

            <h2 style="color:#3b82f6; margin-top:20px;">Skills</h2>
            <p>${resumeData.skills}</p>
        </section>
    </div>`;
}

function generateMinimalElegantPhotoTemplate() {
    return `
    <div style="display:flex; font-family:Georgia, serif; color:#1e293b;">
        <aside style="width:30%; height:100%; background:#f8fafc; padding:55px; text-align:center; border-right:1px solid #e2e8f0;">
            <div style="width:130px;height:130px;border-radius:50%;overflow:hidden;
                        margin:0 auto 25px;background:#ddd;border:4px solid white;"></div>
            <h2 style="font-size:22px;">${resumeData.name || 'Your Name'}</h2>
            <p>${resumeData.title || 'Professional Title'}</p>
            <hr style="margin:15px 0">
            <p style="font-size:14px;">${resumeData.email || 'email@example.com'}</p>
            <p style="font-size:14px;">${resumeData.phone || '+20 123 456 7890'}</p>
            <p style="font-size:14px;">${resumeData.location || 'City, Country'}</p>
            <br>
            ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a><br>` : ''}
            ${resumeData.github ? `<a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:#6C5CE7;text-decoration:none" target="_blank">GitHub</a>` : ''}
            <br><br>
            
            <h3 style="text-align:left; border-bottom:2px solid #e2e8f0; padding-bottom:5px;">Skills</h3>
            <ul style="text-align:left; padding-left:20px;">
                ${(resumeData.skills || '').split(',').map(s => `<li>${s.trim()}</li>`).join('')}
            </ul>
        </aside>

        <main style="width:70%; padding:30px;">
            ${resumeData.summary ? `<h2 style="border-bottom:2px solid #e2e8f0;">Summary</h2>
            <p style="margin-bottom:20px;">${resumeData.summary}</p>` : ''}
            
            <h2 style="border-bottom:2px solid #e2e8f0;">Education</h2>
            ${resumeData.education.map(e => `
                <div style="margin-bottom:10px;">
                    <strong>${e.degree}</strong> — ${e.school} (${e.year})
                </div>
            `).join("")}

            <h2 style="margin-top:20px; border-bottom:2px solid #e2e8f0;">Experience</h2>
            ${resumeData.experience.map(exp => `
                <div style="margin-bottom:12px;">
                    <strong>${exp.title}</strong>, ${exp.company}
                    <br><em>${exp.dates}</em>
                    <p>${exp.desc}</p>
                </div>
            `).join("")}
            
            ${resumeData.projects.length ? `
            <h2 style="margin-top:20px; border-bottom:2px solid #e2e8f0;">Projects</h2>
            ${resumeData.projects.map(p => `
                <div>
                    <strong>${p.name}</strong> (${p.tech})
                    <p>${p.desc}</p>
                </div>
            `).join("")}
            ` : ""}
        </main>
    </div>`;
}

function generateProfessionalTwoColumnTemplate() {
    return `
    <div style="max-width:1000px;margin:0 auto;font-family:'Arial',sans-serif;display:grid;grid-template-columns:30% 70%;min-height:1100px;">
        <div style="background:#2c3e50;color:white;padding:40px 30px;">
            <h1 style="margin:0 0 10px;font-size:28px;color:#ecf0f1">${resumeData.name || 'Your Name'}</h1>
            <p style="margin:0 0 30px;font-size:16px;color:#bdc3c7">${resumeData.title || 'Professional Title'}</p>
            
            <div style="margin-bottom:30px;">
                <h2 style="font-size:18px;color:#ecf0f1;border-bottom:2px solid #7f8c8d;padding-bottom:5px;margin-bottom:15px;">PROFESSIONAL SUMMARY</h2>
                <p style="font-size:14px;line-height:1.5">${resumeData.summary || 'Add your professional summary here...'}</p>
            </div>
            
            <div style="margin-bottom:30px;">
                <h2 style="font-size:18px;color:#ecf0f1;border-bottom:2px solid #7f8c8d;padding-bottom:5px;margin-bottom:15px;">CONTACT</h2>
                <p style="font-size:14px;">
                    ${resumeData.email || 'email@example.com'}<br>
                    ${resumeData.phone || '(123) 456-7890'}<br>
                    ${resumeData.location || 'City, State'}<br>
                    ${resumeData.linkedin ? `<br><a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#bdc3c7;text-decoration:none" target="_blank">LinkedIn Profile</a>` : ''}
                </p>
            </div>
            
            <div style="margin-bottom:30px;">
                <h2 style="font-size:18px;color:#ecf0f1;border-bottom:2px solid #7f8c8d;padding-bottom:5px;margin-bottom:15px;">SKILLS</h2>
                <div style="font-size:14px;">
                    ${(resumeData.skills || '').split(',').map(skill => `
                        <div style="margin-bottom:8px">• ${skill.trim()}</div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom:30px;">
                <h2 style="font-size:18px;color:#ecf0f1;border-bottom:2px solid #7f8c8d;padding-bottom:5px;margin-bottom:15px;">EDUCATION</h2>
                ${resumeData.education.length > 0 ? resumeData.education.map(edu => `
                    <div style="margin-bottom:20px;">
                        <strong style="font-size:14px;">${edu.degree || 'Degree'}</strong><br>
                        <span style="font-size:13px;">${edu.school || 'Institution'}</span><br>
                        <em style="font-size:13px;">${edu.year || 'Year'}</em>
                    </div>
                `).join('') : '<p style="font-size:14px;">Add your education details...</p>'}
            </div>
            
            <div>
                <h2 style="font-size:18px;color:#ecf0f1;border-bottom:2px solid #7f8c8d;padding-bottom:5px;margin-bottom:15px;">AFFILIATIONS</h2>
                <div style="font-size:14px;">
                    <div style="margin-bottom:8px">• American Society of Professionals</div>
                    <div style="margin-bottom:8px">• Association of Information Technology Professionals</div>
                </div>
            </div>
        </div>
        
        <div style="padding:40px 30px;background:#ffffff;">
            <h2 style="color:#2c3e50;border-bottom:2px solid #2c3e50;padding-bottom:5px;margin-bottom:25px;">WORK HISTORY</h2>
            
            ${resumeData.experience.length > 0 ? resumeData.experience.map(exp => `
                <div style="margin-bottom:30px;">
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                        <strong style="font-size:16px;color:#2c3e50;">${exp.title || 'Job Title'}</strong>
                        <span style="font-size:14px;color:#7f8c8d;">${exp.dates || 'Dates'}</span>
                    </div>
                    <div style="font-size:14px;color:#34495e;margin-bottom:10px;">
                        ${exp.company || 'Company'} • ${exp.company ? (exp.location || resumeData.location || 'Location') : ''}
                    </div>
                    <ul style="padding-left:20px;margin:0;font-size:14px;line-height:1.5;color:#2c3e50;">
                        ${exp.desc ? exp.desc.split('\n').map(item => `<li style="margin-bottom:5px;">${item}</li>`).join('') : '<li>Add your responsibilities and achievements...</li>'}
                    </ul>
                </div>
            `).join('') : `
                <div style="margin-bottom:30px;">
                    <p style="font-size:14px;color:#7f8c8d;font-style:italic;">Add your work experience in the form above...</p>
                </div>
            `}
            
            ${resumeData.projects.length > 0 ? `
                <h2 style="color:#2c3e50;border-bottom:2px solid #2c3e50;padding-bottom:5px;margin-bottom:25px;margin-top:40px;">PROJECTS</h2>
                ${resumeData.projects.map(proj => `
                    <div style="margin-bottom:20px;">
                        <strong style="font-size:16px;color:#2c3e50;">${proj.name || 'Project Name'}</strong>
                        <span style="font-size:14px;color:#7f8c8d;"> (${proj.tech || 'Technologies'})</span>
                        <p style="font-size:14px;margin-top:5px;line-height:1.5;">${proj.desc || 'Project description'}</p>
                    </div>
                `).join('')}
            ` : ''}
        </div>
    </div>`;
}

function generateCleanHeaderTemplate() {
    return `
    <div style="max-width:800px;margin:0 auto;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#333;line-height:1.5;">
        <header style="text-align:center;padding:30px 0 20px;margin-bottom:30px;">
            <h1 style="font-size:36px;margin:0;color:#2c3e50;font-weight:bold;">${resumeData.name || 'Your Name'}</h1>
            <p style="font-size:18px;margin:10px 0;color:#7f8c8d;">${resumeData.title || 'Professional Title'}</p>
            
            <div style="margin-top:15px;font-size:14px;color:#555;">
                <span>${resumeData.phone || '(123) 456-7890'}</span> • 
                <span>${resumeData.email || 'email@example.com'}</span> • 
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#3498db;text-decoration:none" target="_blank">LinkedIn</a> • ` : ''}
                ${resumeData.github ? `<a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:#3498db;text-decoration:none" target="_blank">Portfolio</a>` : ''}<br>
                <span>${resumeData.location || 'City, State'}</span>
            </div>
        </header>
        
        <div style="padding:0 20px;">
            ${resumeData.summary ? `
                <div style="margin-bottom:30px;">
                    <p style="font-size:16px;line-height:1.6;">${resumeData.summary}</p>
                </div>
            ` : ''}
            
            <div style="display:grid;grid-template-columns:1fr 2fr;gap:40px;">
                <div>
                    <h3 style="color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:5px;margin-bottom:15px;">EDUCATION</h3>
                    ${resumeData.education.length > 0 ? resumeData.education.map(edu => `
                        <div style="margin-bottom:20px;">
                            <strong style="font-size:15px;">${edu.degree || 'Degree Name'}</strong><br>
                            <span style="font-size:14px;">${edu.school || 'Institution Name'}</span><br>
                            <em style="font-size:13px;color:#7f8c8d;">${edu.year || 'Graduation Year'}</em>
                        </div>
                    `).join('') : '<p style="font-size:14px;color:#7f8c8d;">Add your education details...</p>'}
                    
                    <h3 style="color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:5px;margin-bottom:15px;margin-top:30px;">KEY SKILLS</h3>
                    <div style="font-size:14px;">
                        ${(resumeData.skills || '').split(',').map(skill => `
                            <div style="margin-bottom:5px">• ${skill.trim()}</div>
                        `).join('')}
                    </div>
                    
                    ${resumeData.projects.length > 0 ? `
                        <h3 style="color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:5px;margin-bottom:15px;margin-top:30px;">CERTIFICATION</h3>
                        ${resumeData.projects.map((proj, index) => `
                            <div style="font-size:14px;margin-bottom:8px;">• ${proj.name || 'Certification Name'} (${proj.tech || 'Issuing Body'})</div>
                        `).join('')}
                    ` : ''}
                </div>
                
                <div>
                    <h3 style="color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:5px;margin-bottom:15px;">PROFESSIONAL EXPERIENCE</h3>
                    
                    ${resumeData.experience.length > 0 ? resumeData.experience.map((exp, index) => `
                        <div style="margin-bottom:${index < resumeData.experience.length - 1 ? '30px' : '0'};">
                            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:5px;">
                                <strong style="font-size:16px;">${exp.title || 'Job Title'}</strong>
                                <span style="font-size:14px;color:#7f8c8d;">${exp.dates || 'Date Range'}</span>
                            </div>
                            <div style="font-size:15px;color:#34495e;margin-bottom:10px;font-style:italic;">
                                ${exp.company || 'Company Name'}, ${exp.location || resumeData.location || 'Location'}
                            </div>
                            <ul style="padding-left:20px;margin:0;font-size:14px;line-height:1.5;">
                                ${exp.desc ? exp.desc.split('\n').map(item => `<li style="margin-bottom:8px;">${item}</li>`).join('') : '<li>Add your achievements...</li>'}
                            </ul>
                        </div>
                    `).join('') : `
                        <div style="margin-bottom:30px;">
                            <p style="font-size:14px;color:#7f8c8d;font-style:italic;">Add your professional experience in the form above...</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    </div>`;
}

function generateAcademicStyleTemplate() {
    return `
    <div style="max-width:900px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2c3e50;line-height:1.6;">
        <header style="text-align:center;padding-bottom:20px;border-bottom:2px solid #ecf0f1;margin-bottom:30px;">
            <h1 style="font-size:32px;margin:0 0 5px;font-weight:bold;letter-spacing:1px;">${resumeData.name || 'Your Name'}</h1>
            <p style="font-size:16px;margin:0 0 15px;color:#7f8c8d;text-transform:uppercase;">${resumeData.title || 'PROFESSIONAL TITLE'}</p>
            
            <div style="display:flex;justify-content:center;align-items:center;gap:15px;font-size:14px;color:#555;">
                <span>${resumeData.phone || '(123) 456-7890'}</span> • 
                <span>${resumeData.email || 'email@example.com'}</span> • 
                <span>${resumeData.location || 'City, State'}</span><br>
            </div>
            <div style="margin-top:8px;font-size:13px;">
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#3498db;text-decoration:none" target="_blank">LinkedIn Profile</a>` : ''}
            </div>
        </header>
        
        <div style="display:grid;grid-template-columns:35% 65%;gap:30px;padding:0 10px;">
            <div>
                <h3 style="color:#2c3e50;font-size:16px;border-bottom:1px solid #bdc3c7;padding-bottom:3px;margin-bottom:15px;">EDUCATION</h3>
                ${resumeData.education.length > 0 ? resumeData.education.map(edu => `
                    <div style="margin-bottom:25px;">
                        <div style="font-weight:bold;font-size:14px;">${edu.degree || 'DEGREE'}</div>
                        <div style="font-size:13px;color:#7f8c8d;margin:3px 0;">${edu.year || 'Year'}</div>
                        <div style="font-size:14px;">${edu.school || 'Institution'}</div>
                        <div style="font-size:13px;color:#7f8c8d;">${edu.location || resumeData.location || 'Location'}</div>
                    </div>
                `).join('') : `
                    <div style="margin-bottom:25px;">
                        <p style="font-size:14px;color:#7f8c8d;font-style:italic;">Add your education details...</p>
                    </div>
                `}
                
                <h3 style="color:#2c3e50;font-size:16px;border-bottom:1px solid #bdc3c7;padding-bottom:3px;margin-bottom:15px;margin-top:30px;">SKILLS</h3>
                <div style="font-size:14px;line-height:1.8;">
                    ${(resumeData.skills || '').split(',').slice(0, 12).map(skill => `
                        <div>• ${skill.trim()}</div>
                    `).join('')}
                </div>
                
                ${resumeData.projects.length > 0 ? `
                    <h3 style="color:#2c3e50;font-size:16px;border-bottom:1px solid #bdc3c8;padding-bottom:3px;margin-bottom:15px;margin-top:30px;">AWARDS</h3>
                    ${resumeData.projects.slice(0, 2).map((proj, index) => `
                        <div style="margin-bottom:20px;">
                            <div style="font-size:13px;color:#7f8c8d;">${proj.tech || 'Date'}</div>
                            <div style="font-weight:bold;font-size:14px;">${proj.name || 'Award Name'}</div>
                            <div style="font-size:13px;">${proj.desc || 'Organization'} | Location</div>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
            
            <div>
                <h3 style="color:#2c3e50;font-size:16px;border-bottom:1px solid #bdc3c7;padding-bottom:3px;margin-bottom:15px;">CAREER OBJECTIVE</h3>
                <div style="font-size:14px;margin-bottom:30px;line-height:1.6;">
                    ${resumeData.summary || 'Add your career objective or professional summary here...'}
                </div>
                
                <h3 style="color:#2c3e50;font-size:16px;border-bottom:1px solid #bdc3c7;padding-bottom:3px;margin-bottom:15px;">EXPERIENCE</h3>
                
                ${resumeData.experience.length > 0 ? resumeData.experience.map(exp => `
                    <div style="margin-bottom:30px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <strong style="font-size:15px;">${exp.title || 'Position Title'}</strong>
                            <span style="font-size:13px;color:#7f8c8d;">${exp.dates || 'Date Range'}</span>
                        </div>
                        <ul style="padding-left:20px;margin:0;font-size:14px;line-height:1.6;">
                            ${exp.desc ? exp.desc.split('\n').map(item => `
                                <li style="margin-bottom:8px;">${item}</li>
                            `).join('') : '<li>Add your responsibilities and achievements...</li>'}
                        </ul>
                    </div>
                `).join('') : `
                    <div style="margin-bottom:30px;">
                        <p style="font-size:14px;color:#7f8c8d;font-style:italic;">Add your experience in the form above...</p>
                    </div>
                `}
                
                ${resumeData.projects.length > 0 ? `
                    <h3 style="color:#2c3e50;font-size:16px;border-bottom:1px solid #bdc3c7;padding-bottom:3px;margin-bottom:15px;">PROJECTS</h3>
                    
                    ${resumeData.projects.map(proj => `
                        <div style="margin-bottom:25px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <strong style="font-size:15px;">${proj.name || 'Project Name'}</strong>
                                <span style="font-size:13px;color:#7f8c8d;">${proj.tech || 'Date Range'}</span>
                            </div>
                            <ul style="padding-left:20px;margin:0;font-size:14px;line-height:1.6;">
                                <li style="margin-bottom:5px;">${proj.desc || 'Project description...'}</li>
                            </ul>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        </div>
    </div>`;
}

function downloadResumePDF() {
    const element = document.getElementById('resume-content');
    if (!element) {
        alert('Please generate a resume preview first.');
        return;
    }
    
    html2pdf()
        .set({ 
            margin: 10, 
            filename: `${resumeData.name || 'Resume'}_Edumate.pdf`, 
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save()
        .catch(err => {
            console.error('PDF generation error:', err);
            alert('Error generating PDF. Please try again.');
        });
}

function checkATSCompatibility() {
    if (window.checkATSCompatibility && window.checkATSCompatibility !== checkATSCompatibility) {
        return window.checkATSCompatibility.apply(this, arguments);
    }
    console.warn('checkATSCompatibility is handled by backend_api.js');
}

// ============================================
// GPA CALCULATOR
// ============================================

const GRADE_POINTS = {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0
};

let courseGrades = {};

function loadSavedGrades() {
    const saved = localStorage.getItem('edumate_course_grades');
    if (saved) {
        courseGrades = JSON.parse(saved);
    }
}

window.loadInternshipsFromSearch = loadInternshipsByPosition;

function saveGrades() {
    localStorage.setItem('edumate_course_grades', JSON.stringify(courseGrades));
}

function hydrateCourseGradesFromSemesters(semesters) {
    courseGrades = {};
    (semesters || []).forEach(semester => {
        (semester.courses || []).forEach(course => {
            const courseId = course.id?.toString();
            if (courseId && course.status === 'completed' && course.grade && GRADE_POINTS[course.grade] !== undefined) {
                courseGrades[courseId] = course.grade;
            }
        });
    });
    saveGrades();
}

function calculateGPA() {
    const allCourseRows = document.querySelectorAll('.course-row');
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    let coursesWithGrades = 0;
    
    allCourseRows.forEach(row => {
        const courseId = row.getAttribute('data-course-id');
        const creditSpan = row.querySelector('.course-credits');
        
        if (creditSpan) {
            const match = creditSpan.textContent.match(/(\d+)/);
            if (match) {
                const credits = parseInt(match[1]);
                const grade = courseGrades[courseId] || null;
                
                if (grade && GRADE_POINTS[grade] !== undefined) {
                    totalWeightedPoints += GRADE_POINTS[grade] * credits;
                    totalCredits += credits;
                    coursesWithGrades++;
                }
            }
        }
    });
    
    const gpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;
    return {
        gpa: parseFloat(gpa.toFixed(2)),
        totalCredits,
        totalWeightedPoints,
        coursesWithGrades
    };
}

function calculateCGPA() {
    const allCourseRows = document.querySelectorAll('.course-row');
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    let totalCourses = 0;
    
    allCourseRows.forEach(row => {
        const courseId = row.getAttribute('data-course-id');
        const creditSpan = row.querySelector('.course-credits');
        
        if (creditSpan) {
            const match = creditSpan.textContent.match(/(\d+)/);
            if (match) {
                const credits = parseInt(match[1]);
                const grade = courseGrades[courseId] || null;
                
                if (grade && GRADE_POINTS[grade] !== undefined) {
                    totalWeightedPoints += GRADE_POINTS[grade] * credits;
                    totalCredits += credits;
                    totalCourses++;
                }
            }
        }
    });
    
    const cgpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits) : 0;
    return {
        cgpa: parseFloat(cgpa.toFixed(2)),
        totalCredits,
        totalWeightedPoints,
        totalCourses
    };
}

function updateGPADisplay() {
    const gpaResult = calculateGPA();
    const cgpaResult = calculateCGPA();
    
    const gpaElement = document.getElementById('current-gpa');
    if (gpaElement) {
        gpaElement.textContent = gpaResult.gpa.toFixed(2);
    }
    
    updateGPAPanel(gpaResult, cgpaResult);
}

function updateGPAPanel(gpaResult, cgpaResult) {
    const rightPanel = document.querySelector('.right-panel');
    if (!rightPanel) return;
    
    let gpaPanel = document.getElementById('gpa-panel');
    
    if (!gpaPanel) {
        gpaPanel = document.createElement('div');
        gpaPanel.id = 'gpa-panel';
        gpaPanel.className = 'gpa-panel';
        gpaPanel.style.cssText = `
            background: white;
            border-radius: 24px;
            padding: 1.5rem;
            margin-top: 1.5rem;
            box-shadow: 0 6px 12px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        `;
        
        const progressBlock = rightPanel.querySelector('.progress-block');
        if (progressBlock) {
            progressBlock.insertAdjacentElement('afterend', gpaPanel);
        } else {
            rightPanel.appendChild(gpaPanel);
        }
    }
    
    const distribution = calculateGradeDistribution();
    
    gpaPanel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 style="margin: 0; color: #1e293b; font-size: 1.1rem;">
                <i class="fas fa-calculator" style="color: #2563eb; margin-right: 8px;"></i>
                GPA Calculator
            </h4>
            <button onclick="toggleGPADetails()" class="link-btn" style="padding: 4px 12px; font-size: 0.85rem;">
                <i class="fas fa-chevron-down"></i> Details
            </button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 1rem; border-radius: 16px; text-align: center;">
                <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 4px;">Term GPA</div>
                <div style="font-size: 2.2rem; font-weight: 700; line-height: 1;">${gpaResult.gpa}</div>
                <div style="font-size: 0.75rem; opacity: 0.8;">${gpaResult.coursesWithGrades} graded courses</div>
            </div>
            <div style="background: linear-gradient(135deg, #475569, #334155); color: white; padding: 1rem; border-radius: 16px; text-align: center;">
                <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 4px;">Cumulative GPA</div>
                <div style="font-size: 2.2rem; font-weight: 700; line-height: 1;">${cgpaResult.cgpa}</div>
                <div style="font-size: 0.75rem; opacity: 0.8;">${cgpaResult.totalCourses} total courses</div>
            </div>
        </div>
        
        <div id="gpa-details" style="display: none; margin-top: 1rem;">
            <div style="background: #f8fafc; border-radius: 12px; padding: 1rem;">
                <h5 style="margin: 0 0 0.75rem 0; color: #1e293b; font-size: 0.9rem;">Grade Distribution</h5>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                    ${Object.entries(distribution).map(([grade, count]) => `
                        ${count > 0 ? `
                        <div style="background: white; padding: 0.25rem 0.75rem; border-radius: 20px; border: 1px solid #e2e8f0; font-size: 0.85rem;">
                            <span style="font-weight: 600;">${grade}:</span> ${count}
                        </div>
                        ` : ''}
                    `).join('')}
                </div>
                
                <div style="font-size: 0.85rem; color: #475569;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span>Total Credit Hours:</span>
                        <span style="font-weight: 600;">${gpaResult.totalCredits}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span>Weighted Points:</span>
                        <span style="font-weight: 600;">${gpaResult.totalWeightedPoints.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (document.body.classList.contains('dark-theme')) {
        gpaPanel.style.background = 'rgba(30, 41, 59, 0.9)';
        gpaPanel.style.border = '1px solid rgba(255,255,255,0.1)';
    }
}

function calculateGradeDistribution() {
    const distribution = {
        'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0,
        'C+': 0, 'C': 0, 'C-': 0, 'D+': 0, 'D': 0, 'F': 0
    };
    
    document.querySelectorAll('.course-row').forEach(row => {
        const courseId = row.getAttribute('data-course-id');
        const grade = courseGrades[courseId];
        if (grade && distribution[grade] !== undefined) {
            distribution[grade]++;
        }
    });
    
    return distribution;
}

function toggleGPADetails() {
    const details = document.getElementById('gpa-details');
    const button = document.querySelector('[onclick="toggleGPADetails()"] i');
    
    if (details) {
        if (details.style.display === 'none') {
            details.style.display = 'block';
            if (button) button.className = 'fas fa-chevron-up';
        } else {
            details.style.display = 'none';
            if (button) button.className = 'fas fa-chevron-down';
        }
    }
}

function showGradeModal(courseRow) {
    const courseId = courseRow.getAttribute('data-course-id');
    const courseName = courseRow.querySelector('.course-name').textContent.trim();
    const currentGrade = courseGrades[courseId] || '';
    
    const modal = document.createElement('div');
    modal.className = 'grade-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 20px; padding: 2rem; max-width: 400px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #1e293b;">Set Grade</h3>
                <button onclick="this.closest('.grade-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">&times;</button>
            </div>
            
            <p style="color: #475569; margin-bottom: 1rem;"><strong>${courseName}</strong></p>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1.5rem;">
                ${Object.entries(GRADE_POINTS).map(([grade, points]) => `
                    <button onclick="setGrade('${courseId}', '${grade}')" 
                            class="${currentGrade === grade ? 'btn' : 'link-btn'}"
                            style="padding: 0.75rem; ${currentGrade === grade ? 'background: #2563eb; color: white;' : ''}">
                        ${grade} (${points})
                    </button>
                `).join('')}
            </div>
            
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button onclick="clearGrade('${courseId}')" class="link-btn" style="color: #ef4444;">Clear</button>
                <button onclick="this.closest('.grade-modal').remove()" class="btn">Done</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function renderGradeOptions(currentGrade = '') {
    return `
        <option value="">Not completed yet</option>
        ${Object.entries(GRADE_POINTS).map(([grade, points]) => `
            <option value="${grade}" ${currentGrade === grade ? 'selected' : ''}>${grade} (${points})</option>
        `).join('')}
    `;
}

async function getSemesterGradeRows(semesterEl) {
    const level = parseInt(semesterEl.dataset.semester || '0', 10);
    const semesterName = semesterEl.dataset.semesterName || '';

    const data = await apiFetch('/planning/career-path/me');
    const semester = (data.semesters || []).find(item => (
        parseInt(item.level, 10) === level && String(item.semester_name || '') === semesterName
    ));

    hydrateCourseGradesFromSemesters(data.semesters || []);

    if (!semester?.courses?.length) {
        return [];
    }

    return semester.courses.map(course => ({
        id: course.id,
        code: course.code || '',
        name: course.name || 'Subject',
        credits: course.credits || 0,
        status: course.status || 'upcoming',
        grade: course.status === 'completed' ? (course.grade || '') : '',
    }));
}

async function showSemesterGradeModal(semesterEl) {
    if (!semesterEl) return;

    const semesterTitle = semesterEl.querySelector('.sem-info h3')?.textContent?.trim() || 'This level';
    const modal = document.createElement('div');
    modal.className = 'grade-modal grade-page';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0f172a;
        z-index: 2000;
        overflow: auto;
        padding: 32px;
    `;

    const renderShell = content => `
        <div style="max-width: 1040px; margin: 0 auto; color: #e2e8f0;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
                <div>
                    <h2 style="margin:0; color:#f8fafc; font-size:2rem;">Put Your Grades</h2>
                    <p style="margin:0.35rem 0 0; color:#94a3b8;">${escapeHtml(semesterTitle)} subjects loaded from your database study plan</p>
                </div>
                <button onclick="this.closest('.grade-modal').remove()" class="link-btn" style="border-color:rgba(96,165,250,0.45); color:#60a5fa; padding:10px 18px;">
                    <i class="fas fa-arrow-left"></i> Back to Plan
                </button>
            </div>
            ${content}
        </div>
    `;

    modal.innerHTML = renderShell(`
        <div style="background:#1e293b; border:1px solid rgba(96,165,250,0.35); border-radius:24px; padding:48px; text-align:center;">
            <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:#60a5fa;"></i>
            <div style="margin-top:1rem; color:#cbd5e1; font-weight:700;">Loading courses from database...</div>
        </div>
    `);

    document.body.appendChild(modal);

    try {
        const rows = await getSemesterGradeRows(semesterEl);

        if (!rows.length) {
            modal.innerHTML = renderShell(`
                <div style="background:#1e293b; border:1px solid rgba(96,165,250,0.35); border-radius:24px; padding:48px; text-align:center;">
                    <div style="color:#cbd5e1; font-weight:800;">No courses found for this level in the database.</div>
                </div>
            `);
            return;
        }

        modal.innerHTML = renderShell(`
            <div style="background:#1e293b; border:1px solid rgba(96,165,250,0.35); border-radius:24px; padding:22px; box-shadow:0 24px 80px rgba(0,0,0,0.25);">
                <div style="display:grid; grid-template-columns:minmax(0, 1fr) 130px 150px 180px; gap:1rem; padding:0 12px 12px; color:#94a3b8; font-weight:800; font-size:0.8rem; text-transform:uppercase;">
                    <span>Subject</span>
                    <span>Credits</span>
                    <span>Database Status</span>
                    <span>Grade</span>
                </div>
                <div style="display:grid; gap:0.75rem;">
                    ${rows.map(row => {
                        const courseId = String(row.id);
                        const currentGrade = row.grade || courseGrades[courseId] || '';
                        return `
                            <label style="display:grid; grid-template-columns:minmax(0, 1fr) 130px 150px 180px; gap:1rem; align-items:center; padding:1rem 12px; border:1px solid rgba(148,163,184,0.18); border-radius:16px; background:rgba(15,23,42,0.45);">
                                <span style="min-width:0;">
                                    <strong style="display:block; color:#f8fafc; font-size:1rem;">${escapeHtml(row.code)}: ${escapeHtml(row.name)}</strong>
                                </span>
                                <span style="color:#cbd5e1; font-weight:800;">${escapeHtml(String(row.credits || 0))} cr</span>
                                <span style="color:${row.status === 'completed' ? '#34d399' : '#94a3b8'}; font-weight:800; text-transform:capitalize;">${escapeHtml(String(row.status || 'upcoming').replace('_', ' '))}</span>
                                <select class="semester-grade-select" data-course-id="${escapeHtml(courseId)}" style="width:100%; padding:0.7rem; border:1px solid rgba(148,163,184,0.35); border-radius:12px; color:#e2e8f0; background:#334155;">
                                    ${renderGradeOptions(currentGrade)}
                                </select>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>

            <div style="display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1.5rem;">
                <button onclick="this.closest('.grade-modal').remove()" class="link-btn" style="padding:10px 18px;">Cancel</button>
                <button onclick="saveSemesterGrades(this.closest('.grade-modal'))" class="btn" style="padding:10px 22px;">
                    <i class="fas fa-save"></i> Save Grades
                </button>
            </div>
        `);
    } catch (error) {
        console.error('Could not load semester grades from database:', error);
        modal.innerHTML = renderShell(`
            <div style="background:#1e293b; border:1px solid rgba(239,68,68,0.45); border-radius:24px; padding:48px; text-align:center;">
                <div style="color:#f87171; font-weight:800;">Could not load courses from the database.</div>
                <div style="margin-top:0.5rem; color:#94a3b8;">${escapeHtml(error.message || 'Please make sure the backend is running and you are logged in.')}</div>
            </div>
        `);
    }
}

async function saveSemesterGrades(modal) {
    const selects = Array.from(modal.querySelectorAll('.semester-grade-select'));
    const saveBtn = modal.querySelector('.btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }

    try {
        for (const select of selects) {
            const courseId = select.dataset.courseId;
            const grade = select.value;
            const numericId = parseInt(courseId);
            if (isNaN(numericId)) continue;

            if (grade) {
                await apiFetch(`/planning/enroll/${numericId}?status=completed&grade=${encodeURIComponent(grade)}`, {
                    method: 'PUT'
                });
                courseGrades[courseId] = grade;
            } else {
                await apiFetch(`/planning/enroll/${numericId}?status=planned&grade=`, {
                    method: 'PUT'
                });
                delete courseGrades[courseId];
            }
        }

        saveGrades();
        modal.remove();
        await loadStudyPlan();
        showNotification('Grades saved and GPA updated', 'success');
    } catch (e) {
        console.error('Error saving semester grades:', e);
        showNotification('Failed to save one or more grades', 'error');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Grades';
        }
    }
}

async function setGrade(courseId, grade) {
    try {
        // Handle numeric IDs (from DB) vs string IDs (from custom)
        const numericId = parseInt(courseId);
        if (!isNaN(numericId)) {
            await apiFetch(`/planning/enroll/${numericId}?status=completed&grade=${encodeURIComponent(grade)}`, {
                method: 'PUT'
            });
        }
        
        courseGrades[courseId] = grade;
        saveGrades();
        updateGPADisplay();
        updateSemesterGPADisplays();
        addFinalGPADisplay();
        
        const courseRow = document.querySelector(`[data-course-id="${courseId}"]`) || 
                          document.querySelector(`[data-subject-id="${courseId}"]`);
        
        if (courseRow) {
            const existingBadge = courseRow.querySelector('.grade-badge');
            if (existingBadge) existingBadge.remove();
            
            const gradeBadge = document.createElement('span');
            gradeBadge.className = 'grade-badge';
            gradeBadge.style.cssText = `
                background: ${getGradeColor(grade)};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
                margin-left: 8px;
            `;
            gradeBadge.textContent = grade;
            
            const nameSpan = courseRow.querySelector('.course-name');
            if (nameSpan) nameSpan.appendChild(gradeBadge);
            
            // Mark as completed visually if it wasn't
            courseRow.classList.add('completed');
        }

        try {
            const data = await apiFetch('/planning/career-path/me');
            hydrateCourseGradesFromSemesters(data.semesters || []);
            updatePlanningHeaderStats(data);
            updateGPADisplay();
            updateSemesterGPADisplays();
            addFinalGPADisplay();
        } catch (statsError) {
            console.warn('Could not refresh planning header stats:', statsError);
        }
        
        showNotification(`Grade ${grade} set successfully`, 'success');
    } catch (e) {
        console.error('Error setting grade:', e);
        showNotification('Failed to save grade to database', 'error');
    }
    
    document.querySelector('.grade-modal')?.remove();
}

async function clearGrade(courseId) {
    const numericId = parseInt(courseId);
    if (!isNaN(numericId)) {
        try {
            await apiFetch(`/planning/enroll/${numericId}?status=planned&grade=`, {
                method: 'PUT'
            });
        } catch (e) {
            console.error('Error clearing grade:', e);
            showNotification('Failed to clear grade in database', 'error');
            return;
        }
    }

    delete courseGrades[courseId];
    saveGrades();
    updateGPADisplay();
    updateSemesterGPADisplays();
    addFinalGPADisplay();
    
    const courseRow = document.querySelector(`[data-course-id="${courseId}"]`);
    if (courseRow) {
        const gradeBadge = courseRow.querySelector('.grade-badge');
        if (gradeBadge) gradeBadge.remove();
    }
    
    document.querySelector('.grade-modal')?.remove();
}

function getGradeColor(grade) {
    const colors = {
        'A': '#10b981', 'A-': '#10b981',
        'B+': '#3b82f6', 'B': '#3b82f6', 'B-': '#3b82f6',
        'C+': '#f59e0b', 'C': '#f59e0b', 'C-': '#f59e0b',
        'D+': '#ef4444', 'D': '#ef4444', 'F': '#ef4444'
    };
    return colors[grade] || '#64748b';
}

function addGradeButtons() {
    document.querySelectorAll('.course-row').forEach(row => {
        if (row.querySelector('.grade-btn')) return;
        
        const courseId = row.getAttribute('data-course-id');
        const actions = row.querySelector('.course-actions');
        
        if (actions) {
            const gradeBtn = document.createElement('button');
            gradeBtn.className = 'grade-btn';
            gradeBtn.innerHTML = '<i class="fas fa-star"></i>';
            gradeBtn.title = 'Set Grade';
            gradeBtn.style.cssText = `
                background: none;
                border: none;
                color: #f59e0b;
                cursor: pointer;
                opacity: 0.5;
                transition: opacity 0.2s;
                padding: 4px;
                border-radius: 50%;
                margin-right: 5px;
            `;
            gradeBtn.onmouseover = () => gradeBtn.style.opacity = '1';
            gradeBtn.onmouseout = () => gradeBtn.style.opacity = '0.5';
            gradeBtn.onclick = (e) => {
                e.stopPropagation();
                showGradeModal(row);
            };
            
            actions.insertBefore(gradeBtn, actions.firstChild);
        }
        
        if (courseId && courseGrades[courseId]) {
            const grade = courseGrades[courseId];
            const gradeBadge = document.createElement('span');
            gradeBadge.className = 'grade-badge';
            gradeBadge.style.cssText = `
                background: ${getGradeColor(grade)};
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
                margin-left: 8px;
            `;
            gradeBadge.textContent = grade;
            
            const nameSpan = row.querySelector('.course-name');
            nameSpan.appendChild(gradeBadge);
        }
    });
}

const originalDeleteCourse = window.deleteCourse;
window.deleteCourse = function(button, subjectId) {
    const courseRow = button.closest('.course-row');
    const courseId = courseRow.getAttribute('data-course-id');
    
    if (courseId && courseGrades[courseId]) {
        delete courseGrades[courseId];
        saveGrades();
    }
    
    if (originalDeleteCourse) {
        originalDeleteCourse(button, subjectId);
    }
};

const originalCreateSemester = window.createSemesterWithSubjects;
window.createSemesterWithSubjects = function() {
    originalCreateSemester();
    setTimeout(addGradeButtons, 500);
    updateGPADisplay();
};

const originalAddSubject = window.addSubjectToSemester;
window.addSubjectToSemester = function() {
    originalAddSubject();
    setTimeout(addGradeButtons, 500);
    updateGPADisplay();
};

// ============================================
// PLANNING PAGE
// ============================================

const subjectDatabase = {
    foundation: [
        { id: "cs101", name: "Intro to Programming", credits: 4, required: false, code: "CS 101", department: "Computer Science" },
        { id: "math101", name: "Mathematics I", credits: 4, required: false, code: "MATH 101", department: "Mathematics" },
        { id: "eng101", name: "English I", credits: 3, required: false, code: "ENG 101", department: "English" },
        { id: "cs102", name: "Computer Fundamentals", credits: 3, required: false, code: "CS 102", department: "Computer Science" },
        { id: "gen101", name: "Study Skills", credits: 2, required: false, code: "GEN 101", department: "General" },
        { id: "it101", name: "Introduction to IT", credits: 3, required: false, code: "IT 101", department: "Information Technology" },
        { id: "math102", name: "Discrete Mathematics", credits: 3, required: false, code: "MATH 102", department: "Mathematics" },
        { id: "phy101", name: "Physics", credits: 4, required: false, code: "PHY 101", department: "Physics" }
    ],
    core: [
        { id: "cs201", name: "Object Oriented Programming", credits: 4, required: false, code: "CS 201", department: "Computer Science" },
        { id: "cs202", name: "Data Structures", credits: 4, required: false, code: "CS 202", department: "Computer Science" },
        { id: "cs203", name: "Database Systems", credits: 3, required: false, code: "CS 203", department: "Computer Science" },
        { id: "cs204", name: "Computer Networks", credits: 3, required: false, code: "CS 204", department: "Computer Science" },
        { id: "cs205", name: "Operating Systems", credits: 3, required: false, code: "CS 205", department: "Computer Science" },
        { id: "cs206", name: "Web Development", credits: 3, required: false, code: "CS 206", department: "Computer Science" },
        { id: "cs207", name: "Software Engineering", credits: 3, required: false, code: "CS 207", department: "Computer Science" },
        { id: "cs208", name: "Algorithms", credits: 3, required: false, code: "CS 208", department: "Computer Science" }
    ],
    intelligent: [
        { id: "cs301", name: "Machine Learning", credits: 4, required: false, code: "CS 301", department: "Computer Science" },
        { id: "cs302", name: "Artificial Intelligence", credits: 4, required: false, code: "CS 302", department: "Computer Science" },
        { id: "cs303", name: "Data Science", credits: 3, required: false, code: "CS 303", department: "Computer Science" },
        { id: "cs304", name: "Neural Networks", credits: 3, required: false, code: "CS 304", department: "Computer Science" },
        { id: "cs305", name: "Computer Vision", credits: 3, required: false, code: "CS 305", department: "Computer Science" },
        { id: "cs306", name: "Natural Language Processing", credits: 3, required: false, code: "CS 306", department: "Computer Science" },
        { id: "cs307", name: "Deep Learning", credits: 3, required: false, code: "CS 307", department: "Computer Science" },
        { id: "cs308", name: "Reinforcement Learning", credits: 3, required: false, code: "CS 308", department: "Computer Science" }
    ],
    advanced: [
        { id: "cs401", name: "Advanced Algorithms", credits: 4, required: false, code: "CS 401", department: "Computer Science" },
        { id: "cs402", name: "Distributed Systems", credits: 4, required: false, code: "CS 402", department: "Computer Science" },
        { id: "cs403", name: "Cloud Computing", credits: 3, required: false, code: "CS 403", department: "Computer Science" },
        { id: "cs404", name: "Big Data Analytics", credits: 3, required: false, code: "CS 404", department: "Computer Science" },
        { id: "cs405", name: "Cybersecurity", credits: 3, required: false, code: "CS 405", department: "Computer Science" },
        { id: "cs406", name: "Blockchain Technology", credits: 3, required: false, code: "CS 406", department: "Computer Science" },
        { id: "cs407", name: "Quantum Computing", credits: 3, required: false, code: "CS 407", department: "Computer Science" },
        { id: "cs408", name: "Advanced Databases", credits: 3, required: false, code: "CS 408", department: "Computer Science" }
    ],
    specialization: [
        { id: "sec501", name: "Advanced Cybersecurity", credits: 4, required: false, code: "SEC 501", department: "Security" },
        { id: "sec502", name: "Network Security", credits: 4, required: false, code: "SEC 502", department: "Security" },
        { id: "sec503", name: "Cryptography", credits: 3, required: false, code: "SEC 503", department: "Security" },
        { id: "sec504", name: "Ethical Hacking", credits: 3, required: false, code: "SEC 504", department: "Security" },
        { id: "sec505", name: "Digital Forensics", credits: 3, required: false, code: "SEC 505", department: "Security" },
        { id: "sec506", name: "Security Operations", credits: 3, required: false, code: "SEC 506", department: "Security" },
        { id: "sec507", name: "Risk Management", credits: 3, required: false, code: "SEC 507", department: "Security" },
        { id: "sec508", name: "Compliance & Audit", credits: 3, required: false, code: "SEC 508", department: "Security" }
    ],
    capstone: [
        { id: "cap601", name: "Capstone Project I", credits: 3, required: false, code: "CAP 601", department: "Capstone" },
        { id: "cap602", name: "Capstone Project II", credits: 3, required: false, code: "CAP 602", department: "Capstone" },
        { id: "cap603", name: "Research Methods", credits: 3, required: false, code: "CAP 603", department: "Capstone" },
        { id: "cap604", name: "Technical Writing", credits: 2, required: false, code: "CAP 604", department: "Capstone" },
        { id: "cap605", name: "Professional Ethics", credits: 2, required: false, code: "CAP 605", department: "Capstone" },
        { id: "cap606", name: "Industry Internship", credits: 3, required: false, code: "CAP 606", department: "Capstone" },
        { id: "cap607", name: "Portfolio Development", credits: 2, required: false, code: "CAP 607", department: "Capstone" },
        { id: "cap608", name: "Career Preparation", credits: 1, required: false, code: "CAP 608", department: "Capstone" }
    ],
    final: [
        { id: "fin701", name: "Final Project", credits: 4, required: false, code: "FIN 701", department: "Final" },
        { id: "fin702", name: "Thesis", credits: 4, required: false, code: "FIN 702", department: "Final" },
        { id: "fin703", name: "Comprehensive Exam", credits: 2, required: false, code: "FIN 703", department: "Final" },
        { id: "fin704", name: "Industry Seminar", credits: 2, required: false, code: "FIN 704", department: "Final" },
        { id: "fin705", name: "Graduate Workshop", credits: 1, required: false, code: "FIN 705", department: "Final" },
        { id: "fin706", name: "Professional Development", credits: 2, required: false, code: "FIN 706", department: "Final" }
    ]
};

let planningSelectedSubjects = [];
let planningCurrentSemester = null;
let planningDropMode = false;
let takenSubjects = new Set();

const TOTAL_REQUIRED_CREDITS = 128;

function initPlanning() {
    loadPlanningData();
    loadStudyPlan(); // New: Load from database
    updatePlanningDate();
    loadTakenSubjects();
    initializePlanningInteractive();
    calculateAllCredits();
    loadSavedGrades();
    setTimeout(addGradeButtons, 500);
    setTimeout(updateGPADisplay, 500);
    setTimeout(addFinalGPADisplay, 500);
    setTimeout(updateSemesterGPADisplays, 500);
}

async function loadTakenSubjects() {
    try {
        const overview = await apiFetch('/planning/overview/me');
        if (overview && overview.enrollments) {
            takenSubjects = new Set(
                overview.enrollments
                    .filter(e => e.status === 'completed')
                    .map(e => e.course_id.toString())
            );
        }
    } catch (e) {
        console.error('Error loading taken subjects:', e);
        // Fallback to localStorage if backend fails
        const saved = localStorage.getItem('edumate_taken_subjects');
        if (saved) {
            takenSubjects = new Set(JSON.parse(saved));
        }
    }
    
    saveTakenSubjects();
}

function saveTakenSubjects() {
    localStorage.setItem('edumate_taken_subjects', JSON.stringify([...takenSubjects]));
}

function updatePlanningDate() {
    const dateElement = document.getElementById('planning-date');
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

function initializePlanningInteractive() {
    const careerTag = document.querySelector('.career-tag');
    const careerBadge = document.querySelector('.career-badge');
    const addSemesterBtn = document.getElementById('add-semester-btn');
    
    if (careerTag && careerBadge) {
        // createPathSwitch(careerTag, careerBadge);
    }
    
    if (addSemesterBtn) {
        addSemesterBtn.addEventListener('click', openSubjectModal);
    }
    
    document.querySelectorAll('.semester-item').forEach(sem => {
        initializeSemesterCard(sem);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            if (addSemesterBtn) addSemesterBtn.click();
        }
        if (e.key === 'Escape') {
            closeSubjectModal();
            closeAddSubjectModal();
        }
    });
}

function initializeSemesterCard(semester) {
    const title = semester.querySelector('h3');
    if (title) {
        title.addEventListener('blur', updateLastUpdated);
    }
}

function createSemesterActions(semester) {
    const actions = document.createElement('div');
    actions.className = 'semester-actions';
    actions.innerHTML = `
        <button class="add-course-btn" onclick="showAddSubjectModal(this)">
            <i class="fas fa-plus-circle"></i> add subject
        </button>
        <button class="drop-course-btn" onclick="showDropSubjectsMode(this)">
            <i class="fas fa-minus-circle"></i> drop subjects
        </button>
    `;
    semester.appendChild(actions);
    return actions;
}

function createPathSwitch(careerTag, careerBadge) {
    const switchWrapper = document.createElement('div');
    switchWrapper.className = 'path-switch-wrapper';
    switchWrapper.style.cssText = `
        display: flex;
        align-items: center;
        margin-left: 12px;
        background: rgba(255,255,255,0.2);
        border-radius: 40px;
        padding: 3px;
    `;
    
    const previewBtn = document.createElement('button');
    previewBtn.className = 'switch-option active';
    previewBtn.textContent = 'Preview';
    previewBtn.style.cssText = `
        border: none;
        background: #ffffff;
        color: #1e293b;
        padding: 6px 16px;
        border-radius: 30px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    
    const planBtn = document.createElement('button');
    planBtn.className = 'switch-option';
    planBtn.textContent = 'Plan';
    planBtn.style.cssText = `
        border: none;
        background: transparent;
        color: white;
        padding: 6px 16px;
        border-radius: 30px;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
    `;
    
    previewBtn.addEventListener('click', () => {
        if (previewBtn.classList.contains('active')) return;
        [previewBtn, planBtn].forEach(btn => btn.classList.remove('active'));
        previewBtn.classList.add('active');
        previewBtn.style.background = '#ffffff';
        previewBtn.style.color = '#1e293b';
        planBtn.style.background = 'transparent';
        planBtn.style.color = 'white';
        careerBadge.innerHTML = '🔍 Preview';
        switchPlanningView('preview');
    });
    
    planBtn.addEventListener('click', () => {
        if (planBtn.classList.contains('active')) return;
        [previewBtn, planBtn].forEach(btn => btn.classList.remove('active'));
        planBtn.classList.add('active');
        planBtn.style.background = '#ffffff';
        planBtn.style.color = '#1e293b';
        previewBtn.style.background = 'transparent';
        previewBtn.style.color = 'white';
        const careerPathName = document.getElementById('career-name-display')?.textContent || 'My Path';
        careerBadge.innerHTML = `🛡️ ${careerPathName}`;
        switchPlanningView('plan');
    });
    
    switchWrapper.appendChild(previewBtn);
    switchWrapper.appendChild(planBtn);
    careerTag.appendChild(switchWrapper);
    
    careerBadge.style.cursor = 'pointer';
    careerBadge.addEventListener('click', () => {
        if (planBtn.classList.contains('active')) {
            previewBtn.click();
        } else {
            planBtn.click();
        }
    });
}

function calculateTotalCredits() {
    const allCourseRows = document.querySelectorAll('.course-row');
    let total = 0;
    
    allCourseRows.forEach(row => {
        const creditSpan = row.querySelector('.course-credits');
        if (creditSpan) {
            const match = creditSpan.textContent.match(/(\d+)/);
            if (match) {
                total += parseInt(match[1]);
            }
        }
    });
    
    return total;
}

function calculateEarnedCredits() {
    const earnedElement = document.getElementById('earned-credits');
    return earnedElement ? parseInt(earnedElement.textContent) || 0 : 0;
}

function updateAllCredits() {
    const totalCredits = calculateTotalCredits();
    const earnedCredits = calculateEarnedCredits();
    const remainingCredits = totalCredits - earnedCredits;
    
    const totalElement = document.getElementById('total-credits');
    if (totalElement) {
        totalElement.textContent = totalCredits;
    }
    
    const remainingElement = document.getElementById('remaining-credits');
    const remainingDisplay = document.getElementById('remaining-credits-display');
    if (remainingElement) remainingElement.textContent = remainingCredits;
    if (remainingDisplay) remainingDisplay.textContent = remainingCredits;
    
    const percentElement = document.getElementById('progress-percentage');
    const progressBar = document.getElementById('progress-bar');
    
    if (totalCredits > 0) {
        const percent = Math.min(Math.round((earnedCredits / TOTAL_REQUIRED_CREDITS) * 100), 100);
        if (percentElement) percentElement.textContent = percent + '%';
        if (progressBar) {
            progressBar.style.width = percent + '%';
            progressBar.style.transition = 'width 0.5s ease';
        }
    }
    
    const coursesLeft = document.getElementById('courses-left');
    if (coursesLeft) {
        const avgCreditsPerCourse = 3;
        const coursesRemaining = Math.ceil((TOTAL_REQUIRED_CREDITS - totalCredits) / avgCreditsPerCourse);
        coursesLeft.textContent = Math.max(0, coursesRemaining);
    }
    
    updateLastUpdated();
}

function updateSemesterCredits(semesterElement) {
    const courseRows = semesterElement.querySelectorAll('.course-row');
    let total = 0;
    
    courseRows.forEach(row => {
        const creditSpan = row.querySelector('.course-credits');
        if (creditSpan) {
            const match = creditSpan.textContent.match(/(\d+)/);
            if (match) total += parseInt(match[1]);
        }
    });
    
    const creditSum = semesterElement.querySelector('.credit-sum');
    if (creditSum) {
        creditSum.textContent = `${total} credits`;
        creditSum.style.transform = 'scale(1.1)';
        setTimeout(() => creditSum.style.transform = 'scale(1)', 100);
    }
    
    updateAllCredits();
}

function calculateAllCredits() {
    document.querySelectorAll('.semester-item').forEach(sem => {
        updateSemesterCredits(sem);
    });
    
    updateAllCredits();
}

function openSubjectModal() {
    document.getElementById('semester-subjects-modal').style.display = 'flex';
    planningSelectedSubjects = [];
    loadSubjectsForSemester();
}

function closeSubjectModal() {
    document.getElementById('semester-subjects-modal').style.display = 'none';
    planningSelectedSubjects = [];
    updateSelectedSubjectsDisplay();
}

function showAddSubjectModal(button) {
    planningCurrentSemester = button.closest('.semester-item');
    const modal = document.getElementById('add-subject-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    // Reset form
    const idInput = document.getElementById('new-subject-id');
    const searchInput = document.getElementById('add-subject-search');
    const statusSel = document.getElementById('new-subject-status');
    const gradeSel = document.getElementById('new-subject-grade');
    const gradeGroup = document.getElementById('grade-input-group');
    const selectedDisplay = document.getElementById('selected-course-display');
    const selectedName = document.getElementById('selected-course-name');

    if (idInput) idInput.value = '';
    if (searchInput) searchInput.value = '';
    if (statusSel) statusSel.value = 'planned';
    if (gradeSel) gradeSel.value = '';
    if (gradeGroup) gradeGroup.style.display = 'none';
    if (selectedDisplay) selectedDisplay.style.display = 'none';
    if (selectedName) selectedName.textContent = '';

    loadAvailableSubjectsForAdd();
}

function closeAddSubjectModal() {
    const modal = document.getElementById('add-subject-modal');
    if (modal) modal.style.display = 'none';
    planningCurrentSemester = null;
}

function toggleGradeInput(status) {
    const group = document.getElementById('grade-input-group');
    if (group) group.style.display = (status === 'completed') ? 'block' : 'none';
}

// All available courses cached for search filtering
let _addSubjectAllCourses = [];

async function loadAvailableSubjectsForAdd() {
    const listEl = document.getElementById('add-subjects-list');
    if (!listEl) return;

    listEl.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted);"><i class="fas fa-spinner fa-spin"></i> Loading courses...</div>';

    try {
        const courses = await apiFetch('/planning/courses');
        _addSubjectAllCourses = courses || [];
        renderAddSubjectList(_addSubjectAllCourses);
    } catch (e) {
        console.error('Error loading courses:', e);
        listEl.innerHTML = '<div style="text-align:center; padding:20px; color:#ef4444;">Failed to load courses from database.</div>';
    }
}

function renderAddSubjectList(courses) {
    const listEl = document.getElementById('add-subjects-list');
    if (!listEl) return;

    if (!courses || courses.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted);">No courses found.</div>';
        return;
    }

    listEl.innerHTML = courses.map(c => `
        <div onclick="quickAddSubject('${c.id}', '${c.name.replace(/'/g, "'").replace(/"/g, '&quot;')}', ${c.credits}, '${c.code}')"
             style="display:flex; align-items:center; justify-content:space-between;
                    padding:9px 12px; border-radius:8px; cursor:pointer; transition:background 0.15s;"
             onmouseover="this.style.background='rgba(139,92,246,0.12)'"
             onmouseout="this.style.background='transparent'">
            <div>
                <strong style="color:var(--primary);">${c.code}</strong>
                <span style="color:var(--text); margin-left:8px;">${c.name}</span>
            </div>
            <span style="color:var(--muted); font-size:0.8rem; white-space:nowrap; margin-left:12px;">${c.credits} cr</span>
        </div>
    `).join('');
}

function filterAddSubjectList(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
        renderAddSubjectList(_addSubjectAllCourses);
        return;
    }
    const filtered = _addSubjectAllCourses.filter(c =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
    renderAddSubjectList(filtered);
}

function quickAddSubject(id, name, credits, code) {
    // Set hidden id field
    const idInput = document.getElementById('new-subject-id');
    if (idInput) idInput.value = id;

    // Show selected course name
    const display = document.getElementById('selected-course-display');
    const nameEl = document.getElementById('selected-course-name');
    if (display) display.style.display = 'block';
    if (nameEl) nameEl.textContent = `${code}: ${name} (${credits} cr)`;

    // Highlight chosen row
    document.querySelectorAll('#add-subjects-list div[onclick]').forEach(el => {
        el.style.background = 'transparent';
    });
    // Find the clicked row by matching id in onclick attribute
    const rows = document.querySelectorAll('#add-subjects-list div[onclick]');
    rows.forEach(el => {
        if (el.getAttribute('onclick').startsWith(`quickAddSubject('${id}'`)) {
            el.style.background = 'rgba(139,92,246,0.18)';
        }
    });
}

async function loadSubjectsForSemester() {
    const semesterType = document.getElementById('semester-type').value;
    const subjectsList = document.getElementById('subjects-list');
    const customInput = document.getElementById('custom-subject-input');
    
    if (semesterType === 'custom') {
        subjectsList.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;">Enter your custom subject below</p>';
        customInput.style.display = 'block';
        planningSelectedSubjects = [];
        updateSelectedSubjectsDisplay();
    } else {
        customInput.style.display = 'none';
        subjectsList.innerHTML = '<p style="text-align:center;padding:20px;">Loading subjects...</p>';
        
        try {
            let subjects = [];
            if (semesterType === 'all') {
                subjects = await apiFetch('/planning/courses');
            } else {
                subjects = subjectDatabase[semesterType] || [];
            }
            
            // Filter out subjects already taken
            const availableSubjects = subjects.filter(s => !takenSubjects.has(s.id.toString()));
            
            if (availableSubjects.length === 0) {
                subjectsList.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px;">All subjects in this category have been taken!</p>';
                return;
            }
            
            subjectsList.innerHTML = availableSubjects.map(subject => `
                <div class="subject-item">
                    <input type="checkbox" 
                           value="${subject.id}"
                           data-id="${subject.id}"
                           data-name="${subject.name}"
                           data-credits="${subject.credits}"
                           data-code="${subject.code}"
                           ${subject.required ? 'checked disabled' : ''}
                           onchange="toggleSubject('${subject.id}', '${subject.name}', ${subject.credits}, '${subject.code}', this.checked)">
                    <div style="flex: 1;">
                        <strong>${subject.code}: ${subject.name}</strong>
                        <span style="color: #64748b; margin-left: 10px;">${subject.credits} cr</span>
                        <span style="color: #2563eb; margin-left: 10px; font-size: 0.85rem;">${subject.department || ''}</span>
                        ${subject.required ? '<span class="required-badge">Required</span>' : ''}
                    </div>
                </div>
            `).join('');
            
            // Auto-select required subjects if any
            availableSubjects.filter(s => s.required).forEach(s => {
                if (!planningSelectedSubjects.find(sub => sub.id === s.id.toString())) {
                    planningSelectedSubjects.push({ 
                        id: s.id.toString(), 
                        name: s.name, 
                        credits: s.credits,
                        code: s.code 
                    });
                }
            });
            updateSelectedSubjectsDisplay();
        } catch (e) {
            console.error('Error loading subjects:', e);
            subjectsList.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px;">Failed to load subjects.</p>';
        }
    }
}

function toggleSubject(id, name, credits, code, checked) {
    const subjectId = String(id);
    planningSelectedSubjects = planningSelectedSubjects.filter(subject => String(subject.id) !== subjectId);
    if (checked) {
        planningSelectedSubjects.push({
            id: subjectId,
            name,
            credits: Number(credits) || 0,
            code
        });
    }
    updateSelectedSubjectsDisplay();
}


async function addSubjectToSemester() {
    const subjectIdInput = document.getElementById('new-subject-id');
    const subjectId = subjectIdInput ? subjectIdInput.value.trim() : '';
    const status = document.getElementById('new-subject-status')?.value || 'planned';
    const grade = document.getElementById('new-subject-grade')?.value || null;

    // Get name from selected course display for feedback
    const selectedNameEl = document.getElementById('selected-course-name');
    const subjectName = selectedNameEl ? selectedNameEl.textContent : 'Course';

    if (!subjectId || isNaN(parseInt(subjectId))) {
        showNotification('⚠️ Please select a course from the list first.', 'warning');
        return;
    }

    if (!planningCurrentSemester) {
        showNotification('⚠️ No semester selected. Please open this modal from a semester card.', 'warning');
        return;
    }

    // Derive semester to save — use data-semester-name if available (e.g. "Fall", "Spring")
    let semesterToSave;
    const semSeason = planningCurrentSemester.dataset.semesterName || planningCurrentSemester.dataset.semesterSeason;
    if (semSeason) {
        semesterToSave = semSeason; // e.g. "Fall", "Spring"
    } else {
        const semesterTitle = planningCurrentSemester.querySelector('h3')?.textContent?.trim() || 'Fall';
        semesterToSave = semesterTitle;
        if (semesterTitle.includes(' - ')) {
            semesterToSave = semesterTitle.split(' - ').pop().trim();
        } else if (/^sem\s+\d+$/i.test(semesterTitle)) {
            semesterToSave = semesterTitle.replace(/^sem\s+/i, 'Semester ');
        }
    }

    const btn = document.getElementById('add-subject-submit-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    try {
        await apiFetch('/planning/me/courses', {
            method: 'POST',
            body: JSON.stringify({
                course_id: parseInt(subjectId),
                semester: semesterToSave,
                status: status,
                grade: (status === 'completed' && grade) ? grade : null
            })
        });

        showNotification(`✅ "${subjectName}" added successfully!`, 'success');
        closeAddSubjectModal();

        // Refresh views that show the student's courses
        try { await loadStudyPlan(); } catch(e) {}
        try { await loadAcademicPlan(); } catch(e) {}
        try { await loadCareerTimeline(); } catch(e) {}
        // Refresh header stats independently
        try {
            const stats = await apiFetch('/planning/career-path/me');
            updatePlanningHeaderStats(stats);
        } catch(e) {}

    } catch (e) {
        console.error('Error adding subject to DB:', e);
        const msg = (e.message && e.message.includes('already')) 
            ? 'This course is already in your plan for this semester.'
            : (e.message || 'Failed to add subject. Please try again.');
        showNotification('❌ ' + msg, 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Subject'; }
    }
}

function updateSelectedSubjectsDisplay() {
    const listElement = document.getElementById('selected-subjects-list');
    const countElement = document.getElementById('selected-count');
    if (!listElement || !countElement) return;
    
    countElement.textContent = planningSelectedSubjects.length;
    
    if (planningSelectedSubjects.length === 0) {
        listElement.innerHTML = '<p style="color: #94a3b8; text-align: center;">No subjects selected yet</p>';
    } else {
        listElement.innerHTML = planningSelectedSubjects.map(subject => `
            <div class="selected-subject-item">
                <div>
                    <span>${subject.code}: ${subject.name}</span>
                </div>
                <span style="color: #2563eb; font-weight: 600;">${subject.credits} cr</span>
            </div>
        `).join('');
    }
}

async function createSemesterWithSubjects() {
    const semesterTypeEl = document.getElementById('semester-type');
    const selectedType = semesterTypeEl.options[semesterTypeEl.selectedIndex].text;
    const semesterCardsContainer = document.getElementById('semester-cards-container');
    const currentSemesters = document.querySelectorAll('.semester-item');
    const nextSemNum = currentSemesters.length + 1;
    
    if (document.getElementById('semester-type').value === 'custom') {
        const customName = document.getElementById('custom-subject-name').value;
        const customCredits = document.getElementById('custom-subject-credits').value;
        
        if (!customName) {
            alert('Please enter a subject name for custom semester');
            return;
        }
        
        planningSelectedSubjects = [{ 
            id: 'custom_' + Date.now(),
            name: customName, 
            credits: parseInt(customCredits),
            code: 'CUSTOM'
        }];
    }
    
    if (planningSelectedSubjects.length === 0) {
        alert('Please select at least one subject');
        return;
    }
    
    // Save to database
    try {
        const enrollData = planningSelectedSubjects
            .filter(s => !s.id.toString().startsWith('custom_'))
            .map(s => ({
                course_id: parseInt(s.id),
                semester: selectedType,
                status: 'planned'
            }));
            
        if (enrollData.length > 0) {
            await apiFetch('/planning/enroll', {
                method: 'POST',
                body: JSON.stringify(enrollData)
            });
        }
        
        showNotification(`Semester saved to database`, 'success');
    } catch (e) {
        console.error('Error saving semester:', e);
        showNotification('Failed to save some courses to database', 'warning');
    }

    const totalCredits = planningSelectedSubjects.reduce((sum, subject) => sum + subject.credits, 0);
    
    const newSemester = document.createElement('div');
    newSemester.className = 'semester-item';
    newSemester.setAttribute('data-semester', nextSemNum);
    newSemester.style.opacity = '0';
    newSemester.style.transform = 'translateY(20px)';
    newSemester.style.transition = 'all 0.3s ease';
    
    const coursesHTML = planningSelectedSubjects.map(subject => {
        const courseId = subject.id;
        takenSubjects.add(subject.id.toString());
        
        return `
            <div class="course-row" data-course-id="${courseId}" data-subject-id="${courseId}">
                <span class="course-name">
                    <i class="fas fa-circle"></i> 
                    <span class="course-code">${subject.code}:</span> ${subject.name}
                </span>
                <span class="course-credits" data-credits="${subject.credits}">${subject.credits} cr</span>
                <div class="course-actions">
                    <button class="delete-course-btn" onclick="deleteCourse(this, '${courseId}')">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    newSemester.innerHTML = `
        <div class="semester-head">
            <div class="semester-title">
                <span class="sem-num">sem ${nextSemNum}</span>
                <h3 contenteditable="true">${selectedType}</h3>
            </div>
            <div class="credit-sum">${totalCredits} credits</div>
        </div>
        <div class="courses-container">
            ${coursesHTML}
        </div>
        <div class="semester-actions">
            <button class="add-course-btn" onclick="showAddSubjectModal(this)">
                <i class="fas fa-plus-circle"></i> add subject
            </button>
            <button class="drop-course-btn" onclick="showDropSubjectsMode(this)">
                <i class="fas fa-minus-circle"></i> drop subjects
            </button>
        </div>
    `;
    
    semesterCardsContainer.appendChild(newSemester);
    saveTakenSubjects();
    
    setTimeout(() => {
        newSemester.style.opacity = '1';
        newSemester.style.transform = 'translateY(0)';
    }, 10);
    
    updateSemesterCounter();
    calculateAllCredits();
    closeSubjectModal();
    
    updatePlanningHeaderStats();
    loadCareerTimeline(); // Refresh path view
    
    setTimeout(addGradeButtons, 500);
    updateGPADisplay();
    updateSemesterGPADisplays();
    addFinalGPADisplay();
}

async function deleteCourse(button, subjectId) {
    const courseRow = button.closest('.course-row');
    const semesterItem = courseRow.closest('.semester-item');
    const subjectName = courseRow.querySelector('.course-name').textContent.trim();
    
    if (!confirm(`Are you sure you want to delete "${subjectName}"?`)) return;
    
    const numericId = parseInt(subjectId);
    if (!isNaN(numericId)) {
        try {
            await apiFetch(`/planning/enroll/${numericId}`, {
                method: 'DELETE'
            });
            showNotification(`"${subjectName}" removed from database`, 'info');
        } catch (e) {
            console.error('Error deleting subject from DB:', e);
            showNotification('Failed to remove from database', 'error');
            return;
        }
    }
    
    if (subjectId && !subjectId.toString().startsWith('custom_')) {
        takenSubjects.delete(subjectId.toString());
        saveTakenSubjects();
    }
    
    courseRow.style.opacity = '0';
    courseRow.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        courseRow.remove();
        updateSemesterCredits(semesterItem);
        updateGPADisplay();
        updateSemesterGPADisplays();
        addFinalGPADisplay();
        updatePlanningHeaderStats();
        loadCareerTimeline();
    }, 300);
}

function showDropSubjectsMode(button) {
    const semesterItem = button.closest('.semester-item');
    const courseRows = semesterItem.querySelectorAll('.course-row');
    const dropBtn = button;
    
    if (planningDropMode) {
        exitDropMode(semesterItem);
    } else {
        planningDropMode = true;
        dropBtn.innerHTML = '<i class="fas fa-check-circle"></i> done dropping';
        dropBtn.style.background = '#10b981';
        dropBtn.style.color = 'white';
        dropBtn.style.border = '1px solid #10b981';
        
        courseRows.forEach(row => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'drop-checkbox';
            
            const subjectId = row.getAttribute('data-subject-id');
            if (subjectId) {
                checkbox.setAttribute('data-subject-id', subjectId);
            }
            
            row.insertBefore(checkbox, row.firstChild);
            row.style.background = '#fee2e2';
            row.style.borderRadius = '8px';
            row.style.padding = '4px 8px';
        });
        
        const deleteSelectedBtn = document.createElement('button');
        deleteSelectedBtn.className = 'delete-selected-btn';
        deleteSelectedBtn.innerHTML = '<i class="fas fa-trash"></i> delete selected';
        deleteSelectedBtn.onclick = () => deleteSelectedCourses(semesterItem);
        
        semesterItem.querySelector('.semester-actions').appendChild(deleteSelectedBtn);
    }
}

function exitDropMode(semesterItem) {
    planningDropMode = false;
    
    semesterItem.querySelectorAll('.drop-checkbox').forEach(c => c.remove());
    semesterItem.querySelectorAll('.course-row').forEach(row => {
        row.style.background = '';
        row.style.borderRadius = '';
        row.style.padding = '';
    });
    
    const dropBtn = semesterItem.querySelector('.drop-course-btn');
    if (dropBtn) {
        dropBtn.innerHTML = '<i class="fas fa-minus-circle"></i> drop subjects';
        dropBtn.style.background = '';
        dropBtn.style.color = '#ef4444';
        dropBtn.style.border = '1px dashed #ef4444';
    }
    
    semesterItem.querySelector('.delete-selected-btn')?.remove();
}

function deleteSelectedCourses(semesterItem) {
    const checkboxes = semesterItem.querySelectorAll('.drop-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('Please select at least one subject to delete');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${checkboxes.length} selected subject(s)?`)) {
        checkboxes.forEach(checkbox => {
            const courseRow = checkbox.closest('.course-row');
            const subjectId = checkbox.getAttribute('data-subject-id');
            
            if (subjectId && !subjectId.startsWith('custom_')) {
                takenSubjects.delete(subjectId);
            }
            
            courseRow.style.opacity = '0';
            courseRow.style.transform = 'translateX(20px)';
            
            setTimeout(() => courseRow.remove(), 200);
        });
        
        setTimeout(() => {
            saveTakenSubjects();
            updateSemesterCredits(semesterItem);
            exitDropMode(semesterItem);
            showNotification(`Deleted ${checkboxes.length} subject(s)`, 'info');
            updateGPADisplay();
            updateSemesterGPADisplays();
            addFinalGPADisplay();
        }, 300);
    }
}

function updateSemesterCounter() {
    const semCounter = document.getElementById('semester-counter');
    const currentSemesters = document.querySelectorAll('.semester-item').length;
    const remaining = Math.max(0, 8 - currentSemesters);
    semCounter.innerHTML = `<i class="fas-regular fa-calendar-plus"></i> ${remaining} more semesters planned`;
}

function updateLastUpdated() {
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        lastUpdated.innerHTML = `<i class="fas fa-sync-alt"></i> last updated today at ${timeStr}`;
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

function showNotification(message, type = 'info') {
    ensurePopupStyles();
    let stack = document.getElementById('edumate-popup-stack');
    if (!stack) {
        stack = document.createElement('div');
        stack.id = 'edumate-popup-stack';
        stack.className = 'edumate-popup-stack';
        document.body.appendChild(stack);
    }

    const notification = document.createElement('div');
    notification.className = `edumate-popup ${type || 'info'}`;
    notification.innerHTML = `
        <button class="edumate-popup-close" type="button" aria-label="Close">×</button>
        <div class="edumate-popup-title">${type || 'info'}</div>
        <div class="edumate-popup-message">${normalizePopupMessage(message)}</div>
    `;
    notification.querySelector('.edumate-popup-close')?.addEventListener('click', () => notification.remove());
    stack.appendChild(notification);

    setTimeout(() => {
        if (!notification.parentNode) return;
        notification.classList.add('edumate-popup-hide');
        setTimeout(() => notification.remove(), 220);
    }, 3000);
}

async function updatePlanningHeaderStats() {
    try {
        const overview = await apiFetch('/planning/overview/me');
        if (!overview) return;

        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        
        el('total-credits', overview.total_credits);
        el('earned-credits', overview.completed_credits);
        el('remaining-credits', overview.remaining_credits);
        el('current-gpa', overview.current_gpa.toFixed(2));
        
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${overview.progress_percentage}%`;
        }
        const percentText = document.getElementById('progress-percentage');
        if (percentText) {
            percentText.textContent = `${overview.progress_percentage}%`;
        }

        // Update other labels if they exist
        el('path-progress-percent', `${overview.progress_percentage}%`);
        el('preview-progress-text', `${overview.progress_percentage}% Complete`);
        
    } catch (e) {
        console.error('Error updating planning stats:', e);
    }
}

async function loadPlanningData() {
    console.log('Loading planning data UI...');
    // Fetch and update header stats first
    await updatePlanningHeaderStats();
    
    // Render the UI components
    loadCareerTimeline();
    loadSummerCourses();
    loadAdvisorSuggestions();
}

function savePlannerData() {
    if (window.savePlannerData && window.savePlannerData !== savePlannerData) {
        return window.savePlannerData.apply(this, arguments);
    }
    console.warn('savePlannerData is handled by backend_api.js');
}

function saveCareerRoadmap() {
    if (window.saveCareerRoadmap && window.saveCareerRoadmap !== saveCareerRoadmap) {
        return window.saveCareerRoadmap.apply(this, arguments);
    }
    console.warn('saveCareerRoadmap is handled by backend_api.js');
}

function calculateProfileCompletion() {
    const uname = sessionStorage.getItem('edumate_username');
    if (!uname || !users[uname]) return 0;
    
    const user = users[uname];
    let completion = 0;
    
    if (user.name?.trim()) completion += 20;
    if (user.email?.trim()) completion += 20;
    if (user.major?.trim()) completion += 20;
    if (user.skills?.trim()) completion += 20;
    if (user.profilePic && !user.profilePic.includes('placeholder')) completion += 20;
    
    return Math.min(completion, 100);
}

function updateProfileCompletion() {
    const percentage = calculateProfileCompletion();
    const progressBar = document.getElementById('profile-progress');
    const percentageText = document.getElementById('profile-percentage');
    
    if (progressBar && percentageText) {
        progressBar.style.width = `${percentage}%`;
        percentageText.textContent = `${percentage}%`;
    }
}

function initDashboard() {
    updateDashboardDate();
    loadDashboardStats();
    loadUpcomingEvents();
    loadRecentActivity();
    startDashboardAnimations();
}

function updateDashboardDate() {
    const dateElement = document.getElementById('dashboard-date');
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

function loadDashboardStats() {
    if (window.loadDashboardStats && window.loadDashboardStats !== loadDashboardStats) {
        return window.loadDashboardStats.apply(this, arguments);
    }
    console.warn('loadDashboardStats is handled by backend_api.js');
}

function loadUpcomingEvents() {
    const container = document.getElementById('upcoming-events');
    if (!container) return;
    
    const events = [
        { title: 'AI & ML Summit 2026', date: 'Tomorrow', type: 'conference' },
        { title: 'Career Fair: Tech Companies', date: 'In 3 days', type: 'fair' },
        { title: 'Resume Workshop', date: 'Next week', type: 'workshop' }
    ];
    
    container.innerHTML = events.map(event => `
        <div class="activity-item">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:1.2rem">${getEventIcon(event.type)}</span>
                    <div>
                        <div style="font-weight:600">${event.title}</div>
                        <div style="font-size:0.85rem;color:var(--muted)">${event.date}</div>
                    </div>
                </div>
                <button class="btn" style="padding:6px 12px;font-size:0.85rem">RSVP</button>
            </div>
        </div>
    `).join('');
}

function getEventIcon(type) {
    const icons = { conference: '🎤', fair: '🏢', workshop: '📚', webinar: '💻' };
    return icons[type] || '📅';
}

function loadRecentActivity() {
    if (window.loadRecentActivity && window.loadRecentActivity !== loadRecentActivity) {
        return window.loadRecentActivity.apply(this, arguments);
    }
    console.warn('loadRecentActivity is handled by backend_api.js');
}

function startDashboardAnimations() {
    const counters = document.querySelectorAll('#career-score, #skill-growth, #profile-views, #learning-time');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            if (counter.id === 'career-score' || counter.id === 'profile-views') {
                counter.textContent = Math.floor(current);
            } else if (counter.id === 'skill-growth') {
                counter.textContent = `+${Math.floor(current)}%`;
            }
        }, 20);
    });
}

function refreshDashboard() {
    const refreshBtn = document.querySelector('[onclick="refreshDashboard()"]');
    if (refreshBtn) {
        refreshBtn.innerHTML = '⏳';
        refreshBtn.disabled = true;
    }
    
    loadDashboardStats();
    updatePlanningHeaderStats();
    
    setTimeout(() => {
        if (refreshBtn) {
            refreshBtn.innerHTML = '🔄';
            refreshBtn.disabled = false;
        }
        showNotification('Dashboard refreshed successfully!', 'success');
    }, 1000);
}

let _curriculumData = null;
let _curriculumMajor = 'Computer Science';

function initCoursesPage() {
    const searchInput = document.getElementById('course-search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchCourses();
        });
    }
    currentPage = 1;
    currentSearchResults = [];
}

async function loadCurriculumMap() {
    const grid = document.getElementById('curriculum-grid');
    if (!grid) return;
    if (_curriculumData) {
        renderCurriculumGrid(_curriculumData, _curriculumMajor);
        return;
    }
    try {
        const data = await apiFetch('/courses/curriculum-map', { auth: false });
        _curriculumData = data;
        renderCurriculumGrid(data, _curriculumMajor);
    } catch (e) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)">Could not load curriculum data.</div>';
    }
}

function switchCurriculumMajor(majorName) {
    _curriculumMajor = majorName;
    const labelMap = { 'Computer Science': 'CS', 'Cyber Security': 'Cyber', 'Data Science': 'DS' };
    const label = labelMap[majorName] || majorName;
    const btns = document.querySelectorAll('.curriculum-toggle-btn');
    btns.forEach(b => {
        b.classList.toggle('active', b.textContent.trim().includes(label));
    });
    if (_curriculumData) renderCurriculumGrid(_curriculumData, majorName);
}

function getCourseCategory(code) {
    if (!code) return 'cs';
    const prefix = code.replace(/[0-9]/g, '').toUpperCase();
    if (prefix === 'CY') return 'cy';
    if (prefix === 'DS') return 'ds';
    if (prefix === 'BIS') return 'bis';
    return 'cs';
}

let _curriculumFlatMap = {};
let _selectedCourseCode = null;

function buildCurriculumGraph(semesters) {
    _curriculumFlatMap = {};
    for (let i = 1; i <= 8; i++) {
        const courses = semesters[String(i)] || [];
        for (const c of courses) {
            _curriculumFlatMap[c.code] = c;
        }
    }
}

function handleCourseCardClick(clickedCode) {
    if (_selectedCourseCode === clickedCode) {
        _selectedCourseCode = null;
        updateCurriculumGridColors(null, new Set(), new Set(), new Set());
        return;
    }
    
    _selectedCourseCode = clickedCode;
    
    const directPrereqs = new Set();
    const indirectPrereqs = new Set();
    const nextCourses = new Set();
    
    function findPrereqs(code, isDirect) {
        const course = _curriculumFlatMap[code];
        if (!course || !course.prerequisites) return;
        
        for (const prereqCode of course.prerequisites) {
            if (isDirect) {
                directPrereqs.add(prereqCode);
                findPrereqs(prereqCode, false);
            } else {
                if (!directPrereqs.has(prereqCode)) {
                    indirectPrereqs.add(prereqCode);
                }
                findPrereqs(prereqCode, false);
            }
        }
    }
    
    findPrereqs(clickedCode, true);
    
    for (const code in _curriculumFlatMap) {
        if (code === clickedCode) continue;
        const c = _curriculumFlatMap[code];
        if (c.prerequisites && c.prerequisites.includes(clickedCode)) {
            nextCourses.add(code);
        }
    }
    
    updateCurriculumGridColors(clickedCode, directPrereqs, indirectPrereqs, nextCourses);
}

window.handleCourseCardClick = handleCourseCardClick;

function updateCurriculumGridColors(selectedCode, directPrereqs, indirectPrereqs, nextCourses) {
    const cells = document.querySelectorAll('#curriculum-grid .cur-table-cell');
    
    cells.forEach(cell => {
        cell.classList.remove('selected-course', 'direct-prereq', 'indirect-prereq', 'next-course', 'dimmed');
        
        const codeText = cell.getAttribute('data-course-code');
        if (!codeText) return;
        
        if (!selectedCode) {
            return;
        }
        
        if (codeText === selectedCode) {
            cell.classList.add('selected-course');
        } else if (directPrereqs.has(codeText)) {
            cell.classList.add('direct-prereq');
        } else if (indirectPrereqs.has(codeText)) {
            cell.classList.add('indirect-prereq');
        } else if (nextCourses.has(codeText)) {
            cell.classList.add('next-course');
        } else {
            cell.classList.add('dimmed');
        }
    });
}

function renderCurriculumGrid(data, majorName) {
    const grid = document.getElementById('curriculum-grid');
    if (!grid) return;
    const semesters = data[majorName] || {};

    // Build flat map for relationship calculations
    buildCurriculumGraph(semesters);

    // Reset selected code when major changes
    _selectedCourseCode = null;

    // Find the max number of courses in any semester for column count
    let maxCols = 0;
    for (let i = 1; i <= 8; i++) {
        const courses = semesters[String(i)] || [];
        if (courses.length > maxCols) maxCols = courses.length;
    }
    if (maxCols < 4) maxCols = 4; // minimum 4 columns

    let html = '<table class="cur-table" style="width: 100%; border-collapse: separate; border-spacing: 0 8px;"><tbody>';
    
    const yearNames = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
    
    for (let year = 1; year <= 4; year++) {
        // Add a stylized Year Header Row
        html += `<tr class="cur-table-year-row">
            <td colspan="${maxCols + 1}" style="padding: 18px 20px 10px 20px; font-weight: 800; color: var(--primary); text-align: left; font-size: 1.15rem; letter-spacing: 1px; text-transform: uppercase;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-graduation-cap" style="color: var(--accent);"></i>
                    ${yearNames[year - 1]}
                    <div style="flex-grow: 1; height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%); margin-left: 15px;"></div>
                </div>
            </td>
        </tr>`;
        
        for (let semInYear = 1; semInYear <= 2; semInYear++) {
            let i = (year - 1) * 2 + semInYear;
            let semSeason = semInYear === 1 ? 'Fall' : 'Spring';
            
            const courses = semesters[String(i)] || [];
            html += '<tr class="cur-table-row">';
            html += `<td class="cur-table-sem" style="vertical-align: middle; background: rgba(255,255,255,0.02); border-left: 3px solid var(--accent); border-radius: 8px 0 0 8px;">
                <span style="display:block; font-size:1.05rem; font-weight:700;">Semester ${i}</span>
                <span style="display:inline-block; font-size:0.75rem; color:#94a3b8; font-weight:600; margin-top:6px; background: rgba(0,0,0,0.3); padding: 3px 8px; border-radius: 12px; letter-spacing: 0.5px;">${semSeason}</span>
            </td>`;
            
            for (let j = 0; j < maxCols; j++) {
                if (j < courses.length) {
                    const c = courses[j];
                    const cat = getCourseCategory(c.code);
                    
                    // Dynamically detect Summer courses and assign distinct styling
                    const isSummer = c.semester_name === 'Summer';
                    const summerBadge = isSummer 
                        ? `<div style="font-size: 0.7rem; color: #f59e0b; font-weight: 700; margin-bottom: 6px; display: inline-block; background: rgba(245,158,11,0.15); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(245,158,11,0.3);">☀️ Summer</div>` 
                        : '';
                    const summerStyle = isSummer 
                        ? 'style="border: 1px solid rgba(245,158,11,0.6); box-shadow: inset 0 0 15px rgba(245,158,11,0.05);"' 
                        : '';
                    
                    const prereqText = c.prerequisites && c.prerequisites.length
                        ? `<div class="cur-cell-prereq">Prereq: ${c.prerequisites.join(', ')}</div>` : '';
                    html += `<td class="cur-table-cell" data-cat="${cat}" data-course-code="${c.code}" onclick="handleCourseCardClick('${c.code}')" ${summerStyle}>
                        ${summerBadge}
                        <div class="cur-cell-name">${c.name}</div>
                        <div class="cur-cell-code">${c.code} · ${c.credits}CH</div>
                        ${prereqText}
                    </td>`;
                } else {
                    html += '<td class="cur-table-cell cur-cell-empty"></td>';
                }
            }
            html += '</tr>';
        }
    }
    html += '</tbody></table>';
    grid.innerHTML = html;
}

function showModal(content, modalId) {
    const existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'course-modal active';
    modal.innerHTML = content;
    
    document.body.appendChild(modal);
}

function closeCourseModal() {
    document.querySelectorAll('.course-modal').forEach(m => m.remove());
}

const PROTECTED_PAGES = new Set(['dashboard','resume','Internships','xai','profile','courses','planning','advisor-chat','advisor-meetups']);

function navigateTo(id) {
    const logged = sessionStorage.getItem('edumate_logged') === '1';
    
    if (PROTECTED_PAGES.has(id) && !logged) {
        alert('Please sign in to access this page.');
        id = 'login';
    }
    
    const current = document.querySelector('.page.active');
    const next = document.getElementById(id);
    
    if (!next) return;
    
    document.getElementById('aiPopup')?.classList.remove('active');
    
    if (!current) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        next.classList.add('active');
        window.scrollTo(0, 0);
        runPageInit(id);
        return;
    }
    
    current.style.transition = 'all 0.2s ease';
    current.style.opacity = '0';
    current.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
            p.style.opacity = '0';
            p.style.transform = 'translateX(20px)';
        });
        
        next.classList.add('active');
        window.scrollTo(0, 0);
        
        next.style.transition = 'all 0.25s ease';
        setTimeout(() => {
            next.style.opacity = '1';
            next.style.transform = 'translateX(0)';
        }, 30);
        
        runPageInit(id);
    }, 200);
}

function runPageInit(id) {
    if (id === 'dashboard') setTimeout(() => initDashboard(), 50);
    if (id === 'resume') setTimeout(generateResumePreview, 50);
    if (id === 'courses') setTimeout(initCoursesPage, 50);
    if (id === 'planning') setTimeout(initPlanning, 50);
    if (id === 'advisor-chat') {
        setTimeout(() => {
            if (typeof window.loadStudentAdvisorInfo === 'function') window.loadStudentAdvisorInfo();
            if (typeof window.loadStudentAdvisorMessages === 'function') window.loadStudentAdvisorMessages();
            if (typeof window.startStudentChatPolling === 'function') window.startStudentChatPolling();
        }, 100);
    } else if (id === 'advisor-meetups') {
        setTimeout(() => {
            if (typeof window.stopStudentChatPolling === 'function') window.stopStudentChatPolling();
            if (typeof window.initializeAdvisorMeetupsPage === 'function') window.initializeAdvisorMeetupsPage();
        }, 100);
    } else {
        if (typeof window.stopStudentChatPolling === 'function') window.stopStudentChatPolling();
    }
}

function logActivity(action, text) {
    if (window.logActivity && window.logActivity !== logActivity) {
        return window.logActivity.apply(this, arguments);
    }
    console.warn('logActivity is handled by backend_api.js');
}

function calculateSemesterGPAs() {
    const semesterGPAs = [];
    
    document.querySelectorAll('.semester-item').forEach((semester, index) => {
        const semesterNum = index + 1;
        const courseRows = semester.querySelectorAll('.course-row');
        let semTotalPoints = 0;
        let semTotalCredits = 0;
        let semCourses = 0;
        
        courseRows.forEach(row => {
            const courseId = row.getAttribute('data-course-id');
            const creditSpan = row.querySelector('.course-credits');
            
            if (creditSpan) {
                const match = creditSpan.textContent.match(/(\d+)/);
                if (match) {
                    const credits = parseInt(match[1]);
                    const grade = courseGrades[courseId];
                    
                    if (grade && GRADE_POINTS[grade] !== undefined) {
                        semTotalPoints += GRADE_POINTS[grade] * credits;
                        semTotalCredits += credits;
                        semCourses++;
                    }
                }
            }
        });
        
        const semesterGPA = semTotalCredits > 0 ? (semTotalPoints / semTotalCredits) : 0;
        
        semesterGPAs.push({
            semesterNum: semesterNum,
            gpa: parseFloat(semesterGPA.toFixed(2)),
            credits: semTotalCredits,
            courses: semCourses,
            totalCourses: courseRows.length
        });
    });
    
    return semesterGPAs;
}

function updateSemesterGPADisplays() {
    const semesterGPAs = calculateSemesterGPAs();
    
    document.querySelectorAll('.semester-item').forEach((semester, index) => {
        const semesterData = semesterGPAs[index];
        
        const existingGPA = semester.querySelector('.semester-gpa-display');
        if (existingGPA) existingGPA.remove();
        
        const gpaDisplay = document.createElement('div');
        gpaDisplay.className = 'semester-gpa-display';
        
        if (semesterData.courses > 0) {
            gpaDisplay.innerHTML = `
                <div class="semester-gpa-badge" style="
                    background: ${getGPAColor(semesterData.gpa)};
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 8px;
                ">
                    <i class="fas fa-star"></i>
                    Semester GPA: ${semesterData.gpa}
                    <span style="font-size: 0.7rem; opacity: 0.8;">(${semesterData.courses}/${semesterData.totalCourses} graded)</span>
                </div>
            `;
        } else {
            gpaDisplay.innerHTML = `
                <div class="semester-gpa-badge" style="
                    background: #94a3b8;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 8px;
                    opacity: 0.7;
                ">
                    <i class="fas fa-star"></i>
                    No grades yet
                </div>
            `;
        }
        
        const semesterHead = semester.querySelector('.semester-head');
        if (semesterHead) {
            semesterHead.appendChild(gpaDisplay);
        }
    });
}

function getGPAColor(gpa) {
    if (gpa >= 3.7) return '#10b981';
    if (gpa >= 3.0) return '#3b82f6';
    if (gpa >= 2.0) return '#f59e0b';
    return '#ef4444';
}

function calculateFinalGPA() {
    const semesterGPAs = calculateSemesterGPAs();
    let totalWeightedGPA = 0;
    let totalCredits = 0;
    let semestersWithGrades = 0;
    
    semesterGPAs.forEach(sem => {
        if (sem.courses > 0) {
            totalWeightedGPA += sem.gpa * sem.credits;
            totalCredits += sem.credits;
            semestersWithGrades++;
        }
    });
    
    const finalGPA = totalCredits > 0 ? (totalWeightedGPA / totalCredits) : 0;
    
    return {
        finalGPA: parseFloat(finalGPA.toFixed(2)),
        totalCredits,
        semestersWithGrades,
        totalSemesters: semesterGPAs.length
    };
}

function addFinalGPADisplay() {
    const rightPanel = document.querySelector('.right-panel');
    if (!rightPanel) return;
    
    let finalGPADisplay = document.getElementById('final-gpa-display');
    
    if (!finalGPADisplay) {
        finalGPADisplay = document.createElement('div');
        finalGPADisplay.id = 'final-gpa-display';
        finalGPADisplay.className = 'final-gpa-display';
        finalGPADisplay.style.cssText = `
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: white;
            border-radius: 20px;
            padding: 1.2rem;
            margin-top: 1rem;
            text-align: center;
            box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4);
        `;
        
        const pathCard = rightPanel.querySelector('.path-card');
        if (pathCard) {
            pathCard.insertAdjacentElement('afterend', finalGPADisplay);
        } else {
            rightPanel.insertBefore(finalGPADisplay, rightPanel.firstChild);
        }
    }
    
    const finalGPA = calculateFinalGPA();
    const currentGPA = calculateGPA();
    
    finalGPADisplay.innerHTML = `
        <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.5rem;">FINAL CUMULATIVE GPA</div>
        <div style="font-size: 3rem; font-weight: 700; line-height: 1; margin-bottom: 0.5rem;">${finalGPA.finalGPA}</div>
        <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 0.8rem; font-size: 0.85rem;">
            <div>
                <div style="opacity: 0.8;">Term GPA</div>
                <div style="font-weight: 600;">${currentGPA.gpa}</div>
            </div>
            <div>
                <div style="opacity: 0.8;">Total Credits</div>
                <div style="font-weight: 600;">${finalGPA.totalCredits}</div>
            </div>
            <div>
                <div style="opacity: 0.8;">Semesters</div>
                <div style="font-weight: 600;">${finalGPA.semestersWithGrades}/${finalGPA.totalSemesters}</div>
            </div>
        </div>
    `;
}

function toggleGPASection() {
    const content = document.querySelector('.gpa-main-content');
    const toggleBtn = document.querySelector('.gpa-toggle-btn i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleBtn.className = 'fas fa-chevron-up';
    } else {
        content.style.display = 'none';
        toggleBtn.className = 'fas fa-chevron-down';
    }
}

function quickGradeAll(grade) {
    const allCourseRows = document.querySelectorAll('.course-row');
    let gradedCount = 0;
    
    allCourseRows.forEach(row => {
        const courseId = row.getAttribute('data-course-id');
        if (courseId && !courseGrades[courseId]) {
            setGrade(courseId, grade);
            gradedCount++;
        }
    });
    
    if (gradedCount > 0) {
        showNotification(`Set ${gradedCount} courses to grade ${grade}`, 'success');
        updateGPADisplay();
        updateSemesterGPADisplays();
        addFinalGPADisplay();
    } else {
        showNotification('No ungraded courses found', 'info');
    }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    const storedTheme = localStorage.getItem('edumate_theme');
    if (storedTheme === 'dark') document.body.classList.add('dark-theme');
    updateThemeIcon();
    
    initCoursesPage();
    updateSidebarFromStorage();
    applyStoredProfileToUI();
    setupEventListeners();
    initializeApp();
});

// ============================================
// EXPORT FUNCTIONS
// ============================================
window.switchPlanningView = window.switchPlanningView || switchPlanningView;
window.switchCurriculumMajor = window.switchCurriculumMajor || switchCurriculumMajor;
window.sendAdvisorMessage = window.sendAdvisorMessage || sendAdvisorMessage;
window.sendAdvisorQuickMessage = window.sendAdvisorQuickMessage || sendAdvisorQuickMessage;
window.requestSummerCourse = window.requestSummerCourse || requestSummerCourse;
window.viewAllSummerCourses = window.viewAllSummerCourses || viewAllSummerCourses;
window.apiFetch = window.apiFetch || apiFetch;
window.navigateTo = window.navigateTo || navigateTo;
window.initPlanning = window.initPlanning || initPlanning;
window.initCoursesPage = window.initCoursesPage || initCoursesPage;
window.showSummerRequestModal = window.showSummerRequestModal || showSummerRequestModal;
window.closeSummerRequestModal = window.closeSummerRequestModal || closeSummerRequestModal;
window.submitSummerRequest = window.submitSummerRequest || submitSummerRequest;
window.cancelSummerRequest = window.cancelSummerRequest || cancelSummerRequest;
window.toggleAIPopup = window.toggleAIPopup || toggleAIPopup;
window.signOut = window.signOut || signOut;
window.refreshDashboard = window.refreshDashboard || refreshDashboard;
window.searchCourses = window.searchCourses || searchCourses;
window.quickSearch = window.quickSearch || quickSearch;
window.loadInternshipsByPosition = window.loadInternshipsByPosition || loadInternshipsByPosition;
window.generateResumePreview = window.generateResumePreview || generateResumePreview;
window.downloadResumePDF = window.downloadResumePDF || downloadResumePDF;
window.saveResumeData = window.saveResumeData || saveResumeData;
window.addEducation = window.addEducation || addEducation;
window.addExperience = window.addExperience || addExperience;
window.addProject = window.addProject || addProject;
window.showResumeForm = window.showResumeForm || showResumeForm;
window.changeProfileAvatar = window.changeProfileAvatar || changeProfileAvatar;
window.saveProfileEdits = window.saveProfileEdits || saveProfileEdits;
window.attemptLogin = window.attemptLogin || attemptLogin;
window.firebaseLogin = window.firebaseLogin || firebaseLogin;
window.startRegistration = window.startRegistration || startRegistration;
window.completeRegistration = window.completeRegistration || completeRegistration;
window.showNotification = window.showNotification || showNotification;
window.closeSubjectModal = window.closeSubjectModal || closeSubjectModal;
window.closeAddSubjectModal = window.closeAddSubjectModal || closeAddSubjectModal;
window.createSemesterWithSubjects = window.createSemesterWithSubjects || createSemesterWithSubjects;
window.showAddSubjectModal = window.showAddSubjectModal || showAddSubjectModal;
window.addSubjectToSemester = window.addSubjectToSemester || addSubjectToSemester;
window.deleteCourse = window.deleteCourse || deleteCourse;
window.toggleGPASection = window.toggleGPASection || toggleGPASection;
window.quickGradeAll = window.quickGradeAll || quickGradeAll;
window.setGrade = window.setGrade || setGrade;
window.clearGrade = window.clearGrade || clearGrade;
window.showSemesterGradeModal = window.showSemesterGradeModal || showSemesterGradeModal;
window.saveSemesterGrades = window.saveSemesterGrades || saveSemesterGrades;
window.toggleSubject = window.toggleSubject || toggleSubject;
window.loadSubjectsForSemester = window.loadSubjectsForSemester || loadSubjectsForSemester;
window.quickAddSubject = window.quickAddSubject || quickAddSubject;
window.showDropSubjectsMode = window.showDropSubjectsMode || showDropSubjectsMode;
window.deleteSelectedCourses = window.deleteSelectedCourses || deleteSelectedCourses;
window.alert = window.alert || function(m) { showNotification(m, 'info'); };

// ============================================
// ADVISING APPOINTMENT BOOKING
// ============================================

let _advisingSlot = null;       // current active advisor slot
let _selectedWindow = null;     // the time window the student clicked

async function initAdvisingBooking() {
    // Reset state
    _advisingSlot = null;
    _selectedWindow = null;

    const slotsContainer = document.getElementById('advisor-slots-container');
    const tableBody = document.getElementById('advisor-slots-table-body');
    const noSlotMsg = document.getElementById('no-advisor-slot-msg');
    const formContainer = document.getElementById('booking-form-container');

    if (!slotsContainer || !tableBody) return;

    // Show loading state
    slotsContainer.style.display = 'none';
    noSlotMsg.style.display = 'none';
    formContainer.style.display = 'none';

    try {
        const slots = await apiFetch('/advising/slots');

        if (!Array.isArray(slots) || slots.length === 0) {
            noSlotMsg.style.display = 'block';
            return;
        }

        // Render slots into table
        tableBody.innerHTML = slots.map(s => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:12px 5px;">
                    <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(s.advisor_name || 'Advisor')}</div>
                </td>
                <td style="padding:12px 5px;">
                    <div style="color:#8B5CF6; font-weight:600;">${s.day_of_week}s</div>
                    <div style="font-size:0.75rem; color:var(--muted);">${s.start_time} - ${s.end_time}</div>
                </td>
                <td style="padding:12px 5px; color:var(--text-secondary);">${escapeHtml(s.location)}</td>
                <td style="padding:12px 5px; text-align:center;">
                    <button class="btn" style="padding:6px 12px; font-size:0.75rem;" onclick='selectAdvisorSlot(${JSON.stringify(s)})'>
                        Choose
                    </button>
                </td>
            </tr>
        `).join('');

        slotsContainer.style.display = 'block';
        noSlotMsg.style.display = 'none';

        // Load student's existing appointments
        await _loadMyAppointments();

    } catch (err) {
        console.error('Advising slots fetch failed:', err);
        noSlotMsg.style.display = 'block';
    }
}

/** Called when student clicks "Choose" on a specific advisor's slot */
window.selectAdvisorSlot = function(slot) {
    _advisingSlot = slot;
    _selectedWindow = null;
    
    const formContainer = document.getElementById('booking-form-container');
    if (!formContainer) return;

    // Update form header or info
    const header = formContainer.querySelector('h4');
    if (header) {
        header.innerHTML = `<i class="fas fa-calendar-plus" style="color:#8B5CF6;"></i> Book a 15-Minute Slot`;
    }

    // Populate summary card
    const nameEl = document.getElementById('booking-advisor-name');
    const dayEl = document.getElementById('booking-advisor-day');
    const locEl = document.getElementById('booking-advisor-loc');
    if (nameEl) nameEl.textContent = slot.advisor_name || 'Advisor';
    if (dayEl) dayEl.textContent = `${slot.day_of_week}s (${slot.start_time} - ${slot.end_time})`;
    if (locEl) locEl.textContent = slot.location;

    formContainer.style.display = 'block';
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Populate dates for this specific slot
    _populateDateSelect(slot.day_of_week);
    
    // Reset window grid
    const grid = document.getElementById('booking-windows-grid');
    if (grid) grid.innerHTML = '<span style="color:#64748b; font-size:0.9rem;">Select a date first</span>';
    
    const selectedTimeDisp = document.getElementById('booking-selected-time');
    if (selectedTimeDisp) selectedTimeDisp.textContent = 'None';
    
    _updateSubmitBtn();
};

/** Populate the date <select> with the next 4 Mondays (or whatever day) */
function _populateDateSelect(dayName) {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const target = days.indexOf(dayName);
    const select = document.getElementById('booking-date-select');
    if (!select) return;
    select.innerHTML = '<option value="">-- pick a date --</option>';

    const today = new Date();
    let count = 0;
    let d = new Date(today);

    // Advance to first future occurrence
    while (count < 4) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() === target) {
            // Use local date parts to avoid timezone shifts from toISOString()
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const iso = `${year}-${month}-${day}`;
            
            const label = d.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
            const opt = document.createElement('option');
            opt.value = iso;
            opt.textContent = label;
            select.appendChild(opt);
            count++;
        }
    }
}

/** Called when date changes — fetch availability windows from API */
async function loadBookingWindows() {
    const select = document.getElementById('booking-date-select');
    const grid = document.getElementById('booking-windows-grid');
    const selectedDate = select ? select.value : null;

    if (!selectedDate || !_advisingSlot) {
        grid.innerHTML = '<span style="color:#64748b; font-size:0.9rem;">Select a date first</span>';
        return;
    }

    grid.innerHTML = '<span style="color:#64748b; font-size:0.85rem;">Loading...</span>';
    _selectedWindow = null;
    _updateSubmitBtn();

    try {
        const data = await apiFetch(`/advising/slots/${_advisingSlot.id}/availability?date=${selectedDate}`);
        grid.innerHTML = '';

        if (!data || !data.windows || data.windows.length === 0) {
            grid.innerHTML = '<span style="color:#ef4444; font-size:0.85rem;">No slots available for this date.</span>';
            return;
        }

        let addedCount = 0;
        data.windows.forEach(win => {
            if (!win.available) return; // Skip taken slots

            addedCount++;
            const btn = document.createElement('button');
            btn.textContent = win.start;
            btn.className = 'booking-window-btn';
            btn.style.cssText = `
                padding: 8px 16px;
                border-radius: 20px;
                border: 2px solid #8B5CF6;
                background: transparent;
                color: #8B5CF6;
                font-weight: 600;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.15s;
                font-family: inherit;
            `;
            btn.onclick = () => selectBookingWindow(win.start, btn);
            grid.appendChild(btn);
        });

        if (addedCount === 0) {
            grid.innerHTML = '<span style="color:#ef4444; font-size:0.85rem;">All slots are fully booked for this date.</span>';
        }
    } catch (err) {
        console.error('Error loading booking windows:', err);
        grid.innerHTML = '<span style="color:#ef4444; font-size:0.85rem;">Error loading availability.</span>';
    }
}

/** Highlight chosen time window */
function selectBookingWindow(startTime, clickedBtn) {
    // De-select all
    document.querySelectorAll('.booking-window-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#8B5CF6';
    });
    // Highlight selected
    clickedBtn.style.background = '#8B5CF6';
    clickedBtn.style.color = 'white';

    _selectedWindow = startTime;
    document.getElementById('booking-selected-time').textContent = `Selected: ${startTime}`;
    _updateSubmitBtn();
}

function _updateSubmitBtn() {
    const btn = document.getElementById('booking-submit-btn');
    if (!btn) return;
    if (_selectedWindow) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}

/** Student confirms and books the selected window */
async function submitAppointmentBooking() {
    if (!_selectedWindow || !_advisingSlot) return;

    const date = document.getElementById('booking-date-select').value;
    const purpose = document.getElementById('booking-purpose').value;
    const notes = document.getElementById('booking-notes').value.trim();

    if (!date) {
        showNotification('Please select a date first', 'error');
        return;
    }

    const btn = document.getElementById('booking-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

    try {
        await apiFetch('/advising/appointments', {
            method: 'POST',
            body: JSON.stringify({
                slot_id: _advisingSlot.id,
                appointment_date: date,
                start_time: _selectedWindow,
                purpose,
                purpose_notes: notes || null,
            }),
        });

        showNotification('Appointment booked successfully! ✅', 'success');

        // Reset form
        document.getElementById('booking-date-select').value = '';
        document.getElementById('booking-notes').value = '';
        document.getElementById('booking-windows-grid').innerHTML =
            '<span style="color:#64748b; font-size:0.9rem;">Select a date first</span>';
        document.getElementById('booking-selected-time').textContent = '';
        _selectedWindow = null;
        _updateSubmitBtn();

        // Refresh the appointments list
        await _loadMyAppointments();

    } catch (err) {
        showNotification(err.message || 'Booking failed. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirm Appointment';
    }
}

/** Load and render the student's own appointments */
async function _loadMyAppointments() {
    const section = document.getElementById('my-appointments-section');
    const list = document.getElementById('my-appointments-list');
    const ratingsSection = document.getElementById('pending-ratings-section');
    const ratingsList = document.getElementById('pending-ratings-list');
    if (!section || !list) return;

    try {
        const appointments = await apiFetch('/advising/appointments/me');
        if (!appointments || !appointments.length) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        const today = new Date().toISOString().split('T')[0];
        const pending = [];
        const upcoming = appointments.filter(a => a.appointment_date >= today && a.status === 'booked');
        const past = appointments.filter(a => a.appointment_date < today || a.status === 'completed');

        list.innerHTML = upcoming.map(a => `
            <div style="
                background: rgba(30,41,59,0.5); border:1px solid rgba(139,92,246,0.2);
                border-radius:16px; padding:1rem 1.2rem; margin-bottom:10px;
                display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;
            ">
                <div>
                    <div style="font-weight:700; color:#e2e8f0;">
                        ${a.advisor_name || 'Advisor'} — ${a.appointment_date}
                    </div>
                    <div style="font-size:0.85rem; color:#8B5CF6; margin-top:2px;">
                        ${a.start_time} – ${a.end_time}
                    </div>
                    <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">
                        ${a.location || ''} &nbsp;•&nbsp; ${a.purpose}
                    </div>
                </div>
                <button onclick="cancelMyAppointment(${a.id})" style="
                    background:none; border:1px solid #ef4444; color:#ef4444;
                    padding:6px 14px; border-radius:20px; font-size:0.8rem; cursor:pointer;
                    font-family:inherit; font-weight:600;
                ">Cancel</button>
            </div>
        `).join('');

        // Past meetings that need rating
        past.forEach(a => {
            if (!a.outcome || a.outcome.student_rating === null) {
                pending.push(a);
            }
        });

        if (pending.length > 0) {
            ratingsSection.style.display = 'block';
            ratingsList.innerHTML = pending.map(a => `
                <div style="
                    background: rgba(30,41,59,0.5); border:1px solid rgba(245,158,11,0.2);
                    border-radius:16px; padding:1rem 1.2rem; margin-bottom:12px;
                ">
                    <div style="font-weight:700; color:#e2e8f0; margin-bottom:0.5rem;">
                        ${a.advisor_name || 'Advisor'} — ${a.appointment_date} at ${a.start_time}
                    </div>
                    <div style="display:flex; gap:6px; margin-bottom:8px;" id="stars-${a.id}">
                        ${[1,2,3,4,5].map(n => `
                            <span onclick="_setRatingStar(${a.id},${n})" data-star="${n}" style="
                                font-size:1.4rem; cursor:pointer; color:#475569; transition:color 0.1s;
                            ">★</span>
                        `).join('')}
                    </div>
                    <input type="text" id="feedback-${a.id}" class="input"
                        placeholder="Leave a comment (optional)" style="margin-bottom:8px;">
                    <button onclick="submitRating(${a.id})" style="
                        background:linear-gradient(135deg,#f59e0b,#d97706); color:white;
                        border:none; padding:8px 18px; border-radius:12px; font-size:0.85rem;
                        cursor:pointer; font-family:inherit; font-weight:600;
                    "><i class="fas fa-star"></i> Submit Rating</button>
                </div>
            `).join('');
        } else {
            ratingsSection.style.display = 'none';
        }

    } catch (err) {
        console.warn('Failed to load appointments:', err);
    }
}

function _setRatingStar(appointmentId, value) {
    const container = document.getElementById(`stars-${appointmentId}`);
    if (!container) return;
    container.querySelectorAll('[data-star]').forEach(s => {
        s.style.color = parseInt(s.dataset.star) <= value ? '#f59e0b' : '#475569';
    });
    container.dataset.selected = value;
}

async function submitRating(appointmentId) {
    const container = document.getElementById(`stars-${appointmentId}`);
    const rating = container ? parseInt(container.dataset.selected || '0') : 0;
    const feedback = (document.getElementById(`feedback-${appointmentId}`)?.value || '').trim();

    if (!rating) {
        showNotification('Please select a star rating first', 'error');
        return;
    }

    try {
        await apiFetch(`/advising/appointments/${appointmentId}/outcome/student`, {
            method: 'PATCH',
            body: JSON.stringify({ rating, feedback: feedback || null }),
        });
        showNotification('Rating submitted! Thank you.', 'success');
        await _loadMyAppointments();
    } catch (err) {
        showNotification(err.message || 'Failed to submit rating', 'error');
    }
}

async function cancelMyAppointment(appointmentId) {
    if (!confirm('Cancel this appointment?')) return;
    try {
        await apiFetch(`/advising/appointments/${appointmentId}`, { method: 'DELETE' });
        showNotification('Appointment cancelled', 'info');
        await _loadMyAppointments();
        loadBookingWindows(); // refresh windows if same date still selected
    } catch (err) {
        showNotification(err.message || 'Could not cancel appointment', 'error');
    }
}

window.loadBookingWindows = window.loadBookingWindows || loadBookingWindows;
window.submitAppointmentBooking = window.submitAppointmentBooking || submitAppointmentBooking;
window.cancelMyAppointment = window.cancelMyAppointment || cancelMyAppointment;
window.submitRating = window.submitRating || submitRating;
window.selectBookingWindow = window.selectBookingWindow || selectBookingWindow;
window.initAdvisingBooking = window.initAdvisingBooking || initAdvisingBooking;

let _chatMeetupSlot = null;
let _chatMeetupWindow = null;
let _chatMeetupInitStartedAt = 0;

function _nextFourDatesForDay(dayName) {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const target = days.indexOf(dayName);
    const dates = [];
    const d = new Date();
    while (dates.length < 4) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() === target) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.push({ value: `${y}-${m}-${day}`, label: d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }) });
        }
    }
    return dates;
}

async function initChatMeetupBooking() {
    const wrap = document.getElementById('chat-meetup-slots');
    const dateSelect = document.getElementById('chat-meetup-date');
    const windows = document.getElementById('chat-meetup-windows');
    const purpose = document.getElementById('chat-meetup-purpose');
    const reason = document.getElementById('chat-meetup-reason');
    const submit = document.getElementById('chat-meetup-submit');
    if (!wrap) return;
    _chatMeetupSlot = null;
    _chatMeetupWindow = null;
    wrap.innerHTML = `
        <div style="font-weight:800;font-size:1.05rem;margin-bottom:14px">Book an Appointment</div>
        <div style="color:var(--muted)">Loading slots...</div>
    `;
    if (dateSelect) dateSelect.style.display = 'none';
    if (windows) windows.innerHTML = '<span>Select an appointment date to show times.</span>';
    if (purpose) purpose.style.display = 'none';
    if (reason) reason.style.display = 'none';
    if (submit) {
        submit.style.display = 'none';
        submit.disabled = true;
        submit.style.opacity = '0.55';
    }
    loadChatMeetupAppointments();
    const getApi = () => (window.apiFetch && window.apiFetch !== apiFetch ? window.apiFetch : apiFetch);
    try {
        let slots = [];
        try {
            slots = await withTimeout(getApi()('/advising/student/slots'), 18000, 'Meetup slots request timed out.');
        } catch (studentSlotsError) {
            console.warn('Student slots endpoint failed, falling back to /advising/slots:', studentSlotsError);
            slots = await withTimeout(getApi()('/advising/slots'), 18000, 'Meetup slots request timed out.');
        }
        if (!Array.isArray(slots) || !slots.length) {
            wrap.innerHTML = `
                <div style="font-weight:800;font-size:1.05rem;margin-bottom:14px">Book an Appointment</div>
                <div style="color:var(--muted)">No active advisor meetup slots are available yet.</div>
            `;
            return;
        }
        if (slots.length === 1) {
            selectChatMeetupSlot(slots[0]);
        } else {
            wrap.innerHTML = `
                <div style="font-weight:800;font-size:1.05rem;margin-bottom:14px">Book an Appointment</div>
                <div style="display:flex;flex-wrap:wrap;gap:10px">
                    ${slots.map(slot => `
                        <button class="link-btn" style="padding:12px 16px;border-radius:999px" onclick='selectChatMeetupSlot(${JSON.stringify(slot)})'>
                            ${escapeHtml(slot.day_of_week)} ${escapeHtml(slot.start_time)} - ${escapeHtml(slot.end_time)}
                        </button>
                    `).join('')}
                </div>
            `;
        }
    } catch (e) {
        wrap.innerHTML = `
            <div style="font-weight:800;font-size:1.05rem;margin-bottom:14px">Book an Appointment</div>
            <div style="color:#ef4444">${escapeHtml(e.message || 'Could not load meetup slots from advisor_slots.')}</div>
        `;
        const list = document.getElementById('chat-meetup-appointments-list');
        if (list) list.textContent = 'Could not load appointments until the server responds.';
    }
}

function initializeAdvisorMeetupsPage() {
    const now = Date.now();
    if (now - _chatMeetupInitStartedAt < 500) return;
    _chatMeetupInitStartedAt = now;
    if (typeof window.stopStudentChatPolling === 'function') window.stopStudentChatPolling();
    initChatMeetupBooking();
}

function withTimeout(promise, ms, message) {
    let timer = null;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function selectChatMeetupSlot(slot) {
    _chatMeetupSlot = slot;
    _chatMeetupWindow = null;
    const wrap = document.getElementById('chat-meetup-slots');
    const dateSelect = document.getElementById('chat-meetup-date');
    const windows = document.getElementById('chat-meetup-windows');
    const purpose = document.getElementById('chat-meetup-purpose');
    const reason = document.getElementById('chat-meetup-reason');
    const submit = document.getElementById('chat-meetup-submit');
    if (wrap) {
        wrap.innerHTML = `
            <div style="font-weight:800;font-size:1.05rem;margin-bottom:14px">Book an Appointment</div>
            <div style="display:flex;gap:38px;align-items:center;flex-wrap:wrap;font-size:0.96rem">
                <span><strong>${escapeHtml(slot.day_of_week)}</strong> ${escapeHtml(slot.start_time)} - ${escapeHtml(slot.end_time)}</span>
                <span>${escapeHtml(slot.location || 'TBA')}</span>
                <span>${escapeHtml(slot.advisor_name || 'Advisor')}</span>
            </div>
        `;
    }
    if (dateSelect) {
        const dates = _nextFourDatesForDay(slot.day_of_week);
        dateSelect.innerHTML = dates
            .map(d => `<option value="${d.value}">${escapeHtml(d.label)}</option>`)
            .join('');
        dateSelect.style.display = 'block';
        if (dates.length) dateSelect.value = dates[0].value;
    }
    if (windows) windows.innerHTML = '<span>Loading available times...</span>';
    if (purpose) purpose.style.display = 'block';
    if (reason) reason.style.display = 'block';
    if (submit) {
        submit.style.display = 'block';
        submit.disabled = true;
        submit.style.opacity = '0.55';
    }
    setTimeout(() => loadChatMeetupWindows(), 0);
}

async function loadChatMeetupWindows() {
    const dateSelect = document.getElementById('chat-meetup-date');
    const windows = document.getElementById('chat-meetup-windows');
    const submit = document.getElementById('chat-meetup-submit');
    if (!dateSelect?.value || !_chatMeetupSlot || !windows) return;
    _chatMeetupWindow = null;
    if (submit) submit.disabled = true;
    windows.innerHTML = '<span>Loading...</span>';
    try {
        const getApi = () => (window.apiFetch && window.apiFetch !== apiFetch ? window.apiFetch : apiFetch);
        const data = await getApi()(`/advising/slots/${_chatMeetupSlot.id}/availability?date=${dateSelect.value}`);
        const available = (data.windows || []).filter(w => w.available);
        if (!available.length) {
            windows.innerHTML = '<span style="color:#ef4444">No free 15-minute slots.</span>';
            return;
        }
        windows.innerHTML = available.map(w => `
            <button class="link-btn chat-meetup-time-btn" onclick="selectChatMeetupWindow('${escapeHtml(w.start)}', this)"
                style="border:2px solid #8B5CF6;color:#a78bfa;border-radius:999px;padding:9px 22px;font-weight:800;background:transparent">
                ${escapeHtml(w.start)}
            </button>
        `).join('');
    } catch (e) {
        windows.innerHTML = '<span style="color:#ef4444">Could not load times.</span>';
    }
}

function selectChatMeetupWindow(start, btn) {
    _chatMeetupWindow = start;
    document.querySelectorAll('#chat-meetup-windows .chat-meetup-time-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = '#a78bfa';
    });
    btn.style.background = 'rgba(139,92,246,0.22)';
    btn.style.color = '#fff';
    const submit = document.getElementById('chat-meetup-submit');
    if (submit) {
        submit.disabled = false;
        submit.style.opacity = '1';
    }
}

async function submitChatMeetupBooking() {
    const date = document.getElementById('chat-meetup-date')?.value;
    const purpose = document.getElementById('chat-meetup-purpose')?.value || 'inquiry';
    const reason = document.getElementById('chat-meetup-reason')?.value.trim() || '';
    if (!_chatMeetupSlot || !_chatMeetupWindow || !date) return;
    try {
        const getApi = () => (window.apiFetch && window.apiFetch !== apiFetch ? window.apiFetch : apiFetch);
        await getApi()('/advising/appointments', {
            method: 'POST',
            body: JSON.stringify({
                slot_id: _chatMeetupSlot.id,
                appointment_date: date,
                start_time: _chatMeetupWindow,
                purpose,
                purpose_notes: reason || null,
            }),
        });
        showNotification('Meetup booked successfully.', 'success');
        await initChatMeetupBooking();
        await loadChatMeetupAppointments();
    } catch (e) {
        showNotification(e.message || 'Could not book meetup.', 'error');
    }
}

async function loadChatMeetupAppointments() {
    const list = document.getElementById('chat-meetup-appointments-list');
    if (!list) return;
    list.textContent = 'Loading appointments...';
    try {
        const getApi = () => (window.apiFetch && window.apiFetch !== apiFetch ? window.apiFetch : apiFetch);
        const appointments = await getApi()('/advising/appointments/me');
        const visible = (appointments || []).filter((appt) => appt.status !== 'cancelled');
        if (!visible.length) {
            list.textContent = 'No appointments booked yet.';
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        const pendingFeedback = [];
        list.innerHTML = visible.map((appt) => {
            const canFeedback = (appt.status === 'completed' || appt.appointment_date < today) && !appt.outcome?.student_rating;
            if (canFeedback) pendingFeedback.push(appt);
            return `
            <div style="border:1px solid rgba(139,92,246,0.24);border-radius:16px;background:rgba(30,41,59,0.36);padding:14px 18px;margin-bottom:10px;display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap">
                <div>
                    <div style="font-weight:800;color:var(--text)">${escapeHtml(appt.advisor_name || 'Advisor')}</div>
                    <div style="margin-top:4px;color:var(--muted)">${escapeHtml(appt.appointment_date)} - ${escapeHtml(appt.start_time)} - ${escapeHtml(appt.end_time)} - ${escapeHtml(appt.location || 'TBA')}</div>
                    ${appt.purpose_notes ? `<div style="margin-top:4px;color:var(--muted);font-size:0.88rem">${escapeHtml(appt.purpose_notes)}</div>` : ''}
                    ${appt.outcome?.advisor_notes ? `<div style="margin-top:6px;color:#c4b5fd;font-size:0.86rem"><strong>Advisor notes:</strong> ${escapeHtml(appt.outcome.advisor_notes)}</div>` : ''}
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;min-width:210px">
                    <span style="border-radius:999px;padding:6px 12px;background:rgba(139,92,246,0.16);color:#c4b5fd;font-weight:800;font-size:0.82rem;text-transform:capitalize">${escapeHtml(appt.status || 'booked')}</span>
                    ${canFeedback ? `
                        <button class="link-btn" onclick='openStudentMeetingFeedbackModal(${JSON.stringify(appt).replace(/'/g, '&#39;')})' style="padding:7px 10px">Add Report</button>
                    ` : ''}
                    ${appt.outcome?.student_rating ? `<span style="color:var(--muted);font-size:0.82rem">Your rating: ${escapeHtml(String(appt.outcome.student_rating))}/5</span>` : ''}
                </div>
            </div>
        `}).join('');
        if (pendingFeedback.length) {
            const firstPending = pendingFeedback[0];
            const key = `edumate_meetup_feedback_prompt_${firstPending.id}`;
            if (!sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, '1');
                setTimeout(() => openStudentMeetingFeedbackModal(firstPending), 250);
            }
        }
    } catch (e) {
        list.innerHTML = `<span style="color:#ef4444">${escapeHtml(e.message || 'Could not load appointments.')}</span>`;
    }
}

function ensureStudentMeetingFeedbackModal() {
    if (document.getElementById('studentMeetingFeedbackModal')) return;
    const modal = document.createElement('div');
    modal.id = 'studentMeetingFeedbackModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.72);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;z-index:2000;padding:18px';
    modal.innerHTML = `
        <div style="width:min(92vw,520px);background:var(--card);border:1px solid var(--border);border-radius:20px;padding:26px;position:relative;color:var(--text)">
            <button onclick="closeStudentMeetingFeedbackModal()" style="position:absolute;right:18px;top:14px;background:none;border:none;color:var(--muted);font-size:26px;cursor:pointer">&times;</button>
            <h3 style="margin:0 0 8px;font-size:1.25rem">Meeting Feedback</h3>
            <p id="studentFeedbackMeta" style="margin:0 0 18px;color:var(--muted)"></p>
            <input type="hidden" id="studentFeedbackAppointmentId">
            <input type="hidden" id="studentFeedbackRating">
            <label style="display:block;font-weight:800;margin-bottom:8px">Rate the meeting out of 5</label>
            <div id="studentFeedbackRatingRow" style="display:flex;gap:8px;margin-bottom:16px">
                ${[1,2,3,4,5].map(n => `<button type="button" onclick="setStudentFeedbackRating(${n})" style="width:42px;height:42px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:var(--text);font-weight:800;cursor:pointer">${n}</button>`).join('')}
            </div>
            <label style="display:block;font-weight:800;margin-bottom:8px">Your report / reason</label>
            <textarea id="studentFeedbackText" class="input" rows="5" placeholder="Was your reason handled? Add details for the advisor/admin." style="min-height:120px;resize:vertical"></textarea>
            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px">
                <button class="link-btn" onclick="closeStudentMeetingFeedbackModal()">Later</button>
                <button class="btn" onclick="submitMeetupFeedback()">Submit Feedback</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function openStudentMeetingFeedbackModal(appt) {
    ensureStudentMeetingFeedbackModal();
    document.getElementById('studentFeedbackAppointmentId').value = appt.id;
    document.getElementById('studentFeedbackRating').value = '';
    document.getElementById('studentFeedbackMeta').textContent = `${appt.advisor_name || 'Advisor'} - ${appt.appointment_date || ''} ${appt.start_time || ''}`;
    document.getElementById('studentFeedbackText').value = appt.purpose_notes ? `Reason: ${appt.purpose_notes}\n\nReport: ` : '';
    document.querySelectorAll('#studentFeedbackRatingRow button').forEach(btn => {
        btn.style.background = 'rgba(255,255,255,0.04)';
        btn.style.borderColor = 'var(--border)';
        btn.style.color = 'var(--text)';
    });
    document.getElementById('studentMeetingFeedbackModal').style.display = 'flex';
}

function closeStudentMeetingFeedbackModal() {
    const modal = document.getElementById('studentMeetingFeedbackModal');
    if (modal) modal.style.display = 'none';
}

function setStudentFeedbackRating(value) {
    document.getElementById('studentFeedbackRating').value = value;
    document.querySelectorAll('#studentFeedbackRatingRow button').forEach((btn, index) => {
        const active = index < value;
        btn.style.background = active ? 'rgba(139,92,246,0.24)' : 'rgba(255,255,255,0.04)';
        btn.style.borderColor = active ? '#8B5CF6' : 'var(--border)';
        btn.style.color = active ? '#fff' : 'var(--text)';
    });
}

async function submitMeetupFeedback(appointmentId) {
    const id = appointmentId || parseInt(document.getElementById('studentFeedbackAppointmentId')?.value || '0', 10);
    const rating = parseInt(document.getElementById('studentFeedbackRating')?.value || '0', 10);
    const feedback = document.getElementById('studentFeedbackText')?.value.trim() || '';
    if (!id) return;
    if (!rating) {
        showNotification('Please choose a rating first.', 'error');
        return;
    }
    if (!feedback) {
        showNotification('Please write a short meeting report.', 'error');
        return;
    }
    try {
        const getApi = () => (window.apiFetch && window.apiFetch !== apiFetch ? window.apiFetch : apiFetch);
        await getApi()(`/advising/appointments/${id}/outcome/student`, {
            method: 'PATCH',
            body: JSON.stringify({ rating, feedback }),
        });
        showNotification('Meeting feedback saved.', 'success');
        closeStudentMeetingFeedbackModal();
        await loadChatMeetupAppointments();
    } catch (e) {
        showNotification(e.message || 'Could not save feedback.', 'error');
    }
}

window.initChatMeetupBooking = initChatMeetupBooking;
window.initializeAdvisorMeetupsPage = initializeAdvisorMeetupsPage;
window.selectChatMeetupSlot = selectChatMeetupSlot;
window.loadChatMeetupWindows = loadChatMeetupWindows;
window.selectChatMeetupWindow = selectChatMeetupWindow;
window.submitChatMeetupBooking = submitChatMeetupBooking;
window.loadChatMeetupAppointments = loadChatMeetupAppointments;
window.submitMeetupFeedback = submitMeetupFeedback;
window.openStudentMeetingFeedbackModal = openStudentMeetingFeedbackModal;
window.closeStudentMeetingFeedbackModal = closeStudentMeetingFeedbackModal;
window.setStudentFeedbackRating = setStudentFeedbackRating;
window.showSemesterGradeModal = showSemesterGradeModal;
window.saveSemesterGrades = saveSemesterGrades;
window.showGradeModal = showGradeModal;
window.setGrade = setGrade;
window.clearGrade = clearGrade;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[onclick*="advisor-meetups"]').forEach((link) => {
        link.addEventListener('click', () => {
            setTimeout(() => initializeAdvisorMeetupsPage(), 300);
        });
    });

    const meetupsPage = document.getElementById('advisor-meetups');
    if (meetupsPage) {
        const observer = new MutationObserver(() => {
            if (meetupsPage.classList.contains('active')) {
                setTimeout(() => initializeAdvisorMeetupsPage(), 0);
            }
        });
        observer.observe(meetupsPage, { attributes: true, attributeFilter: ['class'] });
    }

    setTimeout(() => {
        if (meetupsPage?.classList.contains('active')) initializeAdvisorMeetupsPage();
    }, 0);
});

})(); // End IIFE wrapper
