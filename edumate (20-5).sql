-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql-app.railway.internal:3306
-- Generation Time: May 20, 2026 at 02:46 PM
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
-- Table structure for table `active_semester`
--

CREATE TABLE `active_semester` (
  `id` int NOT NULL,
  `semester` enum('Fall','Spring','Summer') COLLATE utf8mb4_general_ci NOT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `registration_open` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `active_semester`
--

INSERT INTO `active_semester` (`id`, `semester`, `academic_year`, `registration_open`, `created_at`) VALUES
(1, 'Fall', '2026', 1, '2026-05-19 03:25:03'),
(2, 'Fall', '2026', 1, '2026-05-19 03:39:15');

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

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `student_id`, `action`, `text`, `created_at`, `updated_at`) VALUES
(1, 11, 'signed_in', 'Signed in to EduMate', '2026-05-19 21:13:04', '2026-05-19 21:13:04'),
(2, 11, 'signed_in', 'Signed in to EduMate', '2026-05-19 21:29:41', '2026-05-19 21:29:41'),
(3, 11, 'signed_in', 'Signed in to EduMate', '2026-05-19 21:35:22', '2026-05-19 21:35:22'),
(4, 11, 'signed_in', 'Signed in to EduMate', '2026-05-19 21:51:34', '2026-05-19 21:51:34'),
(5, 11, 'signed_in', 'Signed in to EduMate', '2026-05-20 09:12:07', '2026-05-20 09:12:07'),
(6, 11, 'signed_in', 'Signed in to EduMate', '2026-05-20 09:35:30', '2026-05-20 09:35:30'),
(7, 11, 'signed_in', 'Signed in to EduMate', '2026-05-20 09:53:16', '2026-05-20 09:53:16'),
(8, 11, 'signed_in', 'Signed in to EduMate', '2026-05-20 10:00:19', '2026-05-20 10:00:19'),
(9, 11, 'signed_in', 'Signed in to EduMate', '2026-05-20 10:01:37', '2026-05-20 10:01:37'),
(9, 11, 'signed_in', 'Signed in to EduMate', '2026-05-20 10:01:37', '2026-05-20 10:01:37'),
(10, 11, 'signed_in', 'Signed in to EduMate', '2026-05-20 10:21:24', '2026-05-20 10:21:24'),
(11, 10, 'signed_in', 'Signed in to EduMate', '2026-05-20 14:44:16', '2026-05-20 14:44:16');

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

--
-- Dumping data for table `advisor_chat`
--

INSERT INTO `advisor_chat` (`id`, `student_id`, `advisor_id`, `sender_role`, `content`, `is_read`, `send_at`) VALUES
(1, 11, 14, 'student', 'hi', 1, '2026-05-19 16:32:00'),
(2, 11, 14, 'student', 'hi', 1, '2026-05-19 16:32:01'),
(3, 11, 14, 'student', 'wow wasl wasl wasl', 1, '2026-05-19 16:36:19'),
(4, 11, 14, 'advisor', 'hoba hoba', 1, '2026-05-19 16:52:27'),
(5, 11, 14, 'student', 'hi', 1, '2026-05-19 22:12:48'),
(6, 11, 14, 'advisor', 'ya3am hiii b2a mat2rfnish', 1, '2026-05-19 22:16:03'),
(7, 10, 22, 'advisor', 'Hi Salma', 1, '2026-05-20 14:43:45'),
(8, 10, 22, 'student', 'Hi Doctor', 0, '2026-05-20 14:45:04');

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

--
-- Dumping data for table `advisor_slots`
--

INSERT INTO `advisor_slots` (`id`, `advisor_id`, `day_of_week`, `start_time`, `end_time`, `location`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 14, 'Sunday', '09:00:00', '10:00:00', 'room 006', 1, '2026-05-19 16:23:35', '2026-05-19 16:23:35'),
(2, 21, 'Tuesday', '09:00:00', '10:00:00', '006', 1, '2026-05-19 16:51:31', '2026-05-19 16:51:31'),
(3, 16, 'Monday', '09:00:00', '10:00:00', 'Room 241', 1, '2026-05-19 21:50:58', '2026-05-19 21:50:58'),
(4, 15, 'Thursday', '03:00:00', '04:00:00', 'Room 230', 1, '2026-05-19 21:51:15', '2026-05-19 21:51:15'),
(5, 22, 'Thursday', '12:00:00', '14:00:00', 'A23', 1, '2026-05-20 14:43:26', '2026-05-20 14:43:26');

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
-- Table structure for table `demand_analysis_results`
--

CREATE TABLE `demand_analysis_results` (
  `id` int NOT NULL,
  `course_id` int UNSIGNED NOT NULL,
  `semester` enum('Fall','Spring','Summer') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `academic_year` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `demand_count` int DEFAULT '0',
  `blocking_score` int DEFAULT '0',
  `course_category` enum('prerequisite','major','elective') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approved_by_admin` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `demand_analysis_results`
--

INSERT INTO `demand_analysis_results` (`id`, `course_id`, `semester`, `academic_year`, `demand_count`, `blocking_score`, `course_category`, `approved_by_admin`, `created_at`) VALUES
(154, 8, 'Spring', '2026', 13, 2, 'prerequisite', 0, '2026-05-20 12:49:09'),
(155, 9, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:10'),
(156, 10, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:10'),
(157, 16, 'Spring', '2026', 7, 0, 'major', 0, '2026-05-20 12:49:10'),
(158, 19, 'Spring', '2026', 12, 0, 'major', 0, '2026-05-20 12:49:10'),
(159, 26, 'Spring', '2026', 10, 4, 'prerequisite', 0, '2026-05-20 12:49:11'),
(160, 27, 'Spring', '2026', 7, 0, 'major', 0, '2026-05-20 12:49:11'),
(161, 28, 'Spring', '2026', 7, 0, 'prerequisite', 0, '2026-05-20 12:49:11'),
(162, 29, 'Spring', '2026', 10, 0, 'major', 0, '2026-05-20 12:49:11'),
(163, 36, 'Spring', '2026', 13, 0, 'elective', 0, '2026-05-20 12:49:12'),
(164, 39, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:12'),
(165, 69, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:12'),
(166, 70, 'Spring', '2026', 13, 0, 'elective', 0, '2026-05-20 12:49:12'),
(167, 7, 'Spring', '2026', 9, 3, 'major', 0, '2026-05-20 12:49:13'),
(168, 6, 'Spring', '2026', 3, 13, 'prerequisite', 0, '2026-05-20 12:49:13'),
(169, 33, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:13'),
(170, 34, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:13'),
(171, 56, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:14'),
(172, 57, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:14'),
(173, 58, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:14'),
(174, 61, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:14'),
(175, 62, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:15'),
(176, 63, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:15'),
(177, 65, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:15'),
(178, 66, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:15'),
(179, 68, 'Spring', '2026', 1, 0, 'elective', 0, '2026-05-20 12:49:16'),
(180, 2, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:16'),
(181, 3, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:16'),
(182, 4, 'Spring', '2026', 13, 1, 'major', 0, '2026-05-20 12:49:16'),
(183, 5, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:17'),
(184, 11, 'Spring', '2026', 7, 3, 'prerequisite', 0, '2026-05-20 12:49:17'),
(185, 12, 'Spring', '2026', 13, 2, 'prerequisite', 0, '2026-05-20 12:49:17'),
(186, 13, 'Spring', '2026', 7, 1, 'major', 0, '2026-05-20 12:49:17'),
(187, 14, 'Spring', '2026', 7, 2, 'major', 0, '2026-05-20 12:49:18'),
(188, 15, 'Spring', '2026', 13, 3, 'prerequisite', 0, '2026-05-20 12:49:18'),
(189, 23, 'Spring', '2026', 10, 0, 'major', 0, '2026-05-20 12:49:18'),
(190, 25, 'Spring', '2026', 13, 2, 'major', 0, '2026-05-20 12:49:18'),
(191, 30, 'Spring', '2026', 14, 0, 'prerequisite', 0, '2026-05-20 12:49:19'),
(192, 31, 'Spring', '2026', 8, 0, 'major', 0, '2026-05-20 12:49:19'),
(193, 37, 'Spring', '2026', 13, 0, 'elective', 0, '2026-05-20 12:49:19'),
(194, 40, 'Spring', '2026', 14, 0, 'major', 0, '2026-05-20 12:49:19'),
(195, 71, 'Spring', '2026', 13, 0, 'elective', 0, '2026-05-20 12:49:20'),
(196, 32, 'Spring', '2026', 1, 1, 'prerequisite', 0, '2026-05-20 12:49:20'),
(197, 1, 'Spring', '2026', 3, 22, 'prerequisite', 0, '2026-05-20 12:49:20'),
(198, 55, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:21'),
(199, 59, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:21'),
(200, 60, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:21'),
(201, 64, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:21'),
(202, 67, 'Spring', '2026', 1, 0, 'elective', 0, '2026-05-20 12:49:22'),
(203, 2, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:22'),
(204, 3, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:22'),
(205, 4, 'Spring', '2026', 13, 1, 'major', 0, '2026-05-20 12:49:22'),
(206, 5, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:23'),
(207, 11, 'Spring', '2026', 7, 3, 'prerequisite', 0, '2026-05-20 12:49:23'),
(208, 12, 'Spring', '2026', 13, 2, 'prerequisite', 0, '2026-05-20 12:49:23'),
(209, 13, 'Spring', '2026', 7, 1, 'major', 0, '2026-05-20 12:49:23'),
(210, 14, 'Spring', '2026', 7, 2, 'major', 0, '2026-05-20 12:49:24'),
(211, 15, 'Spring', '2026', 13, 3, 'prerequisite', 0, '2026-05-20 12:49:24'),
(212, 23, 'Spring', '2026', 10, 0, 'major', 0, '2026-05-20 12:49:24'),
(213, 25, 'Spring', '2026', 13, 2, 'major', 0, '2026-05-20 12:49:24'),
(214, 30, 'Spring', '2026', 14, 0, 'prerequisite', 0, '2026-05-20 12:49:25'),
(215, 31, 'Spring', '2026', 8, 0, 'major', 0, '2026-05-20 12:49:25'),
(216, 37, 'Spring', '2026', 13, 0, 'elective', 0, '2026-05-20 12:49:25'),
(217, 40, 'Spring', '2026', 14, 0, 'major', 0, '2026-05-20 12:49:25'),
(218, 41, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:26'),
(219, 42, 'Spring', '2026', 14, 0, 'major', 0, '2026-05-20 12:49:26'),
(220, 71, 'Spring', '2026', 13, 0, 'elective', 0, '2026-05-20 12:49:26'),
(221, 32, 'Spring', '2026', 1, 1, 'prerequisite', 0, '2026-05-20 12:49:26'),
(222, 1, 'Spring', '2026', 3, 22, 'prerequisite', 0, '2026-05-20 12:49:27'),
(223, 55, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:27'),
(224, 59, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:27'),
(225, 60, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:27'),
(226, 64, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:28'),
(227, 67, 'Spring', '2026', 1, 0, 'elective', 0, '2026-05-20 12:49:28'),
(228, 8, 'Spring', '2026', 13, 2, 'prerequisite', 0, '2026-05-20 12:49:28'),
(229, 9, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:28'),
(230, 10, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:29'),
(231, 16, 'Spring', '2026', 7, 0, 'major', 0, '2026-05-20 12:49:29'),
(232, 19, 'Spring', '2026', 12, 0, 'major', 0, '2026-05-20 12:49:29'),
(233, 26, 'Spring', '2026', 10, 4, 'prerequisite', 0, '2026-05-20 12:49:29'),
(234, 27, 'Spring', '2026', 7, 0, 'major', 0, '2026-05-20 12:49:30'),
(235, 28, 'Spring', '2026', 7, 0, 'prerequisite', 0, '2026-05-20 12:49:30'),
(236, 29, 'Spring', '2026', 10, 0, 'major', 0, '2026-05-20 12:49:30'),
(237, 36, 'Spring', '2026', 13, 0, 'elective', 0, '2026-05-20 12:49:30'),
(238, 39, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:31'),
(239, 69, 'Spring', '2026', 13, 0, 'major', 0, '2026-05-20 12:49:31'),
(240, 70, 'Spring', '2026', 13, 0, 'elective', 0, '2026-05-20 12:49:31'),
(241, 7, 'Spring', '2026', 9, 3, 'major', 0, '2026-05-20 12:49:31'),
(242, 6, 'Spring', '2026', 3, 13, 'prerequisite', 0, '2026-05-20 12:49:32'),
(243, 33, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:32'),
(244, 34, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:32'),
(245, 56, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:33'),
(246, 57, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:33'),
(247, 58, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:33'),
(248, 61, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:33'),
(249, 62, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:34'),
(250, 63, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:34'),
(251, 65, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:34'),
(252, 66, 'Spring', '2026', 1, 0, 'major', 0, '2026-05-20 12:49:34'),
(253, 68, 'Spring', '2026', 1, 0, 'elective', 0, '2026-05-20 12:49:35'),
(254, 8, 'Spring', '2027', 13, 2, 'prerequisite', 0, '2026-05-20 12:55:53'),
(255, 9, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:55:53'),
(256, 10, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:55:53'),
(257, 16, 'Spring', '2027', 7, 0, 'major', 0, '2026-05-20 12:55:54'),
(258, 19, 'Spring', '2027', 12, 0, 'major', 0, '2026-05-20 12:55:54'),
(259, 26, 'Spring', '2027', 10, 4, 'prerequisite', 0, '2026-05-20 12:55:54'),
(260, 27, 'Spring', '2027', 7, 0, 'major', 0, '2026-05-20 12:55:54'),
(261, 28, 'Spring', '2027', 7, 0, 'prerequisite', 0, '2026-05-20 12:55:55'),
(262, 29, 'Spring', '2027', 10, 0, 'major', 0, '2026-05-20 12:55:55'),
(263, 36, 'Spring', '2027', 13, 0, 'elective', 0, '2026-05-20 12:55:55'),
(264, 39, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:55:55'),
(265, 69, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:55:56'),
(266, 70, 'Spring', '2027', 13, 0, 'elective', 0, '2026-05-20 12:55:56'),
(267, 7, 'Spring', '2027', 9, 3, 'major', 0, '2026-05-20 12:55:56'),
(268, 6, 'Spring', '2027', 3, 13, 'prerequisite', 0, '2026-05-20 12:55:56'),
(269, 33, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:57'),
(270, 34, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:57'),
(271, 56, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:57'),
(272, 57, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:57'),
(273, 58, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:58'),
(274, 61, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:58'),
(275, 62, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:58'),
(276, 63, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:59'),
(277, 65, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:59'),
(278, 66, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:55:59'),
(279, 68, 'Spring', '2027', 1, 0, 'elective', 0, '2026-05-20 12:55:59'),
(280, 2, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:00'),
(281, 3, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:00'),
(282, 4, 'Spring', '2027', 13, 1, 'major', 0, '2026-05-20 12:56:00'),
(283, 5, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:00'),
(284, 11, 'Spring', '2027', 7, 3, 'prerequisite', 0, '2026-05-20 12:56:01'),
(285, 12, 'Spring', '2027', 13, 2, 'prerequisite', 0, '2026-05-20 12:56:01'),
(286, 13, 'Spring', '2027', 7, 1, 'major', 0, '2026-05-20 12:56:01'),
(287, 14, 'Spring', '2027', 7, 2, 'major', 0, '2026-05-20 12:56:01'),
(288, 15, 'Spring', '2027', 13, 3, 'prerequisite', 0, '2026-05-20 12:56:02'),
(289, 23, 'Spring', '2027', 10, 0, 'major', 0, '2026-05-20 12:56:02'),
(290, 25, 'Spring', '2027', 13, 2, 'major', 0, '2026-05-20 12:56:02'),
(291, 30, 'Spring', '2027', 14, 0, 'prerequisite', 0, '2026-05-20 12:56:02'),
(292, 31, 'Spring', '2027', 8, 0, 'major', 0, '2026-05-20 12:56:03'),
(293, 37, 'Spring', '2027', 13, 0, 'elective', 0, '2026-05-20 12:56:03'),
(294, 40, 'Spring', '2027', 14, 0, 'major', 0, '2026-05-20 12:56:03'),
(295, 71, 'Spring', '2027', 13, 0, 'elective', 0, '2026-05-20 12:56:03'),
(296, 32, 'Spring', '2027', 1, 1, 'prerequisite', 0, '2026-05-20 12:56:04'),
(297, 1, 'Spring', '2027', 3, 22, 'prerequisite', 0, '2026-05-20 12:56:04'),
(298, 55, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:04'),
(299, 59, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:04'),
(300, 60, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:05'),
(301, 64, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:05'),
(302, 67, 'Spring', '2027', 1, 0, 'elective', 0, '2026-05-20 12:56:05'),
(303, 2, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:05'),
(304, 3, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:06'),
(305, 4, 'Spring', '2027', 13, 1, 'major', 0, '2026-05-20 12:56:06'),
(306, 5, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:06'),
(307, 11, 'Spring', '2027', 7, 3, 'prerequisite', 0, '2026-05-20 12:56:06'),
(308, 12, 'Spring', '2027', 13, 2, 'prerequisite', 0, '2026-05-20 12:56:07'),
(309, 13, 'Spring', '2027', 7, 1, 'major', 0, '2026-05-20 12:56:07'),
(310, 14, 'Spring', '2027', 7, 2, 'major', 0, '2026-05-20 12:56:07'),
(311, 15, 'Spring', '2027', 13, 3, 'prerequisite', 0, '2026-05-20 12:56:07'),
(312, 23, 'Spring', '2027', 10, 0, 'major', 0, '2026-05-20 12:56:08'),
(313, 25, 'Spring', '2027', 13, 2, 'major', 0, '2026-05-20 12:56:08'),
(314, 30, 'Spring', '2027', 14, 0, 'prerequisite', 0, '2026-05-20 12:56:08'),
(315, 31, 'Spring', '2027', 8, 0, 'major', 0, '2026-05-20 12:56:08'),
(316, 37, 'Spring', '2027', 13, 0, 'elective', 0, '2026-05-20 12:56:09'),
(317, 40, 'Spring', '2027', 14, 0, 'major', 0, '2026-05-20 12:56:09'),
(318, 41, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:09'),
(319, 42, 'Spring', '2027', 14, 0, 'major', 0, '2026-05-20 12:56:09'),
(320, 71, 'Spring', '2027', 13, 0, 'elective', 0, '2026-05-20 12:56:10'),
(321, 32, 'Spring', '2027', 1, 1, 'prerequisite', 0, '2026-05-20 12:56:10'),
(322, 1, 'Spring', '2027', 3, 22, 'prerequisite', 0, '2026-05-20 12:56:10'),
(323, 55, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:10'),
(324, 59, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:11'),
(325, 60, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:11'),
(326, 64, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:11'),
(327, 67, 'Spring', '2027', 1, 0, 'elective', 0, '2026-05-20 12:56:11'),
(328, 8, 'Spring', '2027', 13, 2, 'prerequisite', 0, '2026-05-20 12:56:12'),
(329, 9, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:12'),
(330, 10, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:12'),
(331, 16, 'Spring', '2027', 7, 0, 'major', 0, '2026-05-20 12:56:12'),
(332, 19, 'Spring', '2027', 12, 0, 'major', 0, '2026-05-20 12:56:13'),
(333, 26, 'Spring', '2027', 10, 4, 'prerequisite', 0, '2026-05-20 12:56:13'),
(334, 27, 'Spring', '2027', 7, 0, 'major', 0, '2026-05-20 12:56:13'),
(335, 28, 'Spring', '2027', 7, 0, 'prerequisite', 0, '2026-05-20 12:56:13'),
(336, 29, 'Spring', '2027', 10, 0, 'major', 0, '2026-05-20 12:56:14'),
(337, 36, 'Spring', '2027', 13, 0, 'elective', 0, '2026-05-20 12:56:14'),
(338, 39, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:14'),
(339, 69, 'Spring', '2027', 13, 0, 'major', 0, '2026-05-20 12:56:14'),
(340, 70, 'Spring', '2027', 13, 0, 'elective', 0, '2026-05-20 12:56:15'),
(341, 7, 'Spring', '2027', 9, 3, 'major', 0, '2026-05-20 12:56:15'),
(342, 6, 'Spring', '2027', 3, 13, 'prerequisite', 0, '2026-05-20 12:56:15'),
(343, 33, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:15'),
(344, 34, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:16'),
(345, 56, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:16'),
(346, 57, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:16'),
(347, 58, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:16'),
(348, 61, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:17'),
(349, 62, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:17'),
(350, 63, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:17'),
(351, 65, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:17'),
(352, 66, 'Spring', '2027', 1, 0, 'major', 0, '2026-05-20 12:56:18'),
(353, 68, 'Spring', '2027', 1, 0, 'elective', 0, '2026-05-20 12:56:18'),
(454, 8, 'Fall', '2027', 13, 2, 'prerequisite', 0, '2026-05-20 13:38:58'),
(455, 9, 'Fall', '2027', 13, 0, 'major', 0, '2026-05-20 13:38:58'),
(456, 10, 'Fall', '2027', 13, 0, 'major', 0, '2026-05-20 13:38:59'),
(457, 16, 'Fall', '2027', 7, 0, 'major', 0, '2026-05-20 13:38:59'),
(458, 19, 'Fall', '2027', 12, 0, 'major', 0, '2026-05-20 13:38:59'),
(459, 26, 'Fall', '2027', 10, 4, 'prerequisite', 0, '2026-05-20 13:38:59'),
(460, 27, 'Fall', '2027', 7, 0, 'major', 0, '2026-05-20 13:39:00'),
(461, 28, 'Fall', '2027', 7, 0, 'prerequisite', 0, '2026-05-20 13:39:00'),
(462, 29, 'Fall', '2027', 10, 0, 'major', 0, '2026-05-20 13:39:00'),
(463, 36, 'Fall', '2027', 13, 0, 'elective', 0, '2026-05-20 13:39:00'),
(464, 39, 'Fall', '2027', 13, 0, 'major', 0, '2026-05-20 13:39:01'),
(465, 69, 'Fall', '2027', 13, 0, 'major', 0, '2026-05-20 13:39:01'),
(466, 70, 'Fall', '2027', 13, 0, 'elective', 0, '2026-05-20 13:39:01'),
(467, 7, 'Fall', '2027', 9, 3, 'major', 0, '2026-05-20 13:39:01'),
(468, 6, 'Fall', '2027', 3, 13, 'prerequisite', 0, '2026-05-20 13:39:02'),
(469, 33, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:02'),
(470, 34, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:02'),
(471, 56, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:02'),
(472, 57, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:03'),
(473, 58, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:03'),
(474, 61, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:03'),
(475, 62, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:03'),
(476, 63, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:04'),
(477, 65, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:04'),
(478, 66, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:04'),
(479, 68, 'Fall', '2027', 1, 0, 'elective', 0, '2026-05-20 13:39:04'),
(480, 2, 'Fall', '2027', 13, 0, 'major', 0, '2026-05-20 13:39:05'),
(481, 3, 'Fall', '2027', 13, 0, 'major', 0, '2026-05-20 13:39:05'),
(482, 4, 'Fall', '2027', 13, 1, 'major', 0, '2026-05-20 13:39:05'),
(483, 5, 'Fall', '2027', 13, 0, 'major', 0, '2026-05-20 13:39:05'),
(484, 11, 'Fall', '2027', 7, 3, 'prerequisite', 0, '2026-05-20 13:39:06'),
(485, 12, 'Fall', '2027', 13, 2, 'prerequisite', 0, '2026-05-20 13:39:06'),
(486, 13, 'Fall', '2027', 7, 1, 'major', 0, '2026-05-20 13:39:06'),
(487, 14, 'Fall', '2027', 7, 2, 'major', 0, '2026-05-20 13:39:06'),
(488, 15, 'Fall', '2027', 13, 3, 'prerequisite', 0, '2026-05-20 13:39:07'),
(489, 23, 'Fall', '2027', 10, 0, 'major', 0, '2026-05-20 13:39:07'),
(490, 25, 'Fall', '2027', 13, 2, 'major', 0, '2026-05-20 13:39:07'),
(491, 30, 'Fall', '2027', 14, 0, 'prerequisite', 0, '2026-05-20 13:39:07'),
(492, 31, 'Fall', '2027', 8, 0, 'major', 0, '2026-05-20 13:39:08'),
(493, 37, 'Fall', '2027', 13, 0, 'elective', 0, '2026-05-20 13:39:08'),
(494, 40, 'Fall', '2027', 14, 0, 'major', 0, '2026-05-20 13:39:08'),
(495, 41, 'Fall', '2027', 13, 0, 'major', 0, '2026-05-20 13:39:09'),
(496, 42, 'Fall', '2027', 14, 0, 'major', 0, '2026-05-20 13:39:09'),
(497, 71, 'Fall', '2027', 13, 0, 'elective', 0, '2026-05-20 13:39:09'),
(498, 32, 'Fall', '2027', 1, 1, 'prerequisite', 0, '2026-05-20 13:39:09'),
(499, 1, 'Fall', '2027', 3, 22, 'prerequisite', 0, '2026-05-20 13:39:10'),
(500, 55, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:10'),
(501, 59, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:10'),
(502, 60, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:10'),
(503, 64, 'Fall', '2027', 1, 0, 'major', 0, '2026-05-20 13:39:11'),
(504, 67, 'Fall', '2027', 1, 0, 'elective', 0, '2026-05-20 13:39:11'),
(505, 8, 'Fall', '2026', 13, 2, 'prerequisite', 0, '2026-05-20 13:40:37'),
(506, 9, 'Fall', '2026', 13, 0, 'major', 0, '2026-05-20 13:40:38'),
(507, 10, 'Fall', '2026', 13, 0, 'major', 0, '2026-05-20 13:40:38'),
(508, 16, 'Fall', '2026', 7, 0, 'major', 0, '2026-05-20 13:40:38'),
(509, 19, 'Fall', '2026', 12, 0, 'major', 0, '2026-05-20 13:40:38'),
(510, 26, 'Fall', '2026', 10, 4, 'prerequisite', 0, '2026-05-20 13:40:39'),
(511, 27, 'Fall', '2026', 7, 0, 'major', 0, '2026-05-20 13:40:39'),
(512, 28, 'Fall', '2026', 7, 0, 'prerequisite', 0, '2026-05-20 13:40:39'),
(513, 29, 'Fall', '2026', 10, 0, 'major', 0, '2026-05-20 13:40:39'),
(514, 36, 'Fall', '2026', 13, 0, 'elective', 0, '2026-05-20 13:40:40'),
(515, 39, 'Fall', '2026', 13, 0, 'major', 0, '2026-05-20 13:40:40'),
(516, 69, 'Fall', '2026', 13, 0, 'major', 0, '2026-05-20 13:40:40'),
(517, 70, 'Fall', '2026', 13, 0, 'elective', 0, '2026-05-20 13:40:40'),
(518, 7, 'Fall', '2026', 9, 3, 'major', 0, '2026-05-20 13:40:41'),
(519, 6, 'Fall', '2026', 3, 13, 'prerequisite', 0, '2026-05-20 13:40:41'),
(520, 33, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:41'),
(521, 34, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:41'),
(522, 56, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:42'),
(523, 57, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:42'),
(524, 58, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:42'),
(525, 61, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:43'),
(526, 62, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:43'),
(527, 63, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:43'),
(528, 65, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:43'),
(529, 66, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:44'),
(530, 68, 'Fall', '2026', 1, 0, 'elective', 0, '2026-05-20 13:40:44'),
(531, 2, 'Fall', '2026', 13, 0, 'major', 0, '2026-05-20 13:40:44'),
(532, 3, 'Fall', '2026', 13, 0, 'major', 0, '2026-05-20 13:40:44'),
(533, 4, 'Fall', '2026', 13, 1, 'major', 0, '2026-05-20 13:40:45'),
(534, 5, 'Fall', '2026', 13, 0, 'major', 0, '2026-05-20 13:40:45'),
(535, 11, 'Fall', '2026', 7, 3, 'prerequisite', 0, '2026-05-20 13:40:45'),
(536, 12, 'Fall', '2026', 13, 2, 'prerequisite', 0, '2026-05-20 13:40:45'),
(537, 13, 'Fall', '2026', 7, 1, 'major', 0, '2026-05-20 13:40:46'),
(538, 14, 'Fall', '2026', 7, 2, 'major', 0, '2026-05-20 13:40:46'),
(539, 15, 'Fall', '2026', 13, 3, 'prerequisite', 0, '2026-05-20 13:40:46'),
(540, 23, 'Fall', '2026', 10, 0, 'major', 0, '2026-05-20 13:40:46'),
(541, 25, 'Fall', '2026', 13, 2, 'major', 0, '2026-05-20 13:40:47'),
(542, 30, 'Fall', '2026', 14, 0, 'prerequisite', 0, '2026-05-20 13:40:47'),
(543, 31, 'Fall', '2026', 8, 0, 'major', 0, '2026-05-20 13:40:47'),
(544, 37, 'Fall', '2026', 13, 0, 'elective', 0, '2026-05-20 13:40:47'),
(545, 40, 'Fall', '2026', 14, 0, 'major', 0, '2026-05-20 13:40:48'),
(546, 41, 'Fall', '2026', 13, 0, 'major', 0, '2026-05-20 13:40:48'),
(547, 42, 'Fall', '2026', 14, 0, 'major', 0, '2026-05-20 13:40:48'),
(548, 71, 'Fall', '2026', 13, 0, 'elective', 0, '2026-05-20 13:40:48'),
(549, 32, 'Fall', '2026', 1, 1, 'prerequisite', 0, '2026-05-20 13:40:49'),
(550, 1, 'Fall', '2026', 3, 22, 'prerequisite', 0, '2026-05-20 13:40:49'),
(551, 55, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:49'),
(552, 59, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:50'),
(553, 60, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:50'),
(554, 64, 'Fall', '2026', 1, 0, 'major', 0, '2026-05-20 13:40:50'),
(555, 67, 'Fall', '2026', 1, 0, 'elective', 0, '2026-05-20 13:40:50');

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

--
-- Dumping data for table `planner_states`
--

INSERT INTO `planner_states` (`id`, `student_id`, `career_path`, `mode`, `semesters_json`, `taken_subjects_json`, `grades_json`, `roadmap_json`, `goals_json`, `skills_progress_json`, `created_at`, `updated_at`) VALUES
(1, 11, 'Cyber Security', 'preview', NULL, NULL, NULL, NULL, NULL, '{\"summer_requests\": [{\"id\": 1, \"student_id\": 11, \"course_id\": 29, \"semester\": \"Summer 2026\", \"reason\": \"\", \"status\": \"pending\", \"admin_notes\": null, \"requested_at\": \"2026-05-20T00:27:31\"}, {\"id\": 2, \"student_id\": 11, \"course_id\": 32, \"semester\": \"Summer 2026\", \"reason\": \"\", \"status\": \"pending\", \"admin_notes\": null, \"requested_at\": \"2026-05-20T00:29:55\"}]}', '2026-05-19 15:48:43', '2026-05-19 21:29:54'),
(2, 10, 'Cyber Security', 'preview', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-20 14:42:20', '2026-05-20 14:42:20');

-- --------------------------------------------------------

--
-- Table structure for table `platform_settings`
--

CREATE TABLE `platform_settings` (
  `id` int NOT NULL,
  `maintenance_mode` tinyint(1) DEFAULT '0',
  `session_timeout_minutes` int DEFAULT '30',
  `max_login_attempts` int DEFAULT '5',
  `country_access_mode` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'allow_all',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `platform_settings`
--

INSERT INTO `platform_settings` (`id`, `maintenance_mode`, `session_timeout_minutes`, `max_login_attempts`, `country_access_mode`, `created_at`, `updated_at`) VALUES
(1, 0, 30, 5, 'allow_all', '2026-05-18 14:38:34', '2026-05-18 14:38:34');

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

--
-- Dumping data for table `security_audit_logs`
--

INSERT INTO `security_audit_logs` (`id`, `ip_address`, `event_type`, `identifier`, `details`, `created_at`, `updated_at`) VALUES
(1, '127.0.0.1', 'admin_created', 'admin@edumate.com', 'Admin account created from admin settings panel', '2026-05-18 11:38:13', '2026-05-18 11:38:13'),
(2, '127.0.0.1', 'captcha_failed', 'ahmed230103734@sut.edu.eg', 'Missing or invalid captcha token', '2026-05-18 14:38:35', '2026-05-18 14:38:35'),
(3, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-18 14:40:10', '2026-05-18 14:40:10'),
(4, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-18 14:40:18', '2026-05-18 14:40:18'),
(5, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-18 14:40:57', '2026-05-18 14:40:57'),
(6, '127.0.0.1', 'login_failed', 'lina.hassan@sut.edu.eg', 'Invalid credentials', '2026-05-18 14:41:23', '2026-05-18 14:41:23'),
(7, '127.0.0.1', 'login_failed', 'lina.hassan@sut.edu.eg', 'Invalid credentials', '2026-05-18 14:41:29', '2026-05-18 14:41:29'),
(8, '127.0.0.1', 'login_failed', 'lina.hassan@sut.edu.eg', 'Invalid credentials', '2026-05-18 14:41:33', '2026-05-18 14:41:33'),
(9, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-18 14:44:16', '2026-05-18 14:44:16'),
(10, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-18 14:46:38', '2026-05-18 14:46:38'),
(11, '127.0.0.1', 'captcha_failed', 'ahmed230103734@sut.edu.eg', 'Missing or invalid captcha token', '2026-05-18 14:54:48', '2026-05-18 14:54:48'),
(12, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-18 14:55:22', '2026-05-18 14:55:22'),
(13, '127.0.0.1', 'login_failed', 'ahmed230103734@sut.edu.eg', 'Invalid credentials', '2026-05-18 14:55:50', '2026-05-18 14:55:50'),
(14, '127.0.0.1', 'login_failed', 'lina.hassan@sut.edu.eg', 'Invalid credentials', '2026-05-18 14:56:09', '2026-05-18 14:56:09'),
(15, '127.0.0.1', 'login_failed', 'lina.hassan@sut.edu.eg', 'Invalid credentials', '2026-05-18 14:56:24', '2026-05-18 14:56:24'),
(16, '127.0.0.1', 'login_success', 'admin@edumate.com', 'User authenticated successfully', '2026-05-18 15:11:31', '2026-05-18 15:11:31'),
(17, '127.0.0.1', 'admin_created', 'lina.hassan@sut.edu.eg', 'Admin account created from admin settings panel', '2026-05-18 15:13:25', '2026-05-18 15:13:25'),
(18, '127.0.0.1', 'admin_created', 'admin@edumate.com', 'Created admin account for lina.hassan@sut.edu.eg', '2026-05-18 15:13:26', '2026-05-18 15:13:26'),
(19, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-18 15:14:41', '2026-05-18 15:14:41'),
(20, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-18 15:23:38', '2026-05-18 15:23:38'),
(21, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 10:11:36', '2026-05-19 10:11:36'),
(22, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 10:20:12', '2026-05-19 10:20:12'),
(23, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 10:20:14', '2026-05-19 10:20:14'),
(24, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 10:20:22', '2026-05-19 10:20:22'),
(25, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 10:25:05', '2026-05-19 10:25:05'),
(26, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 11:04:24', '2026-05-19 11:04:24'),
(27, '127.0.0.1', 'login_failed', 'lina.hassan@sut.edu.eg', 'Invalid credentials', '2026-05-19 11:06:56', '2026-05-19 11:06:56'),
(28, '127.0.0.1', 'login_failed', 'lina.hassan@sut.edu.eg', 'Invalid credentials', '2026-05-19 11:07:07', '2026-05-19 11:07:07'),
(29, '127.0.0.1', 'login_failed', 'admin@sut.edu.eg', 'Invalid credentials', '2026-05-19 11:07:21', '2026-05-19 11:07:21'),
(30, '127.0.0.1', 'login_failed', 'admin@sut.edu.eg', 'Invalid credentials', '2026-05-19 11:08:11', '2026-05-19 11:08:11'),
(31, '127.0.0.1', 'login_failed', 'admin@edumate.com', 'Invalid credentials', '2026-05-19 11:09:36', '2026-05-19 11:09:36'),
(32, '127.0.0.1', 'login_failed', 'admin@edumate.com', 'Invalid credentials', '2026-05-19 11:09:47', '2026-05-19 11:09:47'),
(33, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 11:16:10', '2026-05-19 11:16:10'),
(34, '127.0.0.1', 'login_failed', 'admin@edumate.com', 'Invalid credentials', '2026-05-19 11:39:04', '2026-05-19 11:39:04'),
(35, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 11:49:10', '2026-05-19 11:49:10'),
(36, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 11:49:12', '2026-05-19 11:49:12'),
(37, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 11:49:15', '2026-05-19 11:49:15'),
(38, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 11:49:17', '2026-05-19 11:49:17'),
(39, '127.0.0.1', 'login_failed', 'admin@edumate.com', 'Invalid credentials', '2026-05-19 11:50:21', '2026-05-19 11:50:21'),
(40, '127.0.0.1', 'login_success', 'admin@edumate.com', 'User authenticated successfully', '2026-05-19 11:52:52', '2026-05-19 11:52:52'),
(41, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 11:52:54', '2026-05-19 11:52:54'),
(42, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 11:54:18', '2026-05-19 11:54:18'),
(43, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 15:48:39', '2026-05-19 15:48:39'),
(44, '127.0.0.1', 'login_failed', 'admin@edumate.com', 'Invalid credentials', '2026-05-19 15:49:45', '2026-05-19 15:49:45'),
(45, '127.0.0.1', 'login_failed', 'admin@edumate.com', 'Invalid credentials', '2026-05-19 15:52:34', '2026-05-19 15:52:34'),
(46, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 15:57:08', '2026-05-19 15:57:08'),
(47, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 15:57:11', '2026-05-19 15:57:11'),
(48, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 15:57:27', '2026-05-19 15:57:27'),
(49, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 15:57:28', '2026-05-19 15:57:28'),
(50, '127.0.0.1', 'login_failed', 'mohamed.elbassal09@gmail.com', 'Invalid credentials', '2026-05-19 16:03:14', '2026-05-19 16:03:14'),
(51, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:07:22', '2026-05-19 16:07:22'),
(52, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:08:11', '2026-05-19 16:08:11'),
(53, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:23:09', '2026-05-19 16:23:09'),
(54, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:23:52', '2026-05-19 16:23:52'),
(55, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:36:41', '2026-05-19 16:36:41'),
(56, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:38:25', '2026-05-19 16:38:25'),
(57, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:39:14', '2026-05-19 16:39:14'),
(58, '127.0.0.1', 'captcha_failed', 'lina.hassan@sut.edu.eg', 'Missing or invalid captcha token', '2026-05-19 16:39:15', '2026-05-19 16:39:15'),
(59, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:39:26', '2026-05-19 16:39:26'),
(60, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:39:56', '2026-05-19 16:39:56'),
(61, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:39:58', '2026-05-19 16:39:58'),
(62, '127.0.0.1', 'user_status_changed', 'ahmed230103001@sut.edu.eg', 'Admin lina.hassan@sut.edu.eg set account to blocked', '2026-05-19 16:40:12', '2026-05-19 16:40:12'),
(63, '127.0.0.1', 'user_status_changed', 'ahmed230103001@sut.edu.eg', 'Admin lina.hassan@sut.edu.eg set account to active', '2026-05-19 16:40:15', '2026-05-19 16:40:15'),
(64, '127.0.0.1', 'user_status_changed', 'ahmed230103001@sut.edu.eg', 'Admin lina.hassan@sut.edu.eg set account to blocked', '2026-05-19 16:40:24', '2026-05-19 16:40:24'),
(65, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:40:58', '2026-05-19 16:40:58'),
(66, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:44:21', '2026-05-19 16:44:21'),
(67, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:46:39', '2026-05-19 16:46:39'),
(68, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:47:43', '2026-05-19 16:47:43'),
(69, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:51:54', '2026-05-19 16:51:54'),
(70, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 16:53:10', '2026-05-19 16:53:10'),
(71, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 20:48:28', '2026-05-19 20:48:28'),
(72, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:13:01', '2026-05-19 21:13:01'),
(73, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:27:44', '2026-05-19 21:27:44'),
(74, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:29:37', '2026-05-19 21:29:37'),
(75, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:33:00', '2026-05-19 21:33:00'),
(76, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:35:18', '2026-05-19 21:35:18'),
(77, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:41:59', '2026-05-19 21:41:59'),
(78, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:43:50', '2026-05-19 21:43:50'),
(79, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:48:18', '2026-05-19 21:48:18'),
(80, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:48:20', '2026-05-19 21:48:20'),
(81, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:50:32', '2026-05-19 21:50:32'),
(82, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-19 21:51:31', '2026-05-19 21:51:31'),
(83, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-19 22:13:41', '2026-05-19 22:13:41'),
(84, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-19 22:15:14', '2026-05-19 22:15:14'),
(85, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 09:12:04', '2026-05-20 09:12:04'),
(86, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 09:35:25', '2026-05-20 09:35:25'),
(87, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-20 09:50:28', '2026-05-20 09:50:28'),
(88, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 09:53:13', '2026-05-20 09:53:13'),
(89, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-20 09:54:27', '2026-05-20 09:54:27'),
(90, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-20 09:54:29', '2026-05-20 09:54:29'),
(91, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:00:13', '2026-05-20 10:00:13'),
(92, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:00:15', '2026-05-20 10:00:15'),
(93, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:00:27', '2026-05-20 10:00:27'),
(94, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:00:29', '2026-05-20 10:00:29'),
(95, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:01:29', '2026-05-20 10:01:29'),
(96, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:01:31', '2026-05-20 10:01:31'),
(97, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:01:34', '2026-05-20 10:01:34'),
(98, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:07:46', '2026-05-20 10:07:46'),
(99, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:11:07', '2026-05-20 10:11:07'),
(100, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:11:31', '2026-05-20 10:11:31'),
(101, '127.0.0.1', 'login_success', 'm.nasr@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:12:23', '2026-05-20 10:12:23'),
(102, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 10:21:19', '2026-05-20 10:21:19'),
(103, '127.0.0.1', 'login_success', 'ahmed230103734@sut.edu.eg', 'User authenticated successfully', '2026-05-20 11:25:47', '2026-05-20 11:25:47'),
(104, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-20 11:27:02', '2026-05-20 11:27:02'),
(105, '127.0.0.1', 'login_success', 'lina.hassan@sut.edu.eg', 'User authenticated successfully', '2026-05-20 14:38:30', '2026-05-20 14:38:30'),
(106, '127.0.0.1', 'login_success', 'ahmed.ahmed@sut.edu.eg', 'User authenticated successfully', '2026-05-20 14:42:16', '2026-05-20 14:42:16'),
(107, '127.0.0.1', 'login_success', 'salma230103010@sut.edu.eg', 'User authenticated successfully', '2026-05-20 14:44:14', '2026-05-20 14:44:14');

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
(10, 10, '230103010', 0.00, 1, 2027, NULL, NULL, '2026-04-25 17:13:03', '2026-05-20 14:44:17'),
(11, 11, '230103734', 3.61, 1, 2027, NULL, NULL, '2026-04-26 20:54:28', '2026-05-20 09:53:16'),
(13, 17, 'CYS2026001', 0.00, 3, 2029, NULL, NULL, '2026-05-17 21:10:04', '2026-05-17 21:10:04'),
(14, 18, 'ADM001', 0.00, 1, NULL, 'Administration, platform operations, governance', NULL, '2026-05-18 11:38:13', '2026-05-18 11:38:13'),
(15, 20, 'ADM002', 0.00, 1, NULL, 'Administration, platform operations, governance', NULL, '2026-05-18 15:13:25', '2026-05-18 15:13:25');

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

--
-- Dumping data for table `student_advisors`
--

INSERT INTO `student_advisors` (`id`, `student_id`, `advisor_id`, `assigned_at`) VALUES
(2, 11, 14, '2026-05-19 16:10:34'),
(3, 1, 16, '2026-05-19 16:38:56'),
(4, 10, 22, '2026-05-20 14:41:44');

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
(22, 11, 1, 'previous', 'B+', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:46:48'),
(23, 11, 6, 'previous', 'B+', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:47:16'),
(24, 11, 7, 'previous', 'B+', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:47:18'),
(25, 11, 8, 'previous', 'A-', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:47:20'),
(26, 11, 41, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:47:34'),
(27, 11, 11, 'previous', 'B-', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:31:12'),
(28, 11, 12, 'previous', 'B-', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:31:12'),
(29, 11, 13, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:36'),
(30, 11, 14, 'previous', 'B-', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:31:12'),
(31, 11, 16, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:38'),
(32, 11, 19, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:38'),
(33, 11, 21, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:40'),
(34, 11, 26, 'previous', 'B-', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:49:52'),
(35, 11, 15, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:36'),
(36, 11, 22, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:41'),
(37, 11, 23, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:41'),
(38, 11, 24, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:41'),
(39, 11, 2, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:29'),
(40, 11, 3, 'previous', 'C+', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:46:50'),
(41, 11, 9, 'previous', 'A-', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:47:22'),
(42, 11, 10, 'previous', 'A-', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:47:23'),
(43, 11, 25, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:40'),
(44, 11, 4, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:46:52'),
(45, 11, 5, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:30'),
(46, 11, 38, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:36'),
(47, 11, 36, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:47:24'),
(48, 11, 37, 'previous', 'A', 'completed', '2026-04-26 20:54:41', '2026-05-20 09:30:41'),
(60, 11, 17, '', 'A', 'completed', '2026-05-08 23:59:10', '2026-05-20 09:30:38'),
(61, 11, 18, '', 'A', 'completed', '2026-05-08 23:59:10', '2026-05-20 09:30:38'),
(62, 11, 20, '', 'A', 'completed', '2026-05-08 23:59:10', '2026-05-20 09:30:40'),
(63, 11, 27, '', 'B+', 'completed', '2026-05-08 23:59:10', '2026-05-20 09:49:53'),
(64, 11, 28, '', 'A-', 'completed', '2026-05-08 23:59:10', '2026-05-20 09:49:55'),
(65, 11, 39, 'Spring', 'A', 'completed', '2026-05-20 09:30:45', '2026-05-20 09:30:45'),
(66, 11, 32, 'Fall', NULL, 'planned', '2026-05-20 09:30:47', '2026-05-20 09:49:07'),
(67, 11, 31, 'Fall', NULL, 'planned', '2026-05-20 09:30:52', '2026-05-20 09:49:06'),
(68, 11, 29, 'Spring', 'B+', 'completed', '2026-05-20 09:30:57', '2026-05-20 09:49:56'),
(69, 11, 40, 'Fall', NULL, 'planned', '2026-05-20 09:30:59', '2026-05-20 09:49:09'),
(70, 11, 35, 'Spring', NULL, 'planned', '2026-05-20 09:31:04', '2026-05-20 09:47:58'),
(71, 11, 42, 'Summer', NULL, 'planned', '2026-05-20 09:31:15', '2026-05-20 09:49:23'),
(72, 11, 70, 'Spring', NULL, 'planned', '2026-05-20 09:31:16', '2026-05-20 09:48:00'),
(73, 11, 33, 'Spring', NULL, 'planned', '2026-05-20 09:31:18', '2026-05-20 09:47:55'),
(74, 11, 34, 'Spring', NULL, 'planned', '2026-05-20 09:47:57', '2026-05-20 09:47:57'),
(75, 11, 69, 'Spring', NULL, 'planned', '2026-05-20 09:47:59', '2026-05-20 09:47:59'),
(76, 11, 30, 'Fall', NULL, 'planned', '2026-05-20 09:49:05', '2026-05-20 09:49:05'),
(77, 11, 71, 'Fall', NULL, 'planned', '2026-05-20 09:49:10', '2026-05-20 09:49:10');

-- --------------------------------------------------------

--
-- Table structure for table `student_preferences`
--

CREATE TABLE `student_preferences` (
  `id` int NOT NULL,
  `student_id` int UNSIGNED DEFAULT NULL,
  `allow_summer` tinyint(1) DEFAULT '0',
  `preferred_max_credits` int DEFAULT NULL,
  `prefer_fast_graduation` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `course_category` enum('prerequisite','major','elective') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'major',
  `semester_sequence` int DEFAULT NULL,
  `specialization_track` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `study_plan`
--

INSERT INTO `study_plan` (`id`, `major_id`, `course_id`, `semester`, `recommended_level_no`, `display_order`, `is_active`, `created_at`, `updated_at`, `course_category`, `semester_sequence`, `specialization_track`) VALUES
(1, 1, 1, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 1, NULL),
(2, 1, 2, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 1, NULL),
(3, 1, 3, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 1, NULL),
(4, 1, 4, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 1, NULL),
(5, 1, 5, 'Fall', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 1, NULL),
(8, 1, 6, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 2, NULL),
(9, 1, 7, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 2, NULL),
(10, 1, 8, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 2, NULL),
(11, 1, 9, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 2, NULL),
(12, 1, 10, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 2, NULL),
(13, 1, 36, 'Spring', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'elective', 2, NULL),
(15, 1, 41, 'Summer', 1, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:29:23', 'major', 2, NULL),
(16, 1, 11, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 3, NULL),
(17, 1, 12, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 3, NULL),
(18, 1, 14, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 3, NULL),
(19, 1, 15, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 3, NULL),
(20, 1, 25, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(21, 1, 38, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 3, NULL),
(23, 1, 16, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(24, 1, 17, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(25, 1, 18, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(26, 1, 19, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(27, 1, 20, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 4, NULL),
(30, 1, 21, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 5, NULL),
(31, 1, 22, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 5, NULL),
(32, 1, 23, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(33, 1, 24, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(34, 1, 37, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'elective', 5, NULL),
(37, 1, 26, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 6, NULL),
(38, 1, 27, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(39, 1, 28, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 6, NULL),
(40, 1, 29, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(41, 1, 39, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(44, 1, 42, 'Summer', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:29:23', 'major', 6, NULL),
(45, 1, 30, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 7, NULL),
(46, 1, 31, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 7, NULL),
(47, 1, 32, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 7, NULL),
(48, 1, 40, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 7, NULL),
(52, 1, 33, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 8, NULL),
(53, 1, 34, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 8, NULL),
(54, 1, 35, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 8, NULL),
(55, 2, 11, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 3, NULL),
(56, 2, 12, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 3, NULL),
(57, 2, 14, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 3, NULL),
(58, 2, 15, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 3, NULL),
(59, 2, 25, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 3, NULL),
(60, 2, 38, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 3, NULL),
(62, 2, 43, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(63, 2, 44, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(64, 2, 45, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(65, 2, 26, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 4, NULL),
(66, 2, 20, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 4, NULL),
(69, 2, 13, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(70, 2, 23, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(71, 2, 24, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(72, 2, 46, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(73, 2, 47, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(74, 2, 37, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'elective', 5, NULL),
(76, 2, 48, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(77, 2, 49, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(78, 2, 50, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(79, 2, 29, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(80, 2, 39, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(83, 2, 42, 'Summer', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:29:23', 'major', 6, NULL),
(84, 2, 21, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 7, NULL),
(85, 2, 51, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 7, NULL),
(86, 2, 52, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 7, NULL),
(87, 2, 32, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 7, NULL),
(88, 2, 40, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 7, NULL),
(91, 2, 33, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 8, NULL),
(92, 2, 53, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 8, NULL),
(93, 2, 54, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 8, NULL),
(94, 2, 35, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 8, NULL),
(98, 3, 12, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 3, NULL),
(99, 3, 14, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 3, NULL),
(100, 3, 21, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 3, NULL),
(101, 3, 55, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 3, NULL),
(102, 3, 15, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 3, NULL),
(103, 3, 38, 'Fall', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 3, NULL),
(105, 3, 43, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(106, 3, 56, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(107, 3, 57, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(108, 3, 58, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 4, NULL),
(109, 3, 20, 'Spring', 2, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 4, NULL),
(112, 3, 23, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(113, 3, 24, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(114, 3, 59, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(115, 3, 60, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(116, 3, 25, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 5, NULL),
(117, 3, 37, 'Fall', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'elective', 5, NULL),
(119, 3, 26, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 6, NULL),
(120, 3, 61, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(121, 3, 62, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(122, 3, 63, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(123, 3, 39, 'Spring', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 6, NULL),
(126, 3, 42, 'Summer', 3, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:29:23', 'major', 6, NULL),
(127, 3, 30, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 7, NULL),
(128, 3, 67, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:31:12', 'elective', 7, 'NS'),
(129, 3, 64, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 7, NULL),
(130, 3, 32, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 7, NULL),
(131, 3, 40, 'Fall', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 7, NULL),
(134, 3, 34, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 8, NULL),
(135, 3, 65, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 8, NULL),
(136, 3, 66, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:24:12', 'major', 8, NULL),
(137, 3, 35, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:27:49', 'prerequisite', 8, NULL),
(138, 3, 68, 'Spring', 4, 1, 1, '2026-04-25 01:43:23', '2026-05-19 03:31:12', 'elective', 8, 'NS'),
(139, 1, 69, 'Spring', 4, 1, 1, '2026-05-09 00:04:02', '2026-05-19 03:24:12', 'major', 8, NULL),
(140, 1, 70, 'Spring', 4, 1, 1, '2026-05-09 00:04:17', '2026-05-19 03:31:12', 'elective', 8, 'CS'),
(141, 1, 71, 'Fall', 4, 1, 1, '2026-05-09 00:06:37', '2026-05-19 03:31:12', 'elective', 7, 'CS'),
(143, 1, 13, 'Fall', 2, 1, 1, '2026-05-09 00:15:31', '2026-05-19 03:24:12', 'major', 3, NULL),
(144, 2, 1, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:27:49', 'prerequisite', 1, NULL),
(145, 2, 2, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:24:12', 'major', 1, NULL),
(146, 2, 3, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:24:12', 'major', 1, NULL),
(147, 2, 4, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:24:12', 'major', 1, NULL),
(148, 2, 5, 'Fall', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:24:12', 'major', 1, NULL),
(149, 2, 6, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:27:49', 'prerequisite', 2, NULL),
(150, 2, 7, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:24:12', 'major', 2, NULL),
(151, 2, 8, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:27:49', 'prerequisite', 2, NULL),
(152, 2, 9, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:24:12', 'major', 2, NULL),
(153, 2, 10, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:24:12', 'major', 2, NULL),
(154, 2, 36, 'Spring', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:27:49', 'elective', 2, NULL),
(155, 2, 41, 'Summer', 1, 1, 1, '2026-05-09 00:32:06', '2026-05-19 03:29:23', 'major', 2, NULL),
(159, 3, 1, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:27:49', 'prerequisite', 1, NULL),
(160, 3, 2, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:24:12', 'major', 1, NULL),
(161, 3, 3, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:24:12', 'major', 1, NULL),
(162, 3, 4, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:24:12', 'major', 1, NULL),
(163, 3, 5, 'Fall', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:24:12', 'major', 1, NULL),
(164, 3, 6, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:27:49', 'prerequisite', 2, NULL),
(165, 3, 7, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:24:12', 'major', 2, NULL),
(166, 3, 8, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:27:49', 'prerequisite', 2, NULL),
(167, 3, 9, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:24:12', 'major', 2, NULL),
(168, 3, 10, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:24:12', 'major', 2, NULL),
(169, 3, 36, 'Spring', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:27:49', 'elective', 2, NULL),
(170, 3, 41, 'Summer', 1, 1, 1, '2026-05-09 00:34:43', '2026-05-19 03:29:23', 'major', 2, NULL),
(174, 2, 72, 'Fall', 4, 1, 1, '2026-05-09 00:51:31', '2026-05-19 03:31:12', 'elective', 7, 'DS'),
(175, 2, 73, 'Spring', 4, 1, 1, '2026-05-09 00:51:31', '2026-05-19 03:31:12', 'elective', 8, 'DS');

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
(1, 'Ahmed', 'ahmed230103001@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 0, '2026-04-25 17:12:23', '2026-05-19 16:40:24'),
(2, 'Sara', 'sara240103002@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:48:05'),
(3, 'Omar', 'omar250103003@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:48:01'),
(4, 'Mona', 'mona230103004@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:56'),
(5, 'Ali', 'ali240103005@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:54'),
(6, 'Nour', 'nour250103006@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:49'),
(7, 'Karim', 'karim230103007@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:44'),
(8, 'Youssef', 'youssef240103008@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:38'),
(9, 'Huda', 'huda250103009@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-04-25 17:12:23', '2026-05-16 15:47:35'),
(10, 'Salma', 'salma230103010@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, '2026-05-20 14:44:14', 1, '2026-04-25 17:12:23', '2026-05-20 14:44:13'),
(11, 'ahmed', 'ahmed230103734@sut.edu.eg', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, '2026-05-20 11:25:47', 1, '2026-04-26 20:53:52', '2026-05-20 11:25:47'),
(14, 'Mohamed Nasr', 'm.nasr@sut.edu.eg', 'advisor', '$2b$12$brvtUIohj4..EZPBBQpHzuBmdtlV.Is8HcAE0cJ80Zw9v65aXkhB.', NULL, '2026-05-20 10:12:24', 1, '2026-05-07 13:58:55', '2026-05-20 10:12:22'),
(15, 'Sarah Ahmed', 's.ahmed@sut.edu.eg', 'advisor', '$2b$12$brvtUIohj4..EZPBBQpHzuBmdtlV.Is8HcAE0cJ80Zw9v65aXkhB.', NULL, NULL, 1, '2026-05-07 13:58:55', '2026-05-07 13:58:55'),
(16, 'Khaled Ibrahim', 'k.ibrahim@sut.edu.eg', 'advisor', '$2b$12$brvtUIohj4..EZPBBQpHzuBmdtlV.Is8HcAE0cJ80Zw9v65aXkhB.', NULL, NULL, 1, '2026-05-07 13:58:55', '2026-05-07 13:58:55'),
(17, 'asmaa', 'asmaa@edumate.com', 'student', '$2b$12$ZGUH4EZstULJq7eNgyR5/uHi7brZXHuEDtg6fwtuY7m9ukiIkGDUC', NULL, NULL, 1, '2026-05-17 21:04:21', '2026-05-17 21:11:33'),
(18, 'Super Admin', 'admin@edumate.com', 'admin', '$pbkdf2-sha256$29000$ZGxN6d3bu1cqpVQqpdRaaw$9RyLZdRV8Z8bnIavcYNxaFOuVUelrglNoVr61Lnmztc', NULL, '2026-05-19 11:52:55', 1, '2026-05-18 11:38:13', '2026-05-19 11:52:51'),
(20, 'Lina Hassan', 'lina.hassan@sut.edu.eg', 'admin', '$pbkdf2-sha256$29000$xPg/xziHMOa89/7/3/v/nw$lJW.HxbfbqP9iNcZL6wCPKk4pX7N0m/ESnuzrFvrwk0', NULL, '2026-05-20 14:38:30', 1, '2026-05-18 15:13:25', '2026-05-20 14:38:30'),
(21, 'Mohamed El-Bassal', 'mohamed.elbassal09@sut.edu.eg', 'advisor', '$2b$12$YrYaHkFh6KfxcxRTyDgWxeB68kgTHlnNF0.xdxUfbGlFti9ASe4Ry', 'advisor|12345|koko melon', NULL, 1, '2026-05-19 16:02:46', '2026-05-19 16:02:46'),
(22, 'Ahmed Ahmed', 'ahmed.ahmed@sut.edu.eg', 'advisor', '$2b$12$/Vo6e2/dyztWDLmxjCLIfOQBPgLcMQish5o161wPHr/MQ0HZIkggu', 'advisor|AD55|NS', '2026-05-20 14:42:16', 1, '2026-05-20 14:40:56', '2026-05-20 14:42:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `active_semester`
--
ALTER TABLE `active_semester`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `course_offerings`
--
ALTER TABLE `course_offerings`
  ADD KEY `idx_course_offerings_semester` (`semester`,`academic_year`);

--
-- Indexes for table `demand_analysis_results`
--
ALTER TABLE `demand_analysis_results`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `majors`
--
ALTER TABLE `majors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `platform_settings`
--
ALTER TABLE `platform_settings`
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
  ADD KEY `fk_student_courses_course` (`course_id`),
  ADD KEY `idx_student_courses_student` (`student_id`),
  ADD KEY `idx_student_courses_course` (`course_id`);

--
-- Indexes for table `student_preferences`
--
ALTER TABLE `student_preferences`
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `fk_study_plan_course` (`course_id`),
  ADD KEY `idx_study_plan_major` (`major_id`),
  ADD KEY `idx_study_plan_sequence` (`semester_sequence`);

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
-- AUTO_INCREMENT for table `active_semester`
--
ALTER TABLE `active_semester`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `advisor_chat`
--
ALTER TABLE `advisor_chat`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `advisor_slots`
--
ALTER TABLE `advisor_slots`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- AUTO_INCREMENT for table `demand_analysis_results`
--
ALTER TABLE `demand_analysis_results`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=556;

--
-- AUTO_INCREMENT for table `platform_settings`
--
ALTER TABLE `platform_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `saved_internships`
--
ALTER TABLE `saved_internships`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `security_audit_logs`
--
ALTER TABLE `security_audit_logs`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `student_advisors`
--
ALTER TABLE `student_advisors`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_courses`
--
ALTER TABLE `student_courses`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `student_preferences`
--
ALTER TABLE `student_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

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
