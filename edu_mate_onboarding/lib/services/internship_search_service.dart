import 'dart:convert';
import 'package:http/http.dart' as http;

class InternshipSearchService {
  static const String _apiKey = 'AIzaSyDzgj4pFPecvaeqxJNMLxWu1iKJrO79sgs';
  static const String _cx = '952a53415707d42ae';
  static const int resultsPerPage = 10;

  Future<InternshipSearchResult> searchInternships(String query, {int page = 1}) async {
    final startIndex = (page - 1) * resultsPerPage + 1;

    final searchQuery = '$query (internship OR trainee OR "entry level") -site:pinterest.* -site:amazon.*';

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
          throw Exception(data['error']['message'] ?? 'Search error');
        }

        final items = data['items'] as List? ?? [];
        final totalResults =
            int.tryParse(data['searchInformation']?['totalResults']?.toString() ?? '0') ?? 0;

        final internships = items.map((item) {
          String clean(String? s) =>
              (s ?? '').toString().replaceAll(RegExp(r'<[^>]*>'), '');

          return InternshipResult(
            title: clean(item['title']),
            description: clean(item['snippet']),
            applyUrl: item['link']?.toString() ?? '',
            company: _extractCompany(clean(item['title'])),
          );
        }).toList();

        return InternshipSearchResult(internships: internships, totalResults: totalResults);
      } else if (response.statusCode == 403) {
        throw Exception('Daily search limit reached or Access Denied. Please try again later.');
      } else {
        throw Exception('Failed to load results (${response.statusCode})');
      }
    } catch (e) {
      rethrow;
    }
  }

  static String _extractCompany(String title) {
    if (title.contains(' at ')) return title.split(' at ').last.trim();
    if (title.contains(' - ')) return title.split(' - ').last.trim();
    return 'Company';
  }
}

class InternshipResult {
  final String title;
  final String description;
  final String applyUrl;
  final String company;
  InternshipResult({required this.title, required this.description, required this.applyUrl, required this.company});
}

class InternshipSearchResult {
  final List<InternshipResult> internships;
  final int totalResults;
  InternshipSearchResult({required this.internships, required this.totalResults});
}
