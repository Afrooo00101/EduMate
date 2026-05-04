import 'dart:convert';
import 'package:http/http.dart' as http;

class CourseSearchService {
  static const String _apiKey = 'AIzaSyBkyGUHoOohj6VSZYbRLUa4mysfRgV5FTY';
  static const String _cx = 'c77318ddf11b04d7d';
  static const int resultsPerPage = 9;

  Future<CourseSearchResult> searchCourses(String query, {int page = 1}) async {
    final startIndex = (page - 1) * resultsPerPage + 1;

    final searchQuery =
        '"$query" course OR tutorial OR certification OR "online learning" -forum -discussion -answers -quora -pinterest -amazon -site:amazon.* -site:pinterest.*';

    final uri = Uri.https('www.googleapis.com', '/customsearch/v1', {
      'q': searchQuery,
      'key': _apiKey,
      'cx': _cx,
      'start': startIndex.toString(),
    });

    try {
      final response = await http.get(uri);
      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        if (data['error'] != null) {
          throw Exception(data['error']['message'] ?? 'Google API error');
        }

        final items = data['items'] as List? ?? [];
        final searchInfo = data['searchInformation'] as Map<String, dynamic>?;
        final totalResults = int.tryParse(
            searchInfo?['totalResults']?.toString() ?? '0') ??
            0;

        final courses = items.map((item) {
          final title = (item['title'] ?? 'No title').toString();
          final snippet = (item['snippet'] ?? '').toString();
          final link = (item['link'] ?? '').toString();

          String? imageUrl;
          final pagemap = item['pagemap'];
          if (pagemap != null && pagemap is Map) {
            final cseThumbnail = pagemap['cse_thumbnail'];
            if (cseThumbnail != null && cseThumbnail is List && cseThumbnail.isNotEmpty) {
              imageUrl = cseThumbnail[0]['src']?.toString();
            }
          }

          final platform = _extractPlatform(link, title);

          return ExternalCourse.fromSearchResult(
            title: title,
            provider: platform,
            description: snippet,
            externalUrl: link,
            imageUrl: imageUrl ?? '',
            category: platform,
          );
        }).toList();

        return CourseSearchResult(
          courses: courses,
          totalResults: totalResults,
        );
      } else if (response.statusCode == 403) {
        throw Exception('Daily search limit reached. Please try again in 24 hours or use a different API key.');
      } else {
        throw Exception('Failed to load courses (${response.statusCode}): ${data['error']?['message'] ?? 'Unknown error'}');
      }
    } catch (e) {
      throw Exception('Search failed: $e');
    }
  }

  static String _extractPlatform(String url, String title) {
    final lowerUrl = url.toLowerCase();
    if (lowerUrl.contains('coursera.org')) return 'Coursera';
    if (lowerUrl.contains('udemy.com')) return 'Udemy';
    if (lowerUrl.contains('edx.org')) return 'edX';
    if (lowerUrl.contains('udacity.com')) return 'Udacity';
    if (lowerUrl.contains('khanacademy.org')) return 'Khan Academy';
    if (lowerUrl.contains('youtube.com')) return 'YouTube';
    return 'Online Course';
  }
}

class CourseSearchResult {
  final List<ExternalCourse> courses;
  final int totalResults;
  CourseSearchResult({required this.courses, required this.totalResults});
}

class ExternalCourse {
  final String id;
  final String title;
  final String provider;
  final String category;
  final String difficulty;
  final String duration;
  final String description;
  final String imageUrl;
  final String externalUrl;
  bool isEnrolled;
  double progress;

  ExternalCourse({
    this.id = '',
    required this.title,
    this.provider = '',
    this.category = 'Other',
    this.difficulty = 'beginner',
    this.duration = '',
    this.description = '',
    this.imageUrl = '',
    this.externalUrl = '',
    this.isEnrolled = false,
    this.progress = 0,
  });

  factory ExternalCourse.fromSearchResult({
    required String title,
    required String provider,
    required String description,
    required String externalUrl,
    required String imageUrl,
    required String category,
  }) {
    return ExternalCourse(
      title: title,
      provider: provider,
      description: description,
      externalUrl: externalUrl,
      imageUrl: imageUrl,
      category: category,
    );
  }
}
