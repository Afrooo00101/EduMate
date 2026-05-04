// lib/widgets/gpa_calculator.dart
import 'package:flutter/material.dart';
import '../../core/theme/theme.dart';
import '../models/semester_model.dart';

class GPACalculator extends StatefulWidget {
  final List<SemesterModel> semesters;
  final Map<String, double> gradePoints;
  final void Function(SubjectModel subject, double? grade) onGradeUpdated;
  
  const GPACalculator({
    super.key,
    required this.semesters,
    required this.gradePoints,
    required this.onGradeUpdated,
  });

  @override
  State<GPACalculator> createState() => _GPACalculatorState();
}

class _GPACalculatorState extends State<GPACalculator> {
  bool _isExpanded = false;
  bool _showAnalysis = false;
  
  // GPA calculation
  double get termGPA {
    double totalPoints = 0;
    int totalCredits = 0;
    
    for (var semester in widget.semesters) {
      for (var subject in semester.subjects) {
        if (subject.grade != null) {
          totalPoints += subject.gradePoints * subject.credits;
          totalCredits += subject.credits;
        }
      }
    }
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
  }
  
  int get totalCredits {
    return widget.semesters.fold(0, (sum, s) => sum + s.totalCredits);
  }
  
  int get gradedCredits {
    int credits = 0;
    for (var semester in widget.semesters) {
      for (var subject in semester.subjects) {
        if (subject.grade != null) {
          credits += subject.credits;
        }
      }
    }
    return credits;
  }
  
  int get totalCourses {
    return widget.semesters.fold(0, (sum, s) => sum + s.subjectCount);
  }
  
  int get gradedCourses {
    int count = 0;
    for (var semester in widget.semesters) {
      count += semester.gradedCount;
    }
    return count;
  }
  
  Map<String, int> get gradeDistribution {
    final distribution = {
      'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0,
      'C+': 0, 'C': 0, 'C-': 0, 'D': 0, 'F': 0,
    };
    
    for (var semester in widget.semesters) {
      for (var subject in semester.subjects) {
        if (subject.grade != null) {
          final grade = _getGradeLetter(subject.grade!);
          if (distribution.containsKey(grade)) {
            distribution[grade] = distribution[grade]! + 1;
          }
        }
      }
    }
    
    return distribution;
  }
  
  String _getGradeLetter(double grade) {
    if (grade >= 3.85) return 'A';
    if (grade >= 3.5) return 'A-';
    if (grade >= 3.15) return 'B+';
    if (grade >= 2.85) return 'B';
    if (grade >= 2.5) return 'B-';
    if (grade >= 2.15) return 'C+';
    if (grade >= 1.85) return 'C';
    if (grade >= 1.5) return 'C-';
    if (grade >= 1.0) return 'D';
    return 'F';
  }
  
  double _calculateWhatIfGPA(double newGrade, int additionalCredits) {
    double totalPoints = 0;
    int totalCredits = 0;
    
    for (var semester in widget.semesters) {
      for (var subject in semester.subjects) {
        if (subject.grade != null) {
          totalPoints += subject.gradePoints * subject.credits;
          totalCredits += subject.credits;
        }
      }
    }
    
    // Add what-if scenario
    totalPoints += newGrade * additionalCredits;
    totalCredits += additionalCredits;
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
    final secondaryTextColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;
    
    return GlassCard(
      blur: 10,
      opacity: 0.9,
      borderRadius: 20,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.calculate, color: EdumateColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    'GPA Calculator',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: textColor,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: Icon(
                  _isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  color: secondaryTextColor,
                ),
                onPressed: () {
                  setState(() {
                    _isExpanded = !_isExpanded;
                  });
                },
              ),
            ],
          ),
          
          if (_isExpanded) ...[
            const SizedBox(height: 16),
            
            // GPA Summary Cards
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [EdumateColors.primary, EdumateColors.accent],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'Term GPA',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          termGPA.toStringAsFixed(2),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '$gradedCourses courses',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF475569), Color(0xFF334155)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'Cumulative GPA',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          termGPA.toStringAsFixed(2),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '$totalCredits credits',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Quick Grade Buttons
            Text(
              'Quick Grade Entry',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: textColor,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildQuickGradeButton('A (4.0)', 4.0),
                _buildQuickGradeButton('A- (3.7)', 3.7),
                _buildQuickGradeButton('B+ (3.3)', 3.3),
                _buildQuickGradeButton('B (3.0)', 3.0),
                _buildQuickGradeButton('B- (2.7)', 2.7),
                _buildQuickGradeButton('C+ (2.3)', 2.3),
                _buildQuickGradeButton('C (2.0)', 2.0),
                _buildQuickGradeButton('C- (1.7)', 1.7),
                _buildQuickGradeButton('D (1.0)', 1.0),
                _buildQuickGradeButton('F (0.0)', 0.0),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Analysis Button
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      setState(() {
                        _showAnalysis = !_showAnalysis;
                      });
                    },
                    icon: Icon(
                      _showAnalysis ? Icons.visibility_off : Icons.analytics,
                      color: EdumateColors.primary,
                    ),
                    label: Text(
                      _showAnalysis ? 'Hide Analysis' : 'View Analysis',
                      style: const TextStyle(color: EdumateColors.primary),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _resetAllGrades,
                    icon: const Icon(Icons.refresh, color: EdumateColors.error),
                    label: const Text(
                      'Reset All',
                      style: TextStyle(color: EdumateColors.error),
                    ),
                  ),
                ),
              ],
            ),
            
            if (_showAnalysis) ...[
              const SizedBox(height: 16),
              
              // Grade Distribution
              Text(
                'Grade Distribution',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 12),
              ..._buildGradeDistribution(),
              
              const SizedBox(height: 16),
              
              // GPA Statistics
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      'Total Credits',
                      '$totalCredits',
                      secondaryTextColor,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatCard(
                      'Graded Credits',
                      '$gradedCredits',
                      secondaryTextColor,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildStatCard(
                      'Current GPA',
                      termGPA.toStringAsFixed(2),
                      secondaryTextColor,
                      highlight: true,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // What-If Analysis
              Text(
                'What-If Analysis',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 8),
              _buildWhatIfSection(),
            ],
            
            const SizedBox(height: 8),
            
            // Grade Scale Reference
            Center(
              child: TextButton(
                onPressed: () {
                  _showGradeScale(context);
                },
                child: const Text(
                  'View Grade Scale',
                  style: TextStyle(
                    color: EdumateColors.primary,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuickGradeButton(String label, double grade) {
    return GestureDetector(
      onTap: () {
        _quickGradeAll(grade);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: EdumateColors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: EdumateColors.primary.withValues(alpha: 0.3)),
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: EdumateColors.primary,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  void _quickGradeAll(double grade) {
    int count = 0;
    for (var semester in widget.semesters) {
      for (var subject in semester.subjects) {
        if (subject.grade == null) {
          subject.grade = grade;
          widget.onGradeUpdated(subject, grade);
          count++;
        }
      }
    }
    
    if (count > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Set $count ungraded courses to ${_getGradeLetter(grade)}'),
          backgroundColor: EdumateColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      
      setState(() {});
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('No ungraded courses found'),
          backgroundColor: EdumateColors.warning,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  void _resetAllGrades() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reset All Grades'),
        content: const Text('Are you sure? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              for (var semester in widget.semesters) {
                for (var subject in semester.subjects) {
                  subject.grade = null;
                  widget.onGradeUpdated(subject, null);
                }
              }
              Navigator.pop(ctx);
              setState(() {});
              
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('✓ All grades reset'),
                  backgroundColor: EdumateColors.success,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              );
            },
            style: TextButton.styleFrom(foregroundColor: EdumateColors.error),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildGradeDistribution() {
    final distribution = gradeDistribution;
    final total = gradedCourses;
    
    if (total == 0) {
      return [
        const Center(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'No grades entered yet',
              style: TextStyle(color: Colors.grey),
            ),
          ),
        ),
      ];
    }
    
    return distribution.entries.map((entry) {
      final grade = entry.key;
      final count = entry.value;
      if (count == 0) return const SizedBox();
      
      final percentage = count / total;
      Color barColor;
      
      if (grade == 'A' || grade == 'A-') {
        barColor = EdumateColors.success;
      } else if (grade == 'B+' || grade == 'B' || grade == 'B-') barColor = EdumateColors.info;
      else if (grade == 'C+' || grade == 'C' || grade == 'C-') barColor = EdumateColors.warning;
      else barColor = EdumateColors.error;
      
      return Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(
          children: [
            SizedBox(
              width: 30,
              child: Text(
                grade,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: percentage,
                  minHeight: 16,
                  backgroundColor: Colors.grey[300],
                  valueColor: AlwaysStoppedAnimation<Color>(barColor),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '$count',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ],
        ),
      );
    }).toList();
  }

  Widget _buildStatCard(String label, String value, Color secondaryColor, {bool highlight = false}) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: highlight ? EdumateColors.primary.withValues(alpha: 0.1) : null,
        borderRadius: BorderRadius.circular(8),
        border: highlight ? Border.all(color: EdumateColors.primary) : null,
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: highlight ? EdumateColors.primary : null,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: secondaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWhatIfSection() {
    double? additionalCredits;
    double? targetGrade;
    
    return StatefulBuilder(
      builder: (context, setState) {
        return Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      hintText: 'Credits',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    ),
                    onChanged: (value) {
                      additionalCredits = double.tryParse(value);
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      hintText: 'Target GPA',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    ),
                    onChanged: (value) {
                      targetGrade = double.tryParse(value);
                    },
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    if (additionalCredits != null && targetGrade != null) {
                      final newGPA = _calculateWhatIfGPA(targetGrade!, additionalCredits!.toInt());
                      
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text('What-If Result'),
                          content: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                'Current GPA: ${termGPA.toStringAsFixed(2)}',
                                style: const TextStyle(fontSize: 16),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'New GPA: ${newGPA.toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: newGPA > termGPA ? EdumateColors.success : EdumateColors.error,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'With $additionalCredits credits at ${targetGrade!.toStringAsFixed(1)}',
                                style: const TextStyle(fontSize: 12),
                              ),
                            ],
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx),
                              child: const Text('Close'),
                            ),
                          ],
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  ),
                  child: const Icon(Icons.calculate, size: 18),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  void _showGradeScale(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Grade Scale Reference'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildGradeScaleRow('A', '4.0', 'Excellent'),
              _buildGradeScaleRow('A-', '3.7', ''),
              _buildGradeScaleRow('B+', '3.3', ''),
              _buildGradeScaleRow('B', '3.0', 'Good'),
              _buildGradeScaleRow('B-', '2.7', ''),
              _buildGradeScaleRow('C+', '2.3', ''),
              _buildGradeScaleRow('C', '2.0', 'Satisfactory'),
              _buildGradeScaleRow('C-', '1.7', ''),
              _buildGradeScaleRow('D', '1.0', 'Passing'),
              _buildGradeScaleRow('F', '0.0', 'Fail'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildGradeScaleRow(String grade, String points, String description) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 30,
            child: Text(
              grade,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          SizedBox(
            width: 40,
            child: Text(points),
          ),
          Expanded(
            child: Text(
              description,
              style: const TextStyle(color: Colors.grey),
            ),
          ),
        ],
      ),
    );
  }
}
