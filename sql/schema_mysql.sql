CREATE DATABASE IF NOT EXISTS edumate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edumate;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS ai_chat_messages;
DROP TABLE IF EXISTS analytics_events;
DROP TABLE IF EXISTS blocked_country_rules;
DROP TABLE IF EXISTS blocked_ip_rules;
DROP TABLE IF EXISTS platform_settings;
DROP TABLE IF EXISTS security_audit_logs;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS planner_states;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS resume_profiles;
DROP TABLE IF EXISTS cvs;
DROP TABLE IF EXISTS saved_internships;
DROP TABLE IF EXISTS internship_applications;
DROP TABLE IF EXISTS internships;
DROP TABLE IF EXISTS saved_courses;
DROP TABLE IF EXISTS student_courses;
DROP TABLE IF EXISTS study_plan;
DROP TABLE IF EXISTS academic_rules;
DROP TABLE IF EXISTS course_offerings;
DROP TABLE IF EXISTS course_prerequisites;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS majors;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE majors (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(150) NOT NULL,
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    password_hash VARCHAR(255) NOT NULL,
    remember_token VARCHAR(255) NULL,
    last_login DATETIME NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active),
    INDEX idx_users_last_login (last_login),
    CONSTRAINT chk_users_email_domain CHECK (LOWER(email) LIKE '%@sut.edu.eg')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE students (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    student_code VARCHAR(50) NOT NULL UNIQUE,
    gpa DECIMAL(3,2) DEFAULT 0.00,
    major_id INT UNSIGNED NULL,
    graduation_year INT NULL,
    skills_summary TEXT NULL,
    profile_image_url VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_students_graduation_year (graduation_year),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_students_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS trg_students_set_grad_before_insert;
DROP TRIGGER IF EXISTS trg_students_set_grad_before_update;

DELIMITER //
CREATE TRIGGER trg_students_set_grad_before_insert
BEFORE INSERT ON students
FOR EACH ROW
BEGIN
    DECLARE linked_role VARCHAR(20);
    IF NEW.user_id IS NOT NULL THEN
        SELECT role INTO linked_role FROM users WHERE id = NEW.user_id LIMIT 1;
    END IF;
    IF linked_role = 'student' THEN
        IF NEW.student_code REGEXP '^20[0-9]{2}' THEN
            SET NEW.graduation_year = CAST(SUBSTRING(NEW.student_code, 1, 4) AS UNSIGNED) + 4;
        ELSEIF NEW.student_code REGEXP '^[0-9]{2}' THEN
            SET NEW.graduation_year = CAST(CONCAT('20', SUBSTRING(NEW.student_code, 1, 2)) AS UNSIGNED) + 4;
        END IF;
    END IF;
END//

CREATE TRIGGER trg_students_set_grad_before_update
BEFORE UPDATE ON students
FOR EACH ROW
BEGIN
    DECLARE linked_role VARCHAR(20);
    IF NEW.user_id IS NOT NULL THEN
        SELECT role INTO linked_role FROM users WHERE id = NEW.user_id LIMIT 1;
    END IF;
    IF linked_role = 'student' THEN
        IF NEW.student_code REGEXP '^20[0-9]{2}' THEN
            SET NEW.graduation_year = CAST(SUBSTRING(NEW.student_code, 1, 4) AS UNSIGNED) + 4;
        ELSEIF NEW.student_code REGEXP '^[0-9]{2}' THEN
            SET NEW.graduation_year = CAST(CONCAT('20', SUBSTRING(NEW.student_code, 1, 2)) AS UNSIGNED) + 4;
        END IF;
    END IF;
END//
DELIMITER ;

CREATE TABLE skills (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_skills (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    skill_id INT UNSIGNED NOT NULL,
    level VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_skill (student_id, skill_id),
    CONSTRAINT fk_student_skills_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    credits INT NOT NULL,
    major_id INT UNSIGNED NULL,
    description TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_prerequisites (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id INT UNSIGNED NOT NULL,
    prerequisite_course_id INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_course_prerequisite (course_id, prerequisite_course_id),
    CONSTRAINT fk_course_prereq_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_course_prereq_required FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_offerings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id INT UNSIGNED NOT NULL,
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NULL,
    is_open TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_course_offering (course_id, semester, academic_year),
    KEY idx_course_offering_semester (semester, is_open),
    KEY idx_course_offering_year (academic_year),
    CONSTRAINT fk_course_offerings_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE academic_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_type VARCHAR(20) NOT NULL,
    min_gpa DECIMAL(3,2) NOT NULL,
    max_gpa DECIMAL(3,2) NOT NULL,
    max_credits INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_academic_rules_range (semester_type, min_gpa, max_gpa),
    KEY idx_academic_rules_semester (semester_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO academic_rules (semester_type, min_gpa, max_gpa, max_credits) VALUES
('Fall', 0.00, 1.99, 13),
('Fall', 2.00, 2.99, 18),
('Fall', 3.00, 4.30, 21),
('Spring', 0.00, 1.99, 13),
('Spring', 2.00, 2.99, 18),
('Spring', 3.00, 4.30, 21),
('Summer', 0.00, 2.99, 7),
('Summer', 3.00, 4.30, 9);

CREATE TABLE study_plan (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    major_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    semester VARCHAR(20) NOT NULL,
    recommended_level_no INT NULL,
    display_order INT NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_study_plan_major_course (major_id, course_id),
    KEY idx_study_plan_major_semester (major_id, semester, is_active),
    KEY idx_study_plan_display (major_id, display_order),
    CONSTRAINT fk_study_plan_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE CASCADE,
    CONSTRAINT fk_study_plan_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    semester VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'planned',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_course_semester (student_id, course_id, semester),
    CONSTRAINT fk_student_courses_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_courses_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE saved_courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    external_id VARCHAR(255) NULL,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(120) NULL,
    category VARCHAR(120) NULL,
    difficulty VARCHAR(80) NULL,
    duration VARCHAR(80) NULL,
    progress INT NOT NULL DEFAULT 0,
    enrolled TINYINT(1) NOT NULL DEFAULT 0,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    course_url VARCHAR(500) NULL,
    source VARCHAR(80) NOT NULL DEFAULT 'custom',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_courses_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE internships (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    position VARCHAR(150) NOT NULL,
    description TEXT NULL,
    location VARCHAR(150) NULL,
    work_mode VARCHAR(50) NOT NULL DEFAULT 'hybrid',
    application_deadline DATE NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE internship_applications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    internship_id INT UNSIGNED NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    application_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_internship_application (student_id, internship_id),
    CONSTRAINT fk_internship_app_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_internship_app_internship FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE saved_internships (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    position_code VARCHAR(80) NULL,
    match_score INT NULL,
    match_reason TEXT NULL,
    salary VARCHAR(120) NULL,
    apply_url VARCHAR(500) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'saved',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_internships_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cvs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    ats_score INT NULL,
    last_updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cvs_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE resume_profiles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL UNIQUE,
    full_name VARCHAR(150) NULL,
    title VARCHAR(150) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(80) NULL,
    location VARCHAR(150) NULL,
    linkedin VARCHAR(255) NULL,
    github VARCHAR(255) NULL,
    skills TEXT NULL,
    summary TEXT NULL,
    template_name VARCHAR(80) NOT NULL DEFAULT 'modern',
    education_json TEXT NULL,
    experience_json TEXT NULL,
    projects_json TEXT NULL,
    ats_score INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_profiles_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE recommendations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_recommendations_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE planner_states (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL UNIQUE,
    career_path VARCHAR(150) NOT NULL DEFAULT 'Cyber Security',
    mode VARCHAR(50) NOT NULL DEFAULT 'preview',
    semesters_json TEXT NULL,
    taken_subjects_json TEXT NULL,
    grades_json TEXT NULL,
    roadmap_json TEXT NULL,
    goals_json TEXT NULL,
    skills_progress_json TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_planner_states_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE analytics_events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NULL,
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'web',
    payload TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_analytics_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_analytics_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activity_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    action VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_logs_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_chat_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'chat',
    user_message TEXT NOT NULL,
    assistant_message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_chat_messages_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE security_audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(64) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    identifier VARCHAR(255) NULL,
    details TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_security_audit_ip (ip_address),
    INDEX idx_security_audit_event (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE platform_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    maintenance_mode TINYINT(1) NOT NULL DEFAULT 0,
    session_timeout_minutes INT NOT NULL DEFAULT 30,
    max_login_attempts INT NOT NULL DEFAULT 5,
    country_access_mode VARCHAR(30) NOT NULL DEFAULT 'allow_all',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blocked_ip_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(64) NOT NULL UNIQUE,
    reason TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_blocked_ip_rules_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blocked_country_rules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(120) NOT NULL UNIQUE,
    notes TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_blocked_country_rules_country_name (country_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
