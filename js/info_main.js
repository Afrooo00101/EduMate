// Navigation functions
function showHome() {
    hideAllPages();
    document.getElementById('home').classList.add('active');
}

function showLogin() {
    hideAllPages();
    document.getElementById('login').classList.add('active');
}

// Register function removed - hidden from UI
// Keeping function definition but disabled
function showRegister() {
    hideAllPages();
    document.getElementById('register').classList.add('active');
}

function showForgotPassword() {
    Toast.error('Password reset is disabled. Please use: sut123 for students, admin123 for admins');
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

// Scroll to features
function scrollToFeatures() {
    const features = document.querySelector('.hero-features');
    if (features) {
        features.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set up theme toggle listener
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        updateThemeIcon();
    }
    
    // Check session
    if (typeof checkSession === 'function') {
        checkSession();
    }
    
    // Check for remembered user
    const remembered = localStorage.getItem('edumate_remember');
    if (remembered && document.getElementById('login-email')) {
        document.getElementById('login-email').value = remembered;
        document.getElementById('remember-me').checked = true;
    }
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Hide any register links/buttons in the UI
    // hideRegisterElements();
});

// Function to hide register elements from UI
function hideRegisterElements() {
    // Hide register links in navigation if they exist
    document.querySelectorAll('a[onclick="showRegister()"]').forEach(el => {
        el.style.display = 'none';
    });
    
    // Hide register page section if it exists
    const registerPage = document.getElementById('register');
    if (registerPage) {
        registerPage.style.display = 'none';
    }
}

// Export for global use
window.showHome = showHome;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showForgotPassword = showForgotPassword;
window.scrollToFeatures = scrollToFeatures;