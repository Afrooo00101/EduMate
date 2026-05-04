// lib/shared/models/user_model.dart
class UserModel {
  final int id;
  final String name;
  final String email;
  final String token;
  final String? studentCode;
  final int? graduationYear;
  final String? skillsSummary;
  final String? profileImageUrl;
  final int? majorId;
  final Map<String, dynamic>? major;
  final double? gpa;
  final DateTime? lastLogin;
  final bool isActive;
  final bool isAdmin;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.token,
    this.studentCode,
    this.graduationYear,
    this.skillsSummary,
    this.profileImageUrl,
    this.majorId,
    this.major,
    this.gpa,
    this.lastLogin,
    this.isActive = true,
    this.isAdmin = false,
  });

  // من تسجيل الدخول (access_token + student object)
  factory UserModel.fromJson(Map<String, dynamic> json) {
    final student = json['student'];
    return UserModel(
      id: student['id'] ?? 0,
      name: student['full_name'] ?? '',
      email: student['email'] ?? '',
      token: json['access_token'] ?? '',
      studentCode: student['student_code'],
      graduationYear: student['graduation_year'],
      skillsSummary: student['skills_summary'],
      profileImageUrl: student['profile_image_url'],
      majorId: student['major_id'],
      major: student['major'],
      gpa: (student['gpa'] ?? 0.0).toDouble(),
      lastLogin: student['last_login'] != null ? DateTime.tryParse(student['last_login']) : null,
      isActive: student['is_active'] ?? true,
      isAdmin: student['is_admin'] ?? false,
    );
  }

  // من /users/me
  factory UserModel.fromMe(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      name: json['full_name'] ?? '',
      email: json['email'] ?? '',
      token: '',
      studentCode: json['student_code'],
      graduationYear: json['graduation_year'],
      skillsSummary: json['skills_summary'],
      profileImageUrl: json['profile_image_url'],
      majorId: json['major_id'],
      major: json['major'],
      gpa: (json['gpa'] ?? 0.0).toDouble(),
      lastLogin: json['last_login'] != null ? DateTime.tryParse(json['last_login']) : null,
      isActive: json['is_active'] ?? true,
      isAdmin: json['is_admin'] ?? false,
    );
  }

  UserModel copyWith({
    int? id,
    String? name,
    String? email,
    String? token,
    String? studentCode,
    int? graduationYear,
    String? skillsSummary,
    String? profileImageUrl,
    int? majorId,
    Map<String, dynamic>? major,
    double? gpa,
    DateTime? lastLogin,
    bool? isActive,
    bool? isAdmin,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      token: token ?? this.token,
      studentCode: studentCode ?? this.studentCode,
      graduationYear: graduationYear ?? this.graduationYear,
      skillsSummary: skillsSummary ?? this.skillsSummary,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
      majorId: majorId ?? this.majorId,
      major: major ?? this.major,
      gpa: gpa ?? this.gpa,
      lastLogin: lastLogin ?? this.lastLogin,
      isActive: isActive ?? this.isActive,
      isAdmin: isAdmin ?? this.isAdmin,
    );
  }
}