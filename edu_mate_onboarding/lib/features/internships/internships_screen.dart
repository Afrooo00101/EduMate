import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/theme.dart';
import '../../core/network/api_client.dart';
import '../../services/internship_service.dart';
import '../../services/internship_search_service.dart';
import '../../shared/models/internship_model.dart';
import '../auth/auth_provider.dart';

class InternshipsScreen extends StatefulWidget {
  const InternshipsScreen({super.key});

  @override
  State<InternshipsScreen> createState() => _InternshipsScreenState();
}

class _InternshipsScreenState extends State<InternshipsScreen> {
  final InternshipSearchService _searchService = InternshipSearchService();
  late final ApiClient _apiClient;
  late final InternshipService _internshipService;

  final TextEditingController _searchController = TextEditingController();
  String _currentQuery = '';
  int _currentPage = 1;
  List<InternshipResult> _searchResults = [];
  int _totalResults = 0;
  bool _isSearching = false;
  String? _searchError;
  String _selectedCategory = 'All';

  List<SavedInternshipModel> _savedInternships = [];
  bool _isLoadingSaved = true;
  bool _showingSavedOnly = false;

  @override
  void initState() {
    super.initState();
    final token = context.read<UserProvider>().user?.token ?? '';
    _apiClient = ApiClient(token: token);
    _internshipService = InternshipService(_apiClient);
    _loadSavedInternships();
  }

  Future<void> _loadSavedInternships() async {
    setState(() => _isLoadingSaved = true);
    try {
      _savedInternships = await _internshipService.fetchSavedInternships();
    } catch (_) {
      _savedInternships = [];
    }
    setState(() => _isLoadingSaved = false);
  }

  Future<void> _executeSearch({int page = 1}) async {
    final query = _searchController.text.trim();
    if (query.isEmpty && _selectedCategory == 'All') {
      setState(() {
        _currentQuery = '';
        _searchResults.clear();
        _searchError = null;
      });
      return;
    }

    final fullQuery = _selectedCategory == 'All' ? query : '$_selectedCategory $query';

    setState(() {
      _isSearching = true;
      _currentQuery = query;
      _currentPage = page;
      _searchError = null;
    });

    try {
      final result = await _searchService.searchInternships(fullQuery, page: page);
      setState(() {
        _searchResults = result.internships;
        _totalResults = result.totalResults;
      });
    } catch (e) {
      setState(() {
        _searchError = e.toString().replaceFirst('Exception: ', '');
        _searchResults = [];
        _totalResults = 0;
      });
    } finally {
      if (mounted) {
        setState(() => _isSearching = false);
      }
    }
  }

  void _onCategoryChanged(String cat) {
    setState(() {
      _selectedCategory = cat;
      _showingSavedOnly = false;
    });
    _executeSearch();
  }

  void _toggleSavedOnly() {
    setState(() {
      _showingSavedOnly = !_showingSavedOnly;
      if (_showingSavedOnly) {
        _searchController.clear();
        _currentQuery = '';
        _searchResults.clear();
      }
    });
  }

  Future<void> _toggleSaveInternship(InternshipResult internship) async {
    try {
      final existing = _savedInternships.where(
              (s) => s.applyUrl == internship.applyUrl || s.title == internship.title).toList();

      if (existing.isNotEmpty) {
        for (final s in existing) {
          await _internshipService.deleteSavedInternship(s.id);
        }
        setState(() {
          _savedInternships.removeWhere((s) => existing.contains(s));
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: const Text('Removed from saved'), backgroundColor: EdumateColors.warning),
          );
        }
      } else {
        await _internshipService.saveInternship(
          internshipId: 0,
          title: internship.title,
          companyName: internship.company,
          positionCode: _selectedCategory,
          matchScore: 0,
          matchReason: internship.description,
          applyUrl: internship.applyUrl,
        );
        await _loadSavedInternships();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: const Text('Saved successfully'), backgroundColor: EdumateColors.success),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save: $e'), backgroundColor: EdumateColors.error),
        );
      }
    }
  }

  bool _isSaved(InternshipResult internship) {
    return _savedInternships.any((s) => s.applyUrl == internship.applyUrl || s.title == internship.title);
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
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

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        centerTitle: true,
        title: Text('Internships', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: EdumateColors.primary, size: 20),
          onPressed: () => Navigator.maybePop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(_showingSavedOnly ? Icons.bookmark : Icons.bookmark_border, color: textColor),
            onPressed: _toggleSavedOnly,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: ['All', 'Software', 'Data', 'Marketing', 'Design', 'HR', 'Sales'].map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(cat, style: TextStyle(color: isSelected ? Colors.white : textColor, fontSize: 12)),
                    selected: isSelected,
                    onSelected: (_) => _onCategoryChanged(cat),
                    selectedColor: EdumateColors.primary,
                    backgroundColor: cardColor,
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              style: TextStyle(color: textColor),
              decoration: InputDecoration(
                hintText: 'Search internships...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(icon: const Icon(Icons.clear), onPressed: () {
                   _searchController.clear();
                   setState(() {
                     _currentQuery = '';
                     _searchResults.clear();
                   });
                }),
                filled: true,
                fillColor: cardColor,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
              onSubmitted: (_) => _executeSearch(),
            ),
          ),
          Expanded(
            child: _isLoadingSaved || _isSearching
                ? const Center(child: CircularProgressIndicator())
                : _showingSavedOnly
                    ? _buildSavedList(cardColor, textColor, secondaryTextColor)
                    : _buildSearchResults(textColor, secondaryTextColor, cardColor),
          ),
        ],
      ),
    );
  }

  Widget _buildSavedList(Color cardColor, Color textColor, Color secondaryTextColor) {
    if (_savedInternships.isEmpty) {
      return Center(child: Text('No saved internships', style: TextStyle(color: secondaryTextColor)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _savedInternships.length,
      itemBuilder: (_, i) {
        final item = _savedInternships[i];
        return Card(
          color: cardColor,
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            title: Text(item.title, style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
            subtitle: Text(item.companyName, style: TextStyle(color: secondaryTextColor)),
            trailing: const Icon(Icons.chevron_right),
            onTap: item.applyUrl != null ? () => _launchURL(item.applyUrl!) : null,
          ),
        );
      },
    );
  }

  Widget _buildSearchResults(Color textColor, Color secondaryTextColor, Color cardColor) {
    if (_searchResults.isEmpty && _currentQuery.isEmpty && _selectedCategory == 'All') {
      return Center(child: Text('Start searching for internships', style: TextStyle(color: secondaryTextColor)));
    }
    if (_searchResults.isEmpty && !_isSearching) {
      return Center(child: Text(_searchError ?? 'No results found', style: TextStyle(color: secondaryTextColor)));
    }

    final totalPages = (_totalResults / InternshipSearchService.resultsPerPage).ceil();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Found $_totalResults results', style: TextStyle(color: secondaryTextColor, fontSize: 12)),
              Text('Page $_currentPage of $totalPages', style: TextStyle(color: secondaryTextColor, fontSize: 12)),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _searchResults.length,
            itemBuilder: (_, i) {
              final item = _searchResults[i];
              final saved = _isSaved(item);
              return Card(
                color: cardColor,
                margin: const EdgeInsets.only(bottom: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(child: Text(item.title, style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 15), maxLines: 2, overflow: TextOverflow.ellipsis)),
                          IconButton(icon: Icon(saved ? Icons.bookmark : Icons.bookmark_border, color: saved ? EdumateColors.primary : secondaryTextColor), onPressed: () => _toggleSaveInternship(item)),
                        ],
                      ),
                      Text(item.company, style: const TextStyle(color: EdumateColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
                      const SizedBox(height: 8),
                      Text(item.description, style: TextStyle(color: secondaryTextColor, fontSize: 12), maxLines: 3, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _launchURL(item.applyUrl),
                          style: ElevatedButton.styleFrom(backgroundColor: EdumateColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                          child: const Text('Apply Now', style: TextStyle(color: Colors.white)),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        if (totalPages > 1)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(icon: const Icon(Icons.arrow_back_ios, size: 16), onPressed: _currentPage > 1 ? () => _executeSearch(page: _currentPage - 1) : null),
                Text('$_currentPage / $totalPages', style: TextStyle(color: textColor)),
                IconButton(icon: const Icon(Icons.arrow_forward_ios, size: 16), onPressed: _currentPage < totalPages ? () => _executeSearch(page: _currentPage + 1) : null),
              ],
            ),
          ),
      ],
    );
  }
}
