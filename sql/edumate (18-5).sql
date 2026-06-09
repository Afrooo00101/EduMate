-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql-app.railway.internal:3306
-- Generation Time: May 17, 2026 at 10:12 PM
-- Server version: 9.7.0
-- PHP Version: 8.5.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `edumate`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_rules`
--

CREATE TABLE `academic_rules` (
  `id` int UNSIGNED NOT NULL,
  `semester_type` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `min_gpa` decimal(3,2) NOT NULL,
  `max_gpa` decimal(3,2) NOT NULL,
  `max_credits` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `academic_rules`
--

INSERT INTO `academic_rules` (`id`, `semester_type`, `min_gpa`, `max_gpa`, `max_credits`, `created_at`, `updated_at`) VALUES
(1, 'Fall', 0.00, 1.99, 13, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(2, 'Fall', 2.00, 2.99, 18, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(3, 'Fall', 3.00, 4.30, 21, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(4, 'Spring', 0.00, 1.99, 13, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(5, 'Spring', 2.00, 2.99, 18, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(6, 'Spring', 3.00, 4.30, 21, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(7, 'Summer', 0.00, 2.99, 7, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(8, 'Summer', 3.00, 4.30, 9, '2026-04-25 01:43:23', '2026-04-25 01:43:23');

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `advisor_chat`
--

CREATE TABLE `advisor_chat` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `advisor_id` int UNSIGNED NOT NULL,
  `sender_role` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `content` text COLLATE utf8mb4_general_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `send_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `advisor_slots`
--

CREATE TABLE `advisor_slots` (
  `id` int UNSIGNED NOT NULL,
  `advisor_id` int UNSIGNED NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Sunday') COLLATE utf8mb4_general_ci NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` text COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_chat_messages`
--

CREATE TABLE `ai_chat_messages` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `channel` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'chat',
  `user_message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `assistant_message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `analytics_events`
--

CREATE TABLE `analytics_events` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED DEFAULT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `payload` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int UNSIGNED NOT NULL,
  `slot_id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `advisor_id` int UNSIGNED NOT NULL,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `purpose` enum('inquiry','complaint','request','other') COLLATE utf8mb4_general_ci NOT NULL,
  `purpose_notes` text COLLATE utf8mb4_general_ci,
  `status` enum('booked','completed','cancelled','no_show') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'booked',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appointment_feedback`
--

CREATE TABLE `appointment_feedback` (
  `id` int UNSIGNED NOT NULL,
  `appointment_id` int UNSIGNED NOT NULL,
  `advisor_rating` smallint DEFAULT NULL,
  `advisor_notes` text COLLATE utf8mb4_general_ci,
  `advisor_submitted_at` datetime DEFAULT NULL,
  `student_rating` smallint DEFAULT NULL,
  `student_notes` text COLLATE utf8mb4_general_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blocked_country_rules`
--

CREATE TABLE `blocked_country_rules` (
  `id` int UNSIGNED NOT NULL,
  `country_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blocked_ip_rules`
--

CREATE TABLE `blocked_ip_rules` (
  `id` int UNSIGNED NOT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int UNSIGNED NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `credits` int NOT NULL,
  `major_id` int UNSIGNED DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `level` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `code`, `name`, `credits`, `major_id`, `description`, `created_at`, `updated_at`, `level`) VALUES
(1, 'CET111', 'Introduction to Computer and Programming', 4, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(2, 'EPT111', 'Computer Aided Engineering Drawing', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(3, 'GEN111', 'Applied Mathematics I', 4, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(4, 'HUM111', 'English Language I', 2, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(5, 'HUM121', 'Principles of Law, Human Rights & Ethics', 2, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(6, 'CET112', 'Object Oriented Programming', 4, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(7, 'CET141', 'Database Management Systems', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(8, 'CET161', 'Network Basics', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(9, 'GEN112', 'Applied Discrete Mathematics', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(10, 'GEN122', 'Principles of Physics', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(11, 'CET211', 'Data Structures & Algorithms', 4, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(12, 'CET212', 'Operating Systems', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(13, 'CET213', 'Software Engineering', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(14, 'CET214', 'Web Programming', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(15, 'CET291', 'Project I', 2, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(16, 'CET215', 'Mobile Application Development', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(17, 'CET217', 'Software Testing and QA', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(18, 'CET218', 'Advanced Web Programming', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(19, 'CET219', 'UI/UX Principles', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(20, 'CET292', 'Project II', 4, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(21, 'CET231', 'Cyber & Information Security', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(22, 'CET311', 'Design & Analysis of Algorithms', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(23, 'CET321', 'Internet of Things', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(24, 'CET322', 'Cloud Computing', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(25, 'GEN211', 'Probability & Statistics', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(26, 'CET251', 'Artificial Intelligence', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(27, 'CET312', 'ERP Systems', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(28, 'CET313', 'Theory of Computation', 4, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(29, 'CET352', 'Image Processing and Computer Vision', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:38:10', 1),
(30, 'CET221', 'Computer Organization', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(31, 'CET411', 'Game Programming', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(32, 'CET491', 'Project III', 4, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(33, 'CET414', 'Parallel Programming', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(34, 'CET416', 'DevOps', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(35, 'CET492', 'Project IV', 4, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(36, 'HUMUE1', 'University Elective I', 2, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(37, 'HUMUE2', 'University Elective II', 2, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(38, 'HUM231', 'Technical Writing', 2, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(39, 'HUM311', 'English Language II', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(40, 'HUM431', 'Project Management', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(41, 'CET191', 'Internship I', 2, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(42, 'CET392', 'Internship II', 2, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(43, 'CET216', 'Linux and Shell Programming', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:37:56', 1),
(44, 'CET241', 'Cloud Databases', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:37:56', 1),
(45, 'CET242', 'Data Analytics and Visualization', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:37:56', 1),
(46, 'CET341', 'Data Cleansing and Migration', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:41:31', 1),
(47, 'CET351', 'Machine Learning', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:44:13', 1),
(48, 'CET342', 'Data Mining', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:41:31', 1),
(49, 'CET343', 'Big Data Analytics', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:41:31', 1),
(50, 'CET344', 'Algorithms for Data Science', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:41:31', 1),
(51, 'CET252', 'Neural Networks and Deep Learning', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:46:20', 1),
(52, 'CET451', 'Data Science Project', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23', 1),
(53, 'CET452', 'Natural Language Processing', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:46:20', 1),
(54, 'CET453', 'Advanced Machine Learning', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 00:46:20', 1),
(55, 'CET261', 'Advanced Computer Networks', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:01:47', 1),
(56, 'CET232', 'Web and Security Technologies', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:01:47', 1),
(57, 'CET233', 'Digital Forensics Fundamental', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:01:47', 1),
(58, 'CET262', 'Network Operation and Management', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:01:47', 1),
(59, 'CET331', 'Security Policy, Threats & Risk Management', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:03:43', 1),
(60, 'CET332', 'Penetration Testing & Ethical Hacking', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:03:43', 1),
(61, 'CET333', 'Advanced Digital Forensics', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:03:43', 1),
(62, 'CET334', 'Cryptographic Algorithms & Protocols', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:03:43', 1),
(63, 'CET361', 'Routing & Switching', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:03:43', 1),
(64, 'CET431', 'Software Security', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:05:41', 1),
(65, 'CET435', 'Network and Mobile Security', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:05:41', 1),
(66, 'CET436', 'Information Security Management', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:05:41', 1),
(67, 'CET3E3', 'NS Major Elective I', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:05:41', 1),
(68, 'CET4E3', 'NS Major Elective II', 3, NULL, NULL, '2026-04-25 01:43:23', '2026-05-09 01:05:41', 1),
(69, 'CET415', 'Digital Marketing Technologies', 3, NULL, NULL, '2026-05-09 00:03:25', '2026-05-09 00:03:25', 4),
(70, 'CET4E1', 'CS Major Elective II', 3, NULL, NULL, '2026-05-09 00:03:39', '2026-05-09 00:03:39', 4),
(71, 'CET3E1', 'CS Major Elective I', 3, NULL, NULL, '2026-05-09 00:06:24', '2026-05-09 00:06:24', 4),
(72, 'CET3E2', 'DS Major Elective I', 3, NULL, NULL, '2026-05-09 00:51:19', '2026-05-09 00:51:19', 4),
(73, 'CET4E2', 'DS Major Elective II', 3, NULL, NULL, '2026-05-09 00:51:19', '2026-05-09 00:51:19', 4);

-- --------------------------------------------------------

--
-- Table structure for table `course_offerings`
--

CREATE TABLE `course_offerings` (
  `id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `semester` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_open` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_offerings`
--

INSERT INTO `course_offerings` (`id`, `course_id`, `semester`, `academic_year`, `is_open`, `created_at`, `updated_at`) VALUES
(1, 1, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(2, 2, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(3, 3, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(4, 4, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(5, 5, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(6, 6, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(7, 7, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(8, 8, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(9, 9, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(10, 10, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(11, 11, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(12, 12, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(13, 13, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(14, 14, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(15, 15, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(16, 16, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(17, 17, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(18, 18, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(19, 19, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(20, 20, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(21, 21, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(22, 22, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(23, 23, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(24, 24, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(25, 25, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(26, 26, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(27, 27, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(28, 28, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(29, 29, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(30, 30, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(31, 31, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(32, 32, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(33, 33, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(34, 34, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(35, 35, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(36, 36, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(37, 37, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(38, 38, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(39, 39, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(40, 40, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(41, 41, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(42, 42, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(43, 43, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(44, 44, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(45, 45, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(46, 46, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(47, 47, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(48, 48, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(49, 49, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(50, 50, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(51, 51, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(52, 52, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(53, 53, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(54, 54, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(55, 55, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(56, 56, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(57, 57, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(58, 58, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(59, 59, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(60, 60, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(61, 61, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(62, 62, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(63, 63, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(64, 64, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(65, 65, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(66, 66, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(67, 67, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(68, 68, 'Fall', '2024', 1, '2026-04-25 16:37:10', '2026-04-25 16:37:10'),
(0, 15, 'Spring', '2026', 1, '2026-05-04 22:29:43', '2026-05-04 22:29:43'),
(0, 26, 'Spring', '2026', 1, '2026-05-04 22:29:43', '2026-05-04 22:29:43'),
(0, 11, 'Spring', '2026', 1, '2026-05-04 22:29:43', '2026-05-04 22:29:43'),
(0, 15, 'Spring', '2026', 1, '2026-05-04 23:57:53', '2026-05-04 23:57:53'),
(0, 26, 'Spring', '2026', 1, '2026-05-04 23:57:53', '2026-05-04 23:57:53'),
(0, 11, 'Spring', '2026', 1, '2026-05-04 23:57:53', '2026-05-04 23:57:53'),
(0, 15, 'Spring', '2026', 1, '2026-05-05 00:13:26', '2026-05-05 00:13:26'),
(0, 26, 'Spring', '2026', 1, '2026-05-05 00:13:26', '2026-05-05 00:13:26'),
(0, 11, 'Spring', '2026', 1, '2026-05-05 00:13:26', '2026-05-05 00:13:26'),
(0, 15, 'Spring', '2026', 1, '2026-05-05 00:13:28', '2026-05-05 00:13:28'),
(0, 26, 'Spring', '2026', 1, '2026-05-05 00:13:28', '2026-05-05 00:13:28'),
(0, 11, 'Spring', '2026', 1, '2026-05-05 00:13:28', '2026-05-05 00:13:28'),
(0, 26, 'Fall', '2026', 1, '2026-05-05 02:35:22', '2026-05-05 02:35:22'),
(0, 6, 'Fall', '2027', 1, '2026-05-05 03:39:31', '2026-05-05 03:39:31'),
(0, 26, 'Fall', '2027', 1, '2026-05-05 03:39:31', '2026-05-05 03:39:31'),
(0, 27, 'Fall', '2027', 1, '2026-05-05 03:39:31', '2026-05-05 03:39:31'),
(0, 28, 'Fall', '2027', 1, '2026-05-05 03:39:31', '2026-05-05 03:39:31'),
(0, 29, 'Fall', '2027', 1, '2026-05-05 03:39:31', '2026-05-05 03:39:31'),
(0, 6, 'Fall', '2027', 1, '2026-05-05 03:40:54', '2026-05-05 03:40:54'),
(0, 7, 'Fall', '2027', 1, '2026-05-05 03:40:54', '2026-05-05 03:40:54'),
(0, 8, 'Fall', '2027', 1, '2026-05-05 03:40:54', '2026-05-05 03:40:54'),
(0, 17, 'Fall', '2027', 1, '2026-05-05 03:40:54', '2026-05-05 03:40:54'),
(0, 26, 'Fall', '2027', 1, '2026-05-05 03:40:54', '2026-05-05 03:40:54'),
(0, 26, 'Fall', '2026', 1, '2026-05-08 21:06:20', '2026-05-08 21:06:20'),
(0, 30, 'Spring', '2026', 1, '2026-05-08 21:13:25', '2026-05-08 21:13:25'),
(0, 31, 'Spring', '2026', 1, '2026-05-08 21:13:25', '2026-05-08 21:13:25'),
(0, 26, 'Fall', '2026', 1, '2026-05-09 00:01:13', '2026-05-09 00:01:13'),
(0, 39, 'Fall', '2027', 1, '2026-05-09 00:18:24', '2026-05-09 00:18:24'),
(0, 29, 'Fall', '2027', 1, '2026-05-09 03:33:30', '2026-05-09 03:33:30'),
(0, 6, 'Fall', '2027', 1, '2026-05-09 03:34:01', '2026-05-09 03:34:01'),
(0, 7, 'Fall', '2027', 1, '2026-05-09 03:34:01', '2026-05-09 03:34:01'),
(0, 8, 'Fall', '2027', 1, '2026-05-09 03:34:01', '2026-05-09 03:34:01'),
(0, 26, 'Fall', '2027', 1, '2026-05-09 03:34:01', '2026-05-09 03:34:01'),
(0, 29, 'Fall', '2027', 1, '2026-05-09 03:34:01', '2026-05-09 03:34:01'),
(0, 26, 'Fall', '2026', 1, '2026-05-09 05:20:35', '2026-05-09 05:20:35'),
(0, 26, 'Fall', '2026', 1, '2026-05-09 05:30:35', '2026-05-09 05:30:35'),
(0, 26, 'Fall', '2026', 1, '2026-05-09 05:44:45', '2026-05-09 05:44:45');

-- --------------------------------------------------------

--
-- Table structure for table `course_prerequisites`
--

CREATE TABLE `course_prerequisites` (
  `id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `prerequisite_course_id` int UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_prerequisites`
--

INSERT INTO `course_prerequisites` (`id`, `course_id`, `prerequisite_course_id`, `created_at`, `updated_at`) VALUES
(0, 6, 1, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 11, 6, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 13, 6, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 14, 6, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 43, 12, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 21, 8, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 44, 7, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 45, 25, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 26, 1, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 20, 15, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 23, 1, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 24, 8, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 24, 12, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 38, 4, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 16, 6, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 17, 13, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 18, 14, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 22, 11, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 27, 6, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 28, 6, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 29, 1, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 31, 6, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 33, 11, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 34, 14, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 32, 20, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 35, 32, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 46, 7, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 48, 1, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 48, 7, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 49, 45, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 50, 11, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 47, 26, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 52, 47, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 53, 26, '2026-05-09 03:31:00', '2026-05-09 03:31:00'),
(0, 54, 47, '2026-05-09 03:31:00', '2026-05-09 03:31:00');

-- --------------------------------------------------------

--
-- Table structure for table `course_prerequisites_backup`
--

CREATE TABLE `course_prerequisites_backup` (
  `id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `prerequisite_course_id` int UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_prerequisites_backup`
--

INSERT INTO `course_prerequisites_backup` (`id`, `course_id`, `prerequisite_course_id`, `created_at`, `updated_at`) VALUES
(13, 6, 1, '2026-04-26 21:57:19', '2026-04-26 21:57:19'),
(14, 8, 1, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(15, 7, 1, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(16, 11, 6, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(17, 12, 6, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(18, 13, 6, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(19, 14, 6, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(20, 43, 12, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(21, 44, 7, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(22, 45, 25, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(23, 26, 1, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(24, 20, 15, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(25, 24, 12, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(26, 24, 8, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(27, 48, 11, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(28, 48, 44, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(29, 47, 26, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(30, 42, 41, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(31, 52, 47, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(32, 33, 11, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(33, 54, 26, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(34, 32, 20, '2026-04-26 21:57:20', '2026-04-26 21:57:20'),
(35, 35, 32, '2026-04-26 21:57:20', '2026-04-26 21:57:20');

-- --------------------------------------------------------

--
-- Table structure for table `course_registration_rules`
--

CREATE TABLE `course_registration_rules` (
  `id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `min_cgpa` decimal(3,2) DEFAULT '0.00',
  `min_completed_credits` int DEFAULT '0',
  `min_level` int DEFAULT '1',
  `allowed_semesters` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_mandatory` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_registration_rules`
--

INSERT INTO `course_registration_rules` (`id`, `course_id`, `min_cgpa`, `min_completed_credits`, `min_level`, `allowed_semesters`, `is_mandatory`, `created_at`, `updated_at`) VALUES
(1, 15, 2.20, 24, 2, 'Fall,Spring', 0, '2026-04-26 01:17:12', '2026-04-26 01:17:12'),
(2, 32, 2.50, 90, 4, 'Fall', 0, '2026-04-26 01:17:12', '2026-04-26 01:17:12'),
(3, 41, 0.00, 0, 2, 'Summer', 0, '2026-04-26 01:17:12', '2026-04-26 01:17:12');

-- --------------------------------------------------------

--
-- Table structure for table `cvs`
--

CREATE TABLE `cvs` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ats_score` int DEFAULT NULL,
  `last_updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `internships`
--

CREATE TABLE `internships` (
  `id` int UNSIGNED NOT NULL,
  `company_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_mode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hybrid',
  `application_deadline` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `internship_applications`
--

CREATE TABLE `internship_applications` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `internship_id` int UNSIGNED NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `application_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `majors`
--

CREATE TABLE `majors` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `majors`
--

INSERT INTO `majors` (`id`, `name`, `department`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Computer Science', 'CS', NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(2, 'Data Science', 'DS', NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(3, 'Cyber Security', 'CYS', NULL, '2026-04-25 01:43:23', '2026-04-25 01:43:23');

-- --------------------------------------------------------

--
-- Table structure for table `planner_states`
--

CREATE TABLE `planner_states` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `career_path` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cyber Security',
  `mode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'preview',
  `semesters_json` text COLLATE utf8mb4_unicode_ci,
  `taken_subjects_json` text COLLATE utf8mb4_unicode_ci,
  `grades_json` text COLLATE utf8mb4_unicode_ci,
  `roadmap_json` text COLLATE utf8mb4_unicode_ci,
  `goals_json` text COLLATE utf8mb4_unicode_ci,
  `skills_progress_json` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `platform_settings`
--

CREATE TABLE `platform_settings` (
  `id` int UNSIGNED NOT NULL,
  `maintenance_mode` tinyint(1) NOT NULL DEFAULT '0',
  `session_timeout_minutes` int NOT NULL DEFAULT '30',
  `max_login_attempts` int NOT NULL DEFAULT '5',
  `country_access_mode` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'allow_all',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recommendations`
--

CREATE TABLE `recommendations` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `recommendation_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `generated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `resume_profiles`
--

CREATE TABLE `resume_profiles` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `github` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skills` text COLLATE utf8mb4_unicode_ci,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `template_name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'modern',
  `education_json` text COLLATE utf8mb4_unicode_ci,
  `experience_json` text COLLATE utf8mb4_unicode_ci,
  `projects_json` text COLLATE utf8mb4_unicode_ci,
  `ats_score` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `saved_internships`
--

CREATE TABLE `saved_internships` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position_code` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `match_score` int DEFAULT NULL,
  `match_reason` text COLLATE utf8mb4_unicode_ci,
  `salary` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apply_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'saved',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `security_audit_logs`
--

CREATE TABLE `security_audit_logs` (
  `id` int UNSIGNED NOT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `identifier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `student_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gpa` decimal(3,2) DEFAULT '0.00',
  `major_id` int UNSIGNED DEFAULT NULL,
  `graduation_year` int DEFAULT NULL,
  `skills_summary` text COLLATE utf8mb4_unicode_ci,
  `profile_image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `student_code`, `gpa`, `major_id`, `graduation_year`, `skills_summary`, `profile_image_url`, `created_at`, `updated_at`) VALUES
(1, 1, '230103001', 3.20, 1, 2027, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(2, 2, '240103002', 2.70, 1, 2028, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(3, 3, '250103003', 3.50, 1, 2029, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(4, 4, '230103004', 2.90, 1, 2027, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(5, 5, '240103005', 3.80, 1, 2028, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(6, 6, '250103006', 2.40, 1, 2029, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(7, 7, '230103007', 3.60, 1, 2027, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(8, 8, '240103008', 3.10, 1, 2028, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(9, 9, '250103009', 2.20, 1, 2029, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(10, 10, '230103010', 3.90, 1, 2027, NULL, NULL, '2026-04-25 17:13:03', '2026-04-25 17:13:03'),
(11, 11, '230103734', 3.00, 1, 2027, NULL, NULL, '2026-04-26 20:54:28', '2026-04-26 20:54:28'),
(13, 17, 'CYS2026001', 0.00, 3, 2029, NULL, NULL, '2026-05-17 21:10:04', '2026-05-17 21:10:04');

--
-- Triggers `students`
--
DELIMITER $$
CREATE TRIGGER `trg_students_set_grad_before_insert` BEFORE INSERT ON `students` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_students_set_grad_before_update` BEFORE UPDATE ON `students` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `student_advisors`
--

CREATE TABLE `student_advisors` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `advisor_id` int UNSIGNED NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_courses`
--

CREATE TABLE `student_courses` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `semester` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planned',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_courses`
--

INSERT INTO `student_courses` (`id`, `student_id`, `course_id`, `semester`, `grade`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 'Fall 2024', NULL, 'completed', '2026-04-25 17:37:53', '2026-04-25 17:37:53'),
(2, 6, 1, 'Fall 2024', NULL, 'completed', '2026-04-25 17:37:53', '2026-04-25 17:37:53'),
(3, 9, 1, 'Fall 2024', NULL, 'completed', '2026-04-25 17:37:53', '2026-04-25 17:37:53'),
(4, 2, 1, 'Fall 2023', NULL, 'completed', '2026-04-25 17:38:19', '2026-04-25 17:38:19'),
(5, 2, 6, 'Spring 2024', NULL, 'completed', '2026-04-25 17:38:19', '2026-04-25 17:38:19'),
(6, 5, 1, 'Fall 2023', NULL, 'completed', '2026-04-25 17:38:19', '2026-04-25 17:38:19'),
(7, 5, 6, 'Spring 2024', NULL, 'completed', '2026-04-25 17:38:19', '2026-04-25 17:38:19'),
(8, 8, 1, 'Fall 2023', NULL, 'completed', '2026-04-25 17:38:19', '2026-04-25 17:38:19'),
(9, 8, 6, 'Spring 2024', NULL, 'completed', '2026-04-25 17:38:19', '2026-04-25 17:38:19'),
(10, 1, 1, 'Fall 2022', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(11, 1, 6, 'Spring 2023', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(12, 1, 7, 'Fall 2023', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(13, 4, 1, 'Fall 2022', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(14, 4, 6, 'Spring 2023', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(15, 4, 7, 'Fall 2023', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(16, 7, 1, 'Fall 2022', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(17, 7, 6, 'Spring 2023', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(18, 7, 7, 'Fall 2023', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(19, 10, 1, 'Fall 2022', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(20, 10, 6, 'Spring 2023', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(21, 10, 7, 'Fall 2023', NULL, 'completed', '2026-04-25 17:38:33', '2026-04-25 17:38:33'),
(22, 11, 1, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(23, 11, 6, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(24, 11, 7, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(25, 11, 8, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(26, 11, 41, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(27, 11, 11, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(28, 11, 12, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(29, 11, 13, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(30, 11, 14, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(31, 11, 16, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(32, 11, 19, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(33, 11, 21, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(34, 11, 26, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(35, 11, 15, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(36, 11, 22, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(37, 11, 23, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(38, 11, 24, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(39, 11, 2, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(40, 11, 3, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(41, 11, 9, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(42, 11, 10, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(43, 11, 25, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(44, 11, 4, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(45, 11, 5, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(46, 11, 38, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(47, 11, 36, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(48, 11, 37, 'previous', NULL, 'completed', '2026-04-26 20:54:41', '2026-04-26 20:54:41'),
(60, 11, 17, '', NULL, 'completed', '2026-05-08 23:59:10', '2026-05-08 23:59:10'),
(61, 11, 18, '', NULL, 'completed', '2026-05-08 23:59:10', '2026-05-08 23:59:10'),
(62, 11, 20, '', NULL, 'completed', '2026-05-08 23:59:10', '2026-05-08 23:59:10'),
(63, 11, 27, '', NULL, 'completed', '2026-05-08 23:59:10', '2026-05-08 23:59:10'),
(64, 11, 28, '', NULL, 'completed', '2026-05-08 23:59:10', '2026-05-08 23:59:10');

-- --------------------------------------------------------

--
-- Table structure for table `student_skills`
--

CREATE TABLE `student_skills` (
  `id` int UNSIGNED NOT NULL,
  `student_id` int UNSIGNED NOT NULL,
  `skill_id` int UNSIGNED NOT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `study_plan`
--

CREATE TABLE `study_plan` (
  `id` int UNSIGNED NOT NULL,
  `major_id` int UNSIGNED NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `semester` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recommended_level_no` int DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `study_plan`
--

INSERT INTO `study_plan` (`id`, `major_id`, `course_id`, `semester`, `recommended_level_no`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(2, 1, 2, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(3, 1, 3, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(4, 1, 4, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(5, 1, 5, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(8, 1, 6, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(9, 1, 7, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(10, 1, 8, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(11, 1, 9, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(12, 1, 10, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(13, 1, 36, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(15, 1, 41, 'Summer', 1, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(16, 1, 11, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(17, 1, 12, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(18, 1, 14, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(19, 1, 15, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(20, 1, 25, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-09 00:12:32'),
(21, 1, 38, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(23, 1, 16, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(24, 1, 17, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(25, 1, 18, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(26, 1, 19, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(27, 1, 20, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(30, 1, 21, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(31, 1, 22, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(32, 1, 23, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(33, 1, 24, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(34, 1, 37, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(37, 1, 26, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(38, 1, 27, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(39, 1, 28, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(40, 1, 29, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(41, 1, 39, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(44, 1, 42, 'Summer', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(45, 1, 30, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(46, 1, 31, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(47, 1, 32, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(48, 1, 40, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(52, 1, 33, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(53, 1, 34, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(54, 1, 35, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(55, 2, 11, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(56, 2, 12, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(57, 2, 14, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(58, 2, 15, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(59, 2, 25, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(60, 2, 38, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(62, 2, 43, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(63, 2, 44, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(64, 2, 45, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(65, 2, 26, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(66, 2, 20, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(69, 2, 13, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(70, 2, 23, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(71, 2, 24, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(72, 2, 46, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(73, 2, 47, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(74, 2, 37, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(76, 2, 48, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(77, 2, 49, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(78, 2, 50, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(79, 2, 29, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(80, 2, 39, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(83, 2, 42, 'Summer', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(84, 2, 21, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(85, 2, 51, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(86, 2, 52, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(87, 2, 32, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(88, 2, 40, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(91, 2, 33, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(92, 2, 53, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(93, 2, 54, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(94, 2, 35, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(98, 3, 12, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(99, 3, 14, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(100, 3, 21, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(101, 3, 55, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(102, 3, 15, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(103, 3, 38, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(105, 3, 43, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(106, 3, 56, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(107, 3, 57, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(108, 3, 58, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(109, 3, 20, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(112, 3, 23, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(113, 3, 24, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(114, 3, 59, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(115, 3, 60, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(116, 3, 25, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(117, 3, 37, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(119, 3, 26, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(120, 3, 61, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(121, 3, 62, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(122, 3, 63, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(123, 3, 39, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(126, 3, 42, 'Summer', 3, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(127, 3, 30, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(128, 3, 67, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(129, 3, 64, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(130, 3, 32, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(131, 3, 40, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(134, 3, 34, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(135, 3, 65, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(136, 3, 66, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(137, 3, 35, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(138, 3, 68, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-04-25 01:43:23'),
(139, 1, 69, 'Spring', 4, 1, 1, '2026-05-09 00:04:02', '2026-05-09 00:04:02'),
(140, 1, 70, 'Spring', 4, 1, 1, '2026-05-09 00:04:17', '2026-05-09 00:04:17'),
(141, 1, 71, 'Fall', 4, 1, 1, '2026-05-09 00:06:37', '2026-05-09 00:06:37'),
(143, 1, 13, 'Fall', 2, 1, 1, '2026-05-09 00:15:31', '2026-05-09 00:15:31'),
(144, 2, 1, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(145, 2, 2, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(146, 2, 3, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(147, 2, 4, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(148, 2, 5, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(149, 2, 6, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(150, 2, 7, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(151, 2, 8, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(152, 2, 9, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(153, 2, 10, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(154, 2, 36, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(155, 2, 41, 'Summer', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-09 00:32:06'),
(159, 3, 1, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(160, 3, 2, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(161, 3, 3, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(162, 3, 4, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(163, 3, 5, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(164, 3, 6, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(165, 3, 7, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(166, 3, 8, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(167, 3, 9, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(168, 3, 10, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(169, 3, 36, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(170, 3, 41, 'Summer', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-09 00:34:43'),
(174, 2, 72, 'Fall', 4, 1, 1, '2026-05-09 00:51:31', '2026-05-09 00:51:31'),
(175, 2, 73, 'Spring', 4, 1, 1, '2026-05-09 00:51:31', '2026-05-09 00:51:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('student','admin','advisor') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'student',
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `remember_token` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `password_hash`, `remember_token`, `last_login`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Ahmed', 'ahmed230103001@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:48:08'),
(2, 'Sara', 'sara240103002@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:48:05'),
(3, 'Omar', 'omar250103003@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:48:01'),
(4, 'Mona', 'mona230103004@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:56'),
(5, 'Ali', 'ali240103005@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:54'),
(6, 'Nour', 'nour250103006@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:49'),
(7, 'Karim', 'karim230103007@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:44'),
(8, 'Youssef', 'youssef240103008@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:38'),
(9, 'Huda', 'huda250103009@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:35'),
(10, 'Salma', 'salma230103010@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:33'),
(11, 'ahmed', 'ahmed230103734@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-26 20:53:52', '2026-05-16 15:47:28'),
(13, 'Lina Hassan', 'lina.hassan@sut.edu.eg', 'admin', '$2b$12$LWv8F8d/8rjKTOaqUp4b8O0g7B2J0ojaSYGLWUqrwT2mPV1fqiqge', NULL, '2026-05-01 14:50:32', 1, '2026-04-20 13:07:59', '2026-05-01 17:50:32'),
(14, 'Mohamed Nasr', 'm.nasr@sut.edu.eg', 'advisor', '$2b$12$brvtUIohj4..EZPBBQpHzuBmdtlV.Is8HcAE0cJ80Zw9v65aXkhB.', NULL, '2026-05-07 11:04:21', 1, '2026-05-07 13:58:55', '2026-05-07 14:04:21'),
(15, 'Sarah Ahmed', 's.ahmed@sut.edu.eg', 'advisor', '$2b$12$brvtUIohj4..EZPBBQpHzuBmdtlV.Is8HcAE0cJ80Zw9v65aXkhB.', NULL, NULL, 1, '2026-05-07 13:58:55', '2026-05-07 13:58:55'),
(16, 'Khaled Ibrahim', 'k.ibrahim@sut.edu.eg', 'advisor', '$2b$12$brvtUIohj4..EZPBBQpHzuBmdtlV.Is8HcAE0cJ80Zw9v65aXkhB.', NULL, NULL, 1, '2026-05-07 13:58:55', '2026-05-07 13:58:55'),
(17, 'asmaa', 'asmaa@edumate.com', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-05-17 21:04:21', '2026-05-17 21:11:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `advisor_chat`
--
ALTER TABLE `advisor_chat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_advisor_messages_student_id` (`student_id`),
  ADD KEY `fk_advisor_messages_advisor_id` (`advisor_id`);

--
-- Indexes for table `advisor_slots`
--
ALTER TABLE `advisor_slots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_advisor_slots_advisor_id` (`advisor_id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_appointments_slot_id` (`slot_id`),
  ADD KEY `fk_appointments_student_id` (`student_id`),
  ADD KEY `fk_appointments_advisor_id` (`advisor_id`);

--
-- Indexes for table `appointment_feedback`
--
ALTER TABLE `appointment_feedback`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_appointment_feedback` (`appointment_id`),
  ADD KEY `fk_appointment_feedback_appointment_id` (`appointment_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_courses_code` (`code`),
  ADD KEY `idx_courses_major_id` (`major_id`);

--
-- Indexes for table `majors`
--
ALTER TABLE `majors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `saved_internships`
--
ALTER TABLE `saved_internships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_saved_internships_student` (`student_id`);

--
-- Indexes for table `security_audit_logs`
--
ALTER TABLE `security_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_security_audit_ip` (`ip_address`),
  ADD KEY `idx_security_audit_event` (`event_type`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `student_code` (`student_code`),
  ADD KEY `idx_students_graduation_year` (`graduation_year`),
  ADD KEY `fk_students_major` (`major_id`);

--
-- Indexes for table `student_advisors`
--
ALTER TABLE `student_advisors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_student_advisor` (`student_id`,`advisor_id`),
  ADD KEY `fk_student_advisors_student_id` (`student_id`),
  ADD KEY `fk_student_advisors_advisor_id` (`advisor_id`);

--
-- Indexes for table `student_courses`
--
ALTER TABLE `student_courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_course_semester` (`student_id`,`course_id`,`semester`),
  ADD UNIQUE KEY `uq_student_course` (`student_id`,`course_id`),
  ADD KEY `fk_student_courses_course` (`course_id`);

--
-- Indexes for table `student_skills`
--
ALTER TABLE `student_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_student_skill` (`student_id`,`skill_id`),
  ADD KEY `fk_student_skills_skill` (`skill_id`);

--
-- Indexes for table `study_plan`
--
ALTER TABLE `study_plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_study_plan_major_course` (`major_id`,`course_id`),
  ADD KEY `idx_study_plan_major_semester` (`major_id`,`semester`,`is_active`),
  ADD KEY `idx_study_plan_display` (`major_id`,`display_order`),
  ADD KEY `fk_study_plan_course` (`course_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_active` (`is_active`),
  ADD KEY `idx_users_last_login` (`last_login`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `advisor_chat`
--
ALTER TABLE `advisor_chat`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `advisor_slots`
--
ALTER TABLE `advisor_slots`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appointment_feedback`
--
ALTER TABLE `appointment_feedback`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `saved_internships`
--
ALTER TABLE `saved_internships`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `security_audit_logs`
--
ALTER TABLE `security_audit_logs`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `student_advisors`
--
ALTER TABLE `student_advisors`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_courses`
--
ALTER TABLE `student_courses`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `student_skills`
--
ALTER TABLE `student_skills`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `study_plan`
--
ALTER TABLE `study_plan`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=176;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `advisor_chat`
--
ALTER TABLE `advisor_chat`
  ADD CONSTRAINT `fk_advisor_messages_advisor_id` FOREIGN KEY (`advisor_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_advisor_messages_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `advisor_slots`
--
ALTER TABLE `advisor_slots`
  ADD CONSTRAINT `fk_advisor_slots_advisor_id` FOREIGN KEY (`advisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_appointments_advisor_id` FOREIGN KEY (`advisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointments_slot_id` FOREIGN KEY (`slot_id`) REFERENCES `advisor_slots` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointments_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `appointment_feedback`
--
ALTER TABLE `appointment_feedback`
  ADD CONSTRAINT `fk_appointment_feedback_appointment_id` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_courses_major` FOREIGN KEY (`major_id`) REFERENCES `majors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `saved_internships`
--
ALTER TABLE `saved_internships`
  ADD CONSTRAINT `fk_saved_internships_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_major` FOREIGN KEY (`major_id`) REFERENCES `majors` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_advisors`
--
ALTER TABLE `student_advisors`
  ADD CONSTRAINT `fk_student_advisors_advisor_id` FOREIGN KEY (`advisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_student_advisors_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_courses`
--
ALTER TABLE `student_courses`
  ADD CONSTRAINT `fk_student_courses_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_courses_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_skills`
--
ALTER TABLE `student_skills`
  ADD CONSTRAINT `fk_student_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_student_skills_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `study_plan`
--
ALTER TABLE `study_plan`
  ADD CONSTRAINT `fk_study_plan_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_study_plan_major` FOREIGN KEY (`major_id`) REFERENCES `majors` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
