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
        { degree: "B.Sc Computer Science", school: "Cairo University", year: "2022 â€“ 2026" }
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

// Global variables for pagination
let currentSearchResults = [];
let currentPage = 1;
let itemsPerPage = 9;
let currentSearchQuery = '';

// Search courses function with pagination
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
                                    ðŸ“Œ Save
                                </button>
                                <a href="${item.link}" 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   class="btn" 
                                   style="flex:1; text-align:center; text-decoration:none; padding:10px; font-size:0.9rem;">
                                    View â†’
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
            â† Previous
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
            Next â†’
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
            â† Previous
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
            Next â†’
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
    updateSidebarFromStorage();
    applyStoredProfileToUI();
    
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
                        `<span style="margin-left:15px">â€¢ Total available: ${result.searchInformation.totalResults}</span>` : ''}
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
        <input placeholder="Year (e.g. 2022 â€“ 2026)" class="input" value="${entry.year || ''}">
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
                ${resumeData.email || 'email@example.com'} â€¢ ${resumeData.phone || '+20 123 456 7890'} â€¢ ${resumeData.location || 'City, Country'}<br>
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a> â€¢ ` : ''}
                ${resumeData.github ? `<a href="${resumeData.github.startsWith('http') ? resumeData.github : 'https://' + resumeData.github}" style="color:#6C5CE7;text-decoration:none" target="_blank">GitHub</a>` : ''}
            </p>
        </header>
        
        ${resumeData.summary ? `<h2 style="color:#6C5CE7;border-bottom:2px solid #6C5CE7;padding-bottom:5px">Summary</h2>
        <p style="margin-top:20px;font-size:1.1em">${resumeData.summary}</p>` : ''}

        ${resumeData.education.length ? `<h2 style="color:#6C5CE7;border-bottom:2px solid #6C5CE7;padding-bottom:5px">Education</h2>` : ''}
        ${resumeData.education.map(e => `
            <div style="margin-bottom:20px">
                <strong style="font-size:1.1em">${e.degree}</strong><br>
                <em>${e.school} â€¢ ${e.year}</em>
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
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a> â€¢ ` : ''}
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
                    ${e.school} â€“ ${e.year}
                </p>`).join('')}

                <h3>Experience</h3>
                ${resumeData.experience.map(exp => `
                <div style="margin-bottom:15px">
                    <strong>${exp.title}</strong> â€” ${exp.company}<br>
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
        <p>${resumeData.email || 'email@example.com'} â€¢ ${resumeData.phone || '+20 123 456 7890'} â€¢ ${resumeData.location || 'City, Country'}<br>
            ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a> â€¢ ` : ''}
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
            <p><strong>${e.degree}</strong> â€” ${e.school} (${e.year})</p>
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
                <p><strong>${e.degree}</strong><br>${e.school} â€” ${e.year}</p>
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
                        <strong>${exp.title}</strong> â€” ${exp.company}<br>
                        <em>${exp.dates}</em>
                        <p style="margin-top:8px;">${exp.desc}</p>
                    </div>
                `).join('')}

                <h3 style="margin-top:30px;">EDUCATION</h3>
                ${resumeData.education.map(e => `
                    <p><strong>${e.degree}</strong><br>${e.school} â€” ${e.year}</p>
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
                <p><strong>${e.degree}</strong><br>${e.school} â€” ${e.year}</p>
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
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#6C5CE7;text-decoration:none" target="_blank">LinkedIn</a> â€¢ ` : ''}
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
                    <strong>${e.degree}</strong> â€” ${e.school} (${e.year})
                </div>
            `).join("")}

            <h2 style="color:#1d4ed8; border-bottom:2px solid #1d4ed8; margin-top:20px;">Experience</h2>
            ${resumeData.experience.map(exp => `
                <div style="margin-bottom:15px;">
                    <strong>${exp.title}</strong>, ${exp.company} â€” <em>${exp.dates}</em>
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
                <div><strong>${e.degree}</strong> â€” ${e.school} (${e.year})</div>
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
                    <strong>${e.degree}</strong> â€” ${e.school} (${e.year})
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
                        <div style="margin-bottom:8px">â€¢ ${skill.trim()}</div>
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
                    <div style="margin-bottom:8px">â€¢ American Society of Professionals</div>
                    <div style="margin-bottom:8px">â€¢ Association of Information Technology Professionals</div>
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
                        ${exp.company || 'Company'} â€¢ ${exp.company ? (exp.location || resumeData.location || 'Location') : ''}
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
                <span>${resumeData.phone || '(123) 456-7890'}</span> â€¢ 
                <span>${resumeData.email || 'email@example.com'}</span> â€¢ 
                ${resumeData.linkedin ? `<a href="${resumeData.linkedin.startsWith('http') ? resumeData.linkedin : 'https://' + resumeData.linkedin}" style="color:#3498db;text-decoration:none" target="_blank">LinkedIn</a> â€¢ ` : ''}
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
                            <div style="margin-bottom:5px">â€¢ ${skill.trim()}</div>
                        `).join('')}
                    </div>
                    
                    ${resumeData.projects.length > 0 ? `
                        <h3 style="color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:5px;margin-bottom:15px;margin-top:30px;">CERTIFICATION</h3>
                        ${resumeData.projects.map((proj, index) => `
                            <div style="font-size:14px;margin-bottom:8px;">â€¢ ${proj.name || 'Certification Name'} (${proj.tech || 'Issuing Body'})</div>
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
                <span>${resumeData.phone || '(123) 456-7890'}</span> â€¢ 
                <span>${resumeData.email || 'email@example.com'}</span> â€¢ 
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
                        <div>â€¢ ${skill.trim()}</div>
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
// GPA CALCULATOR - Added to Planning Page
// ============================================

// Grade point scale (customize based on your university)
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

// Store grades for each course
let courseGrades = {};

// Load saved grades from localStorage
function loadSavedGrades() {
    const saved = localStorage.getItem('edumate_course_grades');
    if (saved) {
        courseGrades = JSON.parse(saved);
    }
}

// Save grades to localStorage
function saveGrades() {
    localStorage.setItem('edumate_course_grades', JSON.stringify(courseGrades));
}

// Calculate GPA for all courses
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

// Calculate CGPA (Cumulative GPA) - includes all courses ever taken
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
                
                totalCredits += credits;
                totalCourses++;
                
                if (grade && GRADE_POINTS[grade] !== undefined) {
                    totalWeightedPoints += GRADE_POINTS[grade] * credits;
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

// Update GPA display on the page
function updateGPADisplay() {
    const gpaResult = calculateGPA();
    const cgpaResult = calculateCGPA();
    
    // Update the current GPA in the stats card
    const gpaElement = document.getElementById('current-gpa');
    if (gpaElement) {
        gpaElement.textContent = gpaResult.gpa.toFixed(2);
    }
    
    // Update or create GPA details in the right panel
    updateGPAPanel(gpaResult, cgpaResult);
}

// Create or update GPA panel in the right sidebar
function updateGPAPanel(gpaResult, cgpaResult) {
    const rightPanel = document.querySelector('.right-panel');
    if (!rightPanel) return;
    
    // Check if GPA panel already exists
    let gpaPanel = document.getElementById('gpa-panel');
    
    if (!gpaPanel) {
        // Create GPA panel
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
        
        // Insert after progress block or at the end
        const progressBlock = rightPanel.querySelector('.progress-block');
        if (progressBlock) {
            progressBlock.insertAdjacentElement('afterend', gpaPanel);
        } else {
            rightPanel.appendChild(gpaPanel);
        }
    }
    
    // Calculate grade distribution
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
    
    // Add dark theme support
    if (document.body.classList.contains('dark-theme')) {
        gpaPanel.style.background = 'rgba(30, 41, 59, 0.9)';
        gpaPanel.style.border = '1px solid rgba(255,255,255,0.1)';
        gpaPanel.querySelector('h4').style.color = 'var(--text-primary)';
        const detailsDiv = gpaPanel.querySelector('#gpa-details div');
        if (detailsDiv) {
            detailsDiv.style.background = '#334155';
            detailsDiv.style.color = 'var(--text-primary)';
        }
    }
}

// Calculate grade distribution
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

// Toggle GPA details panel
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

// Show grade selection modal for a course
function showGradeModal(courseRow) {
    const courseId = courseRow.getAttribute('data-course-id');
    const courseName = courseRow.querySelector('.course-name').textContent.trim();
    const currentGrade = courseGrades[courseId] || '';
    
    // Create modal
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

// Set grade for a course
function setGrade(courseId, grade) {
    courseGrades[courseId] = grade;
    saveGrades();
    updateGPADisplay();
    
    // Update course row to show grade
    const courseRow = document.querySelector(`[data-course-id="${courseId}"]`);
    if (courseRow) {
        // Remove existing grade badge if any
        const existingBadge = courseRow.querySelector('.grade-badge');
        if (existingBadge) existingBadge.remove();
        
        // Add grade badge
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
        nameSpan.appendChild(gradeBadge);
    }
    
    // Close modal
    document.querySelector('.grade-modal')?.remove();
}

// Clear grade for a course
function clearGrade(courseId) {
    delete courseGrades[courseId];
    saveGrades();
    updateGPADisplay();
    
    // Remove grade badge
    const courseRow = document.querySelector(`[data-course-id="${courseId}"]`);
    if (courseRow) {
        const gradeBadge = courseRow.querySelector('.grade-badge');
        if (gradeBadge) gradeBadge.remove();
    }
    
    document.querySelector('.grade-modal')?.remove();
}

// Get color for grade
function getGradeColor(grade) {
    const colors = {
        'A': '#10b981', 'A-': '#10b981',
        'B+': '#3b82f6', 'B': '#3b82f6', 'B-': '#3b82f6',
        'C+': '#f59e0b', 'C': '#f59e0b', 'C-': '#f59e0b',
        'D+': '#ef4444', 'D': '#ef4444', 'F': '#ef4444'
    };
    return colors[grade] || '#64748b';
}

// Add grade button to course rows
function addGradeButtons() {
    document.querySelectorAll('.course-row').forEach(row => {
        // Check if grade button already exists
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
        
        // Add existing grade badge if any
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

// Modify the existing deleteCourse function to remove grade when course is deleted
const originalDeleteCourse = window.deleteCourse;
window.deleteCourse = function(button, subjectId) {
    const courseRow = button.closest('.course-row');
    const courseId = courseRow.getAttribute('data-course-id');
    
    // Remove grade data
    if (courseId && courseGrades[courseId]) {
        delete courseGrades[courseId];
        saveGrades();
    }
    
    // Call original function
    if (originalDeleteCourse) {
        originalDeleteCourse(button, subjectId);
    }
};

// Modify createSemesterWithSubjects to add grade buttons to new courses
const originalCreateSemester = window.createSemesterWithSubjects;
window.createSemesterWithSubjects = function() {
    originalCreateSemester();
    // Add grade buttons to new courses after a short delay
    setTimeout(addGradeButtons, 500);
    updateGPADisplay();
};

// Modify addSubjectToSemester to add grade button to new course
const originalAddSubject = window.addSubjectToSemester;
window.addSubjectToSemester = function() {
    originalAddSubject();
    // Add grade button to new course after a short delay
    setTimeout(addGradeButtons, 500);
    updateGPADisplay();
};

// ============================================
// PLANNING PAGE JAVASCRIPT - COMPLETE WITH CREDIT CALCULATIONS
// Subject database with locking system and automatic credit calculations
// ============================================

// Subject database for different semester types
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

// Global variables for planning
let planningSelectedSubjects = [];
let planningCurrentSemester = null;
let planningDropMode = false;
let takenSubjects = new Set();

// Target graduation credits (adjust based on your program)
const TOTAL_REQUIRED_CREDITS = 128;

// Initialize Planning Page
function initPlanning() {
    loadPlanningData();
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

function loadTakenSubjects() {
    const saved = localStorage.getItem('edumate_taken_subjects');
    if (saved) {
        takenSubjects = new Set(JSON.parse(saved));
    }
    
    document.querySelectorAll('.course-row[data-subject-id]').forEach(row => {
        const subjectId = row.getAttribute('data-subject-id');
        if (subjectId && !subjectId.startsWith('custom_')) {
            takenSubjects.add(subjectId);
        }
    });
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
        createPathSwitch(careerTag, careerBadge);
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
    
    if (!semester.querySelector('.add-course-btn')) {
        const actions = semester.querySelector('.semester-actions') || createSemesterActions(semester);
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
        
        careerBadge.style.transform = 'scale(0.9)';
        setTimeout(() => careerBadge.style.transform = 'scale(1)', 150);
        
        [previewBtn, planBtn].forEach(btn => btn.classList.remove('active'));
        previewBtn.classList.add('active');
        previewBtn.style.background = '#ffffff';
        previewBtn.style.color = '#1e293b';
        planBtn.style.background = 'transparent';
        planBtn.style.color = 'white';
        careerBadge.innerHTML = 'ðŸ” Preview';
    });
    
    planBtn.addEventListener('click', () => {
        if (planBtn.classList.contains('active')) return;
        
        careerBadge.style.transform = 'scale(0.9)';
        setTimeout(() => careerBadge.style.transform = 'scale(1)', 150);
        
        [previewBtn, planBtn].forEach(btn => btn.classList.remove('active'));
        planBtn.classList.add('active');
        planBtn.style.background = '#ffffff';
        planBtn.style.color = '#1e293b';
        previewBtn.style.background = 'transparent';
        previewBtn.style.color = 'white';
        careerBadge.innerHTML = 'ðŸ›¡ï¸ Cyber Security';
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

// ============================================
// CREDIT CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate total credits from all semesters
 */
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

/**
 * Calculate earned credits (you can modify this logic based on your needs)
 * For now, we'll consider all added courses as "in progress" and none as earned
 * You can change this to mark completed semesters or courses as earned
 */
function calculateEarnedCredits() {
    const earnedElement = document.getElementById('earned-credits');
    return earnedElement ? parseInt(earnedElement.textContent) || 0 : 0;
}

/**
 * Update all credit displays based on current courses
 */
function updateAllCredits() {
    const totalCredits = calculateTotalCredits();
    const earnedCredits = calculateEarnedCredits();
    const remainingCredits = totalCredits - earnedCredits;
    
    // Update total credits display
    const totalElement = document.getElementById('total-credits');
    if (totalElement) {
        totalElement.textContent = totalCredits;
    }
    
    // Update remaining credits
    const remainingElement = document.getElementById('remaining-credits');
    const remainingDisplay = document.getElementById('remaining-credits-display');
    if (remainingElement) remainingElement.textContent = remainingCredits;
    if (remainingDisplay) remainingDisplay.textContent = remainingCredits;
    
    // Update progress percentage
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
    
    // Update courses left (optional)
    const coursesLeft = document.getElementById('courses-left');
    if (coursesLeft) {
        const avgCreditsPerCourse = 3;
        const coursesRemaining = Math.ceil((TOTAL_REQUIRED_CREDITS - totalCredits) / avgCreditsPerCourse);
        coursesLeft.textContent = Math.max(0, coursesRemaining);
    }
    
    updateLastUpdated();
}

/**
 * Update credits for a specific semester
 */
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
    
    // Update global credits after semester update
    updateAllCredits();
}

/**
 * Calculate and update all credits (convenience function)
 */
function calculateAllCredits() {
    // Update each semester's credits
    document.querySelectorAll('.semester-item').forEach(sem => {
        updateSemesterCredits(sem);
    });
    
    // Update global credits
    updateAllCredits();
}

// Modal Functions
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
    document.getElementById('add-subject-modal').style.display = 'flex';
    loadAvailableSubjectsForAdd();
}

function closeAddSubjectModal() {
    document.getElementById('add-subject-modal').style.display = 'none';
    planningCurrentSemester = null;
}

// Subject Selection Functions
function loadSubjectsForSemester() {
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
        const subjects = subjectDatabase[semesterType] || [];
        const availableSubjects = subjects.filter(s => !takenSubjects.has(s.id));
        
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
                    <span style="color: #2563eb; margin-left: 10px; font-size: 0.85rem;">${subject.department}</span>
                    ${subject.required ? '<span class="required-badge">Required</span>' : ''}
                </div>
            </div>
        `).join('');
        
        subjects.filter(s => s.required && !takenSubjects.has(s.id)).forEach(s => {
            if (!planningSelectedSubjects.find(sub => sub.id === s.id)) {
                planningSelectedSubjects.push({ 
                    id: s.id, 
                    name: s.name, 
                    credits: s.credits,
                    code: s.code 
                });
            }
        });
        updateSelectedSubjectsDisplay();
    }
}

function loadAvailableSubjectsForAdd() {
    let listElement = document.getElementById('add-subjects-list');
    if (!listElement) {
        const modalBody = document.querySelector('#add-subject-modal .modal-body');
        listElement = document.createElement('div');
        listElement.id = 'add-subjects-list';
        listElement.className = 'subjects-list';
        listElement.style.marginBottom = '20px';
        listElement.style.maxHeight = '200px';
        listElement.style.overflowY = 'auto';
        modalBody.insertBefore(listElement, document.querySelector('#new-subject-name').closest('.form-group'));
    }
    
    const allSubjects = [];
    Object.values(subjectDatabase).forEach(category => {
        category.forEach(subject => {
            if (!takenSubjects.has(subject.id)) {
                allSubjects.push(subject);
            }
        });
    });
    
    if (allSubjects.length === 0) {
        listElement.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 10px;">No available subjects! All subjects have been taken.</p>';
        return;
    }
    
    listElement.innerHTML = `
        <p style="margin-bottom: 10px; font-weight: 600;">Quick Add from Database:</p>
        ${allSubjects.map(subject => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px; border-bottom: 1px solid #e2e8f0;">
                <div>
                    <strong>${subject.code}</strong> - ${subject.name}
                    <span style="color: #64748b; margin-left: 10px;">${subject.credits} cr</span>
                </div>
                <button onclick="quickAddSubject('${subject.id}', '${subject.name}', ${subject.credits}, '${subject.code}')" 
                        class="link-btn" 
                        style="padding: 4px 12px; font-size: 0.85rem;">
                    Add
                </button>
            </div>
        `).join('')}
    `;
}

function quickAddSubject(id, name, credits, code) {
    document.getElementById('new-subject-name').value = name;
    document.getElementById('new-subject-credits').value = credits;
    document.getElementById('new-subject-id').value = id;
    document.getElementById('new-subject-code').value = code;
}

function toggleSubject(id, name, credits, code, isChecked) {
    if (isChecked) {
        if (!planningSelectedSubjects.find(s => s.id === id)) {
            planningSelectedSubjects.push({ id, name, credits, code });
        }
    } else {
        planningSelectedSubjects = planningSelectedSubjects.filter(s => s.id !== id);
    }
    updateSelectedSubjectsDisplay();
}

function updateSelectedSubjectsDisplay() {
    const listElement = document.getElementById('selected-subjects-list');
    const countElement = document.getElementById('selected-count');
    
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

// Create New Semester
function createSemesterWithSubjects() {
    const semesterType = document.getElementById('semester-type');
    const selectedType = semesterType.options[semesterType.selectedIndex].text;
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
    
    const alreadyTaken = planningSelectedSubjects.filter(s => takenSubjects.has(s.id));
    if (alreadyTaken.length > 0) {
        alert(`The following subjects have already been taken:\n${alreadyTaken.map(s => s.name).join('\n')}`);
        return;
    }
    
    const totalCredits = planningSelectedSubjects.reduce((sum, subject) => sum + subject.credits, 0);
    
    const newSemester = document.createElement('div');
    newSemester.className = 'semester-item';
    newSemester.setAttribute('data-semester', nextSemNum);
    newSemester.style.opacity = '0';
    newSemester.style.transform = 'translateY(20px)';
    newSemester.style.transition = 'all 0.3s ease';
    
    const coursesHTML = planningSelectedSubjects.map(subject => {
        const courseId = `db_${subject.id}`;
        takenSubjects.add(subject.id);
        
        return `
            <div class="course-row" data-course-id="${courseId}" data-subject-id="${subject.id}">
                <span class="course-name">
                    <i class="fas fa-circle"></i> 
                    <span class="course-code">${subject.code}:</span> ${subject.name}
                </span>
                <span class="course-credits" data-credits="${subject.credits}">${subject.credits} cr</span>
                <div class="course-actions">
                    <button class="delete-course-btn" onclick="deleteCourse(this, '${subject.id}')">
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
    showNotification(`Semester ${nextSemNum} created with ${planningSelectedSubjects.length} subjects`, 'success');
    
    // Add grade buttons to new courses
    setTimeout(addGradeButtons, 500);
    updateGPADisplay();
    updateSemesterGPADisplays();
    addFinalGPADisplay();
}

// Add Subject to Semester
function addSubjectToSemester() {
    if (!planningCurrentSemester) return;
    
    const subjectName = document.getElementById('new-subject-name').value.trim();
    const credits = document.getElementById('new-subject-credits').value;
    const subjectId = document.getElementById('new-subject-id')?.value || 'custom_' + Date.now();
    const subjectCode = document.getElementById('new-subject-code')?.value || 'CUSTOM';
    
    if (!subjectName) {
        alert('Please enter a subject name');
        return;
    }
    
    if (takenSubjects.has(subjectId)) {
        alert('This subject has already been taken and cannot be added again');
        return;
    }
    
    const coursesContainer = planningCurrentSemester.querySelector('.courses-container');
    const courseId = `db_${subjectId}`;
    
    takenSubjects.add(subjectId);
    saveTakenSubjects();
    
    const newCourseRow = document.createElement('div');
    newCourseRow.className = 'course-row';
    newCourseRow.setAttribute('data-course-id', courseId);
    newCourseRow.setAttribute('data-subject-id', subjectId);
    newCourseRow.innerHTML = `
        <span class="course-name">
            <i class="fas fa-circle"></i> 
            <span class="course-code">${subjectCode}:</span> ${subjectName}
        </span>
        <span class="course-credits" data-credits="${credits}">${credits} cr</span>
        <div class="course-actions">
            <button class="delete-course-btn" onclick="deleteCourse(this, '${subjectId}')">
                <i class="fas fa-times-circle"></i>
            </button>
        </div>
    `;
    
    newCourseRow.style.opacity = '0';
    newCourseRow.style.transform = 'translateX(-10px)';
    newCourseRow.style.transition = 'all 0.3s ease';
    
    coursesContainer.appendChild(newCourseRow);
    
    setTimeout(() => {
        newCourseRow.style.opacity = '1';
        newCourseRow.style.transform = 'translateX(0)';
    }, 10);
    
    updateSemesterCredits(planningCurrentSemester);
    closeAddSubjectModal();
    showNotification(`Added "${subjectName}" to semester`, 'success');
    
    // Add grade button to new course
    setTimeout(addGradeButtons, 500);
    updateGPADisplay();
    updateSemesterGPADisplays();
    addFinalGPADisplay();
}

// Delete Course
function deleteCourse(button, subjectId) {
    const courseRow = button.closest('.course-row');
    const semesterItem = courseRow.closest('.semester-item');
    const subjectName = courseRow.querySelector('.course-name').textContent.trim();
    
    if (!confirm(`Are you sure you want to delete "${subjectName}"?`)) return;
    
    if (subjectId && !subjectId.startsWith('custom_')) {
        takenSubjects.delete(subjectId);
        saveTakenSubjects();
    }
    
    courseRow.style.opacity = '0';
    courseRow.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        courseRow.remove();
        updateSemesterCredits(semesterItem);
        showNotification(`Removed "${subjectName}" from semester`, 'info');
        updateGPADisplay();
        updateSemesterGPADisplays();
        addFinalGPADisplay();
    }, 300);
}

// Drop Subjects Mode
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

// Utility Functions
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

// Load Planning Data
function loadPlanningData() {
    if (window.loadPlanningData && window.loadPlanningData !== loadPlanningData) {
        return window.loadPlanningData.apply(this, arguments);
    }
    console.warn('loadPlanningData is handled by backend_api.js');
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

// Profile Completion Functions
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
    if (window.loadDashboardStats && window.loadDashboardStats !== loadDashboardStats) {
        return window.loadDashboardStats.apply(this, arguments);
    }
    console.warn('loadDashboardStats is handled by backend_api.js');
}

function calculateCareerScore() {
    const uname = sessionStorage.getItem('edumate_username');
    if (!uname || !users[uname]) return 65;
    
    const user = users[uname];
    let score = 50;
    
    if (user.name?.trim()) score += 10;
    if (user.email?.trim()) score += 10;
    if (user.major?.trim()) score += 15;
    if (user.skills?.trim()) score += 15;
    if (user.profilePic && !user.profilePic.includes('placeholder')) score += 10;
    if (localStorage.getItem('edumate_resume')) score += 10;
    if (sessionStorage.getItem('edumate_ai_chats')) score += 5;
    
    return Math.min(score, 100);
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
    const icons = { conference: 'ðŸŽ¤', fair: 'ðŸ¢', workshop: 'ðŸ“š', webinar: 'ðŸ’»' };
    return icons[type] || 'ðŸ“…';
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
        refreshBtn.innerHTML = 'â³';
        refreshBtn.disabled = true;
    }
    
    loadDashboardStats();
    
    setTimeout(() => {
        if (refreshBtn) {
            refreshBtn.innerHTML = 'ðŸ”„';
            refreshBtn.disabled = false;
        }
        showNotification('Dashboard refreshed successfully!', 'success');
    }, 1000);
}

// Courses Functions
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

function showCourseModal() {
    const modalContent = `
        <div class="course-modal-content">
            <div style="padding: 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0;">Add Custom Course</h3>
                <button class="btn-icon" onclick="closeCourseModal()">âœ•</button>
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
    if (window.addCustomCourse && window.addCustomCourse !== addCustomCourse) {
        return window.addCustomCourse.apply(this, arguments);
    }
    console.warn('addCustomCourse is handled by backend_api.js');
}

function saveCoursesData() {
    localStorage.setItem('edumate_courses', JSON.stringify(coursesData));
}

function loadCoursesData() {
    const saved = localStorage.getItem('edumate_courses');
    if (saved) Object.assign(coursesData, JSON.parse(saved));
}

// Modal Functions
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

// Navigation
const PROTECTED_PAGES = new Set(['dashboard','resume','Internships','xai','profile','courses','planning']);

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
}

function logActivity(action, text) {
    if (window.logActivity && window.logActivity !== logActivity) {
        return window.logActivity.apply(this, arguments);
    }
    console.warn('logActivity is handled by backend_api.js');
}

// ============================================
// ENHANCED GPA FUNCTIONS - Semester GPA Display
// ============================================

// Calculate semester GPAs
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

// Update semester GPA displays in each semester card
function updateSemesterGPADisplays() {
    const semesterGPAs = calculateSemesterGPAs();
    
    document.querySelectorAll('.semester-item').forEach((semester, index) => {
        const semesterData = semesterGPAs[index];
        
        // Remove existing GPA display if any
        const existingGPA = semester.querySelector('.semester-gpa-display');
        if (existingGPA) existingGPA.remove();
        
        // Create GPA display element
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
        
        // Insert after credit sum or at the end of semester head
        const semesterHead = semester.querySelector('.semester-head');
        if (semesterHead) {
            semesterHead.appendChild(gpaDisplay);
        }
    });
}

// Get color based on GPA value
function getGPAColor(gpa) {
    if (gpa >= 3.7) return '#10b981'; // Excellent - Green
    if (gpa >= 3.0) return '#3b82f6'; // Good - Blue
    if (gpa >= 2.0) return '#f59e0b'; // Satisfactory - Orange
    return '#ef4444'; // Poor - Red
}

// Calculate final GPA (weighted average of all semesters)
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

// Add final GPA display to the page
function addFinalGPADisplay() {
    const rightPanel = document.querySelector('.right-panel');
    if (!rightPanel) return;
    
    // Check if final GPA display already exists
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
        
        // Insert at the beginning of right panel or after path card
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

// Toggle GPA section collapse/expand
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

// Toggle grade distribution view
function toggleGradeDistribution() {
    const distribution = document.getElementById('grade-distribution-section');
    const btn = document.querySelector('.view-details-btn');
    
    if (distribution.style.display === 'none') {
        distribution.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-chart-bar"></i> Hide Grade Distribution';
        updateGradeDistributionBars();
    } else {
        distribution.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-chart-bar"></i> View Grade Distribution';
    }
}

// Quick grade all ungraded courses
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
        updateGradeDistributionBars();
        updateSemesterGPADisplays();
        addFinalGPADisplay();
    } else {
        showNotification('No ungraded courses found', 'info');
    }
}

// Update grade distribution bars
function updateGradeDistributionBars() {
    const distribution = calculateGradeDistribution();
    const container = document.getElementById('grade-distribution-bars');
    const totalCourses = Object.values(distribution).reduce((a, b) => a + b, 0);
    
    if (totalCourses === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">No grades entered yet</p>';
        return;
    }
    
    let html = '';
    for (const [grade, count] of Object.entries(distribution)) {
        if (count > 0) {
            const percentage = (count / totalCourses) * 100;
            const barClass = grade.charAt(0);
            html += `
                <div class="distribution-item">
                    <span class="distribution-label">${grade}</span>
                    <div class="distribution-bar-container">
                        <div class="distribution-bar ${barClass}" style="width: ${percentage}%"></div>
                    </div>
                    <span class="distribution-count">${count}</span>
                </div>
            `;
        }
    }
    
    container.innerHTML = html;
}

// Add CSS animations
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .semester-gpa-display {
            margin-top: 8px;
            animation: fadeIn 0.3s ease;
        }
        
        .semester-gpa-badge {
            transition: all 0.2s ease;
        }
        
        .semester-gpa-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .final-gpa-display {
            animation: slideDown 0.5s ease;
        }
        
        .final-gpa-display:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px -5px rgba(139, 92, 246, 0.5);
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    const storedTheme = localStorage.getItem('edumate_theme');
    if (storedTheme === 'dark') document.body.classList.add('dark-theme');
    updateThemeIcon();
    
    loadCoursesData();
    updateSidebarFromStorage();
    applyStoredProfileToUI();
    setupEventListeners();
    initializeApp();
});

// Export functions
window.navigateTo = navigateTo;
window.initCoursesPage = initCoursesPage;
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
window.loadInternshipsByPosition = loadInternshipsByPosition;
window.viewSavedInternships = viewSavedInternships;
window.retryInternshipsearch = retryInternshipsearch;
window.saveJob = saveJob;
window.updateInternshipstatus = updateInternshipstatus;
window.removeSavedJob = removeSavedJob;
window.searchCourses = searchCourses;
window.quickSearch = quickSearch;
window.saveCustomCourse = saveCustomCourse;
window.removeCustomCourse = removeCustomCourse;
window.viewSavedCourses = viewSavedCourses;

// Planning functions
window.initPlanning = initPlanning;
window.switchPlanningTab = function(tabId) {
    document.querySelectorAll('.planning-tab, .planning-tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`${tabId}-planner`)?.classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
    logActivity('viewed', `Viewed ${tabId} planning tab`);
};
window.savePlannerData = savePlannerData;
window.saveCareerRoadmap = saveCareerRoadmap;
window.addGoal = function() {
    const container = document.getElementById('goals-container');
    if (!container) return;
    
    const goalId = 'goal_' + Date.now();
    const goalDiv = document.createElement('div');
    goalDiv.className = 'goal-item';
    goalDiv.setAttribute('data-goal-id', goalId);
    
    goalDiv.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;flex:1">
            <input type="checkbox" onchange="toggleGoalComplete(this)" id="${goalId}">
            <div style="flex:1">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <input type="text" class="input" placeholder="Goal description" style="flex:1;margin-right:10px;" value="New Goal">
                    <input type="text" class="input" placeholder="Due date" style="width:120px;" value="Dec 2024">
                </div>
                <div class="goal-progress-container">
                    <div class="goal-progress-bar" style="width:0%"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:0.85rem">
                    <span>Progress: 0%</span>
                    <div>
                        <button class="link-btn" style="color:var(--primary);padding:0 5px;" onclick="updateGoalProgress('${goalId}', 10)">+10%</button>
                        <button class="link-btn" style="color:var(--error);padding:0 5px;" onclick="this.closest('.goal-item').remove(); saveGoals();">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(goalDiv);
    window.saveGoals = saveGoals;
    logActivity('added', 'Added new goal');
};
window.toggleGoalComplete = function(checkbox) {
    const goalItem = checkbox.closest('.goal-item');
    if (checkbox.checked) {
        goalItem.style.opacity = '0.6';
        const progressBar = goalItem.querySelector('.goal-progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
            const span = goalItem.querySelector('span:first-of-type');
            if (span) span.textContent = 'Progress: 100%';
        }
    } else {
        goalItem.style.opacity = '1';
    }
    saveGoals();
};
window.updateGoalProgress = function(goalId, increment) {
    const goalItem = document.querySelector(`[data-goal-id="${goalId}"]`);
    if (!goalItem) return;
    
    const progressBar = goalItem.querySelector('.goal-progress-bar');
    const progressSpan = goalItem.querySelector('span:first-of-type');
    
    if (progressBar && progressSpan) {
        let current = parseInt(progressBar.style.width) || 0;
        let newWidth = Math.min(current + increment, 100);
        progressBar.style.width = newWidth + '%';
        progressSpan.textContent = `Progress: ${newWidth}%`;
        
        if (newWidth >= 100) {
            const checkbox = goalItem.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = true;
            goalItem.style.opacity = '0.6';
        }
    }
    saveGoals();
};
window.addSkillPlan = function() {
    const container = document.getElementById('skills-container');
    if (!container) return;
    
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skill-item';
    
    skillDiv.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div>
                <input type="text" class="input" placeholder="Skill name" style="width:200px;margin-right:10px;" value="New Skill">
                <span style="color:var(--muted);font-size:0.85rem;margin-left:10px">Target: 
                    <input type="text" class="input" placeholder="Date" style="width:100px;" value="Dec 2024">
                </span>
            </div>
            <select class="input skill-level" style="width:120px;">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
            </select>
        </div>
        <div class="course-progress">
            <div class="course-progress-fill" style="width:0%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:5px;font-size:0.85rem">
            <span>0% complete</span>
            <div>
                <button class="link-btn" style="color:var(--primary);padding:0 5px;" onclick="updateSkillProgress(this, 10)">+10%</button>
                <button class="link-btn" style="color:var(--error);padding:0 5px;" onclick="this.closest('.skill-item').remove(); saveSkills();">Remove</button>
            </div>
        </div>
    `;
    
    container.appendChild(skillDiv);
    window.saveSkills = saveSkills;
    logActivity('added', 'Added new skill to track');
};
window.updateSkillProgress = function(button, increment) {
    const skillItem = button.closest('.skill-item');
    if (!skillItem) return;
    
    const progressBar = skillItem.querySelector('.course-progress-fill');
    const progressSpan = skillItem.querySelector('span:first-of-type');
    
    if (progressBar && progressSpan) {
        let current = parseInt(progressBar.style.width) || 0;
        let newWidth = Math.min(current + increment, 100);
        progressBar.style.width = newWidth + '%';
        progressSpan.textContent = `${newWidth}% complete`;
    }
    saveSkills();
};
window.saveAllPlanningData = function() {
    savePlannerData();
    saveCareerRoadmap();
    saveGoals();
    saveSkills();
    showNotification('All planning data saved!', 'success');
    logActivity('saved', 'Saved all planning data');
};
window.calculateSemesterCredits = function() {
    const semesters = [1, 2, 3, 4];
    let total = 0;
    semesters.forEach(sem => {
        let semTotal = 0;
        for (let i = 1; i <= 3; i++) {
            const creditSelect = document.getElementById(`sem${sem}-credits${i}`);
            if (creditSelect) semTotal += parseInt(creditSelect.value) || 0;
        }
        const totalElement = document.getElementById(`sem${sem}-total`);
        if (totalElement) totalElement.textContent = semTotal;
        total += semTotal;
    });
    document.getElementById('total-credits').textContent = total;
};
window.loadPlanningData = loadPlanningData;
window.saveGoals = function() {
    const goals = [];
    document.querySelectorAll('#goals-container .goal-item').forEach(goalItem => {
        const checkbox = goalItem.querySelector('input[type="checkbox"]');
        const goalInput = goalItem.querySelector('input[type="text"]:first-of-type');
        const dueDate = goalItem.querySelectorAll('input[type="text"]')[1];
        const progressBar = goalItem.querySelector('.goal-progress-bar');
        
        goals.push({
            id: goalItem.dataset.goalId,
            text: goalInput ? goalInput.value : '',
            dueDate: dueDate ? dueDate.value : '',
            completed: checkbox ? checkbox.checked : false,
            progress: progressBar ? parseInt(progressBar.style.width) || 0 : 0
        });
    });
    localStorage.setItem('edumate_goals', JSON.stringify(goals));
};
window.saveSkills = function() {
    const skills = [];
    document.querySelectorAll('#skills-container .skill-item').forEach(skillItem => {
        const nameInput = skillItem.querySelector('input[type="text"]:first-of-type');
        const dateInput = skillItem.querySelectorAll('input[type="text"]')[1];
        const levelSelect = skillItem.querySelector('.skill-level');
        const progressBar = skillItem.querySelector('.course-progress-fill');
        
        skills.push({
            name: nameInput ? nameInput.value : '',
            targetDate: dateInput ? dateInput.value : '',
            level: levelSelect ? levelSelect.value : 'beginner',
            progress: progressBar ? parseInt(progressBar.style.width) || 0 : 0
        });
    });
    localStorage.setItem('edumate_skills', JSON.stringify(skills));
};

// Planning modal functions
window.closeSubjectModal = closeSubjectModal;
window.closeAddSubjectModal = closeAddSubjectModal;
window.loadSubjectsForSemester = loadSubjectsForSemester;
window.toggleSubject = toggleSubject;
window.createSemesterWithSubjects = createSemesterWithSubjects;
window.showAddSubjectModal = showAddSubjectModal;
window.addSubjectToSemester = addSubjectToSemester;
window.deleteCourse = deleteCourse;
window.showDropSubjectsMode = showDropSubjectsMode;
window.deleteSelectedCourses = deleteSelectedCourses;
window.quickAddSubject = quickAddSubject;
window.updateAllCredits = updateAllCredits;
window.calculateAllCredits = calculateAllCredits;

// GPA functions
window.showGradeModal = showGradeModal;
window.setGrade = setGrade;
window.clearGrade = clearGrade;
window.toggleGPADetails = toggleGPADetails;
window.toggleGPASection = toggleGPASection;
window.toggleGradeDistribution = toggleGradeDistribution;
window.quickGradeAll = quickGradeAll;
window.calculateGPA = calculateGPA;
window.calculateCGPA = calculateCGPA;
window.calculateFinalGPA = calculateFinalGPA;
window.updateGPADisplay = updateGPADisplay;
window.updateSemesterGPADisplays = updateSemesterGPADisplays;
window.addFinalGPADisplay = addFinalGPADisplay;
window.showNotification = showNotification;
window.alert = function (message) {
    showNotification(message, 'info');
};
