import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/theme.dart';
import '../../core/network/api_client.dart';
import '../../services/course_service.dart';
import '../../services/course_search_service.dart';
import '../auth/auth_provider.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  final CourseSearchService _searchService = CourseSearchService();
  late final ApiClient _apiClient;
  late final CourseService _courseService;

  List<SavedCourse> _savedCourses = [];
  bool _isLoadingSaved = true;

  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  String _currentQuery = '';
  int _currentPage = 1;
  List<ExternalCourse> _searchResults = [];
  int _totalResults = 0;
  String? _errorMessage;

  bool _showingSavedOnly = false;

  @override
  void initState() {
    super.initState();
    final token = context.read<UserProvider>().user?.token ?? '';
    _apiClient = ApiClient(token: token);
    _courseService = CourseService(_apiClient);
    _loadSavedCourses();
  }

  Future<void> _loadSavedCourses() async {
    setState(() => _isLoadingSaved = true);
    try {
      _savedCourses = await _courseService.getSavedCourses();
    } catch (_) {
      _savedCourses = [];
    }
    setState(() => _isLoadingSaved = false);
  }

  Future<void> _executeSearch({int page = 1}) async {
    final query = _searchController.text.trim();
    if (query.isEmpty) {
      setState(() {
        _currentQuery = '';
        _searchResults.clear();
        _errorMessage = null;
      });
      return;
    }

    if (query != _currentQuery) page = 1;

    setState(() {
      _isSearching = true;
      _currentQuery = query;
      _currentPage = page;
      _errorMessage = null;
    });

    try {
      final result = await _searchService.searchCourses(query, page: page);
      setState(() {
        _searchResults = result.courses;
        _totalResults = result.totalResults;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _searchResults = [];
        _totalResults = 0;
      });
    } finally {
      if (mounted) {
        setState(() => _isSearching = false);
      }
    }
  }

  void _handleSearchSubmitted(String value) {
    _executeSearch();
  }

  void _goToPage(int page) {
    _executeSearch(page: page);
  }

  Future<void> _enrollCourse(ExternalCourse course) async {
    try {
      await _courseService.saveCourse(
        externalId: course.id.isNotEmpty ? course.id : null,
        title: course.title,
        provider: course.provider,
        category: course.category,
        difficulty: course.difficulty,
        duration: course.duration,
        description: course.description,
        imageUrl: course.imageUrl,
        courseUrl: course.externalUrl,
        progress: 0,
        enrolled: true,
      );
      setState(() {
        course.isEnrolled = true;
      });
      await _loadSavedCourses();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('✓ Enrolled in "${course.title}"'), backgroundColor: EdumateColors.success),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to enroll: $e'), backgroundColor: EdumateColors.error),
        );
      }
    }
  }

  Future<void> _toggleSaveCourse(ExternalCourse course) async {
    final existing = _savedCourses.where((s) =>
    (s.courseUrl != null && s.courseUrl == course.externalUrl) ||
        s.title == course.title).toList();

    if (existing.isNotEmpty) {
      try {
        for (final s in existing) {
          await _courseService.deleteSavedCourse(s.id);
        }
        setState(() {
          _savedCourses.removeWhere((s) => existing.contains(s));
          course.isEnrolled = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Removed "${course.title}"'), backgroundColor: EdumateColors.warning),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to remove: $e'), backgroundColor: EdumateColors.error),
          );
        }
      }
    } else {
      await _enrollCourse(course);
    }
  }

  void _showCourseDetails(ExternalCourse course) {
    final alreadySaved = _savedCourses.any((s) =>
    (s.courseUrl != null && s.courseUrl == course.externalUrl) ||
        s.title == course.title);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).brightness == Brightness.dark ? Colors.grey[900] : Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey[400], borderRadius: BorderRadius.circular(4)),
                ),
              ),
              const SizedBox(height: 16),
              Text(course.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              if (course.provider.isNotEmpty) Text('Provider: ${course.provider}'),
              if (course.description.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(course.description),
                ),
              const SizedBox(height: 16),
              Row(
                children: [
                  if (!alreadySaved && !course.isEnrolled)
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _enrollCourse(course);
                        },
                        icon: const Icon(Icons.bookmark_add),
                        label: const Text('Save'),
                      ),
                    ),
                  if (course.externalUrl.isNotEmpty) ...[
                    if (!alreadySaved && !course.isEnrolled) const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _launchURL(course.externalUrl),
                        icon: const Icon(Icons.open_in_new),
                        label: const Text('Open Link'),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  void _showSavedCourseDetails(SavedCourse saved) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(saved.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            if (saved.provider != null) Text('Provider: ${saved.provider}'),
            if (saved.courseUrl != null && saved.courseUrl!.isNotEmpty)
              ElevatedButton.icon(
                onPressed: () => _launchURL(saved.courseUrl!),
                icon: const Icon(Icons.open_in_new),
                label: const Text('Open Course Link'),
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _launchURL(String url) async {
    final Uri uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
    final secondaryTextColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;
    final cardColor = isDark ? EdumateColors.darkCard : EdumateColors.lightCard;
    final bgColor = isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground;

    final bool showSearchResults = _currentQuery.isNotEmpty;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: Text('Courses', style: TextStyle(color: textColor, fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            icon: Icon(_showingSavedOnly ? Icons.bookmark : Icons.bookmark_border, color: textColor),
            onPressed: () {
              setState(() {
                _showingSavedOnly = !_showingSavedOnly;
                if (_showingSavedOnly) {
                  _searchController.clear();
                  _currentQuery = '';
                  _searchResults.clear();
                }
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              style: TextStyle(color: textColor),
              decoration: InputDecoration(
                hintText: 'Search courses...',
                hintStyle: TextStyle(color: secondaryTextColor),
                prefixIcon: Icon(Icons.search, color: secondaryTextColor),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                  icon: Icon(Icons.clear, color: secondaryTextColor),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {
                      _currentQuery = '';
                      _searchResults.clear();
                    });
                  },
                )
                    : null,
                filled: true,
                fillColor: cardColor,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
              onSubmitted: _handleSearchSubmitted,
            ),
          ),
          Expanded(
            child: _isLoadingSaved
                ? const Center(child: CircularProgressIndicator())
                : _buildContent(textColor, secondaryTextColor, cardColor, showSearchResults),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(Color textColor, Color secondaryTextColor, Color cardColor, bool showSearchResults) {
    if (_showingSavedOnly) {
      return _buildSavedCoursesList(cardColor, textColor, secondaryTextColor);
    }
    if (showSearchResults) {
      return _buildSearchResults(textColor, secondaryTextColor, cardColor);
    }
    return _buildSavedCoursesList(cardColor, textColor, secondaryTextColor);
  }

  Widget _buildSavedCoursesList(Color cardColor, Color textColor, Color secondaryTextColor) {
    if (_savedCourses.isEmpty) {
      return Center(child: Text('No saved courses yet.', style: TextStyle(color: secondaryTextColor)));
    }
    return RefreshIndicator(
      onRefresh: _loadSavedCourses,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _savedCourses.length,
        itemBuilder: (context, index) {
          final saved = _savedCourses[index];
          return Card(
            color: cardColor,
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              title: Text(saved.title, style: TextStyle(color: textColor)),
              subtitle: Text(saved.provider ?? '', style: TextStyle(color: secondaryTextColor)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _showSavedCourseDetails(saved),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSearchResults(Color textColor, Color secondaryTextColor, Color cardColor) {
    if (_isSearching && _searchResults.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (!_isSearching && _searchResults.isEmpty && _currentQuery.isNotEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            if (_errorMessage != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(_errorMessage!, textAlign: TextAlign.center, style: TextStyle(color: secondaryTextColor)),
              )
            else
              Text('No courses found for "$_currentQuery"', style: TextStyle(color: secondaryTextColor)),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => _executeSearch(page: _currentPage),
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    final totalPages = (_totalResults / CourseSearchService.resultsPerPage).ceil();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text('Found $_totalResults results (Page $_currentPage of $totalPages)', style: TextStyle(color: secondaryTextColor, fontSize: 13)),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.62,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: _searchResults.length,
            itemBuilder: (context, index) {
              final course = _searchResults[index];
              final alreadySaved = _savedCourses.any((s) => (s.courseUrl != null && s.courseUrl == course.externalUrl) || s.title == course.title);

              return Card(
                color: cardColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => _showCourseDetails(course),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (course.imageUrl.isNotEmpty)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.network(
                              course.imageUrl,
                              height: 80,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(height: 80, color: Colors.grey[300], child: const Icon(Icons.broken_image, color: Colors.grey)),
                            ),
                          ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: EdumateColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                          child: Text(course.provider.toUpperCase(), style: const TextStyle(color: EdumateColors.primary, fontSize: 10, fontWeight: FontWeight.w600)),
                        ),
                        const SizedBox(height: 8),
                        Text(course.title, style: TextStyle(fontWeight: FontWeight.w600, color: textColor, fontSize: 13), maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 4),
                        Text(course.description, style: TextStyle(color: secondaryTextColor, fontSize: 11), maxLines: 2, overflow: TextOverflow.ellipsis),
                        const Spacer(),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            IconButton(
                              icon: Icon(alreadySaved ? Icons.bookmark : Icons.bookmark_border, color: alreadySaved ? EdumateColors.primary : secondaryTextColor, size: 22),
                              onPressed: () => _toggleSaveCourse(course),
                              constraints: const BoxConstraints(),
                              padding: EdgeInsets.zero,
                            ),
                            if (course.externalUrl.isNotEmpty)
                              IconButton(
                                icon: const Icon(Icons.open_in_new, color: EdumateColors.primary, size: 20),
                                onPressed: () => _launchURL(course.externalUrl),
                                constraints: const BoxConstraints(),
                                padding: EdgeInsets.zero,
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
