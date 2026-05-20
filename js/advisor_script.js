let currentPage = 'advisor-students';
let cachedAdvisorStudents = [];
let cachedAllCourses = [];
let currentViewingStudentId = null;
let currentViewingStudentName = '';

// ── Chat state ──
let chatOpenStudentId = null;
let chatOpenStudentName = '';
let chatOpenStudentCode = '';
let chatPollInterval = null;
let chatConversations = [];

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

function escapeJs(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ');
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
        const user = JSON.parse(sessionStorage.getItem('edumate_admin_user') || '{}');
        adminName.textContent = user.name || user.email || 'Advisor';
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

async function loadAdvisorStudentsData() {
    try {
        const students = await adminApi('/advisors/my-students');
        cachedAdvisorStudents = students;
        renderAdvisorStudentsTable(students);
    } catch (e) {
        notify('Failed to load your students', 'error');
    }
}

async function loadAdvisorSummerRequests() {
    const wrap = document.getElementById('advisorRequestsWrap');
    if (!wrap) return;
    wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">Loading requests...</div>';
    try {
        const requests = await adminApi('/planning/advisor/requests');
        if (!Array.isArray(requests) || !requests.length) {
            wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No summer requests from your students yet.</div>';
            return;
        }
        wrap.innerHTML = `<table><thead><tr>
            <th>Student</th><th>Course</th><th>Semester</th><th>Reason</th><th>Status</th><th>Action</th>
        </tr></thead><tbody>${requests.map(r => {
            const course = r.course ? `${r.course.code} - ${r.course.name}` : `Course #${r.course_id}`;
            const status = String(r.status || 'pending').toLowerCase();
            const color = status === 'approved' ? '#10B981' : status === 'rejected' ? '#EF4444' : '#F59E0B';
            return `
            <tr>
                <td>
                    <div style="font-weight:700">${escapeHtml(r.student_name || 'Student')}</div>
                    <div style="font-size:0.8rem;color:var(--muted)">ID: ${escapeHtml(r.student_code || r.student_id)}</div>
                </td>
                <td>${escapeHtml(course)}</td>
                <td>${escapeHtml(r.semester || 'Summer')}</td>
                <td>${escapeHtml(r.reason || 'No reason added')}</td>
                <td>
                    <span class="badge" style="background:${color}">${escapeHtml(status.toUpperCase())}</span>
                    ${r.admin_notes ? `<div style="font-size:0.8rem;color:var(--muted);margin-top:6px">${escapeHtml(r.admin_notes)}</div>` : ''}
                </td>
                <td>
                    ${status === 'pending' ? `
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                        <input id="request-note-${r.student_id}-${r.id}" class="input" placeholder="Note (optional)" style="min-width:160px;padding:8px">
                        <button class="link-btn" style="border-color:#10B981;color:#10B981" onclick="reviewSummerRequest(${r.student_id}, ${r.id}, 'approved')">Approve</button>
                        <button class="link-btn" style="border-color:#EF4444;color:#EF4444" onclick="reviewSummerRequest(${r.student_id}, ${r.id}, 'rejected')">Reject</button>
                    </div>` : '<span style="color:var(--muted);font-size:0.85rem">Reviewed</span>'}
                </td>
            </tr>`;
        }).join('')}</tbody></table>`;
    } catch (e) {
        wrap.innerHTML = `<div style="color:#ef4444;padding:20px;text-align:center">${escapeHtml(e.message || 'Failed to load requests.')}</div>`;
    }
}

async function reviewSummerRequest(studentId, requestId, status) {
    const note = document.getElementById(`request-note-${studentId}-${requestId}`)?.value.trim() || '';
    try {
        await adminApi(`/planning/advisor/requests/${studentId}/${requestId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, admin_notes: note || null }),
        });
        notify(`Request ${status}`, 'success');
        await loadAdvisorSummerRequests();
    } catch (e) {
        notify(e.message || 'Failed to update request', 'error');
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
            <td><button class="link-btn" onclick="viewStudentCourses(${s.id}, '${escapeHtml(s.full_name)}')">View Courses</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    wrap.innerHTML = html;
}

function formatGpa(gpa) {
    const numericGpa = Number(gpa);
    return Number.isFinite(numericGpa) ? numericGpa.toFixed(2) : 'N/A';
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

async function loadAdvisorDashboard() {
    const user = JSON.parse(sessionStorage.getItem('edumate_admin_user') || '{}');
    setText('advisorWelcomeTitle', `Welcome back, ${user.name || user.email || 'Advisor'}`);

    const studentsWrap = document.getElementById('advisorOverviewStudents');
    const meetupsWrap = document.getElementById('advisorOverviewMeetups');
    if (studentsWrap) studentsWrap.innerHTML = '<div style="color:var(--muted);padding:12px;text-align:center">Loading students...</div>';
    if (meetupsWrap) meetupsWrap.innerHTML = '<div style="color:var(--muted);padding:12px;text-align:center">Loading meetups...</div>';

    const [studentsResult, requestsResult, appointmentsResult, chatResult] = await Promise.allSettled([
        adminApi('/advisors/my-students'),
        adminApi('/planning/advisor/requests'),
        adminApi('/advising/appointments/advisor/me'),
        adminApi('/chat/advisor/conversations'),
    ]);

    const students = studentsResult.status === 'fulfilled' && Array.isArray(studentsResult.value) ? studentsResult.value : [];
    const requests = requestsResult.status === 'fulfilled' && Array.isArray(requestsResult.value) ? requestsResult.value : [];
    const appointments = appointmentsResult.status === 'fulfilled' && Array.isArray(appointmentsResult.value) ? appointmentsResult.value : [];
    const conversations = chatResult.status === 'fulfilled' && Array.isArray(chatResult.value) ? chatResult.value : [];

    cachedAdvisorStudents = students;

    const pendingRequests = requests.filter(r => String(r.status || 'pending').toLowerCase() === 'pending');
    const activeAppointments = appointments.filter(a => !['completed', 'canceled', 'cancelled'].includes(String(a.status || '').toLowerCase()));
    const unreadCount = conversations.reduce((sum, item) => sum + Number(item.unread_count || item.unread || 0), 0);

    setText('advisorMetricStudents', students.length);
    setText('advisorMetricRequests', pendingRequests.length);
    setText('advisorMetricMeetups', activeAppointments.length);
    setText('advisorMetricUnread', unreadCount);

    renderAdvisorOverviewStudents(students, pendingRequests);
    renderAdvisorOverviewMeetups(activeAppointments);
}

function renderAdvisorOverviewStudents(students, pendingRequests) {
    const wrap = document.getElementById('advisorOverviewStudents');
    if (!wrap) return;
    if (!students.length) {
        wrap.innerHTML = '<div style="color:var(--muted);padding:12px;text-align:center">No assigned students yet.</div>';
        return;
    }

    const requestCountByStudent = pendingRequests.reduce((map, req) => {
        const key = String(req.student_id);
        map[key] = (map[key] || 0) + 1;
        return map;
    }, {});

    const sorted = [...students].sort((a, b) => {
        const aRequests = requestCountByStudent[String(a.id)] || 0;
        const bRequests = requestCountByStudent[String(b.id)] || 0;
        if (bRequests !== aRequests) return bRequests - aRequests;
        return Number(a.gpa || 4) - Number(b.gpa || 4);
    }).slice(0, 5);

    wrap.innerHTML = sorted.map(student => {
        const requests = requestCountByStudent[String(student.id)] || 0;
        return `<div class="advisor-preview-row">
            <div>
                <div class="advisor-preview-row-title">${escapeHtml(student.full_name || 'Student')}</div>
                <div class="advisor-preview-row-meta">ID: ${escapeHtml(student.student_code)} · GPA ${formatGpa(student.gpa)}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end">
                ${requests ? `<span class="badge" style="background:#F59E0B">${requests} request${requests === 1 ? '' : 's'}</span>` : ''}
                <button class="link-btn" onclick="viewStudentCourses(${student.id}, '${escapeHtml(student.full_name || 'Student')}')">Open</button>
            </div>
        </div>`;
    }).join('');
}

function renderAdvisorOverviewMeetups(appointments) {
    const wrap = document.getElementById('advisorOverviewMeetups');
    if (!wrap) return;
    if (!appointments.length) {
        wrap.innerHTML = '<div style="color:var(--muted);padding:12px;text-align:center">No upcoming meetups booked.</div>';
        return;
    }

    wrap.innerHTML = appointments.slice(0, 5).map(appointment => `<div class="advisor-preview-row">
        <div>
            <div class="advisor-preview-row-title">${escapeHtml(appointment.student_name || 'Student')}</div>
            <div class="advisor-preview-row-meta">
                ${escapeHtml(appointment.appointment_date || '')} · ${escapeHtml(appointment.start_time || '')} - ${escapeHtml(appointment.end_time || '')}
            </div>
        </div>
        <span class="badge" style="background:${appointment.status === 'booked' ? '#8B5CF6' : '#10B981'}">${escapeHtml(appointment.status || 'scheduled')}</span>
    </div>`).join('');
}

async function loadAllCourses() {
    if (cachedAllCourses.length > 0) return cachedAllCourses;
    try {
        const courses = await adminApi('/courses');
        cachedAllCourses = courses;
        return courses;
    } catch (e) {
        console.error('Failed to load available courses', e);
        return [];
    }
}

async function viewStudentCourses(studentId, studentName) {
    currentViewingStudentId = studentId;
    currentViewingStudentName = studentName;
    try {
        const enrollments = await adminApi(`/advisors/students/${studentId}/courses`);
        
        // Split courses: Finished (has grade or specific status) vs Ongoing/Planned
        const finished = enrollments.filter(e => e.grade || ['completed', 'finished', 'passed', 'failed'].includes(String(e.status).toLowerCase()));
        const ongoing = enrollments.filter(e => !finished.includes(e));

        document.getElementById('modalStudentName').textContent = studentName;
        
        const finishedList = document.getElementById('finishedCoursesList');
        const ongoingList = document.getElementById('ongoingCoursesList');

        finishedList.innerHTML = finished.length ? finished.map(e => {
            const grade = String(e.grade || '—').toUpperCase();
            const gradeColor = grade === 'F' ? '#ef4444' : (['A', 'A+', 'A-'].includes(grade) ? '#10B981' : '#F59E0B');
            return `
                <li class="course-item-detail">
                    <div style="display:flex; align-items:center; flex:1">
                        <span class="course-code">${escapeHtml(e.course ? e.course.code : 'N/A')}</span>
                        <span class="course-name">${escapeHtml(e.course ? e.course.name : 'Unknown')}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px">
                        <span class="course-grade" style="background:rgba(255,255,255,0.05); color:${gradeColor}; border:1px solid ${gradeColor}">${escapeHtml(grade)}</span>
                        <button class="btn-icon" style="background:none; border:none; cursor:pointer; opacity:0.6; padding:0" title="Remove" onclick="removeEnrollment(${e.id}, ${studentId}, '${escapeHtml(studentName)}')">🗑️</button>
                    </div>
                </li>
            `;
        }).join('') : '<li style="color:var(--muted);padding:10px">No completed courses.</li>';

        ongoingList.innerHTML = ongoing.length ? ongoing.map(e => `
            <li class="course-item-detail">
                <div style="display:flex; align-items:center; flex:1">
                    <span class="course-code">${escapeHtml(e.course ? e.course.code : 'N/A')}</span>
                    <span class="course-name">${escapeHtml(e.course ? e.course.name : 'Unknown')}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px">
                    <span style="font-size:0.75rem; color:var(--muted)">${escapeHtml(e.semester)}</span>
                    <select class="input" style="padding:4px 8px; font-size:0.8rem; width:80px; margin:0; background:rgba(255,255,255,0.05); color:white; border:1px solid var(--border); border-radius:4px" onchange="setGrade(${e.id}, this.value, ${studentId}, '${escapeHtml(studentName)}')">
                        <option value="">Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="B-">B-</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="F">F</option>
                    </select>
                    <button class="btn-icon" style="background:none; border:none; cursor:pointer; color:#ef4444; font-size:1.2rem; padding:0" title="Unenroll" onclick="removeEnrollment(${e.id}, ${studentId}, '${escapeHtml(studentName)}')">—</button>
                </div>
            </li>
        `).join('') : '<li style="color:var(--muted);padding:10px">No ongoing courses.</li>';

        // Populate available courses dropdown
        const allCourses = await loadAllCourses();
        const select = document.getElementById('availableCoursesSelect');
        if (select) {
            // Filter out courses already enrolled
            const enrolledCourseIds = enrollments.map(e => e.course_id);
            const available = allCourses.filter(c => !enrolledCourseIds.includes(c.id));
            
            select.innerHTML = '<option value="">Select Course...</option>' + 
                available.map(c => `<option value="${c.id}">${escapeHtml(c.code)} - ${escapeHtml(c.name)}</option>`).join('');
        }

        document.getElementById('studentCoursesModal').style.display = 'flex';
    } catch (e) {
        notify(e.message || 'Failed to load student courses', 'error');
    }
}

async function setGrade(enrollmentId, grade, studentId, studentName) {
    if (!grade) return;
    try {
        await adminApi(`/advisors/enrollments/${enrollmentId}`, {
            method: 'PUT',
            body: JSON.stringify({ grade: grade, status: 'completed' })
        });
        notify(`Grade ${grade} set successfully. Course moved to completed.`, 'success');
        viewStudentCourses(studentId, studentName);
        loadAdvisorStudentsData();
    } catch (e) {
        notify(e.message || 'Failed to set grade', 'error');
    }
}

async function enrollCurrentStudent() {
    const courseId = document.getElementById('availableCoursesSelect').value;
    const semester = document.getElementById('enrollSemester').value;
    
    if (!courseId) {
        notify('Please select a course to enroll', 'warning');
        return;
    }
    
    if (!currentViewingStudentId) {
        notify('No student selected', 'error');
        return;
    }
    
    try {
        await adminApi(`/advisors/students/${currentViewingStudentId}/enroll?course_id=${courseId}&semester=${encodeURIComponent(semester)}`, {
            method: 'POST'
        });
        notify('Student enrolled successfully', 'success');
        viewStudentCourses(currentViewingStudentId, currentViewingStudentName);
    } catch (e) {
        notify(e.message || 'Failed to enroll student', 'error');
    }
}

async function removeEnrollment(enrollmentId, studentId, studentName) {
    if (!confirm('Are you sure you want to remove this record?')) return;
    try {
        await adminApi(`/advisors/enrollments/${enrollmentId}`, { method: 'DELETE' });
        notify('Record removed', 'success');
        viewStudentCourses(studentId, studentName);
    } catch (e) {
        notify(e.message || 'Failed to remove enrollment', 'error');
    }
}

function closeStudentCoursesModal() {
    document.getElementById('studentCoursesModal').style.display = 'none';
}

async function loadAdvisorMeetingSlots() {
    await Promise.allSettled([loadCurrentAdvisorSlot(), loadAdvisorAppointments()]);
}

async function loadCurrentAdvisorSlot() {
    const wrap = document.getElementById('advisorCurrentSlotWrap');
    if (!wrap) return;
    wrap.textContent = 'Loading current slot...';
    try {
        const slot = await adminApi('/advising/slots/me');
        document.getElementById('advisorSlotDay').value = slot.day_of_week;
        document.getElementById('advisorSlotFrom').value = slot.start_time;
        document.getElementById('advisorSlotTo').value = slot.end_time;
        document.getElementById('advisorSlotPlace').value = slot.location || '';
        wrap.innerHTML = `<span class="badge" style="background:#10B981">Active</span>
            <div style="margin-top:8px;color:var(--text);font-weight:600">${escapeHtml(slot.day_of_week)} ${escapeHtml(slot.start_time)} - ${escapeHtml(slot.end_time)}</div>
            <div>${escapeHtml(slot.location || 'TBA')}</div>
            <div style="margin-top:6px;font-size:0.8rem">Students will see 15-minute slots inside this time range.</div>`;
    } catch (e) {
        wrap.innerHTML = '<span class="badge" style="background:#64748b">Inactive</span><div style="margin-top:8px">No active slot yet.</div>';
    }
}

async function saveAdvisorSlot() {
    const day = document.getElementById('advisorSlotDay')?.value || '';
    const start = document.getElementById('advisorSlotFrom')?.value || '';
    const end = document.getElementById('advisorSlotTo')?.value || '';
    const location = document.getElementById('advisorSlotPlace')?.value.trim() || '';

    if (!day || !start || !end || !location) {
        notify('Please choose day, from time, to time, and place.', 'warning');
        return;
    }
    if (end <= start) {
        notify('The end time must be after the start time.', 'warning');
        return;
    }

    try {
        await adminApi('/advising/slots', {
            method: 'POST',
            body: JSON.stringify({ day_of_week: day, start_time: start, end_time: end, location })
        });
        notify('Meetup slot saved. Students can now book 15-minute meetings.', 'success');
        await loadCurrentAdvisorSlot();
    } catch (e) {
        notify(e.message || 'Failed to save meetup slot', 'error');
    }
}

async function deactivateAdvisorSlot() {
    if (!confirm('Deactivate your current meeting slot?')) return;
    try {
        await adminApi('/advising/slots/me', { method: 'DELETE' });
        notify('Meeting slot deactivated', 'info');
        await loadCurrentAdvisorSlot();
    } catch (e) {
        notify(e.message || 'No active slot to deactivate', 'error');
    }
}

async function loadAdvisorAppointments() {
    const wrap = document.getElementById('advisorAppointmentsWrap');
    if (!wrap) return;
    wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">Loading meetings...</div>';
    try {
        const appointments = await adminApi('/advising/appointments/advisor/me');
        if (!appointments.length) {
            wrap.innerHTML = '<div style="color:var(--muted);padding:20px;text-align:center">No student meetings booked yet.</div>';
            return;
        }
        wrap.innerHTML = `<table><thead><tr>
            <th>Student</th><th>Date</th><th>Time</th><th>Reason</th><th>Status / Notes</th>
        </tr></thead><tbody>${appointments.map(a => `
            <tr>
                <td>
                    <div style="font-weight:700">${escapeHtml(a.student_name || 'Student')}</div>
                    <div style="font-size:0.8rem;color:var(--muted)">ID: ${escapeHtml(a.student_code || a.student_id)}</div>
                </td>
                <td>${escapeHtml(a.appointment_date)}</td>
                <td>${escapeHtml(a.start_time)} - ${escapeHtml(a.end_time)}<div style="font-size:0.8rem;color:var(--muted)">${escapeHtml(a.location || '')}</div></td>
                <td>
                    <div>${escapeHtml(a.purpose || 'inquiry')}</div>
                    <div style="font-size:0.8rem;color:var(--muted)">${escapeHtml(a.purpose_notes || 'No reason added')}</div>
                </td>
                <td>
                    <span class="badge" style="background:${a.status === 'booked' ? '#8B5CF6' : '#10B981'}">${escapeHtml(a.status)}</span>
                    ${a.outcome?.advisor_rating ? `<div style="margin-top:8px;color:var(--muted);font-size:0.82rem">Your rating: ${escapeHtml(String(a.outcome.advisor_rating))}/5</div>` : ''}
                    ${a.outcome?.advisor_notes ? `<div style="margin-top:6px;color:var(--muted);font-size:0.82rem;max-width:260px">${escapeHtml(a.outcome.advisor_notes)}</div>` : ''}
                    ${a.status === 'booked' ? `
                        <div style="display:flex;gap:8px;margin-top:8px;align-items:center">
                            <button class="link-btn" onclick="openAdvisorMeetingReportModal(${a.id}, '${escapeJs(a.student_name || 'Student')}', '${escapeJs(a.appointment_date || '')}', '${escapeJs(a.start_time || '')}', '${escapeJs(a.purpose_notes || a.purpose || '')}')">Finish</button>
                        </div>
                    ` : ''}
                </td>
            </tr>
        `).join('')}</tbody></table>`;
    } catch (e) {
        wrap.innerHTML = `<div style="color:#ef4444;padding:20px;text-align:center">${escapeHtml(e.message || 'Failed to load meetings.')}</div>`;
    }
}

async function submitAdvisorMeetingNotes(appointmentId) {
    openAdvisorMeetingReportModal(appointmentId, 'Student', '', '', '');
}

function openAdvisorMeetingReportModal(appointmentId, studentName, appointmentDate, startTime, reason) {
    document.getElementById('advisorReportAppointmentId').value = appointmentId;
    document.getElementById('advisorReportRating').value = '';
    document.getElementById('advisorReportNotes').value = reason ? `Reason: ${reason}\n\nReport: ` : '';
    document.getElementById('advisorReportMeetingMeta').textContent = `${studentName || 'Student'}${appointmentDate ? ` - ${appointmentDate}` : ''}${startTime ? ` at ${startTime}` : ''}`;
    document.querySelectorAll('#advisorReportRatingRow .rating-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('advisorMeetingReportModal').style.display = 'flex';
}

function closeAdvisorMeetingReportModal() {
    document.getElementById('advisorMeetingReportModal').style.display = 'none';
}

function setAdvisorReportRating(value) {
    document.getElementById('advisorReportRating').value = value;
    document.querySelectorAll('#advisorReportRatingRow .rating-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index < value);
    });
}

async function submitAdvisorMeetingReport() {
    const appointmentId = Number(document.getElementById('advisorReportAppointmentId')?.value || 0);
    const rating = Number(document.getElementById('advisorReportRating')?.value || 0);
    const notes = document.getElementById('advisorReportNotes')?.value.trim() || '';
    if (!appointmentId) return;
    if (!rating) {
        notify('Please choose a rating out of 5.', 'warning');
        return;
    }
    if (!notes) {
        notify('Please write a short meeting report.', 'warning');
        return;
    }
    try {
        await adminApi(`/advising/appointments/${appointmentId}/outcome/advisor`, {
            method: 'PATCH',
            body: JSON.stringify({ rating, status: 'completed', notes })
        });
        notify('Meeting report saved', 'success');
        closeAdvisorMeetingReportModal();
        await loadAdvisorAppointments();
    } catch (e) {
        notify(e.message || 'Failed to save meeting report', 'error');
    }
}

function navigateTo(id) {
    currentPage = id;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    updateActiveNavItem(id);
    
    if (id === 'advisor-dashboard') loadAdvisorDashboard();
    if (id === 'advisor-students') loadAdvisorStudentsData();
    if (id === 'advisor-requests') loadAdvisorSummerRequests();
    if (id === 'advisor-meeting-slots') loadAdvisorMeetingSlots();
    if (id === 'advisor-chat') {
        loadChatConversations();
        startChatPolling();
    } else {
        stopChatPolling();
    }
}

function signOut() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

function initializeApp() {
    updateThemeIcon();
    updateAdminProfile();
    
    const themePref = localStorage.getItem('edumate_admin_theme');
    if (themePref === 'light') document.body.classList.remove('dark-theme');
    
    navigateTo('advisor-dashboard');
}

document.addEventListener('DOMContentLoaded', initializeApp);
document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

window.navigateTo = navigateTo;
window.viewStudentCourses = viewStudentCourses;
window.closeStudentCoursesModal = closeStudentCoursesModal;
window.signOut = signOut;
window.enrollCurrentStudent = enrollCurrentStudent;
window.setGrade = setGrade;
window.removeEnrollment = removeEnrollment;
window.loadAdvisorMeetingSlots = loadAdvisorMeetingSlots;
window.loadAdvisorSummerRequests = loadAdvisorSummerRequests;
window.reviewSummerRequest = reviewSummerRequest;
window.saveAdvisorSlot = saveAdvisorSlot;
window.deactivateAdvisorSlot = deactivateAdvisorSlot;
window.loadAdvisorAppointments = loadAdvisorAppointments;
window.submitAdvisorMeetingNotes = submitAdvisorMeetingNotes;
window.openAdvisorMeetingReportModal = openAdvisorMeetingReportModal;
window.closeAdvisorMeetingReportModal = closeAdvisorMeetingReportModal;
window.setAdvisorReportRating = setAdvisorReportRating;
window.submitAdvisorMeetingReport = submitAdvisorMeetingReport;
window.openChatWithStudent = openChatWithStudent;
window.advisorSendMessage = advisorSendMessage;

// ══════════════════════════════════════════
//  CHAT FUNCTIONS
// ══════════════════════════════════════════

async function loadChatConversations() {
    try {
        const convs = await adminApi('/chat/advisor/conversations');
        chatConversations = convs;
        renderChatSidebar(convs);
        updateChatNavBadge(convs);
    } catch (e) {
        const list = document.getElementById('chatStudentList');
        if (list) list.innerHTML = '<div style="padding:16px;color:var(--muted);font-size:0.85rem">Failed to load conversations.</div>';
    }
}

function renderChatSidebar(convs) {
    const list = document.getElementById('chatStudentList');
    if (!list) return;
    if (!convs.length) {
        list.innerHTML = '<div style="padding:16px;color:var(--muted);font-size:0.85rem">No students assigned yet.</div>';
        return;
    }
    list.innerHTML = convs.map(c => {
        const initials = (c.student_name || 'S').slice(0, 2).toUpperCase();
        const unread = c.unread_count > 0
            ? `<div class="chat-unread-badge">${c.unread_count}</div>`
            : '';
        const activeClass = chatOpenStudentId === c.student_id ? ' active' : '';
        return `
        <div class="chat-student-item${activeClass}" data-student-id="${c.student_id}" data-student-name="${escapeHtml(c.student_name)}" data-student-code="${escapeHtml(c.student_code)}">
            <div class="chat-student-avatar">${initials}</div>
            <div class="chat-student-info">
                <div class="chat-student-name">${escapeHtml(c.student_name)}</div>
                <div class="chat-student-code">${escapeHtml(c.student_code)}</div>
            </div>
            ${unread}
        </div>`;
    }).join('');
    list.querySelectorAll('.chat-student-item').forEach(item => {
        item.addEventListener('click', () => {
            openChatWithStudent(
                Number(item.dataset.studentId),
                item.dataset.studentName || 'Student',
                item.dataset.studentCode || ''
            );
        });
    });
}

function updateChatNavBadge(convs) {
    const badge = document.getElementById('chat-nav-badge');
    if (!badge) return;
    const total = convs.reduce((sum, c) => sum + (c.unread_count || 0), 0);
    if (total > 0) {
        badge.textContent = total > 9 ? '9+' : total;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

async function openChatWithStudent(studentId, studentName, studentCode) {
    chatOpenStudentId = studentId;
    chatOpenStudentName = studentName;
    chatOpenStudentCode = studentCode;

    // Update sidebar active state
    document.querySelectorAll('.chat-student-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.chat-student-item[data-student-id="${studentId}"]`)?.classList.add('active');

    // Show header
    const initials = (studentName || 'S').slice(0, 2).toUpperCase();
    document.getElementById('chatHeaderAvatar').textContent = initials;
    document.getElementById('chatHeaderName').textContent = studentName;
    document.getElementById('chatHeaderCode').textContent = studentCode;
    document.getElementById('chatEmptyState').style.display = 'none';
    document.getElementById('chatWindowHeader').style.display = 'flex';
    document.getElementById('chatMessagesArea').style.display = 'flex';
    document.getElementById('chatInputBar').style.display = 'flex';

    await fetchAndRenderMessages();
    const chatInput = document.getElementById('chatMsgInput');
    if (chatInput) {
        chatInput.style.height = '44px';
        chatInput.focus();
    }
    // Refresh sidebar to clear unread badge
    loadChatConversations();
}

async function fetchAndRenderMessages() {
    if (!chatOpenStudentId) return;
    try {
        const messages = await adminApi(`/chat/advisor/messages/${chatOpenStudentId}`);
        renderMessages(messages);
    } catch (e) {
        console.error('Failed to load messages', e);
    }
}

function renderMessages(messages) {
    const area = document.getElementById('chatMessagesArea');
    if (!area) return;
    if (!messages.length) {
        area.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:0.85rem;margin-top:20px">No messages yet. Say hello! 👋</div>';
        return;
    }
    area.innerHTML = messages.map(m => {
        const isSent = m.sender_role === 'advisor';
        const wrapClass = isSent ? 'sent' : 'received';
        const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
        <div class="chat-bubble-wrap ${wrapClass}">
            <div class="chat-bubble-stack">
                <div class="chat-bubble">${escapeHtml(m.content)}</div>
                <div class="chat-bubble-time">${time}</div>
            </div>
        </div>`;
    }).join('');
    // Scroll to bottom
    area.scrollTop = area.scrollHeight;
}

async function advisorSendMessage() {
    const input = document.getElementById('chatMsgInput');
    const btn = document.getElementById('chatSendBtn');
    if (!input || !chatOpenStudentId) return;
    const content = input.value.trim();
    if (!content) return;

    if (btn) btn.disabled = true;
    try {
        await adminApi(`/chat/advisor/messages/${chatOpenStudentId}`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        input.value = '';
        input.style.height = '44px';
        await fetchAndRenderMessages();
    } catch (e) {
        notify(e.message || 'Failed to send message', 'error');
    } finally {
        if (btn) btn.disabled = false;
        input.focus();
    }
}

function startChatPolling() {
    stopChatPolling();
    chatPollInterval = setInterval(async () => {
        await loadChatConversations();
        if (chatOpenStudentId) await fetchAndRenderMessages();
    }, 5000);
}

function stopChatPolling() {
    if (chatPollInterval) { clearInterval(chatPollInterval); chatPollInterval = null; }
}

// Send on Enter (Shift+Enter = new line)
document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('chatMsgInput');
    if (inp) {
        const resizeChatInput = () => {
            inp.style.height = '44px';
            inp.style.height = Math.min(inp.scrollHeight, 120) + 'px';
        };
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                advisorSendMessage();
            }
        });
        // Auto-grow textarea
        inp.addEventListener('input', resizeChatInput);
    }
});
