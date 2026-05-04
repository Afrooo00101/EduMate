// lib/models/semester_model.dart
import 'package:flutter/material.dart';
import '../../core/theme/theme.dart';

class SubjectModel {
  final String id;
  final String name;
  final String code;
  final int credits;
  final String department;
  double? grade;
  bool isCompleted;
  
  SubjectModel({
    required this.id,
    required this.name,
    required this.code,
    required this.credits,
    required this.department,
    this.grade,
    this.isCompleted = false,
  });

  // Grade point value
  double get gradePoints {
    if (grade == null) return 0.0;
    switch (grade!.toStringAsFixed(1)) {
      case '4.0': return 4.0;
      case '3.7': return 3.7;
      case '3.3': return 3.3;
      case '3.0': return 3.0;
      case '2.7': return 2.7;
      case '2.3': return 2.3;
      case '2.0': return 2.0;
      case '1.7': return 1.7;
      case '1.3': return 1.3;
      case '1.0': return 1.0;
      default: return 0.0;
    }
  }

  // Get color for grade
  Color getGradeColor() {
    if (grade == null) return Colors.grey;
    if (grade! >= 3.7) return EdumateColors.success;
    if (grade! >= 3.0) return EdumateColors.info;
    if (grade! >= 2.0) return EdumateColors.warning;
    return EdumateColors.error;
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'code': code,
    'credits': credits,
    'department': department,
    'grade': grade,
    'isCompleted': isCompleted,
  };

  factory SubjectModel.fromJson(Map<String, dynamic> json) => SubjectModel(
    id: json['id'],
    name: json['name'],
    code: json['code'],
    credits: json['credits'],
    department: json['department'],
    grade: json['grade']?.toDouble(),
    isCompleted: json['isCompleted'] ?? false,
  );
}

class SemesterModel {
  final String id;
  String name;
  int semesterNumber;
  List<SubjectModel> subjects;
  bool isCompleted;
  
  SemesterModel({
    required this.id,
    required this.name,
    required this.semesterNumber,
    required this.subjects,
    this.isCompleted = false,
  });

  // Calculate total credits for this semester
  int get totalCredits => subjects.fold(0, (sum, s) => sum + s.credits);
  
  // Calculate GPA for this semester
  double get gpa {
    double totalPoints = 0;
    int totalCredits = 0;
    
    for (var subject in subjects) {
      if (subject.grade != null) {
        totalPoints += subject.gradePoints * subject.credits;
        totalCredits += subject.credits;
      }
    }
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
  }
  
  // Number of graded subjects
  int get gradedCount => subjects.where((s) => s.grade != null).length;
  
  // Number of subjects
  int get subjectCount => subjects.length;

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'semesterNumber': semesterNumber,
    'subjects': subjects.map((s) => s.toJson()).toList(),
    'isCompleted': isCompleted,
  };

  factory SemesterModel.fromJson(Map<String, dynamic> json) => SemesterModel(
    id: json['id'],
    name: json['name'],
    semesterNumber: json['semesterNumber'],
    subjects: (json['subjects'] as List).map((s) => SubjectModel.fromJson(s)).toList(),
    isCompleted: json['isCompleted'] ?? false,
  );
}

// Subject Database
class SubjectDatabase {
  static final Map<String, List<SubjectModel>> subjectsByType = {
    'foundation': [
      SubjectModel(
        id: 'cs101',
        name: 'Intro to Programming',
        code: 'CS 101',
        credits: 4,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'math101',
        name: 'Mathematics I',
        code: 'MATH 101',
        credits: 4,
        department: 'Mathematics',
      ),
      SubjectModel(
        id: 'eng101',
        name: 'English I',
        code: 'ENG 101',
        credits: 3,
        department: 'English',
      ),
      SubjectModel(
        id: 'cs102',
        name: 'Computer Fundamentals',
        code: 'CS 102',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'gen101',
        name: 'Study Skills',
        code: 'GEN 101',
        credits: 2,
        department: 'General',
      ),
      SubjectModel(
        id: 'it101',
        name: 'Introduction to IT',
        code: 'IT 101',
        credits: 3,
        department: 'Information Technology',
      ),
      SubjectModel(
        id: 'math102',
        name: 'Discrete Mathematics',
        code: 'MATH 102',
        credits: 3,
        department: 'Mathematics',
      ),
      SubjectModel(
        id: 'phy101',
        name: 'Physics',
        code: 'PHY 101',
        credits: 4,
        department: 'Physics',
      ),
    ],
    'core': [
      SubjectModel(
        id: 'cs201',
        name: 'Object Oriented Programming',
        code: 'CS 201',
        credits: 4,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs202',
        name: 'Data Structures',
        code: 'CS 202',
        credits: 4,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs203',
        name: 'Database Systems',
        code: 'CS 203',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs204',
        name: 'Computer Networks',
        code: 'CS 204',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs205',
        name: 'Operating Systems',
        code: 'CS 205',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs206',
        name: 'Web Development',
        code: 'CS 206',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs207',
        name: 'Software Engineering',
        code: 'CS 207',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs208',
        name: 'Algorithms',
        code: 'CS 208',
        credits: 3,
        department: 'Computer Science',
      ),
    ],
    'intelligent': [
      SubjectModel(
        id: 'cs301',
        name: 'Machine Learning',
        code: 'CS 301',
        credits: 4,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs302',
        name: 'Artificial Intelligence',
        code: 'CS 302',
        credits: 4,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs303',
        name: 'Data Science',
        code: 'CS 303',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs304',
        name: 'Neural Networks',
        code: 'CS 304',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs305',
        name: 'Computer Vision',
        code: 'CS 305',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs306',
        name: 'Natural Language Processing',
        code: 'CS 306',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs307',
        name: 'Deep Learning',
        code: 'CS 307',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs308',
        name: 'Reinforcement Learning',
        code: 'CS 308',
        credits: 3,
        department: 'Computer Science',
      ),
    ],
    'advanced': [
      SubjectModel(
        id: 'cs401',
        name: 'Advanced Algorithms',
        code: 'CS 401',
        credits: 4,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs402',
        name: 'Distributed Systems',
        code: 'CS 402',
        credits: 4,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs403',
        name: 'Cloud Computing',
        code: 'CS 403',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs404',
        name: 'Big Data Analytics',
        code: 'CS 404',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs405',
        name: 'Cybersecurity',
        code: 'CS 405',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs406',
        name: 'Blockchain Technology',
        code: 'CS 406',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs407',
        name: 'Quantum Computing',
        code: 'CS 407',
        credits: 3,
        department: 'Computer Science',
      ),
      SubjectModel(
        id: 'cs408',
        name: 'Advanced Databases',
        code: 'CS 408',
        credits: 3,
        department: 'Computer Science',
      ),
    ],
    'specialization': [
      SubjectModel(
        id: 'sec501',
        name: 'Advanced Cybersecurity',
        code: 'SEC 501',
        credits: 4,
        department: 'Security',
      ),
      SubjectModel(
        id: 'sec502',
        name: 'Network Security',
        code: 'SEC 502',
        credits: 4,
        department: 'Security',
      ),
      SubjectModel(
        id: 'sec503',
        name: 'Cryptography',
        code: 'SEC 503',
        credits: 3,
        department: 'Security',
      ),
      SubjectModel(
        id: 'sec504',
        name: 'Ethical Hacking',
        code: 'SEC 504',
        credits: 3,
        department: 'Security',
      ),
      SubjectModel(
        id: 'sec505',
        name: 'Digital Forensics',
        code: 'SEC 505',
        credits: 3,
        department: 'Security',
      ),
      SubjectModel(
        id: 'sec506',
        name: 'Security Operations',
        code: 'SEC 506',
        credits: 3,
        department: 'Security',
      ),
      SubjectModel(
        id: 'sec507',
        name: 'Risk Management',
        code: 'SEC 507',
        credits: 3,
        department: 'Security',
      ),
      SubjectModel(
        id: 'sec508',
        name: 'Compliance & Audit',
        code: 'SEC 508',
        credits: 3,
        department: 'Security',
      ),
    ],
    'capstone': [
      SubjectModel(
        id: 'cap601',
        name: 'Capstone Project I',
        code: 'CAP 601',
        credits: 3,
        department: 'Capstone',
      ),
      SubjectModel(
        id: 'cap602',
        name: 'Capstone Project II',
        code: 'CAP 602',
        credits: 3,
        department: 'Capstone',
      ),
      SubjectModel(
        id: 'cap603',
        name: 'Research Methods',
        code: 'CAP 603',
        credits: 3,
        department: 'Capstone',
      ),
      SubjectModel(
        id: 'cap604',
        name: 'Technical Writing',
        code: 'CAP 604',
        credits: 2,
        department: 'Capstone',
      ),
      SubjectModel(
        id: 'cap605',
        name: 'Professional Ethics',
        code: 'CAP 605',
        credits: 2,
        department: 'Capstone',
      ),
      SubjectModel(
        id: 'cap606',
        name: 'Industry Internship',
        code: 'CAP 606',
        credits: 3,
        department: 'Capstone',
      ),
      SubjectModel(
        id: 'cap607',
        name: 'Portfolio Development',
        code: 'CAP 607',
        credits: 2,
        department: 'Capstone',
      ),
      SubjectModel(
        id: 'cap608',
        name: 'Career Preparation',
        code: 'CAP 608',
        credits: 1,
        department: 'Capstone',
      ),
    ],
    'final': [
      SubjectModel(
        id: 'fin701',
        name: 'Final Project',
        code: 'FIN 701',
        credits: 4,
        department: 'Final',
      ),
      SubjectModel(
        id: 'fin702',
        name: 'Thesis',
        code: 'FIN 702',
        credits: 4,
        department: 'Final',
      ),
      SubjectModel(
        id: 'fin703',
        name: 'Comprehensive Exam',
        code: 'FIN 703',
        credits: 2,
        department: 'Final',
      ),
      SubjectModel(
        id: 'fin704',
        name: 'Industry Seminar',
        code: 'FIN 704',
        credits: 2,
        department: 'Final',
      ),
      SubjectModel(
        id: 'fin705',
        name: 'Graduate Workshop',
        code: 'FIN 705',
        credits: 1,
        department: 'Final',
      ),
      SubjectModel(
        id: 'fin706',
        name: 'Professional Development',
        code: 'FIN 706',
        credits: 2,
        department: 'Final',
      ),
    ],
  };

  static List<SubjectModel> getSubjectsByType(String type) {
    return subjectsByType[type] ?? [];
  }

  static List<String> getSubjectTypes() {
    return subjectsByType.keys.toList();
  }

  static Map<String, String> getTypeNames() {
    return {
      'foundation': 'Foundation Semester',
      'core': 'Core & Data Semester',
      'intelligent': 'Intelligent Systems',
      'advanced': 'Advanced Topics',
      'specialization': 'Specialization',
      'capstone': 'Capstone Prep',
      'final': 'Final Project',
    };
  }
}