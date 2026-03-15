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

// Admin emails (keeping for reference but not using for rules)
const ADMIN_EMAILS = ['admin@edumate.com', 'superadmin@edumate.com'];

// Toast notification system
const Toast = {
    container: document.getElementById('toast-container'),
    
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },
    
    success(message) {
        this.show(message, 'success');
    },
    
    error(message) {
        this.show(message, 'error');
    },
    
    warning(message) {
        this.show(message, 'warning');
    },
    
    info(message) {
        this.show(message, 'info');
    }
};

// Login handler - Updated with new rules
async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me')?.checked || false;
    
    // Validation
    if (!email || !password) {
        Toast.error('Please enter both email and password');
        return;
    }

    // Check email domain
    if (!email.endsWith('@sut.edu.eg')) {
        Toast.error('Email must be from @sut.edu.eg domain');
        return;
    }

    // Extract username part (before @)
    const username = email.split('@')[0];
    
    // Check if email contains numbers
    const hasNumbers = /\d/.test(username);
    
    // Validate password based on user type
    if (hasNumbers) {
        // Student login
        if (password !== 'sut123') {
            Toast.error('Invalid password for student account');
            return;
        }
        
        // Student login successful
        Toast.success('Student login successful! Redirecting...');
        
        // Set session
        sessionStorage.setItem('edumate_logged', '1');
        sessionStorage.setItem('edumate_user_email', email);
        sessionStorage.setItem('edumate_user_type', 'student');
        
        if (remember) {
            localStorage.setItem('edumate_remember', email);
        }
        
        // Redirect to student home
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
        
    } else {
        // Admin login (no numbers in username)
        if (password !== 'admin123') {
            Toast.error('Invalid password for admin account');
            return;
        }
        
        // Admin login successful
        Toast.success('Admin login successful! Redirecting...');
        
        // Set session
        sessionStorage.setItem('edumate_admin_logged', '1');
        sessionStorage.setItem('edumate_admin_email', email);
        sessionStorage.setItem('edumate_user_type', 'admin');
        
        if (remember) {
            localStorage.setItem('edumate_remember', email);
        }
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    }
}

// Handle social login - Disabled with new rules
async function handleSocialLogin(providerType) {
    Toast.error('Social login is currently disabled. Please use your @sut.edu.eg email to login.');
    return;
}

// Handle forgot password - Disabled with new rules
async function handleForgotPassword() {
    Toast.error('Password reset is disabled. Please use the standard passwords: sut123 for students, admin123 for admins');
    setTimeout(() => showLogin(), 2000);
}

// Check session on load
function checkSession() {
    const logged = sessionStorage.getItem('edumate_logged') === '1';
    const adminLogged = sessionStorage.getItem('edumate_admin_logged') === '1';
    const userType = sessionStorage.getItem('edumate_user_type');
    
    if (logged || adminLogged) {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // If on login page but already logged in, redirect appropriately
        if (currentPage === 'index.html' || currentPage === '') {
            if (adminLogged || userType === 'admin') {
                window.location.href = 'admin.html';
            } else if (logged || userType === 'student') {
                window.location.href = 'home.html';
            }
        }
    }
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('edumate_theme', isDark ? 'dark' : 'light');
    
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.textContent = isDark ? '☀️' : '🌙';
    }
}

// Update theme icon
function updateThemeIcon() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        const isDark = document.body.classList.contains('dark-theme');
        toggle.textContent = isDark ? '☀️' : '🌙';
    }
}

// Load theme
const savedTheme = localStorage.getItem('edumate_theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
} else if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
}

// Export for global use
window.handleLogin = handleLogin;
window.handleSocialLogin = handleSocialLogin;
window.handleForgotPassword = handleForgotPassword;
window.toggleTheme = toggleTheme;
window.checkSession = checkSession;