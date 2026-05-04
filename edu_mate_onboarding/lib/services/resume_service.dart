import 'dart:convert';
import '../core/network/api_client.dart';

class ResumeService {
  final ApiClient _apiClient;

  ResumeService(this._apiClient);

  Future<ResumeProfile> getProfile() async {
    final response = await _apiClient.get('/resume/profile/me');
    return ResumeProfile.fromJson(response);
  }

  Future<ResumeProfile> saveProfile(ResumeProfile profile) async {
    final response = await _apiClient.put('/resume/profile/me', data: profile.toJson());
    return ResumeProfile.fromJson(response);
  }

  Future<String> getPreviewHtml(ResumeProfile profile, String templateName) async {
    final response = await _apiClient.post('/resume/preview', data: {
      ...profile.toJson(),
      'template_name': templateName,
    });
    return response['html'] ?? '';
  }

  Future<Map<String, dynamic>> checkATS(ResumeProfile profile) async {
    final response = await _apiClient.post('/resume/ats-check', data: profile.toJson());
    return response;
  }

  Future<List<String>> getTemplates() async {
    final response = await _apiClient.get('/resume/templates');
    return (response['templates'] as List).cast<String>();
  }
}

class ResumeProfile {
  String? fullName;
  String? title;
  String? email;
  String? phone;
  String? location;
  String? linkedin;
  String? github;
  String? skills;
  String? summary;
  List<Education> education;
  List<Experience> experience;
  List<Project> projects;
  String? templateName;

  ResumeProfile({
    this.fullName,
    this.title,
    this.email,
    this.phone,
    this.location,
    this.linkedin,
    this.github,
    this.skills,
    this.summary,
    this.education = const [],
    this.experience = const [],
    this.projects = const [],
    this.templateName = 'modern',
  });

  Map<String, dynamic> toJson() => {
    'full_name': fullName,
    'title': title,
    'email': email,
    'phone': phone,
    'location': location,
    'linkedin': linkedin,
    'github': github,
    'skills': skills,
    'summary': summary,
    'template_name': templateName,
    'education_json': jsonEncode(education.map((e) => e.toJson()).toList()),
    'experience_json': jsonEncode(experience.map((e) => e.toJson()).toList()),
    'projects_json': jsonEncode(projects.map((p) => p.toJson()).toList()),
  };

  factory ResumeProfile.fromJson(Map<String, dynamic> json) {
    return ResumeProfile(
      fullName: json['full_name'],
      title: json['title'],
      email: json['email'],
      phone: json['phone'],
      location: json['location'],
      linkedin: json['linkedin'],
      github: json['github'],
      skills: json['skills'],
      summary: json['summary'],
      education: _parseEducationList(json['education_json']),
      experience: _parseExperienceList(json['experience_json']),
      projects: _parseProjectList(json['projects_json']),
      templateName: json['template_name'],
    );
  }

  static List<Education> _parseEducationList(String? jsonStr) {
    if (jsonStr == null || jsonStr.isEmpty) return [];
    try {
      final List<dynamic> list = jsonDecode(jsonStr);
      return list.map((e) => Education.fromJson(e)).toList();
    } catch (e) {
      return [];
    }
  }

  static List<Experience> _parseExperienceList(String? jsonStr) {
    if (jsonStr == null || jsonStr.isEmpty) return [];
    try {
      final List<dynamic> list = jsonDecode(jsonStr);
      return list.map((e) => Experience.fromJson(e)).toList();
    } catch (e) {
      return [];
    }
  }

  static List<Project> _parseProjectList(String? jsonStr) {
    if (jsonStr == null || jsonStr.isEmpty) return [];
    try {
      final List<dynamic> list = jsonDecode(jsonStr);
      return list.map((p) => Project.fromJson(p)).toList();
    } catch (e) {
      return [];
    }
  }
}

class Education {
  String degree;
  String school;
  String year;
  Education({required this.degree, required this.school, required this.year});
  Map<String, dynamic> toJson() => {'degree': degree, 'school': school, 'year': year};
  factory Education.fromJson(Map<String, dynamic> json) => Education(degree: json['degree'], school: json['school'], year: json['year']);
}

class Experience {
  String title;
  String company;
  String dates;
  String desc;
  Experience({required this.title, required this.company, required this.dates, required this.desc});
  Map<String, dynamic> toJson() => {'title': title, 'company': company, 'dates': dates, 'desc': desc};
  factory Experience.fromJson(Map<String, dynamic> json) => Experience(title: json['title'], company: json['company'], dates: json['dates'], desc: json['desc']);
}

class Project {
  String name;
  String tech;
  String desc;
  Project({required this.name, required this.tech, required this.desc});
  Map<String, dynamic> toJson() => {'name': name, 'tech': tech, 'desc': desc};
  factory Project.fromJson(Map<String, dynamic> json) => Project(name: json['name'], tech: json['tech'], desc: json['desc']);
}