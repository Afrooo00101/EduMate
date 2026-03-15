// Firebase Configuration (Same as main app)
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

// Admin credentials
const ADMIN_EMAILS = ['admin@edumate.com', 'superadmin@sut.edu.eg','admin@sut.edu.eg'];

// Global variables
let activityChart, growthChart, featurePieChart;
let currentPage = 'dashboard';

// Initialize demo data
function initializeDemoData() {
    console.log('Initializing demo data...');
    
    // Demo users (50+ users)
    const demoUsers = {
        'ahmed_mohamed': {
            username: 'ahmed_mohamed',
            name: 'Ahmed Mohamed',
            email: 'ahmed.mohamed@example.com',
            password: 'pass123',
            profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
            education: 'B.Sc Computer Science',
            major: 'Computer Science',
            gradYear: '2025',
            skills: 'Python, JavaScript, React, SQL',
            location: 'Cairo, Egypt',
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            sessions: 45,
            totalTime: 1240,
            blocked: false
        },
        'sara_ahmed': {
            username: 'sara_ahmed',
            name: 'Sara Ahmed',
            email: 'sara.ahmed@example.com',
            password: 'pass123',
            profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
            education: 'B.Sc Engineering',
            major: 'Mechanical Engineering',
            gradYear: '2024',
            skills: 'AutoCAD, SolidWorks, MATLAB, Project Management',
            location: 'Alexandria, Egypt',
            lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            sessions: 38,
            totalTime: 980,
            blocked: false
        },
        'mohamed_ali': {
            username: 'mohamed_ali',
            name: 'Mohamed Ali',
            email: 'mohamed.ali@example.com',
            password: 'pass123',
            profilePic: 'https://randomuser.me/api/portraits/men/3.jpg',
            education: 'MBA',
            major: 'Business Administration',
            gradYear: '2023',
            skills: 'Marketing, Finance, Leadership, Strategy',
            location: 'Giza, Egypt',
            lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            sessions: 62,
            totalTime: 2150,
            blocked: false
        },
        'nour_hassan': {
            username: 'nour_hassan',
            name: 'Nour Hassan',
            email: 'nour.hassan@example.com',
            password: 'pass123',
            profilePic: 'https://randomuser.me/api/portraits/women/4.jpg',
            education: 'Medical School',
            major: 'Medicine',
            gradYear: '2026',
            skills: 'Patient Care, Research, Anatomy, Physiology',
            location: 'Cairo, Egypt',
            lastActive: new Date().toISOString(),
            sessions: 28,
            totalTime: 760,
            blocked: false
        },
        'omar_ibrahim': {
            username: 'omar_ibrahim',
            name: 'Omar Ibrahim',
            email: 'omar.ibrahim@example.com',
            password: 'pass123',
            profilePic: 'https://randomuser.me/api/portraits/men/5.jpg',
            education: 'B.Sc Data Science',
            major: 'Data Science',
            gradYear: '2025',
            skills: 'Python, R, Machine Learning, TensorFlow',
            location: 'Alexandria, Egypt',
            lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            sessions: 52,
            totalTime: 1890,
            blocked: false
        },
        'fatma_said': {
            username: 'fatma_said',
            name: 'Fatma Said',
            email: 'fatma.said@example.com',
            password: 'pass123',
            profilePic: 'https://randomuser.me/api/portraits/women/6.jpg',
            education: 'B.Sc Pharmacy',
            major: 'Pharmacy',
            gradYear: '2024',
            skills: 'Pharmacology, Chemistry, Patient Counseling',
            location: 'Mansoura, Egypt',
            lastActive: new Date().toISOString(),
            sessions: 33,
            totalTime: 845,
            blocked: false
        },
        'khaled_mostafa': {
            username: 'khaled_mostafa',
            name: 'Khaled Mostafa',
            email: 'khaled.mostafa@example.com',
            password: 'pass123',
            profilePic: 'https://randomuser.me/api/portraits/men/7.jpg',
            education: 'B.Sc Architecture',
            major: 'Architecture',
            gradYear: '2025',
            skills: 'AutoCAD, Revit, 3D Modeling, Design',
            location: 'Cairo, Egypt',
            lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            sessions: 19,
            totalTime: 520,
            blocked: false
        },
        'omnia_rady': {
            username: 'omnia_rady',
            name: 'Omnia Rady',
            email: 'omnia.rady@example.com',
            password: 'pass123',
            profilePic: 'https://randomuser.me/api/portraits/women/8.jpg',
            education: 'B.Sc Mass Communication',
            major: 'Mass Communication',
            gradYear: '2024',
            skills: 'Content Writing, Social Media, PR, Journalism',
            location: 'Giza, Egypt',
            lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            sessions: 41,
            totalTime: 1120,
            blocked: false
        }
    };
    
    // Add 20 more generic users
    for (let i = 9; i <= 30; i++) {
        const gender = i % 2 === 0 ? 'men' : 'women';
        const num = i > 20 ? i - 10 : i;
        demoUsers[`user_${i}`] = {
            username: `user_${i}`,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            password: 'pass123',
            profilePic: `https://randomuser.me/api/portraits/${gender}/${num}.jpg`,
            education: `Degree in Various`,
            major: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts'][Math.floor(Math.random() * 5)],
            gradYear: `${2020 + Math.floor(Math.random() * 6)}`,
            skills: 'Various skills',
            location: ['Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Tanta'][Math.floor(Math.random() * 5)] + ', Egypt',
            lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            sessions: Math.floor(Math.random() * 50) + 5,
            totalTime: Math.floor(Math.random() * 2000) + 100,
            blocked: Math.random() > 0.9 // 10% blocked users for demo
        };
    }
    
    localStorage.setItem('edumate_users', JSON.stringify(demoUsers));
    
    // Demo searches (200+ searches)
    const searchTerms = [
        'Computer Science', 'Software Engineer Internships', 'Scholarships 2024',
        'Cairo University', 'MBA programs', 'Data Science courses',
        'Medical schools', 'Study abroad', 'Internships Egypt',
        'Resume templates', 'Python programming', 'Machine Learning',
        'Artificial Intelligence', 'Web Development', 'Digital Marketing',
        'Finance Internships', 'HR courses', 'Graphic Design',
        'IELTS preparation', 'TOEFL test', 'Study in USA',
        'Study in UK', 'Study in Germany', 'Study in Canada',
        'Software Developer', 'Frontend Developer', 'Backend Developer',
        'Full Stack Developer', 'DevOps Engineer', 'Data Analyst',
        'Business Analyst', 'Project Manager', 'Product Manager',
        'Marketing Specialist', 'Sales Executive', 'Accountant',
        'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer',
        'Architect', 'Pharmacist', 'Doctor', 'Nurse',
        'Dentist', 'Veterinarian', 'Lawyer', 'Teacher'
    ];
    
    const searches = [];
    for (let i = 0; i < 250; i++) {
        const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        searches.push({
            term: term,
            timestamp: date.toISOString(),
            userId: `user_${Math.floor(Math.random() * 20) + 1}`,
            results: Math.floor(Math.random() * 50) + 5
        });
    }
    localStorage.setItem('edumate_searches', JSON.stringify(searches));
    
    // Demo sessions (500+ sessions)
    const sessions = [];
    for (let i = 0; i < 500; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 60));
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        sessions.push({
            userId: `user_${Math.floor(Math.random() * 25) + 1}`,
            timestamp: date.toISOString(),
            duration: Math.floor(Math.random() * 60) + 5, // 5-65 minutes
            pages: Math.floor(Math.random() * 10) + 1,
            country: ['EG', 'US', 'SA', 'AE', 'JO', 'KW', 'GB', 'DE', 'FR', 'CA'][Math.floor(Math.random() * 10)]
        });
    }
    localStorage.setItem('edumate_sessions', JSON.stringify(sessions));
    
    // Demo course enrollments
    const courses = {
        cs: 145,
        engineering: 112,
        business: 98,
        medicine: 76,
        arts: 54,
        law: 43,
        science: 67
    };
    localStorage.setItem('edumate_course_interests', JSON.stringify(courses));
    
    // Demo feature usage
    const featureUsage = [
        { name: 'Resume Builder', count: 234, icon: '📄' },
        { name: 'Job Search', count: 189, icon: '💼' },
        { name: 'Courses', count: 167, icon: '📚' },
        { name: 'AI Chat', count: 145, icon: '🤖' },
        { name: 'Scholarships', count: 123, icon: '🎓' },
        { name: 'Faculty Search', count: 98, icon: '👨‍🏫' },
        { name: 'Events', count: 87, icon: '🎟️' },
        { name: 'Profile', count: 156, icon: '👤' },
        { name: 'Resume Templates', count: 112, icon: '📝' },
        { name: 'Interview Prep', count: 94, icon: '🎯' }
    ];
    localStorage.setItem('edumate_feature_usage', JSON.stringify(featureUsage));
    
    // Demo blocked IPs
    const blockedIPs = [
        { address: '192.168.1.100', reason: 'spam', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), blockedBy: 'admin@edumate.com' },
        { address: '10.0.0.45', reason: 'abuse', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), blockedBy: 'admin@edumate.com' },
        { address: '172.16.254.1', reason: 'suspicious', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), blockedBy: 'admin@edumate.com' },
        { address: '203.0.113.5', reason: 'spam', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), blockedBy: 'superadmin@edumate.com' }
    ];
    localStorage.setItem('edumate_blocked_ips', JSON.stringify(blockedIPs));
    
    // Demo blocked regions
    const blockedRegions = [
        { code: 'CN', name: 'China', date: new Date().toISOString() },
        { code: 'RU', name: 'Russia', date: new Date().toISOString() },
        { code: 'KP', name: 'North Korea', date: new Date().toISOString() }
    ];
    localStorage.setItem('edumate_blocked_regions', JSON.stringify(blockedRegions));
    
    // Demo security logs
    const securityLogs = [];
    const logMessages = [
        'Failed login attempt',
        'Successful login',
        'Password reset requested',
        'IP blocked',
        'IP unblocked',
        'User account created',
        'User account deleted',
        'Admin login',
        'Settings changed',
        'Suspicious activity detected'
    ];
    
    for (let i = 0; i < 50; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        securityLogs.push({
            timestamp: date.toISOString(),
            level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
            message: logMessages[Math.floor(Math.random() * logMessages.length)],
            user: `user_${Math.floor(Math.random() * 10) + 1}`,
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        });
    }
    localStorage.setItem('edumate_security_logs', JSON.stringify(securityLogs));
    
    // Demo system logs
    const systemLogs = [];
    const systemMessages = [
        'System started',
        'Database backup completed',
        'Cache cleared',
        'User session timeout',
        'API rate limit reached',
        'Email sent',
        'Notification delivered',
        'Search index updated',
        'Course catalog updated',
        'Resume template updated'
    ];
    
    for (let i = 0; i < 100; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 60));
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        systemLogs.push({
            timestamp: date.toISOString(),
            level: ['info', 'info', 'info', 'warning', 'error'][Math.floor(Math.random() * 5)],
            message: systemMessages[Math.floor(Math.random() * systemMessages.length)],
            component: ['Auth', 'Database', 'API', 'Frontend', 'Background'][Math.floor(Math.random() * 5)]
        });
    }
    localStorage.setItem('edumate_system_logs', JSON.stringify(systemLogs));
    
    // Demo admin settings
    localStorage.setItem('edumate_admin_settings', JSON.stringify({
        maintenanceMode: false,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        allowRegistration: true,
        requireEmailVerification: false,
        defaultUserRole: 'student',
        updatedBy: 'admin@edumate.com',
        updatedAt: new Date().toISOString()
    }));
    
    console.log('Demo data initialized successfully');
}

// Initialize Application
function initializeApp() {
    // Check if demo data exists, if not, create it
    if (!localStorage.getItem('edumate_users') || Object.keys(JSON.parse(localStorage.getItem('edumate_users'))).length < 10) {
        initializeDemoData();
    }
    
    // Update active states in navigation
    updateActiveNavItem('dashboard');
    
    const logged = sessionStorage.getItem('edumate_admin_logged') === '1';
    
    if (!logged) {
        navigateTo('login');
    } else {
        verifyAdminAndProceed();
    }
}

// Update active navigation item
function updateActiveNavItem(pageId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`.nav-item[onclick="navigateTo('${pageId}')"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Also update header nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.background = 'transparent';
        link.style.color = 'var(--muted)';
    });
    
    const activeLink = document.querySelector(`.nav-links a[onclick="navigateTo('${pageId}')"]`);
    if (activeLink) {
        activeLink.style.background = 'rgba(99, 102, 241, 0.1)';
        activeLink.style.color = 'var(--primary)';
    }
}

// Verify admin and load dashboard
function verifyAdminAndProceed() {
    const adminEmail = sessionStorage.getItem('edumate_admin_email');
    
    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
        alert('Unauthorized access');
        signOut();
        return;
    }
    
    updateAdminProfile();
    loadAllDashboardData();
    navigateTo('dashboard');
}

// Admin Login
function attemptAdminLogin() {
    const email = document.getElementById('admin-email')?.value.trim() || '';
    const password = document.getElementById('admin-password')?.value || '';
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    // Check if it's an admin email
    if (!ADMIN_EMAILS.includes(email)) {
        alert('Unauthorized: Not an admin account');
        logSecurityEvent('Unauthorized login attempt', email);
        return;
    }
    
    // For demo purposes - in production, use Firebase Auth with admin claims
    if (password === 'admin123') {
        sessionStorage.setItem('edumate_admin_logged', '1');
        sessionStorage.setItem('edumate_admin_email', email);
        logSecurityEvent('Admin login successful', email);
        verifyAdminAndProceed();
    } else {
        alert('Invalid password');
        logSecurityEvent('Failed admin login attempt', email);
    }
}

// Sign Out
function signOut() {
    sessionStorage.removeItem('edumate_admin_logged');
    sessionStorage.removeItem('edumate_admin_email');
    updateActiveNavItem('login');
    navigateTo('login');
    
    // Redirect to index.html after a brief delay to allow any cleanup
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 100);
}

// Navigation
const PROTECTED_PAGES = new Set(['dashboard', 'users', 'analytics', 'security', 'logs', 'settings']);

function navigateTo(id) {
    console.log('Navigating to:', id);
    
    const logged = sessionStorage.getItem('edumate_admin_logged') === '1';
    
    if (PROTECTED_PAGES.has(id) && !logged) {
        alert('Please sign in as admin');
        id = 'login';
    }
    
    const current = document.querySelector('.page.active');
    const next = document.getElementById(id);
    
    if (!next) {
        console.error('Page not found:', id);
        return;
    }
    
    // Update active navigation
    updateActiveNavItem(id);
    
    // Don't animate if it's the same page
    if (current === next) {
        return;
    }
    
    // Hide current page with animation
    if (current) {
        current.style.transition = 'all 0.2s ease';
        current.style.opacity = '0';
        current.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            document.querySelectorAll('.page').forEach(p => {
                p.classList.remove('active');
                p.style.opacity = '';
                p.style.transform = '';
            });
            
            next.classList.add('active');
            window.scrollTo(0, 0);
            
            // Show next page with animation
            next.style.transition = 'all 0.25s ease';
            next.style.opacity = '0';
            next.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                next.style.opacity = '1';
                next.style.transform = 'translateX(0)';
            }, 30);
            
            runPageInit(id);
        }, 200);
    } else {
        // No current page, just show the next one
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        next.classList.add('active');
        window.scrollTo(0, 0);
        runPageInit(id);
    }
    
    currentPage = id;
}

function runPageInit(id) {
    console.log('Initializing page:', id);
    
    if (id === 'dashboard') {
        setTimeout(() => loadAllDashboardData(), 100);
    }
    if (id === 'users') {
        setTimeout(() => loadUsersData(), 100);
    }
    if (id === 'analytics') {
        setTimeout(() => loadAnalytics(), 100);
    }
    if (id === 'security') {
        setTimeout(() => loadSecurityData(), 100);
    }
    if (id === 'logs') {
        setTimeout(() => loadSystemLogs(), 100);
    }
    if (id === 'settings') {
        setTimeout(() => loadAdminSettings(), 100);
    }
}

// Update Admin Profile
function updateAdminProfile() {
    const adminName = document.getElementById('admin-name');
    if (adminName) {
        adminName.textContent = sessionStorage.getItem('edumate_admin_email') || 'Admin';
    }
}

// Load all dashboard data
function loadAllDashboardData() {
    console.log('Loading dashboard data...');
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
}

// Update last updated timestamp
function updateLastUpdated() {
    const now = new Date();
    document.getElementById('last-updated').textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Load total users
function loadTotalUsers() {
    const users = JSON.parse(localStorage.getItem('edumate_users') || '{}');
    const count = Object.keys(users).length;
    document.getElementById('total-users').textContent = count;
}

// Load total searches
function loadTotalSearches() {
    const searches = JSON.parse(localStorage.getItem('edumate_searches') || '[]');
    document.getElementById('total-searches').textContent = searches.length;
}

// Load active users today
function loadActiveUsers() {
    const sessions = JSON.parse(localStorage.getItem('edumate_sessions') || '[]');
    const today = new Date().toDateString();
    const activeToday = sessions.filter(s => new Date(s.timestamp).toDateString() === today).length;
    document.getElementById('active-today').textContent = activeToday;
}

// Load average session time
function loadAvgSessionTime() {
    const sessions = JSON.parse(localStorage.getItem('edumate_sessions') || '[]');
    let totalTime = 0;
    sessions.forEach(s => {
        if (s.duration) totalTime += s.duration;
    });
    const avgTime = sessions.length ? Math.round(totalTime / sessions.length) : 0;
    document.getElementById('avg-session').textContent = `${avgTime}m`;
    document.getElementById('avg-time-analytics').textContent = `${avgTime}m`;
}

// Load user activity chart
function loadUserActivityChart() {
    const ctx = document.getElementById('userActivityChart').getContext('2d');
    
    // Generate last 7 days
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const sessions = JSON.parse(localStorage.getItem('edumate_sessions') || '[]');
        const daySessions = sessions.filter(s => 
            new Date(s.timestamp).toDateString() === date.toDateString()
        ).length;
        data.push(daySessions);
    }
    
    if (activityChart) activityChart.destroy();
    
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Active Users',
                data: data,
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Load country statistics
function loadCountryStats() {
    const sessions = JSON.parse(localStorage.getItem('edumate_sessions') || '[]');
    
    // Count sessions by country
    const countryCounts = {};
    sessions.forEach(s => {
        const country = s.country || 'EG';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    
    // Sort by count
    const sortedCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    const countryNames = {
        'EG': 'Egypt', 'US': 'United States', 'SA': 'Saudi Arabia',
        'AE': 'UAE', 'JO': 'Jordan', 'KW': 'Kuwait',
        'GB': 'United Kingdom', 'DE': 'Germany', 'FR': 'France',
        'CA': 'Canada'
    };
    
    const container = document.getElementById('country-stats');
    container.innerHTML = sortedCountries.map(([code, count]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding:5px;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:1.5rem">${getCountryFlag(code)}</span>
                <span style="font-weight:600">${countryNames[code] || code}</span>
            </div>
            <div>
                <span class="search-count">${count}</span>
                <span style="color:var(--muted);font-size:0.85rem;margin-left:5px">sessions</span>
            </div>
        </div>
    `).join('');
}

// Get country flag emoji
function getCountryFlag(code) {
    const flags = {
        'EG': '🇪🇬', 'US': '🇺🇸', 'SA': '🇸🇦', 'AE': '🇦🇪', 
        'JO': '🇯🇴', 'KW': '🇰🇼', 'GB': '🇬🇧', 'DE': '🇩🇪',
        'FR': '🇫🇷', 'CA': '🇨🇦', 'CN': '🇨🇳', 'RU': '🇷🇺',
        'IN': '🇮🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'BR': '🇧🇷'
    };
    return flags[code] || '🌍';
}

// Load top searches
function loadTopSearches() {
    const searches = JSON.parse(localStorage.getItem('edumate_searches') || '[]');
    const searchCounts = {};
    
    searches.forEach(s => {
        searchCounts[s.term] = (searchCounts[s.term] || 0) + 1;
    });
    
    const topSearches = Object.entries(searchCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const container = document.getElementById('top-searches');
    
    container.innerHTML = topSearches.map(([term, count]) => `
        <div class="search-item">
            <span class="search-term">${term}</span>
            <span class="search-count">${count}</span>
        </div>
    `).join('');
}

// Load top features
function loadTopFeatures() {
    const features = JSON.parse(localStorage.getItem('edumate_feature_usage') || '[]');
    const container = document.getElementById('top-features');
    
    container.innerHTML = features.map(f => `
        <div class="feature-item">
            <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:1.2rem">${f.icon}</span>
                <span class="search-term">${f.name}</span>
            </div>
            <span class="search-count">${f.count}</span>
        </div>
    `).join('');
}

// Load course interest
function loadCourseInterest() {
    const courses = JSON.parse(localStorage.getItem('edumate_course_interests') || '{}');
    
    const interests = [
        { name: 'Computer Science', count: courses.cs || 145, id: 'cs' },
        { name: 'Engineering', count: courses.engineering || 112, id: 'engineering' },
        { name: 'Business', count: courses.business || 98, id: 'business' },
        { name: 'Medicine', count: courses.medicine || 76, id: 'medicine' },
        { name: 'Science', count: courses.science || 67, id: 'science' },
        { name: 'Arts', count: courses.arts || 54, id: 'arts' },
        { name: 'Law', count: courses.law || 43, id: 'law' }
    ];
    
    const maxCount = Math.max(...interests.map(i => i.count));
    
    interests.forEach(i => {
        const percent = Math.round((i.count / maxCount) * 100);
        document.getElementById(`${i.id}-count`).textContent = i.count;
        document.getElementById(`${i.id}-progress`).style.width = `${percent}%`;
    });
}

// Load blocked IPs
function loadBlockedIPs() {
    const blockedIPs = JSON.parse(localStorage.getItem('edumate_blocked_ips') || '[]');
    const container = document.getElementById('blocked-ips-list');
    
    if (blockedIPs.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">No blocked IPs</p>';
    } else {
        container.innerHTML = blockedIPs.map((ip, index) => `
            <div class="ip-item">
                <div>
                    <span class="ip-address">${ip.address}</span>
                    <div style="font-size:0.8rem;color:var(--muted)">${ip.reason} • ${new Date(ip.date).toLocaleDateString()}</div>
                </div>
                <button class="unblock-btn" onclick="unblockIP(${index})">Unblock</button>
            </div>
        `).join('');
    }
}

// Load blocked regions
function loadBlockedRegions() {
    const blockedRegions = JSON.parse(localStorage.getItem('edumate_blocked_regions') || '[]');
    const container = document.getElementById('blocked-regions');
    
    if (blockedRegions.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:10px">No blocked regions</p>';
    } else {
        container.innerHTML = blockedRegions.map((region, index) => `
            <div class="country-item">
                <div style="display:flex;align-items:center;gap:10px">
                    <span class="country-flag">${getCountryFlag(region.code)}</span>
                    <span class="country-name">${region.name}</span>
                </div>
                <button class="unblock-btn" onclick="unblockRegion(${index})">Allow</button>
            </div>
        `).join('');
    }
}

// Load recent users
function loadRecentUsers() {
    const users = JSON.parse(localStorage.getItem('edumate_users') || '{}');
    const userList = Object.values(users)
        .sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0))
        .slice(0, 5);
    
    const container = document.getElementById('recent-users-list');
    
    container.innerHTML = userList.map(user => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
                <img src="${user.profilePic || 'https://via.placeholder.com/40'}" style="width:40px;height:40px;border-radius:50%;object-fit:cover" onerror="this.src='https://via.placeholder.com/40'">
                <div>
                    <div style="font-weight:600">${user.name || user.username}</div>
                    <div style="font-size:0.85rem;color:var(--muted)">${user.email || ''}</div>
                </div>
            </div>
            <div style="text-align:right">
                <span class="user-status ${user.blocked ? 'status-blocked' : 'status-active'}">
                    ${user.blocked ? 'Blocked' : 'Active'}
                </span>
                <div style="font-size:0.8rem;color:var(--muted);margin-top:4px">
                    ${user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                </div>
            </div>
        </div>
    `).join('');
}

// Load users data
function loadUsersData() {
    const users = JSON.parse(localStorage.getItem('edumate_users') || '{}');
    const userList = Object.values(users);
    const tbody = document.getElementById('users-table-body');
    
    tbody.innerHTML = userList.map(user => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <img src="${user.profilePic || 'https://via.placeholder.com/32'}" style="width:32px;height:32px;border-radius:50%;object-fit:cover" onerror="this.src='https://via.placeholder.com/32'">
                    <span>${user.name || user.username}</span>
                </div>
            </td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.location || 'Egypt'}</td>
            <td>${user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</td>
            <td>
                <span class="user-status ${user.blocked ? 'status-blocked' : 'status-active'}">
                    ${user.blocked ? 'Blocked' : 'Active'}
                </span>
            </td>
            <td>
                <button class="link-btn" style="padding:4px 8px;margin-right:5px" onclick="viewUserDetails('${user.username}')">View</button>
                <button class="btn-danger" style="padding:4px 8px" onclick="blockUser('${user.username}')">${user.blocked ? 'Unblock' : 'Block'}</button>
            </td>
        </tr>
    `).join('');
}

// Load analytics
function loadAnalytics() {
    const period = document.getElementById('analytics-period').value;
    
    const sessions = JSON.parse(localStorage.getItem('edumate_sessions') || '[]');
    const now = new Date();
    
    // Daily active
    const dailyActive = sessions.filter(s => 
        new Date(s.timestamp).toDateString() === now.toDateString()
    ).length;
    document.getElementById('daily-active').textContent = dailyActive;
    
    // Weekly active
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyActive = sessions.filter(s => 
        new Date(s.timestamp) >= weekAgo
    ).length;
    document.getElementById('weekly-active').textContent = weeklyActive;
    
    // Monthly active
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthlyActive = sessions.filter(s => 
        new Date(s.timestamp) >= monthAgo
    ).length;
    document.getElementById('monthly-active').textContent = monthlyActive;
    
    loadUserGrowthChart();
    loadFeaturePieChart();
}

// Load user growth chart
function loadUserGrowthChart() {
    const ctx = document.getElementById('userGrowthChart').getContext('2d');
    
    const labels = [];
    const data = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        
        // Count users registered in that month
        const users = JSON.parse(localStorage.getItem('edumate_users') || '{}');
        const monthUsers = Object.values(users).filter(u => {
            if (!u.lastActive) return false;
            const userDate = new Date(u.lastActive);
            return userDate.getMonth() === date.getMonth() && userDate.getFullYear() === date.getFullYear();
        }).length;
        
        data.push(monthUsers || Math.floor(Math.random() * 30) + 20); // Fallback to random
    }
    
    if (growthChart) growthChart.destroy();
    
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'New Users',
                data: data,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Load feature pie chart
function loadFeaturePieChart() {
    const ctx = document.getElementById('featurePieChart').getContext('2d');
    const features = JSON.parse(localStorage.getItem('edumate_feature_usage') || '[]');
    
    const labels = features.slice(0, 5).map(f => f.name);
    const data = features.slice(0, 5).map(f => f.count);
    const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];
    
    if (featurePieChart) featurePieChart.destroy();
    
    featurePieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load security data
function loadSecurityData() {
    loadBlockedIPs();
    loadBlockedRegions();
    loadSecurityLogs();
}

// Load security logs
function loadSecurityLogs() {
    const logs = JSON.parse(localStorage.getItem('edumate_security_logs') || '[]');
    const container = document.getElementById('security-logs');
    
    if (logs.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">No security logs</p>';
    } else {
        container.innerHTML = logs.slice(0, 20).map(log => `
            <div class="log-item">
                <span class="log-time">${new Date(log.timestamp).toLocaleString()}</span>
                <span class="log-level log-${log.level}">${log.level.toUpperCase()}</span>
                <span>${log.message} - ${log.user || 'System'}</span>
                <div style="font-size:0.8rem;color:var(--muted);margin-top:4px">IP: ${log.ip || 'N/A'}</div>
            </div>
        `).join('');
    }
}

// Load system logs
function loadSystemLogs() {
    const logs = JSON.parse(localStorage.getItem('edumate_system_logs') || '[]');
    const container = document.getElementById('system-logs');
    
    container.innerHTML = logs.slice(0, 50).map(log => `
        <div class="log-item">
            <span class="log-time">${new Date(log.timestamp).toLocaleString()}</span>
            <span class="log-level log-${log.level}">${log.level.toUpperCase()}</span>
            <span>${log.message}</span>
            <div style="font-size:0.8rem;color:var(--muted)">${log.component || 'System'}</div>
        </div>
    `).join('');
}

// Load admin settings
function loadAdminSettings() {
    const settings = JSON.parse(localStorage.getItem('edumate_admin_settings') || '{}');
    document.getElementById('maintenance-mode').checked = settings.maintenanceMode || false;
    document.getElementById('session-timeout').value = settings.sessionTimeout || 30;
    document.getElementById('max-login-attempts').value = settings.maxLoginAttempts || 5;
    
    loadAdminUsers();
}

// Load admin users
function loadAdminUsers() {
    const container = document.getElementById('admin-users-list');
    container.innerHTML = ADMIN_EMAILS.map(email => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid var(--border)">
            <div>
                <span style="font-weight:600">${email}</span>
                <span style="margin-left:10px;color:var(--primary)">Administrator</span>
            </div>
            <div>
                <span class="user-status status-active">Active</span>
            </div>
        </div>
    `).join('');
}

// Block IP
function blockIP() {
    const ip = document.getElementById('new-blocked-ip').value.trim();
    const reason = document.getElementById('block-reason').value;
    
    if (!ip) {
        alert('Please enter an IP address');
        return;
    }
    
    const blockedIPs = JSON.parse(localStorage.getItem('edumate_blocked_ips') || '[]');
    
    // Check if already blocked
    if (blockedIPs.some(item => item.address === ip)) {
        alert('IP already blocked');
        return;
    }
    
    blockedIPs.push({
        address: ip,
        reason: reason,
        date: new Date().toISOString(),
        blockedBy: sessionStorage.getItem('edumate_admin_email')
    });
    
    localStorage.setItem('edumate_blocked_ips', JSON.stringify(blockedIPs));
    logSecurityEvent(`IP blocked: ${ip}`, sessionStorage.getItem('edumate_admin_email'));
    
    document.getElementById('new-blocked-ip').value = '';
    loadBlockedIPs();
    alert(`IP ${ip} has been blocked`);
}

// Unblock IP
function unblockIP(index) {
    const blockedIPs = JSON.parse(localStorage.getItem('edumate_blocked_ips') || '[]');
    const ip = blockedIPs[index].address;
    blockedIPs.splice(index, 1);
    localStorage.setItem('edumate_blocked_ips', JSON.stringify(blockedIPs));
    logSecurityEvent(`IP unblocked: ${ip}`, sessionStorage.getItem('edumate_admin_email'));
    loadBlockedIPs();
    alert(`IP ${ip} has been unblocked`);
}

// Block country
function blockCountry() {
    const countryCode = document.getElementById('country-select').value;
    
    if (!countryCode) {
        alert('Please select a country');
        return;
    }
    
    const countryNames = {
        'CN': 'China', 'RU': 'Russia', 'KP': 'North Korea',
        'IR': 'Iran', 'SY': 'Syria', 'CU': 'Cuba',
        'VE': 'Venezuela', 'BY': 'Belarus', 'MM': 'Myanmar',
        'AF': 'Afghanistan', 'IQ': 'Iraq', 'LY': 'Libya'
    };
    
    const blockedRegions = JSON.parse(localStorage.getItem('edumate_blocked_regions') || '[]');
    
    if (blockedRegions.some(r => r.code === countryCode)) {
        alert('Country already blocked');
        return;
    }
    
    blockedRegions.push({
        code: countryCode,
        name: countryNames[countryCode] || countryCode,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('edumate_blocked_regions', JSON.stringify(blockedRegions));
    logSecurityEvent(`Country blocked: ${countryNames[countryCode]}`, sessionStorage.getItem('edumate_admin_email'));
    
    loadBlockedRegions();
    alert(`Country ${countryNames[countryCode]} has been blocked`);
}

// Unblock region
function unblockRegion(index) {
    const blockedRegions = JSON.parse(localStorage.getItem('edumate_blocked_regions') || '[]');
    const region = blockedRegions[index].name;
    blockedRegions.splice(index, 1);
    localStorage.setItem('edumate_blocked_regions', JSON.stringify(blockedRegions));
    logSecurityEvent(`Region unblocked: ${region}`, sessionStorage.getItem('edumate_admin_email'));
    loadBlockedRegions();
    alert(`${region} has been allowed`);
}

// Update country access
function updateCountryAccess() {
    const access = document.getElementById('country-access').value;
    alert(`Country access policy updated to: ${access}`);
    logSecurityEvent('Country access policy updated', sessionStorage.getItem('edumate_admin_email'));
}

// Show add IP rule
function showAddIPRule() {
    document.getElementById('new-blocked-ip').focus();
}

// View all course interests
function viewAllCourseInterests() {
    navigateTo('analytics');
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const filter = document.getElementById('user-filter').value;
    
    const users = JSON.parse(localStorage.getItem('edumate_users') || '{}');
    const userList = Object.values(users);
    
    const filtered = userList.filter(user => {
        const matchesSearch = (user.name?.toLowerCase().includes(searchTerm) ||
                              user.username?.toLowerCase().includes(searchTerm) ||
                              user.email?.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
        
        if (filter === 'all') return true;
        if (filter === 'active') return !user.blocked && user.lastActive;
        if (filter === 'inactive') return !user.lastActive;
        if (filter === 'blocked') return user.blocked;
        
        return true;
    });
    
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = filtered.map(user => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <img src="${user.profilePic || 'https://via.placeholder.com/32'}" style="width:32px;height:32px;border-radius:50%;object-fit:cover" onerror="this.src='https://via.placeholder.com/32'">
                    <span>${user.name || user.username}</span>
                </div>
            </td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.location || 'Egypt'}</td>
            <td>${user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</td>
            <td>
                <span class="user-status ${user.blocked ? 'status-blocked' : 'status-active'}">
                    ${user.blocked ? 'Blocked' : 'Active'}
                </span>
            </td>
            <td>
                <button class="link-btn" style="padding:4px 8px;margin-right:5px" onclick="viewUserDetails('${user.username}')">View</button>
                <button class="btn-danger" style="padding:4px 8px" onclick="blockUser('${user.username}')">${user.blocked ? 'Unblock' : 'Block'}</button>
            </td>
        </tr>
    `).join('');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">No users found</td></tr>';
    }
}

// View user details
function viewUserDetails(username) {
    const users = JSON.parse(localStorage.getItem('edumate_users') || '{}');
    const user = users[username];
    
    if (!user) {
        alert('User not found');
        return;
    }
    
    const details = `
        Username: ${user.username}
        Name: ${user.name || 'N/A'}
        Email: ${user.email || 'N/A'}
        Location: ${user.location || 'N/A'}
        Education: ${user.education || 'N/A'}
        Major: ${user.major || 'N/A'}
        Graduation Year: ${user.gradYear || 'N/A'}
        Skills: ${user.skills || 'N/A'}
        Sessions: ${user.sessions || 0}
        Total Time: ${user.totalTime || 0} minutes
        Last Active: ${user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
        Status: ${user.blocked ? 'Blocked' : 'Active'}
    `;
    
    alert(details);
}

// Block/unblock user
function blockUser(username) {
    const users = JSON.parse(localStorage.getItem('edumate_users') || '{}');
    
    if (users[username]) {
        users[username].blocked = !users[username].blocked;
        localStorage.setItem('edumate_users', JSON.stringify(users));
        
        const action = users[username].blocked ? 'blocked' : 'unblocked';
        logSecurityEvent(`User ${action}: ${username}`, sessionStorage.getItem('edumate_admin_email'));
        
        // Reload current view
        if (currentPage === 'users') {
            loadUsersData();
        } else if (currentPage === 'dashboard') {
            loadRecentUsers();
        }
        
        alert(`User ${username} has been ${action}`);
    }
}

// Export logs
function exportLogs() {
    const logs = JSON.parse(localStorage.getItem('edumate_system_logs') || '[]');
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `edumate_logs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    logSecurityEvent('Logs exported', sessionStorage.getItem('edumate_admin_email'));
}

// Save admin settings
function saveAdminSettings() {
    const settings = {
        maintenanceMode: document.getElementById('maintenance-mode').checked,
        sessionTimeout: parseInt(document.getElementById('session-timeout').value),
        maxLoginAttempts: parseInt(document.getElementById('max-login-attempts').value),
        allowRegistration: true,
        requireEmailVerification: false,
        defaultUserRole: 'student',
        updatedBy: sessionStorage.getItem('edumate_admin_email'),
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('edumate_admin_settings', JSON.stringify(settings));
    logSecurityEvent('Admin settings updated', sessionStorage.getItem('edumate_admin_email'));
    alert('Settings saved successfully');
}

// Show add admin
// Add Admin function - Opens popup to add new admin email
// Add Admin function - Opens popup to add new admin email
// Add Admin function - Opens popup to add new admin email
function showAddAdmin() {
    // Remove any existing modal first
    if (window.currentAdminModal) {
        closeAdminModal();
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
    `;

    // Check current theme
    const isDarkTheme = document.body.classList.contains('dark-theme');
    
    // Create modal with theme support
    const modal = document.createElement('div');
    modal.className = 'add-admin-modal';
    modal.style.cssText = `
        background: ${isDarkTheme ? '#1f2937' : '#ffffff'};
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, ${isDarkTheme ? '0.5' : '0.3'});
        width: 90%;
        max-width: 500px;
        animation: slideIn 0.3s ease;
        border: ${isDarkTheme ? '1px solid #374151' : 'none'};
        max-height: 80vh;
        overflow-y: auto;
    `;

    // Get current admin list for display
    const adminListHtml = ADMIN_EMAILS.map(email => `
        <div class="admin-email-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: ${isDarkTheme ? '#374151' : '#f3f4f6'}; border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">👤</span>
                <span style="color: ${isDarkTheme ? '#f9fafb' : '#1f2937'};">${email}</span>
                ${email.includes('edumate.com') || email === 'admin@sut.edu.eg' ? 
                    '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">Default</span>' : 
                    ''}
            </div>
            ${!email.includes('edumate.com') && email !== 'admin@sut.edu.eg' ? `
                <button onclick="removeAdminEmail('${email}')" 
                        class="btn-icon-small" 
                        style="background: transparent; border: none; cursor: pointer; padding: 5px 10px; border-radius: 6px; color: #ef4444; transition: all 0.2s; font-size: 0.9rem;">
                    ✕ Remove
                </button>
            ` : ''}
        </div>
    `).join('');

    // Add modal content with theme-aware colors
    modal.innerHTML = `
        <h3 style="margin: 0 0 5px 0; color: ${isDarkTheme ? '#f9fafb' : '#1f2937'};">Manage Admin Users</h3>
        <p style="margin: 0 0 20px 0; color: ${isDarkTheme ? '#9ca3af' : '#6b7280'}; font-size: 14px; border-bottom: 1px solid ${isDarkTheme ? '#374151' : '#e5e7eb'}; padding-bottom: 15px;">
            Add or remove administrators from the system
        </p>
        
        <div style="margin-bottom: 25px;">
            <h4 style="color: ${isDarkTheme ? '#f9fafb' : '#1f2937'}; margin: 0 0 15px 0; font-size: 1rem;">Current Administrators:</h4>
            <div id="admin-list-container" style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                ${adminListHtml || '<p style="color: var(--muted); text-align: center; padding: 20px;">No admin users found</p>'}
            </div>
        </div>

        <div style="border-top: 1px solid ${isDarkTheme ? '#374151' : '#e5e7eb'}; padding-top: 20px;">
            <h4 style="color: ${isDarkTheme ? '#f9fafb' : '#1f2937'}; margin: 0 0 15px 0; font-size: 1rem;">Add New Admin:</h4>
            <div class="form-group" style="margin-bottom: 20px;">
                <label for="new-admin-email" style="display: block; margin-bottom: 8px; color: ${isDarkTheme ? '#f9fafb' : '#1f2937'}; font-weight: 500;">
                    Admin Email
                </label>
                <input type="email" 
                       id="new-admin-email" 
                       class="input" 
                       placeholder="admin@example.com" 
                       style="width: 100%; padding: 12px; border: 2px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'}; border-radius: 8px; font-size: 14px; background: ${isDarkTheme ? '#374151' : '#ffffff'}; color: ${isDarkTheme ? '#f9fafb' : '#1f2937'};"
                       required>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button onclick="closeAdminModal()" 
                        class="btn-secondary" 
                        style="padding: 10px 20px; border: none; border-radius: 8px; background: ${isDarkTheme ? '#374151' : '#f3f4f6'}; color: ${isDarkTheme ? '#f9fafb' : '#1f2937'}; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    Close
                </button>
                <button onclick="addAdminEmail()" 
                        class="btn-primary" 
                        style="padding: 10px 20px; border: none; border-radius: 8px; background: #8b5cf6; color: white; cursor: pointer; font-weight: 500; transition: all 0.2s;">
                    Add Admin
                </button>
            </div>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus on input
    setTimeout(() => {
        document.getElementById('new-admin-email')?.focus();
    }, 100);

    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeAdminModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeAdminModal();
        }
    });

    // Store modal elements globally for cleanup
    window.currentAdminModal = {
        overlay,
        handleEscape
    };
}

// Function to close admin modal
function closeAdminModal() {
    const modal = window.currentAdminModal;
    if (modal) {
        document.removeEventListener('keydown', modal.handleEscape);
        modal.overlay.remove();
        delete window.currentAdminModal;
    }
}

// Function to add admin email to ADMIN_EMAILS
function addAdminEmail() {
    const emailInput = document.getElementById('new-admin-email');
    if (!emailInput) {
        Toast.error('Email input not found');
        return;
    }
    
    const newEmail = emailInput.value.trim().toLowerCase();

    // Validation
    if (!newEmail) {
        Toast.error('Please enter an email address');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        Toast.error('Please enter a valid email address');
        return;
    }

    // Check if already exists in ADMIN_EMAILS
    if (ADMIN_EMAILS.includes(newEmail)) {
        Toast.warning('This email is already an admin');
        emailInput.value = '';
        emailInput.focus();
        return;
    }

    // Add to ADMIN_EMAILS array
    ADMIN_EMAILS.push(newEmail);
    
    // Save to localStorage for persistence
    try {
        // Filter out default admin emails
        const customAdmins = ADMIN_EMAILS.filter(email => 
            !email.includes('edumate.com') && email !== 'admin@sut.edu.eg'
        );
        localStorage.setItem('edumate_admin_emails', JSON.stringify(customAdmins));
    } catch (e) {
        console.log('Error saving to localStorage:', e);
    }

    // Show success message
    Toast.success(`Admin ${newEmail} added successfully!`);

    // Update all admin UIs
    updateAllAdminUIs();

    // Clear input for next entry
    emailInput.value = '';
    emailInput.focus();

    // Update the modal content without closing
    updateAdminModalContent();
}

// Function to remove admin email
function removeAdminEmail(email) {
    if (confirm(`Are you sure you want to remove ${email} from admin list?`)) {
        const index = ADMIN_EMAILS.indexOf(email);
        if (index > -1) {
            ADMIN_EMAILS.splice(index, 1);
            
            // Update localStorage
            try {
                const customAdmins = ADMIN_EMAILS.filter(e => 
                    !e.includes('edumate.com') && e !== 'admin@sut.edu.eg'
                );
                localStorage.setItem('edumate_admin_emails', JSON.stringify(customAdmins));
            } catch (e) {
                console.log('Error saving to localStorage:', e);
            }
            
            Toast.success(`Admin ${email} removed`);
            
            // Update all UIs
            updateAllAdminUIs();
            
            // Update modal content if open
            updateAdminModalContent();
        }
    }
}

// Function to update modal content without closing
function updateAdminModalContent() {
    if (!window.currentAdminModal) return;

    const isDarkTheme = document.body.classList.contains('dark-theme');
    const adminListContainer = document.getElementById('admin-list-container');
    
    if (adminListContainer) {
        const adminListHtml = ADMIN_EMAILS.map(email => `
            <div class="admin-email-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: ${isDarkTheme ? '#374151' : '#f3f4f6'}; border-radius: 8px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.2rem;">👤</span>
                    <span style="color: ${isDarkTheme ? '#f9fafb' : '#1f2937'};">${email}</span>
                    ${email.includes('edumate.com') || email === 'admin@sut.edu.eg' ? 
                        '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">Default</span>' : 
                        ''}
                </div>
                ${!email.includes('edumate.com') && email !== 'admin@sut.edu.eg' ? `
                    <button onclick="removeAdminEmail('${email}')" 
                            class="btn-icon-small" 
                            style="background: transparent; border: none; cursor: pointer; padding: 5px 10px; border-radius: 6px; color: #ef4444; transition: all 0.2s; font-size: 0.9rem;">
                        ✕ Remove
                    </button>
                ` : ''}
            </div>
        `).join('');
        
        adminListContainer.innerHTML = adminListHtml || '<p style="color: var(--muted); text-align: center; padding: 20px;">No admin users found</p>';
    }
}

// Function to update all admin list UIs on the page
function updateAllAdminUIs() {
    // Update admin list in settings page
    const adminUsersList = document.getElementById('admin-users-list');
    if (adminUsersList) {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        adminUsersList.innerHTML = ADMIN_EMAILS.map(email => `
            <div class="admin-email-item" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${isDarkTheme ? '#374151' : '#f9fafb'}; border-radius: 8px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 1.2rem;">👤</span>
                    <div>
                        <div style="font-weight: 600; color: ${isDarkTheme ? '#f9fafb' : '#1f2937'};">${email}</div>
                        <div style="font-size: 0.85rem; color: var(--muted);">Administrator</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="user-status status-active" style="padding: 4px 12px;">Active</span>
                    ${!email.includes('edumate.com') && email !== 'admin@sut.edu.eg' ? `
                        <button onclick="removeAdminEmail('${email}')" 
                                class="btn-danger" 
                                style="padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                            Remove
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Update any other admin list elements
    const mainAdminList = document.getElementById('admin-emails-main-list');
    if (mainAdminList) {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        mainAdminList.innerHTML = ADMIN_EMAILS.map(email => `
            <div class="admin-email-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: ${isDarkTheme ? '#374151' : '#f9fafb'}; border-radius: 8px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.2rem;">👤</span>
                    <span style="color: ${isDarkTheme ? '#f9fafb' : '#1f2937'};">${email}</span>
                </div>
                ${!email.includes('edumate.com') && email !== 'admin@sut.edu.eg' ? `
                    <button onclick="removeAdminEmail('${email}')" 
                            class="btn-remove" 
                            style="background: #ef4444; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                        Remove
                    </button>
                ` : '<span class="badge" style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.85rem;">Default</span>'}
            </div>
        `).join('');
    }
}

// Function to load saved admin emails on initialization
function loadSavedAdminEmails() {
    try {
        const savedAdmins = JSON.parse(localStorage.getItem('edumate_admin_emails') || '[]');
        savedAdmins.forEach(email => {
            if (!ADMIN_EMAILS.includes(email)) {
                ADMIN_EMAILS.push(email);
            }
        });
    } catch (e) {
        console.log('Error loading saved admins:', e);
    }
}

// Add CSS styles dynamically if not already added
function addAdminModalStyles() {
    // Check if styles already added
    if (document.getElementById('admin-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'admin-modal-styles';
    style.textContent = `
        /* Modal Animations */
        @keyframes slideIn {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* Hover effects */
        .btn-secondary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        .btn-primary:hover {
            background: #7c3aed !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .btn-icon-small:hover {
            background: rgba(239, 68, 68, 0.1);
            transform: scale(1.05);
        }

        .btn-remove:hover {
            background: #dc2626 !important;
            transform: translateY(-1px);
        }

        .btn-danger:hover {
            background: #dc2626 !important;
            transform: translateY(-1px);
        }

        /* Input focus styles */
        .add-admin-modal input:focus {
            outline: none;
            border-color: #8b5cf6 !important;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        /* Scrollbar styles */
        #admin-list-container::-webkit-scrollbar,
        #admin-users-list::-webkit-scrollbar {
            width: 6px;
        }

        #admin-list-container::-webkit-scrollbar-track,
        #admin-users-list::-webkit-scrollbar-track {
            background: transparent;
        }

        #admin-list-container::-webkit-scrollbar-thumb,
        #admin-users-list::-webkit-scrollbar-thumb {
            background: #8b5cf6;
            border-radius: 3px;
        }

        /* Dark theme scrollbar */
        .dark-theme #admin-list-container::-webkit-scrollbar-thumb,
        .dark-theme #admin-users-list::-webkit-scrollbar-thumb {
            background: #6d4aff;
        }

        /* Admin email item transitions */
        .admin-email-item {
            transition: all 0.2s ease;
        }

        .admin-email-item:hover {
            transform: translateX(2px);
        }

        /* Toast container if not exists */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        }

        .toast {
            background: white;
            border-radius: 8px;
            padding: 12px 20px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
        }

        .dark-theme .toast {
            background: #1f2937;
            color: #f9fafb;
        }

        .toast.success { border-left: 4px solid #10b981; }
        .toast.error { border-left: 4px solid #ef4444; }
        .toast.warning { border-left: 4px solid #f59e0b; }
        .toast.info { border-left: 4px solid #3b82f6; }
    `;
    document.head.appendChild(style);
}

// Simple Toast implementation if not exists
if (typeof Toast === 'undefined') {
    window.Toast = {
        container: null,
        
        init() {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        },
        
        show(message, type = 'info', duration = 3000) {
            this.init();
            
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            
            toast.innerHTML = `
                <span>${icons[type]}</span>
                <span>${message}</span>
            `;
            
            this.container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        },
        
        success(message) { this.show(message, 'success'); },
        error(message) { this.show(message, 'error'); },
        warning(message) { this.show(message, 'warning'); },
        info(message) { this.show(message, 'info'); }
    };
}

// Load saved admin emails when script initializes
loadSavedAdminEmails();

// Add modal styles
addAdminModalStyles();



// Function to close admin modal
function closeAdminModal() {
    const modal = window.currentAdminModal;
    if (modal) {
        document.removeEventListener('keydown', modal.handleEscape);
        modal.overlay.remove();
        delete window.currentAdminModal;
    }
}

// Function to add admin email to ADMIN_EMAILS
function addAdminEmail() {
    const emailInput = document.getElementById('new-admin-email');
    const newEmail = emailInput?.value.trim().toLowerCase();

    // Validation
    if (!newEmail) {
        Toast.error('Please enter an email address');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        Toast.error('Please enter a valid email address');
        return;
    }

    // Check if already exists in ADMIN_EMAILS
    if (ADMIN_EMAILS.includes(newEmail)) {
        Toast.warning('This email is already an admin');
        // Clear input for new entry
        emailInput.value = '';
        emailInput.focus();
        return;
    }

    // Add to ADMIN_EMAILS array
    ADMIN_EMAILS.push(newEmail);
    
    // Save to localStorage for persistence
    try {
        // Filter out default admin emails if you don't want to save them
        const customAdmins = ADMIN_EMAILS.filter(email => 
            !email.includes('edumate.com') // Adjust this condition as needed
        );
        localStorage.setItem('edumate_admin_emails', JSON.stringify(customAdmins));
    } catch (e) {
        console.log('Error saving to localStorage:', e);
    }

    // Show success message
    Toast.success(`Admin ${newEmail} added successfully!`);

    // Clear input for next entry
    emailInput.value = '';
    emailInput.focus();

    // Update any admin list UI if it exists on the page
    updateAllAdminUIs();

    // Optional: Keep modal open to add more admins
    // If you want to close modal after adding, uncomment the next line:
    // closeAdminModal();
}

// Function to update all admin list UIs on the page
function updateAllAdminUIs() {
    // Update admin list in modal if visible
    const adminListContainer = document.getElementById('admin-list-container');
    const adminEmailsList = document.getElementById('admin-emails-list');
    
    if (adminListContainer && adminEmailsList) {
        adminListContainer.style.display = 'block';
        adminEmailsList.innerHTML = ADMIN_EMAILS.map(email => `
            <div class="admin-email-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: ${document.body.classList.contains('dark-theme') ? '#374151' : '#f9fafb'}; border-radius: 6px; margin-bottom: 6px; font-size: 14px; color: ${document.body.classList.contains('dark-theme') ? '#f9fafb' : '#1f2937'};">
                <span>${email}</span>
                ${!email.includes('edumate.com') ? `
                    <button onclick="removeAdminEmail('${email}')" class="btn-icon-small" style="background: transparent; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; color: #ef4444; transition: all 0.2s;">
                        ✕
                    </button>
                ` : '<span style="width: 28px;"></span>'}
            </div>
        `).join('');
    }

    // Update any admin table/section in the main page
    const mainAdminList = document.getElementById('admin-emails-main-list');
    if (mainAdminList) {
        mainAdminList.innerHTML = ADMIN_EMAILS.map(email => `
            <div class="admin-email-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: ${document.body.classList.contains('dark-theme') ? '#374151' : '#f9fafb'}; border-radius: 8px; margin-bottom: 8px;">
                <span>${email}</span>
                ${!email.includes('edumate.com') ? `
                    <button onclick="removeAdminEmail('${email}')" class="btn-remove" style="background: #ef4444; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer;">
                        Remove
                    </button>
                ` : '<span class="badge" style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px;">Default</span>'}
            </div>
        `).join('');
    }
}

// Function to remove admin email
function removeAdminEmail(email) {
    if (confirm(`Are you sure you want to remove ${email} from admin list?`)) {
        const index = ADMIN_EMAILS.indexOf(email);
        if (index > -1) {
            ADMIN_EMAILS.splice(index, 1);
            
            // Update localStorage
            try {
                const customAdmins = ADMIN_EMAILS.filter(e => !e.includes('edumate.com'));
                localStorage.setItem('edumate_admin_emails', JSON.stringify(customAdmins));
            } catch (e) {
                console.log('Error saving to localStorage:', e);
            }
            
            Toast.success(`Admin ${email} removed`);
            
            // Update all UIs
            updateAllAdminUIs();
        }
    }
}

// Function to load saved admin emails on initialization
function loadSavedAdminEmails() {
    try {
        const savedAdmins = JSON.parse(localStorage.getItem('edumate_admin_emails') || '[]');
        savedAdmins.forEach(email => {
            if (!ADMIN_EMAILS.includes(email)) {
                ADMIN_EMAILS.push(email);
            }
        });
    } catch (e) {
        console.log('Error loading saved admins:', e);
    }
}

// Function to create an admin management section in your page
function createAdminManagementSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isDarkTheme = document.body.classList.contains('dark-theme');
    
    container.innerHTML = `
        <div class="admin-management-section" style="background: ${isDarkTheme ? '#1f2937' : '#ffffff'}; border-radius: 12px; padding: 20px; margin-top: 20px; border: 1px solid ${isDarkTheme ? '#374151' : '#e5e7eb'};">
            <h3 style="color: ${isDarkTheme ? '#f9fafb' : '#1f2937'}; margin-bottom: 20px;">Admin Management</h3>
            
            <button onclick="showAddAdmin()" class="btn-primary" style="background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; margin-bottom: 20px;">
                + Add New Admin
            </button>
            
            <div id="admin-emails-main-list" class="admin-emails-list">
                ${ADMIN_EMAILS.map(email => `
                    <div class="admin-email-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: ${isDarkTheme ? '#374151' : '#f9fafb'}; border-radius: 8px; margin-bottom: 8px;">
                        <span style="color: ${isDarkTheme ? '#f9fafb' : '#1f2937'};">${email}</span>
                        ${!email.includes('edumate.com') ? `
                            <button onclick="removeAdminEmail('${email}')" class="btn-remove" style="background: #ef4444; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer;">
                                Remove
                            </button>
                        ` : '<span class="badge" style="background: #10b981; color: white; padding: 4px 12px; border-radius: 4px;">Default</span>'}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Add CSS styles dynamically
function addAdminModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Modal Animations */
        @keyframes slideIn {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* Hover effects */
        .btn-secondary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        .btn-primary:hover {
            background: #7c3aed !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .btn-icon-small:hover {
            background: rgba(239, 68, 68, 0.1);
            transform: scale(1.1);
        }

        .btn-remove:hover {
            background: #dc2626 !important;
        }

        /* Input focus styles */
        .add-admin-modal input:focus {
            outline: none;
            border-color: #8b5cf6 !important;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        /* Scrollbar styles */
        #admin-list-container::-webkit-scrollbar {
            width: 6px;
        }

        #admin-list-container::-webkit-scrollbar-track {
            background: transparent;
        }

        #admin-list-container::-webkit-scrollbar-thumb {
            background: #8b5cf6;
            border-radius: 3px;
        }

        /* Dark theme scrollbar */
        .dark-theme #admin-list-container::-webkit-scrollbar-thumb {
            background: #6d4aff;
        }
    `;
    document.head.appendChild(style);
}

// Load saved admin emails when script initializes
loadSavedAdminEmails();

// Add modal styles
addAdminModalStyles();



// Function to close admin modal
function closeAdminModal() {
    const modal = window.currentAdminModal;
    if (modal) {
        document.removeEventListener('keydown', modal.handleEscape);
        modal.overlay.remove();
        delete window.currentAdminModal;
    }
}

// Function to add admin email to ADMIN_EMAILS
function addAdminEmail() {
    const emailInput = document.getElementById('new-admin-email');
    const newEmail = emailInput?.value.trim().toLowerCase();

    // Validation
    if (!newEmail) {
        Toast.error('Please enter an email address');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        Toast.error('Please enter a valid email address');
        return;
    }

    // Check if already exists in ADMIN_EMAILS
    if (ADMIN_EMAILS.includes(newEmail)) {
        Toast.warning('This email is already an admin');
        closeAdminModal();
        return;
    }

    // Add to ADMIN_EMAILS array
    ADMIN_EMAILS.push(newEmail);
    
    // Optional: Save to localStorage for persistence
    try {
        const savedAdmins = JSON.parse(localStorage.getItem('edumate_admin_emails') || '[]');
        savedAdmins.push(newEmail);
        localStorage.setItem('edumate_admin_emails', JSON.stringify(savedAdmins));
    } catch (e) {
        console.log('Error saving to localStorage:', e);
    }

    // Show success message
    Toast.success(`Admin ${newEmail} added successfully!`);

    // Close modal
    closeAdminModal();

    // Optional: Update any admin list UI if it exists
    updateAdminListUI();
}

// Function to load saved admin emails on initialization
function loadSavedAdminEmails() {
    try {
        const savedAdmins = JSON.parse(localStorage.getItem('edumate_admin_emails') || '[]');
        savedAdmins.forEach(email => {
            if (!ADMIN_EMAILS.includes(email)) {
                ADMIN_EMAILS.push(email);
            }
        });
    } catch (e) {
        console.log('Error loading saved admins:', e);
    }
}

// Optional: Function to update admin list UI if you have one
function updateAdminListUI() {
    const adminListElement = document.getElementById('admin-emails-list');
    if (adminListElement) {
        adminListElement.innerHTML = ADMIN_EMAILS.map(email => `
            <div class="admin-email-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--border-color, #e5e7eb);">
                <span>${email}</span>
                <button onclick="removeAdminEmail('${email}')" class="btn-icon-small" style="color: #ef4444;">✕</button>
            </div>
        `).join('');
    }
}

// Optional: Function to remove admin email
function removeAdminEmail(email) {
    const index = ADMIN_EMAILS.indexOf(email);
    if (index > -1) {
        ADMIN_EMAILS.splice(index, 1);
        
        // Update localStorage
        try {
            const savedAdmins = ADMIN_EMAILS.filter(e => !e.includes('edumate.com')); // Keep default admins
            localStorage.setItem('edumate_admin_emails', JSON.stringify(savedAdmins));
        } catch (e) {
            console.log('Error saving to localStorage:', e);
        }
        
        Toast.success(`Admin ${email} removed`);
        updateAdminListUI();
    }
}

// Load saved admin emails when script initializes
loadSavedAdminEmails();


// Log security event
function logSecurityEvent(message, user) {
    const logs = JSON.parse(localStorage.getItem('edumate_security_logs') || '[]');
    
    logs.unshift({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: message,
        user: user,
        ip: '127.0.0.1'
    });
    
    // Keep last 100 logs
    if (logs.length > 100) logs.pop();
    
    localStorage.setItem('edumate_security_logs', JSON.stringify(logs));
}

// Refresh dashboard
function refreshDashboard() {
    const refreshBtn = document.querySelector('[onclick="refreshDashboard()"]');
    if (refreshBtn) {
        refreshBtn.innerHTML = '⏳';
        refreshBtn.disabled = true;
    }
    
    loadAllDashboardData();
    
    setTimeout(() => {
        if (refreshBtn) {
            refreshBtn.innerHTML = '🔄';
            refreshBtn.disabled = false;
        }
        updateLastUpdated();
        alert('Dashboard refreshed!');
    }, 1000);
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('edumate_admin_theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
}

// Sidebar Toggle
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

// Setup event listeners
function setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Enter key for search
    document.getElementById('user-search')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchUsers();
    });
    
    // Enter key for IP block
    document.getElementById('new-blocked-ip')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') blockIP();
    });
    
    // Period change for analytics
    document.getElementById('analytics-period')?.addEventListener('change', loadAnalytics);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin panel loading...');
    
    const storedTheme = localStorage.getItem('edumate_admin_theme');
    if (storedTheme === 'light') {
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
    }
    updateThemeIcon();
    
    setupEventListeners();
    initializeApp();
});

// Export functions
window.navigateTo = navigateTo;
window.attemptAdminLogin = attemptAdminLogin;
window.signOut = signOut;
window.refreshDashboard = refreshDashboard;
window.blockIP = blockIP;
window.unblockIP = unblockIP;
window.blockCountry = blockCountry;
window.unblockRegion = unblockRegion;
window.updateCountryAccess = updateCountryAccess;
window.showAddIPRule = showAddIPRule;
window.viewAllCourseInterests = viewAllCourseInterests;
window.searchUsers = searchUsers;
window.viewUserDetails = viewUserDetails;
window.blockUser = blockUser;
window.exportLogs = exportLogs;
window.saveAdminSettings = saveAdminSettings;
// window.showAddAdmin = showAddAdmin;
window.loadAnalytics = loadAnalytics;
// Export for global use
window.showAddAdmin = showAddAdmin;
window.closeAdminModal = closeAdminModal;
window.addAdminEmail = addAdminEmail;
window.removeAdminEmail = removeAdminEmail;
window.updateAllAdminUIs = updateAllAdminUIs;
window.updateAdminModalContent = updateAdminModalContent;