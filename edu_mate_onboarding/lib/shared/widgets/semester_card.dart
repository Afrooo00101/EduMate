// lib/widgets/semester_card.dart
import 'package:flutter/material.dart';
import '../../core/theme/theme.dart';
import '../models/semester_model.dart';

class SemesterCard extends StatelessWidget {
  final SemesterModel semester;
  final VoidCallback onAddSubject;
  final Function(SubjectModel) onDeleteSubject;
  final Function(SubjectModel, double?) onUpdateGrade;
  final Map<String, double> gradePoints;
  
  const SemesterCard({
    super.key,
    required this.semester,
    required this.onAddSubject,
    required this.onDeleteSubject,
    required this.onUpdateGrade,
    required this.gradePoints,
  });

  @override
  Widget build(BuildContext context) { // 👈 context موجود هنا
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
          // Semester Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: EdumateColors.primary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'sem ${semester.semesterNumber}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    width: 150,
                    child: TextField(
                      controller: TextEditingController(text: semester.name),
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                        color: textColor,
                      ),
                      decoration: const InputDecoration(
                        isDense: true,
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onChanged: (value) {
                        semester.name = value;
                      },
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: EdumateColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${semester.totalCredits} credits',
                  style: const TextStyle(
                    color: EdumateColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Subjects List
          ...semester.subjects.map((subject) => _buildSubjectRow(
            subject,
            textColor,
            secondaryTextColor,
            isDark,
            context, // 👈 تمرير context
          )),
          
          if (semester.subjects.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Text(
                  'No subjects added yet',
                  style: TextStyle(color: secondaryTextColor),
                ),
              ),
            ),
          
          const SizedBox(height: 12),
          
          // GPA Display if any grades
          if (semester.gradedCount > 0) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _getGPAColor(semester.gpa).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.star, size: 14, color: EdumateColors.primary),
                  const SizedBox(width: 4),
                  Text(
                    'Semester GPA: ${semester.gpa.toStringAsFixed(2)}',
                    style: TextStyle(
                      color: _getGPAColor(semester.gpa),
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '(${semester.gradedCount}/${semester.subjectCount} graded)',
                    style: TextStyle(
                      color: secondaryTextColor,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
          
          // Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onAddSubject,
                  icon: const Icon(Icons.add_circle, color: EdumateColors.primary, size: 16),
                  label: const Text(
                    'add subject',
                    style: TextStyle(color: EdumateColors.primary),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: EdumateColors.primary.withOpacity(0.5)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    _showGradeAllDialog(context, semester); // 👈 استخدام context هنا
                  },
                  icon: const Icon(Icons.grade, color: EdumateColors.warning, size: 16),
                  label: const Text(
                    'grade all',
                    style: TextStyle(color: EdumateColors.warning),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: EdumateColors.warning.withOpacity(0.5)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectRow(
    SubjectModel subject,
    Color textColor,
    Color secondaryTextColor,
    bool isDark,
    BuildContext context, // 👈 إضافة context كمعامل
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: isDark ? EdumateColors.darkBorder : EdumateColors.lightBorder,
            width: 0.5,
          ),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.circle, size: 8, color: EdumateColors.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${subject.code}: ${subject.name}',
                  style: TextStyle(
                    color: textColor,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  subject.department,
                  style: TextStyle(
                    color: secondaryTextColor,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: EdumateColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '${subject.credits} cr',
              style: const TextStyle(
                color: EdumateColors.primary,
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 8),
          if (subject.grade != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: subject.getGradeColor().withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                subject.grade!.toStringAsFixed(1),
                style: TextStyle(
                  color: subject.getGradeColor(),
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          PopupMenuButton<String>(
            icon: Icon(Icons.more_vert, size: 16, color: secondaryTextColor),
            onSelected: (value) {
              if (value == 'grade') {
                _showGradeDialog(context, subject); // 👈 استخدام context هنا
              } else if (value == 'delete') {
                onDeleteSubject(subject);
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'grade',
                child: Row(
                  children: [
                    Icon(Icons.grade, size: 16),
                    SizedBox(width: 8),
                    Text('Set Grade'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete, size: 16, color: EdumateColors.error),
                    SizedBox(width: 8),
                    Text('Delete', style: TextStyle(color: EdumateColors.error)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showGradeDialog(BuildContext context, SubjectModel subject) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Set Grade for ${subject.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: gradePoints.entries.map((entry) {
                return GestureDetector(
                  onTap: () {
                    onUpdateGrade(subject, entry.value);
                    Navigator.pop(ctx);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: subject.grade == entry.value
                          ? EdumateColors.primary
                          : Colors.grey[200],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${entry.key} (${entry.value})',
                      style: TextStyle(
                        color: subject.grade == entry.value ? Colors.white : Colors.black,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              onUpdateGrade(subject, null);
              Navigator.pop(ctx);
            },
            child: const Text('Clear', style: TextStyle(color: EdumateColors.error)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  void _showGradeAllDialog(BuildContext context, SemesterModel semester) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Grade All - Semester ${semester.semesterNumber}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Set the same grade for all subjects in this semester:'),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: gradePoints.entries.map((entry) {
                return GestureDetector(
                  onTap: () {
                    for (var subject in semester.subjects) {
                      onUpdateGrade(subject, entry.value);
                    }
                    Navigator.pop(ctx);
                    
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('✓ All subjects set to ${entry.key}'),
                        backgroundColor: EdumateColors.success,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${entry.key} (${entry.value})',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  Color _getGPAColor(double gpa) {
    if (gpa >= 3.7) return EdumateColors.success;
    if (gpa >= 3.0) return EdumateColors.info;
    if (gpa >= 2.0) return EdumateColors.warning;
    return EdumateColors.error;
  }
}