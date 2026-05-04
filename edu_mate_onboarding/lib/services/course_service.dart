import '../core/network/api_client.dart';
import '../shared/models/course_model.dart';

class CourseService {
  final ApiClient _apiClient;

  CourseService(this._apiClient);


  Future<List<SavedCourse>> getSavedCourses() async {
    final response = await _apiClient.get('/courses/saved/me');
    final List data = response as List;
    return data.map((json) => SavedCourse.fromJson(json)).toList();
  }

  Future<SavedCourse> saveCourse({
    String? externalId,
    required String title,
    required String provider,
    required String category,
    required String difficulty,
    required String duration,
    String? description,
    String? imageUrl,
    String? courseUrl,
    int progress = 0,
    bool enrolled = true,
  }) async {
    final body = {
      if (externalId != null) 'external_id': externalId,
      'title': title,
      'provider': provider,
      'category': category,
      'difficulty': difficulty,
      'duration': duration,
      'description': description ?? '',
      'image_url': imageUrl ?? '',
      'course_url': courseUrl ?? '',
      'progress': progress,
      'enrolled': enrolled,
    };
    final response = await _apiClient.post('/courses/saved/me', data: body);
    return SavedCourse.fromJson(response);
  }


  Future<void> deleteSavedCourse(int savedCourseId) async {
    await _apiClient.delete('/courses/saved/me/$savedCourseId');
  }
}

class SavedCourse {
  final int id;
  final String? externalId;
  final String title;
  final String? provider;
  final String? category;
  final String? difficulty;
  final String? duration;
  final int progress;
  final bool enrolled;
  final String? description;
  final String? imageUrl;
  final String? courseUrl;

  SavedCourse({
    required this.id,
    this.externalId,
    required this.title,
    this.provider,
    this.category,
    this.difficulty,
    this.duration,
    required this.progress,
    required this.enrolled,
    this.description,
    this.imageUrl,
    this.courseUrl,
  });

  factory SavedCourse.fromJson(Map<String, dynamic> json) {
    return SavedCourse(
      id: json['id'] ?? 0,
      externalId: json['external_id']?.toString(),
      title: json['title'] ?? '',
      provider: json['provider'],
      category: json['category'],
      difficulty: json['difficulty'],
      duration: json['duration'],
      progress: json['progress'] ?? 0,
      enrolled: json['enrolled'] ?? false,
      description: json['description'],
      imageUrl: json['image_url'],
      courseUrl: json['course_url'],
    );
  }
}