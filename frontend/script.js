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

// Global Variables
let users = JSON.parse(localStorage.getItem('edumate_users')) || {};
let resumeData = {
    name: "Mohamed Ahmed",
    title: "Software Engineer",
    email: "mohamed@example.com",
    phone: "+20 123 456 7890",
    location: "Cairo, Egypt",
    linkedin: "linkedin.com/in/mohamed",
    github: "github.com/mohamed",
    education: [
        { degree: "B.Sc Computer Science", school: "Cairo University", year: "2022 – 2026" }
    ],
    experience: [
        { title: "Frontend Developer Intern", company: "TechCorp", dates: "Summer 2024", desc: "Built responsive web apps using React and Tailwind" }
    ],
    skills: "Python, JavaScript, React, Node.js, SQL, Git, AWS",
    projects: []
};

// Load resume data from localStorage
if (localStorage.getItem('edumate_resume')) {
    resumeData = JSON.parse(localStorage.getItem('edumate_resume'));
}

// Events Data
const eventsData = {
    cs: [
        { title: "AI & ML Summit 2026", img: "https://www.adamasintel.com/wp-content/uploads/2024/04/AdobeStock_658654791-2400x1345.jpeg", desc: "Latest AI trends and hands-on workshops" },
        { title: "Cybersecurity Challenge", img: "https://www.hollywoodledletters.ie/wp-content/uploads/2019/10/UPSTARTER-MANSION-HOUSE-HOLLYWOOD-LED-LETTERS-1024x768.jpg", desc: "Ethical hacking competition + career fair" }
    ],
    masscomm: [
        { title: "Digital Media Expo", img: "https://images.pushsquare.com/98564c6a76670/egx-playstation-4-ps4-1.large.jpg", desc: "Content creation and influencer strategies" },
        { title: "Comic Con New York", img: "https://i0.wp.com/gaming-age.com/wp-content/uploads/2022/09/NYCC-2022-Header.jpg?fit=1280%2C852&ssl=1", desc: "Pop culture, networking, and media jobs" }
    ],
    business: [
        { title: "Startup Pitch Competition", img: "https://www.fluxxconference.com/wp-content/uploads/2025/03/About-Conference-3-1-550x785.jpg", desc: "Pitch your idea + meet investors" },
        { title: "Finance & Investment Summit", img: "https://www.andreamatone.com/wp-content/uploads/2015/04/event-conference-photography.jpg", desc: "Stock trading, crypto, and career paths" }
    ],
    engineering: [
        { title: "Robotics & Automation Expo", img: "https://tse1.mm.bing.net/th/id/OIP.NyqJgj7GgaFTgf-VgyT0owHaE7?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Live robot demos + engineering jobs" },
        { title: "Civil Engineering Conference", img: "https://moneyfactsgroup.co.uk/media/bmifehmz/jb-268.jpg", desc: "Mega projects tour + internships" }
    ],
    medicine: [
        { title: "Medical Research Symposium", img: "https://tse4.mm.bing.net/th/id/OIP.IOYLzAcKj_49TH68tQ2lmQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Latest healthcare innovations" },
        { title: "First Aid & CPR Workshop", img: "https://tse4.mm.bing.net/th/id/OIP.IOYLzAcKj_49TH68tQ2lmQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3", desc: "Practical emergency medical training" }
    ]
};

// Jobs Data
const jobsData = [
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
        applyUrl: 'https://www.amazon.jobs/en/jobs/123456/frontend-developer' 
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

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateThemeIcon();
});

// Initialize Application
function initializeApp() {
    updateSidebarFromStorage();
    applyStoredProfileToUI();
    
    const logged = sessionStorage.getItem('edumate_logged') === '1';
    const seenWelcome = localStorage.getItem('edumate_seen_welcome') === '1';
    
    if (!logged && !seenWelcome) {
        showPageWithTransition('welcome');
        localStorage.setItem('edumate_seen_welcome', '1');
    } else if (logged) {
        showPageWithTransition('dashboard');
        renderJobs();
    } else {
        showPageWithTransition('login');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Enter key for AI chat
    document.getElementById('ai-chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAIChatMessage();
    });
    
    document.getElementById('ai-popup-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAIPopupMessage();
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('aiPopup');
        const bubble = document.getElementById('aiBubble');
        if (popup?.classList.contains('active') && !popup.contains(e.target) && !bubble.contains(e.target)) {
            popup.classList.remove('active');
        }
    });
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
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('shifted');
}

// Page Navigation
function showPageWithTransition(id) {
    const requiresAuth = ['dashboard', 'faculty', 'events', 'resume', 'jobs', 'xai', 'profile'];
    const logged = sessionStorage.getItem('edumate_logged') === '1';
    
    if (requiresAuth.includes(id) && !logged) {
        id = 'login';
        alert('Please sign in to access this page.');
    }
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        window.scrollTo(0, 0);
    }
    
    document.getElementById('aiPopup')?.classList.remove('active');
    
    if (id === 'dashboard') renderJobs();
    if (id === 'events') loadEventsByMajor();
    if (id === 'resume') setTimeout(generateResumePreview, 100);
}

// Authentication Functions
function attemptLogin() {
    const emailOrUser = document.getElementById('login-email')?.value.trim() || '';
    const password = document.getElementById('login-password')?.value || '';
    
    if (!emailOrUser || !password) { 
        alert('Please enter email/username and password.'); 
        return; 
    }

    let matched = null;
    for (const k of Object.keys(users)) {
        const u = users[k];
        if ((u.username === emailOrUser) || (u.email && u.email.toLowerCase() === emailOrUser.toLowerCase())) {
            matched = u;
            break;
        }
    }
    
    if (matched && matched.password === password) {
        loginUser(matched.username, true);
    } else {
        alert('Invalid credentials. Try: student / pass123 or create an account.');
    }
}

function firebaseLogin(providerType) {
    let provider;
    if (providerType === 'google') {
        provider = new firebase.auth.GoogleAuthProvider();
    } else if (providerType === 'github') {
        provider = new firebase.auth.GithubAuthProvider();
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
    sessionStorage.setItem('edumate_logged', '1');
    sessionStorage.setItem('edumate_username', username);
    if (remember) localStorage.setItem('edumate_last_user', username);
    
    updateSidebarFromStorage();
    applyStoredProfileToUI();
    document.getElementById('user-name').textContent = users[username].name || username;
    showPageWithTransition('dashboard');
}

function signOut() {
    sessionStorage.removeItem('edumate_logged');
    sessionStorage.removeItem('edumate_username');
    showPageWithTransition('login');
    updateSidebarFromStorage();
    document.getElementById('user-name').textContent = '';
}

// Registration Functions
function startRegistration() {
    const name = document.getElementById('reg-name')?.value.trim() || '';
    const username = document.getElementById('reg-username')?.value.trim() || '';
    const email = document.getElementById('reg-email')?.value.trim() || '';
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
        alert('Username already exists.'); 
        return; 
    }
    
    const temp = { 
        username, name, email, password, 
        profilePic: 'https://via.placeholder.com/110/6C5CE7/FFFFFF?text=U', 
        education: '', major: '', gradYear: '', skills: '' 
    };
    sessionStorage.setItem('edumate_temp_registration', JSON.stringify(temp));
    fillInfoPageFromTemp();
    showPageWithTransition('info');
}

function fillInfoPageFromTemp() {
    const temp = JSON.parse(sessionStorage.getItem('edumate_temp_registration') || '{}');
    if (!temp) return;
    document.getElementById('info-fullname').value = temp.name || '';
    document.getElementById('info-username').value = temp.username || '';
    document.getElementById('info-email').value = temp.email || '';
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
    const temp = JSON.parse(sessionStorage.getItem('edumate_temp_registration') || '{}');
    if (!temp || !temp.username) { 
        alert('Registration data missing.'); 
        showPageWithTransition('register'); 
        return; 
    }

    const username = document.getElementById('info-username').value.trim() || '';
    if (!username || (users[username] && username !== temp.username)) { 
        alert('Username is required or already taken.'); 
        return; 
    }

    const userObj = {
        ...temp,
        username,
        name: document.getElementById('info-fullname').value.trim() || '',
        email: document.getElementById('info-email').value.trim() || '',
        education: document.getElementById('info-education').value.trim() || '',
        major: document.getElementById('info-major').value.trim() || '',
        gradYear: document.getElementById('info-gradyear').value.trim() || '',
        skills: document.getElementById('info-skills').value.trim() || '',
        profilePic: document.getElementById('info-avatar-preview').src || temp.profilePic
    };

    users[username] = userObj;
    localStorage.setItem('edumate_users', JSON.stringify(users));
    sessionStorage.removeItem('edumate_temp_registration');
    loginUser(username, true);
    alert('Account created successfully! Welcome to Edumate.');
}

// Profile Functions
function updateSidebarFromStorage() {
    const uname = sessionStorage.getItem('edumate_username');
    const profileName = document.getElementById('profile-name');
    const profilePic = document.getElementById('profile-pic');
    
    if (uname && users[uname]) {
        profileName.textContent = users[uname].name || uname;
        profilePic.src = users[uname].profilePic || 'https://via.placeholder.com/44/6C5CE7/FFFFFF?text=U';
    } else {
        profileName.textContent = 'Guest';
        profilePic.src = 'https://via.placeholder.com/44/6C5CE7/FFFFFF?text=U';
    }
}

function applyStoredProfileToUI() {
    const uname = sessionStorage.getItem('edumate_username');
    if (!uname || !users[uname]) return;
    const u = users[uname];

    document.getElementById('profile-avatar-large').src = u.profilePic || 'https://via.placeholder.com/110/6C5CE7/FFFFFF?text=U';
    document.getElementById('profile-name-input').value = u.name || '';
    document.getElementById('profile-username-input').value = u.username || '';
    document.getElementById('profile-email-input').value = u.email || '';
    document.getElementById('profile-education-input').value = u.education || '';
    document.getElementById('profile-major-input').value = u.major || '';
    document.getElementById('profile-gradyear-input').value = u.gradYear || '';
    document.getElementById('profile-skills-input').value = u.skills || '';
    if (document.getElementById('user-name')) {
        document.getElementById('user-name').textContent = u.name || u.username;
    }
    updateProfileCompletion();
}

function changeProfileAvatar(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => { 
        document.getElementById('profile-avatar-large').src = e.target.result; 
    };
    reader.readAsDataURL(input.files[0]);
}

function saveProfileEdits() {
    const uname = sessionStorage.getItem('edumate_username');
    if (!uname || !users[uname]) { 
        alert('Please login first.'); 
        return; 
    }
    
    const u = users[uname];
    const newUsername = document.getElementById('profile-username-input').value.trim() || '';
    
    if (newUsername && newUsername !== u.username && users[newUsername]) { 
        alert('Username already taken.'); 
        return; 
    }
    
    const updated = {
        ...u,
        username: newUsername || u.username,
        name: document.getElementById('profile-name-input').value.trim() || u.name,
        email: document.getElementById('profile-email-input').value.trim() || u.email,
        education: document.getElementById('profile-education-input').value.trim() || u.education,
        major: document.getElementById('profile-major-input').value.trim() || u.major,
        gradYear: document.getElementById('profile-gradyear-input').value.trim() || u.gradYear,
        skills: document.getElementById('profile-skills-input').value.trim() || u.skills,
        profilePic: document.getElementById('profile-avatar-large').src || u.profilePic
    };

    if (newUsername && newUsername !== u.username) {
        delete users[u.username];
        sessionStorage.setItem('edumate_username', newUsername);
    }
    
    users[updated.username] = updated;
    localStorage.setItem('edumate_users', JSON.stringify(users));
    updateSidebarFromStorage();
    applyStoredProfileToUI();
    updateProfileCompletion();
    alert('Profile updated successfully!');
}

// AI Chat Functions
function toggleAIPopup() {
    const popup = document.getElementById('aiPopup');
    popup.classList.toggle('active');
}

function sendAIChatMessage() {
    const input = document.getElementById('ai-chat-input');
    const output = document.getElementById('ai-chat-output');
    if (!input || !output) return;
    
    const txt = input.value.trim();
    if (!txt) return;
    
    output.innerHTML += `<div style="margin-bottom:15px"><strong style="color:var(--primary)">You:</strong> ${escapeHtml(txt)}</div>`;
    output.innerHTML += `<div style="margin-bottom:15px"><strong style="color:#10B981">AI:</strong> ${escapeHtml(generateAIResponse(txt))}</div>`;
    input.value = '';
    output.scrollTop = output.scrollHeight;
}

function sendAIPopupMessage() {
    const input = document.getElementById('ai-popup-input');
    const output = document.getElementById('ai-popup-output');
    if (!input || !output) return;
    
    const txt = input.value.trim();
    if (!txt) return;
    
    output.innerHTML += `<div style="margin-bottom:10px"><strong>You:</strong> ${escapeHtml(txt)}</div>`;
    output.innerHTML += `<div style="margin-bottom:15px"><strong>AI:</strong> ${escapeHtml(generateAIResponse(txt))}</div>`;
    input.value = '';
    output.scrollTop = output.scrollHeight;
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

// Events Functions
function loadEventsByMajor() {
    const major = document.getElementById("majorSelect")?.value;
    const container = document.getElementById("eventsContainer");
    
    if (!container) return;
    
    if (!major) { 
        container.innerHTML = `<div class="card" style="text-align:center;color:var(--muted);padding:40px"><p>Select a major to see relevant events</p></div>`;
        return; 
    }
    
    const selectedEvents = eventsData[major] || [];
    container.innerHTML = selectedEvents.map(e => `
        <div class="card event-card">
            <img src="${e.img}" alt="${e.title}" onerror="this.src='https://via.placeholder.com/140x100/6C5CE7/FFFFFF?text=EVENT'">
            <div style="flex:1">
                <h3>${e.title}</h3>
                <p style="color:var(--muted);margin:5px 0">${e.desc}</p>
                <button class="btn" style="font-size:0.85rem;padding:6px 12px">RSVP</button>
            </div>
        </div>
    `).join("");
}

// Jobs Functions
function renderJobs() {
    const list = document.getElementById('jobs-list');
    if (!list) return;

    list.innerHTML = jobsData.map(j => `
        <div class="card">
            <h3>${j.title}</h3>
            <p style="font-weight:600">${j.company}</p>
            <p style="color:var(--muted)">${j.reason} • ${j.match}% match</p>
            <p style="font-size:0.9rem;color:var(--primary)">${j.salary}</p>
            
            <a href="${j.applyUrl}" target="_blank" rel="noopener" style="text-decoration:none;display:block;margin-top:10px">
                <button class="btn" style="width:100%;font-size:0.9rem">Apply Now</button>
            </a>
        </div>
    `).join('');
}

// Resume Functions
function showResumeForm() {
    document.getElementById('resume-form').style.display = 'block';
    loadResumeDataIntoForm();
}

function loadResumeDataIntoForm() {
    document.getElementById('res-name').value = resumeData.name || '';
    document.getElementById('res-title').value = resumeData.title || '';
    document.getElementById('res-email').value = resumeData.email || '';
    document.getElementById('res-phone').value = resumeData.phone || '';
    document.getElementById('res-location').value = resumeData.location || '';
    document.getElementById('res-linkedin').value = resumeData.linkedin || '';
    document.getElementById('res-github').value = resumeData.github || '';
    document.getElementById('res-skills').value = resumeData.skills || '';

    // Populate dynamic sections
    document.getElementById('education-container').innerHTML = '';
    resumeData.education.forEach(addEducationEntry);

    document.getElementById('experience-container').innerHTML = '';
    resumeData.experience.forEach(addExperienceEntry);

    document.getElementById('projects-container').innerHTML = '';
    resumeData.projects.forEach(addProjectEntry);
}

function addEducation(entry = {}) {
    const container = document.getElementById('education-container');
    const div = document.createElement('div');
    div.className = 'education-entry';
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
    const div = document.createElement('div');
    div.className = 'experience-entry';
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
    const div = document.createElement('div');
    div.style = 'border:1px dashed var(--border);padding:12px;border-radius:8px;margin-bottom:10px';
    div.innerHTML = `
        <input placeholder="Project Name" class="input" value="${entry.name || ''}" style="margin-bottom:8px">
        <input placeholder="Tech Stack" class="input" value="${entry.tech || ''}" style="margin-bottom:8px">
        <textarea placeholder="Description" class="input" rows="2">${entry.desc || ''}</textarea>
        <button class="link-btn" style="color:#ef4444;margin-top:8px" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

function saveResumeData() {
    // Save basic info
    resumeData.name = document.getElementById('res-name').value.trim();
    resumeData.title = document.getElementById('res-title').value.trim();
    resumeData.email = document.getElementById('res-email').value.trim();
    resumeData.phone = document.getElementById('res-phone').value.trim();
    resumeData.location = document.getElementById('res-location').value.trim();
    resumeData.linkedin = document.getElementById('res-linkedin').value.trim();
    resumeData.github = document.getElementById('res-github').value.trim();
    resumeData.skills = document.getElementById('res-skills').value.trim();

    // Save dynamic entries
    resumeData.education = Array.from(document.querySelectorAll('.education-entry')).map(el => ({
        degree: el.children[0].value,
        school: el.children[1].value,
        year: el.children[2].value
    }));

    resumeData.experience = Array.from(document.querySelectorAll('.experience-entry')).map(el => ({
        title: el.children[0].value,
        company: el.children[1].value,
        dates: el.children[2].value,
        desc: el.children[3].value
    }));

    localStorage.setItem('edumate_resume', JSON.stringify(resumeData));
    alert('Resume saved!');
    generateResumePreview();
}

function generateResumePreview() {
    const template = document.querySelector('input[name="template"]:checked')?.value || 'modern';
    const content = document.getElementById('resume-content');
    
    const templates = {
        modern: generateModernTemplate,
        elegant: generateElegantTemplate,
        creative: generateCreativeTemplate
    };

    content.innerHTML = templates[template] ? templates[template]() : generateModernTemplate();
}

function generateModernTemplate() {
    return `
    <div style="max-width:800px;margin:0 auto;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2d2d2d;line-height:1.5">
        <header style="text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:4px solid #6C5CE7">
            <h1 style="margin:0;font-size:2.8em;color:#6C5CE7">${resumeData.name || 'Your Name'}</h1>
            <p style="margin:10px 0;font-size:1.2em;color:#555">${resumeData.title || 'Professional Title'}</p>
            <p style="margin:5px 0;color:#666">
                ${resumeData.email || 'email@example.com'} • ${resumeData.phone || '+20 123 456 7890'} • ${resumeData.location || 'City, Country'}<br>
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none">LinkedIn</a> • ` : ''}
                ${resumeData.github ? `<a href="${resumeData.github}" style="color:#6C5CE7;text-decoration:none">GitHub</a>` : ''}
            </p>
        </header>

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
            ${generateModernTemplate().split('<header')[1] ? '<header' + generateModernTemplate().split('<header')[1] : ''}
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
    const feedback = document.getElementById('ats-feedback');
    if (!feedback) return;
    
    feedback.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
                <strong style="color:#10B981">ATS Score: 85% ✅</strong><br>
                <span style="color:var(--muted);font-size:0.9rem">Good job! Your resume passes most systems.</span>
            </div>
            <div style="text-align:right">
                <strong style="color:#F59E0B">⚠️ Missing Keywords:</strong><br>
                <span style="font-size:0.85rem">• Agile Methodology<br>• React.js<br>• AWS Cloud</span>
            </div>
        </div>
    `;
    feedback.style.display = 'block';
}

// Initialize theme from localStorage
const storedTheme = localStorage.getItem('edumate_theme');
if (storedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}


function showPageWithTransition(id) {
    const currentPage = document.querySelector('.page.active');
    const nextPage = document.getElementById(id);
    
    if (currentPage && nextPage) {
        // Animation out
        currentPage.style.opacity = '0';
        currentPage.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            document.querySelectorAll('.page').forEach(p => {
                p.classList.remove('active');
                p.style.opacity = '0';
                p.style.transform = 'translateX(20px)';
            });
            
            nextPage.classList.add('active');
            
            // Animation in
            setTimeout(() => {
                nextPage.style.opacity = '1';
                nextPage.style.transform = 'translateX(0)';
                nextPage.style.transition = 'all 0.3s ease';
            }, 50);
        }, 200);
    } else {
        showPage(id);
    }
}

function calculateProfileCompletion() {
    const uname = sessionStorage.getItem('edumate_username');
    if (!uname || !users[uname]) return 0;
    
    const user = users[uname];
    let completion = 0;
    
    if (user.name && user.name.trim()) completion += 20;
    if (user.email && user.email.trim()) completion += 20;
    if (user.education && user.education.trim()) completion += 15;
    if (user.major && user.major.trim()) completion += 15;
    if (user.skills && user.skills.trim()) completion += 15;
    if (user.profilePic && !user.profilePic.includes('placeholder')) completion += 15;
    
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


// Dashboard Functions
function initDashboard() {
    updateDashboardDate();
    loadDashboardStats();
    initDashboardCharts();
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
    const careerScore = calculateCareerScore();
    document.getElementById('career-score').textContent = careerScore;
    
    const skillGrowth = Math.floor(Math.random() * 20) + 5;
    document.getElementById('skill-growth').textContent = `+${skillGrowth}%`;
    
    const profileViews = Math.floor(Math.random() * 30) + 10;
    document.getElementById('profile-views').textContent = profileViews;
    
    const learningTime = Math.floor(Math.random() * 20) + 5;
    document.getElementById('learning-time').textContent = `${learningTime}h`;
}

function calculateCareerScore() {
    const uname = sessionStorage.getItem('edumate_username');
    if (!uname || !users[uname]) return 65;
    
    const user = users[uname];
    let score = 50; 
    
    if (user.name && user.name.trim()) score += 10;
    if (user.email && user.email.trim()) score += 5;
    if (user.education && user.education.trim()) score += 10;
    if (user.major && user.major.trim()) score += 10;
    if (user.skills && user.skills.trim()) score += 10;
    if (user.profilePic && !user.profilePic.includes('placeholder')) score += 5;
    
    if (localStorage.getItem('edumate_resume')) score += 10;
    if (sessionStorage.getItem('edumate_ai_chats')) score += 5;
    
    return Math.min(score, 100);
}

function initDashboardCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        setTimeout(initDashboardCharts, 500);
        return;
    }
    
    // 1. Skill Radar Chart
    const skillCtx = document.getElementById('skill-chart');
    if (skillCtx) {
        new Chart(skillCtx, {
            type: 'radar',
            data: {
                labels: ['Technical', 'Communication', 'Leadership', 'Problem Solving', 'Creativity', 'Teamwork'],
                datasets: [{
                    label: 'Current Skills',
                    data: [85, 70, 60, 90, 75, 80],
                    backgroundColor: 'rgba(108, 92, 231, 0.2)',
                    borderColor: '#8B5CF6',
                    borderWidth: 2,
                    pointBackgroundColor: '#8B5CF6'
                }, {
                    label: 'Target Skills',
                    data: [95, 85, 80, 95, 85, 90],
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10B981',
                    borderWidth: 2,
                    pointBackgroundColor: '#10B981',
                    borderDash: [5, 5]
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // 2. Jobs Bar Chart
    const jobsCtx = document.getElementById('jobs-chart');
    if (jobsCtx) {
        new Chart(jobsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Applied', 'Interview', 'Rejected', 'Offer'],
                datasets: [{
                    data: [15, 8, 5, 2],
                    backgroundColor: [
                        'rgba(108, 92, 231, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: 'var(--card)'
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function loadUpcomingEvents() {
    const eventsContainer = document.getElementById('upcoming-events');
    if (!eventsContainer) return;
    
    const upcomingEvents = [
        { title: 'AI & ML Summit 2026', date: 'Tomorrow', type: 'conference' },
        { title: 'Career Fair: Tech Companies', date: 'In 3 days', type: 'fair' },
        { title: 'Resume Workshop', date: 'Next week', type: 'workshop' }
    ];
    
    eventsContainer.innerHTML = upcomingEvents.map(event => `
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
    const icons = {
        conference: '🎤',
        fair: '🏢',
        workshop: '📚',
        webinar: '💻'
    };
    return icons[type] || '📅';
}

function loadRecentActivity() {
    
    const activity = JSON.parse(localStorage.getItem('edumate_activity') || '[]');
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    if (activity.length === 0) {
        const defaultActivity = [
            { action: 'resume_update', text: 'Resume Updated', time: '2 hours ago', icon: '✓', color: '#10B981' },
            { action: 'application', text: 'Applied to Computer Science', time: 'Yesterday', icon: '🎓', color: '#F59E0B' },
            { action: 'ai_chat', text: 'Chatted with AI Assistant', time: '2 days ago', icon: '🤖', color: '#8B5CF6' }
        ];
        
        localStorage.setItem('edumate_activity', JSON.stringify(defaultActivity));
    }
}

function startDashboardAnimations() {
    // Animate numbers
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
    
    
    setTimeout(() => {
       
        if (refreshBtn) {
            refreshBtn.innerHTML = '🔄';
            refreshBtn.disabled = false;
        }
        
        
        if (window.notifications) {
            notifications.show('Dashboard refreshed successfully!', 'success');
        } else {
            alert('Dashboard refreshed!');
        }
    }, 1000);
}

function updateDashboardCharts() {
    const period = document.getElementById('chart-period').value;
    
    console.log('Updating charts for period:', period);
    
    initDashboardCharts();
}

function showPage(id) {
    const requiresAuth = ['dashboard', 'faculty', 'events', 'resume', 'jobs', 'xai', 'profile'];
    const logged = sessionStorage.getItem('edumate_logged') === '1';
    
    if (requiresAuth.includes(id) && !logged) {
        id = 'login';
        alert('Please sign in to access this page.');
    }
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        window.scrollTo(0, 0);
    }
    
    document.getElementById('aiPopup')?.classList.remove('active');
    
    
    if (id === 'dashboard') {
        setTimeout(() => {
            initDashboard();
            renderJobs();
        }, 100);
    }
    if (id === 'events') loadEventsByMajor();
    if (id === 'resume') setTimeout(generateResumePreview, 100);
}




// Export functions to global scope for onclick attributes
window.showPage = showPageWithTransition;
window.attemptLogin = attemptLogin;
window.firebaseLogin = firebaseLogin;
window.startRegistration = startRegistration;
window.previewInfoAvatar = previewInfoAvatar;
window.completeRegistration = completeRegistration;
window.changeProfileAvatar = changeProfileAvatar;
window.saveProfileEdits = saveProfileEdits;
window.toggleAIPopup = toggleAIPopup;
window.sendAIChatMessage = sendAIChatMessage;
window.sendAIPopupMessage = sendAIPopupMessage;
window.loadEventsByMajor = loadEventsByMajor;
window.showResumeForm = showResumeForm;
window.addEducation = addEducation;
window.addExperience = addExperience;
window.addProject = addProject;
window.saveResumeData = saveResumeData;
window.generateResumePreview = generateResumePreview;
window.downloadResumePDF = downloadResumePDF;
window.checkATSCompatibility = checkATSCompatibility;
window.signOut = signOut;