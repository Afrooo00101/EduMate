// lib/models/course_model.dart
// Needed for Color usage
import 'package:flutter/material.dart';

class CourseModel {
  final String id;
  final String title;
  final String provider;
  final String category;
  final String difficulty;
  final String duration;
  final double rating;
  final int students;
  final String image;
   bool isEnrolled;
  double? progress;
   String description;
  final double? price;
  final String? language;
  final bool? certificate;

  CourseModel({
    required this.id,
    required this.title,
    required this.provider,
    required this.category,
    required this.difficulty,
    required this.duration,
    required this.rating,
    required this.students,
    required this.image,
    required this.isEnrolled,
    this.progress,
    required this.description,
    this.price,
    this.language,
    this.certificate,
  });

  // Create a copy with updated fields
  CourseModel copyWith({
    String? id,
    String? title,
    String? provider,
    String? category,
    String? difficulty,
    String? duration,
    double? rating,
    int? students,
    String? image,
    bool? isEnrolled,
    double? progress,
    String? description,
    double? price,
    String? language,
    bool? certificate,
  }) {
    return CourseModel(
      id: id ?? this.id,
      title: title ?? this.title,
      provider: provider ?? this.provider,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      duration: duration ?? this.duration,
      rating: rating ?? this.rating,
      students: students ?? this.students,
      image: image ?? this.image,
      isEnrolled: isEnrolled ?? this.isEnrolled,
      progress: progress ?? this.progress,
      description: description ?? this.description,
      price: price ?? this.price,
      language: language ?? this.language,
      certificate: certificate ?? this.certificate,
    );
  }

  // Get difficulty color
  Color getDifficultyColor() {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return Colors.green;
      case 'intermediate':
        return Colors.orange;
      case 'advanced':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  // Get formatted price
  String getFormattedPrice() {
    if (price == null || price == 0) {
      return 'Free';
    }
    return '\$${price!.toStringAsFixed(2)}';
  }

  // Check if course is free
  bool get isFree => price == null || price == 0;

  // Get progress percentage
  int get progressPercentage => (progress ?? 0 * 100).toInt();

  // Format student count
  String get formattedStudents {
    if (students >= 1000000) {
      return '${(students / 1000000).toStringAsFixed(1)}M';
    } else if (students >= 1000) {
      return '${(students / 1000).toStringAsFixed(1)}K';
    }
    return students.toString();
  }

  // Create from JSON (for API responses)
  factory CourseModel.fromJson(Map<String, dynamic> json) {

    final title = json['title'] ?? json['name'] ?? '';
    final provider = json['provider'] ?? json['department'] ?? '';
    return CourseModel(
      id: json['id']?.toString() ?? '',
      title: title,
      provider: provider,
      category: json['category'] ?? '',
      difficulty: json['difficulty'] ?? 'beginner',
      duration: json['duration'] ?? '${json['credits'] ?? 3} credits',
      rating: (json['rating'] ?? 0.0).toDouble(),
      students: json['students'] ?? 0,
      image: json['image'] ?? json['image_url'] ?? '',
      isEnrolled: json['isEnrolled'] ?? false,
      progress: json['progress']?.toDouble(),
      description: json['description'] ?? '',
      price: json['price']?.toDouble(),
      language: json['language'],
      certificate: json['certificate'],
    );
  }

  // Convert to JSON (for storage)
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'provider': provider,
      'category': category,
      'difficulty': difficulty,
      'duration': duration,
      'rating': rating,
      'students': students,
      'image': image,
      'isEnrolled': isEnrolled,
      'progress': progress,
      'description': description,
      'price': price,
      'language': language,
      'certificate': certificate,
    };
  }

  // Create a list of mock courses for testing
  static List<CourseModel> getMockCourses() {
    return [
      CourseModel(
        id: '1',
        title: 'Flutter Development Bootcamp',
        provider: 'Google',
        category: 'Technology',
        difficulty: 'beginner',
        duration: '8 weeks',
        rating: 4.8,
        students: 12500,
        image: 'https://via.placeholder.com/300x150/7C4DFF/FFFFFF?text=Flutter',
        isEnrolled: true,
        progress: 0.65,
        description: 'Complete guide to building iOS and Android apps with Flutter. Learn Dart, widgets, state management, and publish your first app.',
        price: 99.99,
        language: 'English',
        certificate: true,
      ),
      CourseModel(
        id: '2',
        title: 'Data Science Fundamentals',
        provider: 'IBM',
        category: 'Data Science',
        difficulty: 'intermediate',
        duration: '12 weeks',
        rating: 4.7,
        students: 8300,
        image: 'https://via.placeholder.com/300x150/4DA6FF/FFFFFF?text=Data+Science',
        isEnrolled: true,
        progress: 0.30,
        description: 'Master Python, Pandas, NumPy, and Machine Learning basics. Hands-on projects with real datasets.',
        price: 149.99,
        language: 'English',
        certificate: true,
      ),
      CourseModel(
        id: '3',
        title: 'UI/UX Design Masterclass',
        provider: 'Google',
        category: 'Design',
        difficulty: 'beginner',
        duration: '6 weeks',
        rating: 4.9,
        students: 15200,
        image: 'https://via.placeholder.com/300x150/26D07C/FFFFFF?text=UI%2FUX',
        isEnrolled: true,
        progress: 0.15,
        description: 'Learn design thinking, Figma, user research, and prototyping. Build a complete portfolio project.',
        price: 79.99,
        language: 'English',
        certificate: true,
      ),
      CourseModel(
        id: '4',
        title: 'React Native Development',
        provider: 'Meta',
        category: 'Technology',
        difficulty: 'intermediate',
        duration: '10 weeks',
        rating: 4.6,
        students: 6700,
        image: 'https://via.placeholder.com/300x150/FF6B6B/FFFFFF?text=React+Native',
        isEnrolled: false,
        description: 'Build cross-platform mobile apps with React Native. Learn hooks, navigation, and state management.',
        price: 119.99,
        language: 'English',
        certificate: true,
      ),
      CourseModel(
        id: '5',
        title: 'Business Analytics',
        provider: 'Wharton',
        category: 'Business',
        difficulty: 'intermediate',
        duration: '8 weeks',
        rating: 4.5,
        students: 4200,
        image: 'https://via.placeholder.com/300x150/FFA500/FFFFFF?text=Business',
        isEnrolled: false,
        description: 'Data-driven decision making for business. Learn Excel, SQL, Tableau, and business strategy.',
        price: 199.99,
        language: 'English',
        certificate: true,
      ),
      CourseModel(
        id: '6',
        title: 'Machine Learning Specialization',
        provider: 'Stanford',
        category: 'Data Science',
        difficulty: 'advanced',
        duration: '16 weeks',
        rating: 4.9,
        students: 21000,
        image: 'https://via.placeholder.com/300x150/FF4D4D/FFFFFF?text=ML',
        isEnrolled: false,
        description: 'Advanced machine learning algorithms, neural networks, deep learning, and AI applications.',
        price: 299.99,
        language: 'English',
        certificate: true,
      ),
      CourseModel(
        id: '7',
        title: 'Communication Skills',
        provider: 'Yale',
        category: 'Soft Skills',
        difficulty: 'beginner',
        duration: '4 weeks',
        rating: 4.7,
        students: 8900,
        image: 'https://via.placeholder.com/300x150/00BFFF/FFFFFF?text=Communication',
        isEnrolled: false,
        description: 'Master professional communication, public speaking, presentation skills, and interpersonal skills.',
        price: 49.99,
        language: 'English',
        certificate: true,
      ),
    ];
  }
}

