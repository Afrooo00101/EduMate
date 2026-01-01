# Edumate - AI-Powered Career Companion

![Edumate Logo](Edumate_logo.png)

## 📋 Overview
Edumate is a comprehensive web application designed to empower students and graduates in their career journey. It combines AI-powered guidance with practical tools for faculty discovery, resume building, job searching, and skill development.

## ✨ Features

### 🔐 Authentication & User Management
- Email/password registration and login
- Social login (Google, GitHub, Microsoft)
- User profile management with completion tracking
- Dark/light theme support

### 🎓 Academic Features
- **Faculty Search**: Find professors by department using Google Custom Search API
- **Events Discovery**: Browse relevant events by major
- **Courses Management**: Enroll in and track learning progress
- **Scholarships Search**: Find funding opportunities by field of study

### 💼 Career Development
- **Resume Builder**: Multiple templates with ATS compatibility checking
- **Job Search**: Find opportunities by position with save functionality
- **AI Career Assistant**: Chatbot for career guidance and interview preparation

### 📊 Dashboard & Analytics
- Career score calculation
- Learning progress tracking
- Recent activity log
- Upcoming events display

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account for authentication
- Google Custom Search API keys (for search features)

### Installation
1. Clone or download the project files
2. Open `index.html` in a web browser
3. No build process required - it's a pure HTML/CSS/JS application

### File Structure
```
edumate-project/
├── index.html              # Main HTML file
├── style.css              # All CSS styles
├── script.js             # All JavaScript functionality
├── edumate_logo.png      # Application logo
└── README.md            # This documentation
```

## 🔧 Configuration

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password and social providers
4. Copy your Firebase config and replace in `script.js`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Google Custom Search API
For search features (Faculty, Events, Jobs, Scholarships):
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Custom Search API
3. Create API keys and Custom Search Engine IDs
4. Replace in respective functions in `script.js`

## 📱 Usage

### First Time Users
1. Click "Get Started" on welcome page
2. Register with email or use social login
3. Complete your profile for better recommendations
4. Explore features from the sidebar

### Resume Builder
1. Go to Resume section
2. Fill in your information
3. Choose from multiple templates
4. Download as PDF or check ATS compatibility

### Job Search
1. Select a job position from dropdown
2. Browse opportunities
3. Save interesting jobs
4. Track application status

### AI Assistant
Click the 🤖 bubble in bottom-right corner for:
- Resume optimization tips
- Interview preparation
- Career path guidance
- Faculty recommendations

## 🎨 Design Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle with moon/sun icon
- **Modern UI**: Gradient backgrounds, glassmorphism effects
- **Smooth Animations**: Page transitions and hover effects

## 🔐 Security Notes
- Passwords are stored locally (for demo purposes)
- Firebase handles social authentication securely
- No sensitive data is transmitted to third parties
- Always use HTTPS in production

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Firebase Auth
- **Storage**: LocalStorage for user data
- **PDF Generation**: html2pdf.js
- **Icons**: Custom and Font Awesome

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance
- All assets loaded locally
- Minimal external dependencies
- Efficient localStorage usage
- Lazy loading for images

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is for educational purposes. Commercial use may require additional licensing.

## 🐛 Troubleshooting

### Common Issues
1. **API errors**: Check your Google API keys and quotas
2. **Firebase auth not working**: Verify Firebase configuration
3. **PDF not downloading**: Ensure popups are allowed
4. **Slow loading**: Check internet connection and API quotas

### Browser Compatibility
- Enable JavaScript
- Allow localStorage
- Disable strict popup blockers for PDF download

## 📞 Support
For issues and feature requests, please check:
1. Browser console for errors
2. API quota limits
3. Firebase project status

## 🔮 Future Enhancements
- [ ] Backend integration with Node.js
- [ ] Database for persistent storage
- [ ] Mobile app versions
- [ ] Advanced AI recommendations
- [ ] Collaboration features
- [ ] Video interview practice

---

**Note**: This is a demo application. For production use, implement proper backend security, database storage, and user privacy measures.

**Made with ❤️ for students worldwide**
