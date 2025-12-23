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

// Resume Data Management
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
    summary: "Passionate software engineer with experience in web development and problem-solving. Eager to contribute to innovative projects.",
    projects: []
};

// Load from localStorage if exists
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

// Initialize Application
function initializeApp() {
    updateSidebarFromStorage();
    applyStoredProfileToUI();
    
    const logged = sessionStorage.getItem('edumate_logged') === '1';
    const seenWelcome = localStorage.getItem('edumate_seen_welcome') === '1';
    
    if (!logged && !seenWelcome) {
        navigateTo('welcome');
        localStorage.setItem('edumate_seen_welcome', '1');
    } else if (logged) {
        navigateTo('dashboard');
        renderJobs();
    } else {
        navigateTo('login');
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
  if (!sidebar || !mainContent) return;

  const isMobile = window.matchMedia('(max-width: 1024px)').matches;

  if (isMobile) {
    // Mobile: slide in/out
    sidebar.classList.toggle('active');
  } else {
    // Desktop: collapse/expand
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('shifted');
  }
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
    sessionStorage.setItem('edumate_logged', '1');
    sessionStorage.setItem('edumate_username', username);
    if (remember) localStorage.setItem('edumate_last_user', username);
    
    updateSidebarFromStorage();
    applyStoredProfileToUI();
    document.getElementById('user-name').textContent = users[username].name || username;
    navigateTo('dashboard');
}

function signOut() {
    sessionStorage.removeItem('edumate_logged');
    sessionStorage.removeItem('edumate_username');
    navigateTo('login');
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
    navigateTo('info');
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
        navigateTo('register'); 
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

// Scholarships Data
const scholarshipsData = {
    "cs": [
        {
            title: "Tech Innovators Scholarship",
            desc: "For computer science students with innovative project ideas. Deadline: Dec 15, 2024",
            img: "https://innotechscholarship.hkfyg.org.hk/wp-content/uploads/sites/37/2022/06/KEN_0828_2.jpg"
        },
        {
            title: "Women in Tech Grant",
            desc: "Supporting female students pursuing computer science degrees",
            img: "https://womeninstemleadership.org/wp-content/uploads/2024/11/DSC03757.jpg"
        }
    ],
    "business": [
        {
            title: "Entrepreneurship Award",
            desc: "For business students with startup potential",
            img: "https://assets.entrepreneur.com/content/3x2/2000/1701945210-FSX-3209-2.jpg"
        }
    ],
    "engineering": [
        {
            title: "Engineering Excellence Scholarship",
            desc: "Merit-based scholarship for top engineering students",
            img: "https://onlinedegrees.sandiego.edu/wp-content/uploads/2025/02/engineering-scholarships-768x455.jpg"
        }
    ],
    "medicine": [
        {
            title: "Medical Research Grant",
            desc: "Support for medical students engaged in research",
            img: "https://avantgroup.com.au/wp-content/uploads/avant-website-image-16.jpg"
        }
    ]
};

// Scholarships Functions
function loadScholarshipsByMajor() {
    const major = document.getElementById("scholarshipMajorSelect")?.value;
    const container = document.getElementById("scholarshipsContainer");
    
    if (!container) return;
    
    if (!major) { 
        container.innerHTML = `<div class="card" style="text-align:center;color:var(--muted);padding:40px"><p>Select a major to see relevant scholarships</p></div>`;
        return; 
    }
    
    const selectedScholarships = scholarshipsData[major] || [];
    container.innerHTML = selectedScholarships.map(s => `
        <div class="card event-card">
            <img src="${s.img}" alt="${s.title}" onerror="this.src='https://via.placeholder.com/140x100/00B894/FFFFFF?text=SCHOLARSHIP'">
            <div style="flex:1">
                <h3>${s.title}</h3>
                <p style="color:var(--muted);margin:5px 0">${s.desc}</p>
                <button class="btn" style="font-size:0.85rem;padding:6px 12px">Apply Now</button>
            </div>
        </div>
    `).join("");
}

// ==================== RESUME FUNCTIONS ====================

        // Global resume data object
        let ResumeData = {
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            skills: 'Python, JavaScript, React, SQL, Git, AWS, Leadership, Communication',
            summary: '',
            education: [],
            experience: [],
            projects: []
        };

        // Load saved data from localStorage
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

            // Clear containers
            const eduContainer = document.getElementById('education-container');
            const expContainer = document.getElementById('experience-container');
            const projContainer = document.getElementById('projects-container');
            
            if (eduContainer) eduContainer.innerHTML = '';
            if (expContainer) expContainer.innerHTML = '';
            if (projContainer) projContainer.innerHTML = '';

            // Refill dynamic fields
            if (resumeData.education && resumeData.education.length > 0) {
                resumeData.education.forEach(e => addEducation(e));
            } else {
                // Add default education entry
                addEducation();
            }
            
            if (resumeData.experience && resumeData.experience.length > 0) {
                resumeData.experience.forEach(e => addExperience(e));
            } else {
                // Add default experience entry
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
            // Save basic info
            resumeData.name = document.getElementById('res-name').value.trim();
            resumeData.title = document.getElementById('res-title').value.trim();
            resumeData.email = document.getElementById('res-email').value.trim();
            resumeData.phone = document.getElementById('res-phone').value.trim();
            resumeData.location = document.getElementById('res-location').value.trim();
            resumeData.linkedin = document.getElementById('res-linkedin').value.trim();
            resumeData.github = document.getElementById('res-github').value.trim();
            resumeData.summary = document.getElementById('res-summary').value.trim();
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
            
            resumeData.projects = Array.from(document.querySelectorAll('#projects-container > div')).map(el => ({
                name: el.children[0].value,
                tech: el.children[1].value,
                desc: el.children[2].value
            }));

            localStorage.setItem('edumate_resume', JSON.stringify(resumeData));
            alert('Resume saved!');
            generateResumePreview();
        }

        function generateResumePreview() {
            const template = document.querySelector('input[name="template"]:checked')?.value || 'modern';
            const content = document.getElementById('resume-content');
            if (!content) return;
            
            const templates = {
                modern: generateModernTemplate,
                elegant: generateElegantTemplate,
                creative: generateCreativeTemplate,
                classic: generateClassicTemplate,
                compact: generateCompactTemplate,
                harvard: generateHarvardTemplate,
                sidebar: generateSidebarTemplate,
                minimalHeader: generateMinimalHeaderTemplate,
                sidebarPhoto: generateSidebarPhotoTemplate,
                softPink: generateSoftPinkTemplate,
                blueProfessional: generateBlueProfessionalTemplate,
                blueModernHeader: generateBlueModernHeaderTemplate,
                minimalElegantPhoto: generateMinimalElegantPhotoTemplate,
                professionalTwoColumn: generateProfessionalTwoColumnTemplate,
                cleanHeader: generateCleanHeaderTemplate,
                academicStyle: generateAcademicStyleTemplate
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
                <!-- LEFT SIDEBAR -->
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
                
                <!-- RIGHT MAIN CONTENT -->
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
                <!-- HEADER -->
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
                    <!-- SUMMARY -->
                    ${resumeData.summary ? `
                        <div style="margin-bottom:30px;">
                            <p style="font-size:16px;line-height:1.6;">${resumeData.summary}</p>
                        </div>
                    ` : ''}
                    
                    <div style="display:grid;grid-template-columns:1fr 2fr;gap:40px;">
                        <!-- LEFT COLUMN -->
                        <div>
                            <!-- EDUCATION -->
                            <h3 style="color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:5px;margin-bottom:15px;">EDUCATION</h3>
                            ${resumeData.education.length > 0 ? resumeData.education.map(edu => `
                                <div style="margin-bottom:20px;">
                                    <strong style="font-size:15px;">${edu.degree || 'Degree Name'}</strong><br>
                                    <span style="font-size:14px;">${edu.school || 'Institution Name'}</span><br>
                                    <em style="font-size:13px;color:#7f8c8d;">${edu.year || 'Graduation Year'}</em>
                                </div>
                            `).join('') : '<p style="font-size:14px;color:#7f8c8d;">Add your education details...</p>'}
                            
                            <!-- SKILLS -->
                            <h3 style="color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:5px;margin-bottom:15px;margin-top:30px;">KEY SKILLS</h3>
                            <div style="font-size:14px;">
                                ${(resumeData.skills || '').split(',').map(skill => `
                                    <div style="margin-bottom:5px">• ${skill.trim()}</div>
                                `).join('')}
                            </div>
                            
                            <!-- CERTIFICATIONS -->
                            ${resumeData.projects.length > 0 ? `
                                <h3 style="color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:5px;margin-bottom:15px;margin-top:30px;">CERTIFICATION</h3>
                                ${resumeData.projects.map((proj, index) => `
                                    <div style="font-size:14px;margin-bottom:8px;">• ${proj.name || 'Certification Name'} (${proj.tech || 'Issuing Body'})</div>
                                `).join('')}
                            ` : ''}
                        </div>
                        
                        <!-- RIGHT COLUMN -->
                        <div>
                            <!-- EXPERIENCE -->
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
                <!-- HEADER -->
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
                    <!-- LEFT COLUMN -->
                    <div>
                        <!-- EDUCATION -->
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
                        
                        <!-- SKILLS -->
                        <h3 style="color:#2c3e50;font-size:16px;border-bottom:1px solid #bdc3c7;padding-bottom:3px;margin-bottom:15px;margin-top:30px;">SKILLS</h3>
                        <div style="font-size:14px;line-height:1.8;">
                            ${(resumeData.skills || '').split(',').slice(0, 12).map(skill => `
                                <div>• ${skill.trim()}</div>
                            `).join('')}
                        </div>
                        
                        <!-- AWARDS -->
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
                    
                    <!-- RIGHT COLUMN -->
                    <div>
                        <!-- CAREER OBJECTIVE -->
                        <h3 style="color:#2c3e50;font-size:16px;border-bottom:1px solid #bdc3c7;padding-bottom:3px;margin-bottom:15px;">CAREER OBJECTIVE</h3>
                        <div style="font-size:14px;margin-bottom:30px;line-height:1.6;">
                            ${resumeData.summary || 'Add your career objective or professional summary here...'}
                        </div>
                        
                        <!-- EXPERIENCE -->
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
                        
                        <!-- PROJECTS -->
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

// Download resume as PDF 
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


    // Download resume as PDF 
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
    
    return Math.min(score, 100);
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
  const activityContainer = document.getElementById('recent-activity');
  if (!activityContainer) return;

  let activity = JSON.parse(localStorage.getItem('edumate_activity') || '[]');

  if (activity.length === 0) {
    activity = [
      { text: 'Resume Updated', time: '2 hours ago', icon: '✓', color: '#10B981' },
      { text: 'Applied to Computer Science', time: 'Yesterday', icon: '🎓', color: '#F59E0B' },
      { text: 'Chatted with AI Assistant', time: '2 days ago', icon: '🤖', color: '#8B5CF6' }
    ];
    localStorage.setItem('edumate_activity', JSON.stringify(activity));
  }

  activityContainer.innerHTML = activity.map(a => `
    <div class="activity-item">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="color:${a.color || '#10B981'}">${a.icon || '•'}</span>
        <div>
          <div style="font-weight:600">${a.text}</div>
          <div style="font-size:0.85rem;color:var(--muted)">${a.time || ''}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function startDashboardAnimations() {
    // Animate numbers
    const counters = document.querySelectorAll('#career-score, #skill-growth, #learning-time');
    
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
            
            if (counter.id === 'career-score' || counter.id === 'learning-time') {
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
        
        alert('Dashboard refreshed!');
    }, 1000);
}

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

// Courses Functions
function initCoursesPage() {
    renderMyCourses();
    renderRecommendedCourses();
    updateLearningStats();
}

function renderMyCourses() {
    const container = document.getElementById('my-courses');
    if (!container) return;
    
    // Get all enrolled courses
    let myCourses = [];
    Object.values(coursesData).flat().forEach(course => {
        if (course.enrolled) {
            myCourses.push(course);
        }
    });
    
    if (myCourses.length === 0) {
        container.innerHTML = `
            <div class="card" style="grid-column: span 2; text-align: center; padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">📚</div>
                <h3>No Enrolled Courses</h3>
                <p style="color: var(--muted); margin-bottom: 20px;">Start your learning journey by enrolling in a course</p>
                <button class="btn" onclick="renderRecommendedCourses()">Browse Courses</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = myCourses.map(course => `
        <div class="card course-card">
            <img src="${course.image}" alt="${course.title}" class="course-image" 
                 onerror="this.src='https://via.placeholder.com/600x160/6C5CE7/FFFFFF?text=${encodeURIComponent(course.title)}'">
            
            <div style="padding: 15px;">
                <div class="course-category">${course.category.toUpperCase()}</div>
                <h3 style="margin: 5px 0 10px; font-size: 1.2rem;">${course.title}</h3>
                <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 10px;">${course.provider} • ${course.duration}</p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span class="course-difficulty difficulty-${course.difficulty}">
                        ${course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span>
                    <span style="font-weight: 600; color: var(--primary);">${course.progress}%</span>
                </div>
                
                <div class="course-progress">
                    <div class="course-progress-fill" style="width: ${course.progress}%"></div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="btn" style="flex: 1;" onclick="continueCourse(${course.id})">
                        ${course.progress > 0 ? 'Continue' : 'Start'}
                    </button>
                    <button class="link-btn" onclick="viewCourseDetails(${course.id})">
                        Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderRecommendedCourses() {
    const container = document.getElementById('recommended-courses');
    if (!container) return;
    
    // Get recommended courses (not enrolled)
    let recommended = [];
    Object.values(coursesData).flat().forEach(course => {
        if (!course.enrolled) {
            recommended.push(course);
        }
    });
    
    // Shuffle and take first 4
    recommended = recommended.sort(() => Math.random() - 0.5).slice(0, 4);
    
    if (recommended.length === 0) {
        container.innerHTML = '<div class="card">No recommended courses available</div>';
        return;
    }
    
    container.innerHTML = recommended.map(course => `
        <div class="card course-card">
            <img src="${course.image}" alt="${course.title}" class="course-image"
                 onerror="this.src='https://via.placeholder.com/600x160/6C5CE7/FFFFFF?text=${encodeURIComponent(course.title)}'">
            
            <div style="padding: 15px;">
                <div class="course-category">${course.category.toUpperCase()}</div>
                <h3 style="margin: 5px 0 10px; font-size: 1.1rem;">${course.title}</h3>
                <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 15px;">${course.provider} • ${course.duration}</p>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="course-difficulty difficulty-${course.difficulty}">
                        ${course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span>
                    <button class="btn" style="padding: 8px 16px;" onclick="enrollInCourse(${course.id})">
                        Enroll
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCourses(category = null) {
    if (!category) {
        category = document.getElementById('course-category').value;
    }
    
    if (category === 'all') {
        renderMyCourses();
        renderRecommendedCourses();
    } else {
        // Show filtered courses
        showFilteredCourses(category);
    }
}

function showFilteredCourses(category) {
    const modalContent = `
        <div class="course-modal-content">
            <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">${category.charAt(0).toUpperCase() + category.slice(1)} Courses</h3>
                <button class="btn-icon" onclick="closeCourseModal()">✕</button>
            </div>
            
            <div style="padding: 20px;">
                <div class="dashboard-grid">
                    ${coursesData[category] ? coursesData[category].map(course => `
                        <div class="card course-card">
                            <img src="${course.image}" alt="${course.title}" class="course-image"
                                 onerror="this.src='https://via.placeholder.com/600x160/6C5CE7/FFFFFF?text=${encodeURIComponent(course.title)}'">
                            
                            <div style="padding: 15px;">
                                <h3 style="margin: 5px 0 10px; font-size: 1.2rem;">${course.title}</h3>
                                <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 10px;">${course.provider}</p>
                                <p style="font-size: 0.9rem; margin-bottom: 15px;">${course.description}</p>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>${course.duration} • ${course.difficulty}</span>
                                    <button class="btn" onclick="enrollInCourse(${course.id}); closeCourseModal()">
                                        ${course.enrolled ? 'Continue' : 'Enroll'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('') : '<div class="card">No courses in this category</div>'}
                </div>
            </div>
        </div>
    `;
    
    showModal(modalContent, 'course-modal');
}

function enrollInCourse(courseId) {
    // Find course
    let course = null;
    Object.values(coursesData).flat().forEach(c => {
        if (c.id === courseId) {
            course = c;
        }
    });
    
    if (!course) {
        alert('Course not found');
        return;
    }
    
    // Mark as enrolled
    course.enrolled = true;
    course.progress = 0;
    
    // Save to localStorage
    saveCoursesData();
    
    // Update UI
    renderMyCourses();
    renderRecommendedCourses();
    
    // Show success message
    alert(`Successfully enrolled in "${course.title}"!`);
    
    // Log activity
    logActivity('course_enrolled', `Enrolled in ${course.title}`);
}

function continueCourse(courseId) {
    const course = Object.values(coursesData).flat().find(c => c.id === courseId);
    if (!course) return;
    
    // Increase progress
    course.progress = Math.min(course.progress + 25, 100);
    
    // Save to localStorage
    saveCoursesData();
    
    // Update UI
    renderMyCourses();
    updateLearningStats();
    
    // Show progress message
    if (course.progress === 100) {
        alert(`🎉 Congratulations! You completed "${course.title}"!`);
        logActivity('course_completed', `Completed ${course.title}`);
    } else {
        alert(`Progress updated: ${course.progress}%`);
        logActivity('course_progress', `Progress in ${course.title}: ${course.progress}%`);
    }
}

function viewCourseDetails(courseId) {
    const course = Object.values(coursesData).flat().find(c => c.id === courseId);
    if (!course) return;
    
    const modalContent = `
        <div class="course-modal-content">
            <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">Course Details</h3>
                <button class="btn-icon" onclick="closeCourseModal()">✕</button>
            </div>
            
            <div style="padding: 20px;">
                <img src="${course.image}" alt="${course.title}" 
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;"
                     onerror="this.src='https://via.placeholder.com/600x200/6C5CE7/FFFFFF?text=${encodeURIComponent(course.title)}'">
                
                <h2 style="margin: 0 0 10px;">${course.title}</h2>
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <span class="course-category">${course.category.toUpperCase()}</span>
                    <span class="course-difficulty difficulty-${course.difficulty}">${course.difficulty}</span>
                    <span style="color: var(--muted);">${course.provider}</span>
                </div>
                
                <p style="margin-bottom: 20px;">${course.description}</p>
                
                <div style="background: var(--card); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px;">Course Info</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <div>
                            <div style="font-size: 0.9rem; color: var(--muted);">Duration</div>
                            <div style="font-weight: 600;">${course.duration}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: var(--muted);">Progress</div>
                            <div style="font-weight: 600; color: var(--primary);">${course.progress}%</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    ${course.enrolled ? `
                        <button class="btn" style="flex: 1;" onclick="continueCourse(${course.id}); closeCourseModal()">
                            ${course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                        </button>
                        <button class="link-btn" onclick="window.open('${course.link}', '_blank')">
                            Visit Platform
                        </button>
                    ` : `
                        <button class="btn" style="flex: 1;" onclick="enrollInCourse(${course.id}); closeCourseModal()">
                            Enroll Now
                        </button>
                        <button class="link-btn" onclick="window.open('${course.link}', '_blank')">
                            Preview
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
    
    showModal(modalContent, 'course-modal');
}

function showCourseModal() {
    const modalContent = `
        <div class="course-modal-content">
            <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">Add Custom Course</h3>
                <button class="btn-icon" onclick="closeCourseModal()">✕</button>
            </div>
            
            <div style="padding: 20px;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: var(--muted);">Course Title</label>
                    <input id="new-course-title" class="input" placeholder="e.g., Advanced JavaScript">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: var(--muted);">Platform/Provider</label>
                    <input id="new-course-provider" class="input" placeholder="e.g., Udemy, Coursera">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--muted);">Category</label>
                        <select id="new-course-category" class="input">
                            <option value="tech">Technology</option>
                            <option value="business">Business</option>
                            <option value="soft-skills">Soft Skills</option>
                            <option value="career">Career Development</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: var(--muted);">Duration</label>
                        <input id="new-course-duration" class="input" placeholder="e.g., 8 weeks">
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: var(--muted);">Course Link (Optional)</label>
                    <input id="new-course-link" class="input" placeholder="https://...">
                </div>
                
                <button class="btn" style="width: 100%;" onclick="addCustomCourse()">
                    Add Course to My List
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent, 'course-modal');
}

function addCustomCourse() {
    const title = document.getElementById('new-course-title').value;
    const provider = document.getElementById('new-course-provider').value;
    const category = document.getElementById('new-course-category').value;
    const duration = document.getElementById('new-course-duration').value;
    const link = document.getElementById('new-course-link').value;
    
    if (!title || !provider || !duration) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new course
    const newCourse = {
        id: Date.now(), // Unique ID
        title: title,
        provider: provider,
        category: category,
        difficulty: 'beginner',
        duration: duration,
        progress: 0,
        enrolled: true,
        description: `Custom course added by user`,
        image: `https://via.placeholder.com/600x160/6C5CE7/FFFFFF?text=${encodeURIComponent(title.substring(0, 20))}`,
        link: link || '#'
    };
    
    // Add to coursesData
    if (!coursesData[category]) {
        coursesData[category] = [];
    }
    coursesData[category].push(newCourse);
    
    // Save to localStorage
    saveCoursesData();
    
    // Update UI
    renderMyCourses();
    closeCourseModal();
    
    alert(`Course "${title}" added successfully!`);
}

function updateLearningStats() {
    // Calculate learning statistics
    const myCourses = Object.values(coursesData).flat().filter(c => c.enrolled);
    const totalProgress = myCourses.reduce((sum, course) => sum + course.progress, 0);
    const avgProgress = myCourses.length > 0 ? Math.round(totalProgress / myCourses.length) : 0;
    
    // Update dashboard if exists
    const learningElement = document.querySelector('.learning-progress');
    if (learningElement) {
        learningElement.textContent = `${avgProgress}%`;
    }
}

function saveCoursesData() {
    localStorage.setItem('edumate_courses', JSON.stringify(coursesData));
}

function loadCoursesData() {
    const saved = localStorage.getItem('edumate_courses');
    if (saved) {
        Object.assign(coursesData, JSON.parse(saved));
    }
}

// Modal Functions
function showModal(content, modalId = 'course-modal') {
    // Remove existing modal
    const existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();
    
    // Create new modal
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'course-modal active';
    modal.innerHTML = content;
    
    document.body.appendChild(modal);
}

function closeCourseModal() {
    const modals = document.querySelectorAll('.course-modal');
    modals.forEach(modal => modal.remove());
}

const PROTECTED_PAGES = new Set(['dashboard','faculty','events','resume','jobs','xai','profile','courses']);

function navigateTo(id) {
  const logged = sessionStorage.getItem('edumate_logged') === '1';

  // Auth Guard
  if (PROTECTED_PAGES.has(id) && !logged) {
    alert('Please sign in to access this page.');
    id = 'login';
  }

  const current = document.querySelector('.page.active');
  const next = document.getElementById(id);

  if (!next) return;

  // Close AI popup always
  document.getElementById('aiPopup')?.classList.remove('active');

  // If no current page yet
  if (!current) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    next.classList.add('active');
    window.scrollTo(0, 0);
    runPageInit(id);
    return;
  }

  // Transition out
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

    // Transition in
    next.style.transition = 'all 0.25s ease';
    setTimeout(() => {
      next.style.opacity = '1';
      next.style.transform = 'translateX(0)';
    }, 30);

    runPageInit(id);
  }, 200);
}

function runPageInit(id) {
  if (id === 'dashboard') {
    setTimeout(() => { initDashboard(); renderJobs(); }, 50);
  }
  if (id === 'events') {
    setTimeout(loadEventsByMajor, 50);
  }
  if (id === 'resume') {
    setTimeout(() => {
        generateResumePreview();
        loadResumeDataIntoForm();
    }, 50);
  }
  if (id === 'jobs') {
    setTimeout(renderJobs, 50);
  }
  if (id === 'scholarships') {
    setTimeout(loadScholarshipsByMajor, 50);
  }
  if (id === 'courses') {
    setTimeout(initCoursesPage, 50);
  }
}

function logActivity(action, text) {
  const now = new Date();
  const entry = {
    action,
    text,
    time: now.toLocaleString(),
    icon: action.includes('completed') ? '🎉' : '✓',
    color: action.includes('completed') ? '#10B981' : '#8B5CF6'
  };

  const arr = JSON.parse(localStorage.getItem('edumate_activity') || '[]');
  arr.unshift(entry);
  localStorage.setItem('edumate_activity', JSON.stringify(arr.slice(0, 20)));
}

document.addEventListener('DOMContentLoaded', () => {
  // 1) Theme
  const storedTheme = localStorage.getItem('edumate_theme');
  if (storedTheme === 'dark') document.body.classList.add('dark-theme');
  updateThemeIcon();

  // 2) Data loads
  loadCoursesData();          
  updateSidebarFromStorage(); 
  applyStoredProfileToUI();   

  // 3) Listeners
  setupEventListeners();

  // 4) App start routing
  initializeApp();
});

// Export functions to global scope for onclick attributes
window.navigateTo = navigateTo;
window.initCoursesPage = initCoursesPage;
window.renderMyCourses = renderMyCourses;
window.renderRecommendedCourses = renderRecommendedCourses;
window.filterCourses = filterCourses;
window.enrollInCourse = enrollInCourse;
window.continueCourse = continueCourse;
window.viewCourseDetails = viewCourseDetails;
window.showCourseModal = showCourseModal;
window.addCustomCourse = addCustomCourse;
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
window.loadScholarshipsByMajor = loadScholarshipsByMajor;
window.showResumeForm = showResumeForm;
window.addEducation = addEducation;
window.addExperience = addExperience;
window.addProject = addProject;
window.saveResumeData = saveResumeData;
window.generateResumePreview = generateResumePreview;
window.downloadResumePDF = downloadResumePDF;
window.checkATSCompatibility = checkATSCompatibility;
window.signOut = signOut;
window.refreshDashboard = refreshDashboard;
window.logActivity = logActivity;
window.initDashboard = initDashboard;