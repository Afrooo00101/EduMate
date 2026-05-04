// lib/screens/planning_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../core/theme/theme.dart';
import '../../shared/models/semester_model.dart';
import '../../shared/widgets/semester_card.dart';
import '../../shared/widgets/gpa_calculator.dart';
import '../../shared/widgets/subject_modal.dart';
import '../../core/utils/responsive.dart';
import '../../core/network/api_client.dart';
import '../../services/planning_service.dart';
import '../auth/auth_provider.dart';

class PlanningScreen extends StatefulWidget {
  const PlanningScreen({super.key});

  @override
  State<PlanningScreen> createState() => _PlanningScreenState();
}

class _PlanningScreenState extends State<PlanningScreen> {
  List<SemesterModel> _semesters = [];
  bool _isLoading = true;
  final String _selectedCareer = 'Cyber Security';
  final int _totalRequiredCredits = 128;

  final Map<String, double> _gradePoints = {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0,
    'F': 0.0,
  };

  late final ApiClient _apiClient;
  late final PlanningService _planningService;

  @override
  void initState() {
    super.initState();
    final token = context.read<UserProvider>().user?.token ?? '';
    _apiClient = ApiClient(token: token);
    _planningService = PlanningService(_apiClient);
    _loadPlanningData();
  }

  Future<void> _loadPlanningData() async {
    setState(() => _isLoading = true);

    try {
      // محاولة تحميل بيانات state من الباك إند
      final state = await _planningService.getPlanningState();
      final semestersJson = state['semesters_json'] as String?;
      if (semestersJson != null && semestersJson.isNotEmpty) {
        final List<dynamic> decoded = jsonDecode(semestersJson);
        _semesters = decoded.map((s) => SemesterModel.fromJson(s)).toList();
        // حفظ نسخة محلية كاحتياط
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('planning_data', semestersJson);
      } else {
        // إذا لم توجد بيانات في الباك، نحمل من المحلي
        await _loadLocalData();
      }
    } catch (e) {
      // فشل الاتصال، تحميل من المحلي
      await _loadLocalData();
    }

    setState(() => _isLoading = false);
  }

  Future<void> _loadLocalData() async {
    final prefs = await SharedPreferences.getInstance();
    final savedData = prefs.getString('planning_data');
    if (savedData != null) {
      try {
        final List<dynamic> decoded = jsonDecode(savedData);
        _semesters = decoded.map((s) => SemesterModel.fromJson(s)).toList();
      } catch (e) {
        _initializeSampleData();
      }
    } else {
      _initializeSampleData();
    }
  }

  void _initializeSampleData() {
    // نفس البيانات الافتراضية السابقة
    _semesters = [
      SemesterModel(
        id: 'sem1',
        name: 'foundations',
        semesterNumber: 1,
        subjects: [
          SubjectModel(id: 's1c1', name: 'Intro to Programming', code: 'CS 101', credits: 4, department: 'Computer Science'),
          SubjectModel(id: 's1c2', name: 'Mathematics I', code: 'MATH 101', credits: 4, department: 'Mathematics'),
          SubjectModel(id: 's1c3', name: 'English I', code: 'ENG 101', credits: 3, department: 'English'),
        ],
      ),
      SemesterModel(
        id: 'sem2',
        name: 'core & data',
        semesterNumber: 2,
        subjects: [
          SubjectModel(id: 's2c1', name: 'Object Oriented Programming', code: 'CS 201', credits: 4, department: 'Computer Science'),
          SubjectModel(id: 's2c2', name: 'Data Structures', code: 'CS 202', credits: 4, department: 'Computer Science'),
          SubjectModel(id: 's2c3', name: 'Database Systems', code: 'CS 203', credits: 3, department: 'Computer Science'),
        ],
      ),
      SemesterModel(
        id: 'sem3',
        name: 'intelligent systems',
        semesterNumber: 3,
        subjects: [
          SubjectModel(id: 's3c1', name: 'Machine Learning', code: 'CS 301', credits: 4, department: 'Computer Science'),
          SubjectModel(id: 's3c2', name: 'Artificial Intelligence', code: 'CS 302', credits: 4, department: 'Computer Science'),
          SubjectModel(id: 's3c3', name: 'Neural Networks', code: 'CS 304', credits: 3, department: 'Computer Science'),
        ],
      ),
    ];
  }

  /// مزامنة البيانات مع الباك إند وحفظ نسخة محلية
  Future<void> _syncToBackend() async {
    final jsonData = jsonEncode(_semesters.map((s) => s.toJson()).toList());
    // حفظ محلي أولاً
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('planning_data', jsonData);

    // ثم حفظ على السيرفر
    try {
      await _planningService.savePlanningState({
        'career_path': _selectedCareer,
        'mode': 'semesters',
        'semesters_json': jsonData,
      });
    } catch (e) {
      // فشل الحفظ على السيرفر، البيانات بقيت محفوظة محلياً
      debugPrint('Failed to sync to backend: $e');
    }
  }

  void _onPlanningGradeUpdated(SubjectModel subject, double? grade) {
     _updateSubjectGrade(subject, grade);
  }

  void _addSemester() {
    showDialog(
      context: context,
      builder: (ctx) => SubjectModal(
        onSemesterCreated: (name, subjects) {
          final newSemester = SemesterModel(
            id: 'sem${_semesters.length + 1}',
            name: name,
            semesterNumber: _semesters.length + 1,
            subjects: subjects,
          );
          setState(() {
            _semesters.add(newSemester);
          });
          _syncToBackend();
          Navigator.pop(ctx);
        },
      ),
    );
  }

  void _addSubjectToSemester(SemesterModel semester) {
    showDialog(
      context: context,
      builder: (ctx) => SubjectModal(
        semester: semester,
        onSubjectAdded: (subject) {
          setState(() {
            semester.subjects.add(subject);
          });
          _syncToBackend();
          Navigator.pop(ctx);
        },
      ),
    );
  }

  void _deleteSubject(SemesterModel semester, SubjectModel subject) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Subject'),
        content: Text('Are you sure you want to delete "${subject.name}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              setState(() {
                semester.subjects.remove(subject);
              });
              _syncToBackend();
              Navigator.pop(ctx);
            },
            style: TextButton.styleFrom(foregroundColor: EdumateColors.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _updateSubjectGrade(SubjectModel subject, double? grade) {
    setState(() {
      subject.grade = grade;
    });
    _syncToBackend();
  }

  int _getTotalCredits() {
    return _semesters.fold(0, (sum, s) => sum + s.totalCredits);
  }

  int _getEarnedCredits() {
    int earned = 0;
    for (var semester in _semesters) {
      for (var subject in semester.subjects) {
        if (subject.grade != null && subject.grade! > 0) {
          earned += subject.credits;
        }
      }
    }
    return earned;
  }

  double _getOverallGPA() {
    double totalPoints = 0;
    int totalCredits = 0;

    for (var semester in _semesters) {
      for (var subject in semester.subjects) {
        if (subject.grade != null) {
          totalPoints += (subject.grade ?? 0.0) * subject.credits;
          totalCredits += subject.credits;
        }
      }
    }

    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
  }

  String _getEstimatedGraduation() {
    final now = DateTime.now();
    final remainingSemesters = 8 - _semesters.length;
    final graduationYear = now.year + (remainingSemesters ~/ 2) + 1;
    final month = now.month > 6 ? 'Dec' : 'May';
    return '$month \'${graduationYear.toString().substring(2)}';
  }

  @override
Widget build(BuildContext context) {
  final isDark = Theme.of(context).brightness == Brightness.dark;
  final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
  final secondaryTextColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;
  final cardColor = isDark ? EdumateColors.darkCard : EdumateColors.lightCard;

  final totalCredits = _getTotalCredits();
  final earnedCredits = _getEarnedCredits();
  final remainingCredits = _totalRequiredCredits - totalCredits;
  final overallGPA = _getOverallGPA();
  final progressPercent = totalCredits / _totalRequiredCredits;

  return Scaffold(
    backgroundColor: isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground,
    body: _isLoading
        ? Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(EdumateColors.primary),
                ),
                const SizedBox(height: 16),
                Text(
                  'Loading your academic plan...',
                  style: TextStyle(color: secondaryTextColor),
                ),
              ],
            ),
          )
        : SafeArea(
            child: ResponsiveBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  padding: Responsive.getResponsivePadding(context),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header with career path
                      Row(
                        children: [
                          GlassCard(
                            blur: 10,
                            opacity: 0.9,
                            borderRadius: 30,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Row(
                              children: [
                                const Icon(Icons.explore, color: EdumateColors.primary),
                                const SizedBox(width: 8),
                                if (!Responsive.isMobile(context))
                                  Text(
                                    'eduPath · planning ur path',
                                    style: TextStyle(
                                      color: textColor,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  )
                                else
                                  const Icon(Icons.menu, color: Colors.white70),
                              ],
                            ),
                          ),
                          const Spacer(),
                          GlassCard(
                            blur: 10,
                            opacity: 0.9,
                            borderRadius: 30,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            backgroundColor: const Color(0xFF1E293B),
                            child: Responsive.isMobile(context)
                                ? const Icon(Icons.route, color: Colors.white70)
                                : Row(
                                    children: [
                                      const Icon(Icons.route, color: Colors.white70, size: 14),
                                      const SizedBox(width: 8),
                                      const Text(
                                        'current path',
                                        style: TextStyle(color: Colors.white70, fontSize: 12),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFFACC15),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          '🛡️ $_selectedCareer',
                                          style: const TextStyle(
                                            color: Color(0xFF1E293B),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Stats Row - Responsive
                      ResponsiveRow(
                        spacing: 12,
                        children: [
                          _buildStatCard(
                            icon: Icons.book,
                            value: '$totalCredits',
                            label: 'total credits',
                            color: EdumateColors.primary,
                          ),
                          _buildStatCard(
                            icon: Icons.check_circle,
                            value: '$earnedCredits',
                            label: 'earned',
                            color: EdumateColors.success,
                          ),
                          _buildStatCard(
                            icon: Icons.timer,
                            value: '$remainingCredits',
                            label: 'to go',
                            color: EdumateColors.warning,
                          ),
                          _buildStatCard(
                            icon: Icons.star,
                            value: overallGPA.toStringAsFixed(1),
                            label: 'current GPA',
                            color: EdumateColors.info,
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Main planning grid - Responsive
                      if (Responsive.isMobile(context))
                        Column(
                          children: [
                            // Left side - Semesters (full width on mobile)
                            _buildSemestersSection(textColor),
                            const SizedBox(height: 20),
                            // Right panel - Career guidance (full width on mobile)
                            _buildRightPanel(
                              textColor,
                              secondaryTextColor,
                              cardColor,
                              totalCredits,
                              remainingCredits,
                              overallGPA,
                              progressPercent,
                            ),
                          ],
                        )
                      else
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Left side - Semesters
                            Expanded(
                              flex: 3,
                              child: _buildSemestersSection(textColor),
                            ),

                            const SizedBox(width: 20),

                            // Right panel - Career guidance
                            Expanded(
                              flex: 2,
                              child: _buildRightPanel(
                                textColor,
                                secondaryTextColor,
                                cardColor,
                                totalCredits,
                                remainingCredits,
                                overallGPA,
                                progressPercent,
                              ),
                            ),
                          ],
                        ),

                      const SizedBox(height: 20),

                      // Footer - Responsive
                      Row(
                        mainAxisAlignment: Responsive.isMobile(context)
                            ? MainAxisAlignment.center
                            : MainAxisAlignment.spaceBetween,
                        children: [
                          if (!Responsive.isMobile(context))
                            Row(
                              children: [
                                Container(
                                  width: 36,
                                  height: 36,
                                  decoration: const BoxDecoration(
                                    color: EdumateColors.primary,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'MA',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Mohamed Ahmed · cs \'28 · $_selectedCareer specialization',
                                  style: TextStyle(color: secondaryTextColor),
                                ),
                              ],
                            ),
                          Row(
                            children: [
                              Icon(Icons.sync, size: 14, color: secondaryTextColor),
                              const SizedBox(width: 4),
                              Text(
                                'last updated today',
                                style: TextStyle(color: secondaryTextColor, fontSize: 12),
                              ),
                            ],
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),
                    ],
                  ),
                );
              },
            ),
          ),
  );
}

// استخراج الأجزاء الكبيرة لدوال منفصلة
Widget _buildSemestersSection(Color textColor) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.layers, color: EdumateColors.primary),
              const SizedBox(width: 8),
              Text(
                'academic semesters',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
              ),
            ],
          ),
          GestureDetector(
            onTap: _addSemester,
            child: const GlassCard(
              blur: 8,
              opacity: 0.9,
              borderRadius: 30,
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Icon(Icons.add_circle, color: EdumateColors.primary, size: 18),
                  SizedBox(width: 4),
                  Text(
                    'add semester',
                    style: TextStyle(
                      color: EdumateColors.primary,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      const SizedBox(height: 16),

      // Semester Cards
      ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _semesters.length,
        itemBuilder: (context, index) {
          final semester = _semesters[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: SemesterCard(
              semester: semester,
              onAddSubject: () => _addSubjectToSemester(semester),
              onDeleteSubject: (subject) => _deleteSubject(semester, subject),
              onUpdateGrade: _updateSubjectGrade,
              gradePoints: _gradePoints,
            ),
          );
        },
      ),

      const SizedBox(height: 8),
      Text(
        '${8 - _semesters.length} more semesters planned',
        style: const TextStyle(
          color: Colors.grey,
          fontSize: 14,
        ),
      ),
    ],
  );
}

Widget _buildRightPanel(
  Color textColor,
  Color secondaryTextColor,
  Color cardColor,
  int totalCredits,
  int remainingCredits,
  double overallGPA,
  double progressPercent,
) {
  return Column(
    children: [
      // Career Track Card
      GlassCard(
        blur: 12,
        opacity: 0.9,
        borderRadius: 24,
        padding: const EdgeInsets.all(20),
        backgroundColor: const Color(0xFF192742),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.map, color: Colors.white70, size: 18),
                SizedBox(width: 8),
                Text(
                  'career track',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              _selectedCareer,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.school, color: Color(0xFFFACC15), size: 14),
                      const SizedBox(width: 4),
                      Text(
                        '${(8 - _semesters.length) * 5} courses left',
                        style: const TextStyle(color: Colors.white),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.science, color: Color(0xFFFACC15), size: 14),
                      SizedBox(width: 4),
                      Text(
                        '1 capstone',
                        style: TextStyle(color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),

      const SizedBox(height: 16),

      // Academic Tip
      GlassCard(
        blur: 10,
        opacity: 0.9,
        borderRadius: 20,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.lightbulb, color: EdumateColors.warning),
                const SizedBox(width: 8),
                Text(
                  'next milestone suggestion',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: textColor,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'CS 380 - computer vision (3 cr) · aligns with AI engineer path. offered in sem 4, pre-req: linear algebra + ML intro.',
              style: TextStyle(
                color: secondaryTextColor,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),

      const SizedBox(height: 16),

      // Progress
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.task_alt, color: textColor, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    'degree progress',
                    style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
              Text(
                '${(progressPercent * 100).toInt()}%',
                style: const TextStyle(
                  color: EdumateColors.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progressPercent.clamp(0.0, 1.0),
              minHeight: 10,
              backgroundColor: Colors.grey[300],
              valueColor: const AlwaysStoppedAnimation<Color>(EdumateColors.primary),
            ),
          ),
        ],
      ),

      const SizedBox(height: 20),

      // Roadmap Preview - Responsive
      Text(
        'roadmap preview',
        style: TextStyle(
          color: textColor,
          fontWeight: FontWeight.w600,
        ),
      ),
      const SizedBox(height: 12),
      SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: List.generate(5, (index) {
            final isCompleted = index < _semesters.length;
            return Row(
              children: [
                if (index > 0)
                  Container(
                    width: Responsive.isMobile(context) ? 30 : 50,
                    height: 2,
                    color: Colors.grey[300],
                  ),
                Column(
                  children: [
                    Container(
                      width: Responsive.isMobile(context) ? 25 : 30,
                      height: Responsive.isMobile(context) ? 25 : 30,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isCompleted
                            ? EdumateColors.primary
                            : Colors.grey[200],
                        border: Border.all(
                          color: isCompleted
                              ? EdumateColors.primary
                              : Colors.grey[400]!,
                          width: 2,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          '${index + 1}',
                          style: TextStyle(
                            color: isCompleted ? Colors.white : Colors.grey[600],
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'sem${index + 1}',
                      style: TextStyle(
                        color: isCompleted ? textColor : secondaryTextColor,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ],
            );
          }),
        ),
      ),

      const SizedBox(height: 16),

      // AI Advisor Note
      GlassCard(
        blur: 10,
        opacity: 0.9,
        borderRadius: 20,
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(Icons.auto_awesome, color: EdumateColors.primary, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'based on your interest in NLP, consider adding \'speech processing\' as elective (3cr).',
                style: TextStyle(color: textColor, fontSize: 13),
              ),
            ),
          ],
        ),
      ),

      const SizedBox(height: 16),

      // Graduation Info - Responsive
      ResponsiveRow(
        spacing: 12,
        children: [
          Row(
            children: [
              const Icon(Icons.hourglass_bottom, color: EdumateColors.primary),
              const SizedBox(width: 8),
              Text(
                'remaining: $remainingCredits',
                style: TextStyle(color: textColor, fontSize: 13),
              ),
            ],
          ),
          Row(
            children: [
              const Icon(Icons.calendar_today, color: EdumateColors.primary),
              const SizedBox(width: 8),
              Text(
                'est: ${_getEstimatedGraduation()}',
                style: TextStyle(color: textColor, fontSize: 13),
              ),
            ],
          ),
        ],
      ),

      const SizedBox(height: 20),

      // GPA Calculator
      GPACalculator(
        semesters: _semesters,
        gradePoints: _gradePoints,
        onGradeUpdated: _onPlanningGradeUpdated,
      ),
    ],
  );
}

  Widget _buildStatCard({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
  }) {
    return GlassCard(
      blur: 8,
      opacity: 0.9,
      borderRadius: 16,
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  color: Colors.grey,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
