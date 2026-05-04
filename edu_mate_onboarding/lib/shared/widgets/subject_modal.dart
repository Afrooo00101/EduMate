// lib/widgets/subject_modal.dart
import 'package:flutter/material.dart';
import '../../core/theme/theme.dart';
import '../models/semester_model.dart';

class SubjectModal extends StatefulWidget {
  final SemesterModel? semester;
  final Function(String, List<SubjectModel>)? onSemesterCreated;
  final Function(SubjectModel)? onSubjectAdded;
  
  const SubjectModal({
    super.key,
    this.semester,
    this.onSemesterCreated,
    this.onSubjectAdded,
  });

  @override
  State<SubjectModal> createState() => _SubjectModalState();
}

class _SubjectModalState extends State<SubjectModal> {
  String _selectedType = 'foundation';
  final List<SubjectModel> _selectedSubjects = [];
  String _customSubjectName = '';
  int _customSubjectCredits = 3;
  
  final List<String> _subjectTypes = [
    'foundation',
    'core',
    'intelligent',
    'advanced',
    'specialization',
    'capstone',
    'final',
  ];
  
  final Map<String, String> _typeNames = {
    'foundation': 'Foundation Semester',
    'core': 'Core & Data Semester',
    'intelligent': 'Intelligent Systems',
    'advanced': 'Advanced Topics',
    'specialization': 'Specialization',
    'capstone': 'Capstone Prep',
    'final': 'Final Project',
  };

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
    final secondaryTextColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;
    
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(16),
      child: GlassCard(
        blur: 15,
        opacity: 0.95,
        borderRadius: 20,
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      widget.semester == null ? Icons.add_circle : Icons.add,
                      color: EdumateColors.primary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      widget.semester == null
                          ? 'Create New Semester'
                          : 'Add Subject to Semester ${widget.semester!.semesterNumber}',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            if (widget.semester == null) ...[
              // Semester Type Dropdown
              Text(
                'Semester Type:',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[800] : Colors.grey[100],
                  borderRadius: BorderRadius.circular(10),
                ),
                child: DropdownButton<String>(
                  value: _selectedType,
                  isExpanded: true,
                  underline: const SizedBox(),
                  items: _subjectTypes.map((type) {
                    return DropdownMenuItem(
                      value: type,
                      child: Text(
                        _typeNames[type] ?? type,
                        style: TextStyle(color: textColor),
                      ),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedType = value!;
                      _selectedSubjects.clear();
                    });
                  },
                ),
              ),
              const SizedBox(height: 16),
            ],
            
            // Subjects List
            Text(
              'Available Subjects:',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              height: 200,
              decoration: BoxDecoration(
                border: Border.all(
                  color: isDark ? EdumateColors.darkBorder : EdumateColors.lightBorder,
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: _selectedType == 'custom'
                  ? _buildCustomSubjectInput()
                  : _buildSubjectsList(),
            ),
            
            const SizedBox(height: 16),
            
            // Selected Subjects
            Text(
              'Selected Subjects (${_selectedSubjects.length})',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              height: 100,
              decoration: BoxDecoration(
                color: isDark ? Colors.grey[800] : Colors.grey[100],
                borderRadius: BorderRadius.circular(10),
              ),
              child: _selectedSubjects.isEmpty
                  ? Center(
                      child: Text(
                        'No subjects selected',
                        style: TextStyle(color: secondaryTextColor),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(8),
                      itemCount: _selectedSubjects.length,
                      itemBuilder: (context, index) {
                        final subject = _selectedSubjects[index];
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          margin: const EdgeInsets.only(bottom: 4),
                          decoration: BoxDecoration(
                            color: EdumateColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  '${subject.code}: ${subject.name}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: textColor,
                                  ),
                                ),
                              ),
                              Text(
                                '${subject.credits} cr',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: EdumateColors.primary,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
            
            const SizedBox(height: 20),
            
            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _selectedSubjects.isEmpty
                        ? null
                        : () {
                            if (widget.semester == null) {
                              widget.onSemesterCreated!(
                                _typeNames[_selectedType] ?? _selectedType,
                                _selectedSubjects,
                              );
                            } else {
                              for (var subject in _selectedSubjects) {
                                widget.onSubjectAdded!(subject);
                              }
                            }
                          },
                    child: Text(widget.semester == null ? 'Create' : 'Add'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubjectsList() {
    final subjects = SubjectDatabase.getSubjectsByType(_selectedType);
    
    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: subjects.length,
      itemBuilder: (context, index) {
        final subject = subjects[index];
        final isSelected = _selectedSubjects.any((s) => s.id == subject.id);
        
        return CheckboxListTile(
          value: isSelected,
          onChanged: (selected) {
            setState(() {
              if (selected == true) {
                _selectedSubjects.add(subject);
              } else {
                _selectedSubjects.removeWhere((s) => s.id == subject.id);
              }
            });
          },
          title: Text(
            subject.name,
            style: const TextStyle(fontSize: 13),
          ),
          subtitle: Text(
            '${subject.code} • ${subject.credits} cr',
            style: const TextStyle(fontSize: 11),
          ),
          secondary: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: EdumateColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              subject.department,
              style: const TextStyle(
                color: EdumateColors.primary,
                fontSize: 9,
              ),
            ),
          ),
          dense: true,
          controlAffinity: ListTileControlAffinity.leading,
        );
      },
    );
  }

  Widget _buildCustomSubjectInput() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          TextField(
            decoration: const InputDecoration(
              labelText: 'Subject Name',
              border: OutlineInputBorder(),
            ),
            onChanged: (value) {
              _customSubjectName = value;
            },
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Text('Credits:'),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<int>(
                  initialValue: _customSubjectCredits,
                  items: [1, 2, 3, 4, 5, 6].map((credits) {
                    return DropdownMenuItem(
                      value: credits,
                      child: Text('$credits credits'),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _customSubjectCredits = value!;
                    });
                  },
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              if (_customSubjectName.isNotEmpty) {
                final customSubject = SubjectModel(
                  id: 'custom_${DateTime.now().millisecondsSinceEpoch}',
                  name: _customSubjectName,
                  code: 'CUSTOM',
                  credits: _customSubjectCredits,
                  department: 'Custom',
                );
                setState(() {
                  _selectedSubjects.add(customSubject);
                });
              }
            },
            child: const Text('Add Custom Subject'),
          ),
        ],
      ),
    );
  }
}