import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:web/web.dart' as web;
import 'dart:ui_web' as ui_web;
import 'dart:js_interop';
import '../../../core/network/api_client.dart';
import '../../../services/resume_service.dart';
import '../../../core/theme/theme.dart';
import '../auth/auth_provider.dart';

class CVBuilderScreen extends StatefulWidget {
  const CVBuilderScreen({super.key});

  @override
  State<CVBuilderScreen> createState() => _CVBuilderScreenState();
}

class _CVBuilderScreenState extends State<CVBuilderScreen> {
  late ResumeService _resumeService;
  late ResumeProfile _profile = ResumeProfile();
  bool _isLoading = true;
  bool _isSaving = false;
  String? _previewHtml;
  bool _showPreview = false;
  Map<String, dynamic>? _atsResult;
  bool _showAts = false;

  List<String> _templates = [];
  String _selectedTemplate = 'modern';

  final _formKey = GlobalKey<FormState>();

  final _fullNameController = TextEditingController();
  final _titleController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _locationController = TextEditingController();
  final _linkedinController = TextEditingController();
  final _githubController = TextEditingController();
  final _skillsController = TextEditingController();
  final _summaryController = TextEditingController();

  List<Education> _educationList = [];
  List<Experience> _experienceList = [];
  List<Project> _projectList = [];

  @override
  void initState() {
    super.initState();
    _initService();
  }

  Future<void> _initService() async {
    final token = context.read<UserProvider>().user?.token ?? '';
    final apiClient = ApiClient();
    if (token.isNotEmpty) apiClient.updateToken(token);
    _resumeService = ResumeService(apiClient);
    await _loadData();
    setState(() => _isLoading = false);
  }

  Future<void> _loadData() async {
    try {
      final profile = await _resumeService.getProfile();
      setState(() {
        _profile = profile;
        _fullNameController.text = profile.fullName ?? '';
        _titleController.text = profile.title ?? '';
        _emailController.text = profile.email ?? '';
        _phoneController.text = profile.phone ?? '';
        _locationController.text = profile.location ?? '';
        _linkedinController.text = profile.linkedin ?? '';
        _githubController.text = profile.github ?? '';
        _skillsController.text = profile.skills ?? '';
        _summaryController.text = profile.summary ?? '';
        _educationList = List.from(profile.education);
        _experienceList = List.from(profile.experience);
        _projectList = List.from(profile.projects);
        _selectedTemplate = profile.templateName ?? 'modern';
      });
    } catch (e) {
      _showSnackBar('Failed to load resume data: $e', isError: true);
    }
    try {
      _templates = await _resumeService.getTemplates();
    } catch (e) {
      _templates = ['modern', 'elegant', 'creative', 'classic', 'compact'];
    }
  }

  void _updateProfileFromForm() {
    _profile = ResumeProfile(
      fullName: _fullNameController.text,
      title: _titleController.text,
      email: _emailController.text,
      phone: _phoneController.text,
      location: _locationController.text,
      linkedin: _linkedinController.text,
      github: _githubController.text,
      skills: _skillsController.text,
      summary: _summaryController.text,
      education: _educationList,
      experience: _experienceList,
      projects: _projectList,
      templateName: _selectedTemplate,
    );
  }

  Future<void> _preview() async {
    if (!_formKey.currentState!.validate()) return;
    _updateProfileFromForm();
    setState(() => _isSaving = true);
    try {
      final html = await _resumeService.getPreviewHtml(_profile, _selectedTemplate);
      setState(() {
        _previewHtml = html;
        _showPreview = true;
      });
    } catch (e) {
      _showSnackBar('Preview error: $e', isError: true);
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Widget _buildManualPreviewOverlay(BuildContext context) {
    final htmlContent = _previewHtml ?? '<p>No preview content</p>';
    final String viewType = 'resume-preview-${DateTime.now().millisecondsSinceEpoch}';

    ui_web.platformViewRegistry.registerViewFactory(viewType, (int viewId) {
      final iframe = web.HTMLIFrameElement();
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.srcdoc = htmlContent.toJS;
      return iframe;
    });

    return Container(
      color: Colors.black87,
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
          child: Column(
            children: [
              AppBar(
                title: const Text('Resume Preview', style: TextStyle(color: Colors.black)),
                backgroundColor: Colors.white,
                elevation: 0,
                leading: IconButton(
                  icon: const Icon(Icons.close, color: Colors.black),
                  onPressed: () => setState(() => _showPreview = false),
                ),
              ),
              Expanded(child: HtmlElementView(viewType: viewType)),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    _updateProfileFromForm();
    setState(() => _isSaving = true);
    try {
      await _resumeService.saveProfile(_profile);
      _showSnackBar('Resume saved successfully');
    } catch (e) {
      _showSnackBar('Error: $e', isError: true);
    } finally {
      setState(() => _isSaving = false);
    }
  }

  Future<void> _checkATS() async {
    _updateProfileFromForm();
    setState(() => _isSaving = true);
    try {
      final result = await _resumeService.checkATS(_profile);
      setState(() {
        _atsResult = result;
        _showAts = true;
      });
    } catch (e) {
      _showSnackBar('ATS check failed: $e', isError: true);
    } finally {
      setState(() => _isSaving = false);
    }
  }

  void _showSnackBar(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError ? EdumateColors.error : EdumateColors.success,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
    final secondaryColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;
    final cardColor = isDark ? EdumateColors.darkCard : EdumateColors.lightCard;

    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resume Builder'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.preview), onPressed: _preview, tooltip: 'Preview'),
          IconButton(icon: const Icon(Icons.save), onPressed: _save, tooltip: 'Save'),
          IconButton(icon: const Icon(Icons.analytics), onPressed: _checkATS, tooltip: 'Check ATS'),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Choose Template', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 50,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _templates.length,
                      itemBuilder: (context, i) {
                        final t = _templates[i];
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(t),
                            selected: _selectedTemplate == t,
                            onSelected: (sel) => setState(() => _selectedTemplate = t),
                            backgroundColor: cardColor,
                            selectedColor: EdumateColors.primary.withValues(alpha: 0.3),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text('Personal Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
                  const SizedBox(height: 12),
                  _buildTextField(_fullNameController, 'Full Name', textColor, secondaryColor, validator: (v) => v!.isEmpty ? 'Required' : null),
                  _buildTextField(_titleController, 'Professional Title', textColor, secondaryColor),
                  _buildTextField(_emailController, 'Email', textColor, secondaryColor),
                  _buildTextField(_phoneController, 'Phone', textColor, secondaryColor),
                  _buildTextField(_locationController, 'Location', textColor, secondaryColor),
                  _buildTextField(_linkedinController, 'LinkedIn URL', textColor, secondaryColor),
                  _buildTextField(_githubController, 'GitHub URL', textColor, secondaryColor),
                  _buildTextField(_skillsController, 'Skills (comma separated)', textColor, secondaryColor, maxLines: 3),
                  _buildTextField(_summaryController, 'Professional Summary', textColor, secondaryColor, maxLines: 4),
                  const SizedBox(height: 16),
                  _buildSectionHeader('Education', () => setState(() => _educationList.add(Education(degree: '', school: '', year: ''))), textColor),
                  ..._educationList.asMap().entries.map((e) => _buildEducationCard(e.key, e.value, textColor, secondaryColor, cardColor)),
                  const SizedBox(height: 16),
                  _buildSectionHeader('Experience', () => setState(() => _experienceList.add(Experience(title: '', company: '', dates: '', desc: ''))), textColor),
                  ..._experienceList.asMap().entries.map((e) => _buildExperienceCard(e.key, e.value, textColor, secondaryColor, cardColor)),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(onPressed: _save, icon: const Icon(Icons.save), label: const Text('Save Resume')),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
          if (_isSaving) Container(color: Colors.black54, child: const Center(child: CircularProgressIndicator(color: EdumateColors.primary))),
          if (_showPreview) _buildManualPreviewOverlay(context),
          if (_showAts && _atsResult != null) _buildManualAtsOverlay(context),
        ],
      ),
    );
  }

  Widget _buildManualAtsOverlay(BuildContext context) {
    return Container(
      color: Colors.black54,
      child: Center(
        child: Card(
          margin: const EdgeInsets.all(32),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('ATS Score: ${_atsResult!['score']}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Text('Grade: ${_atsResult!['grade']}'),
                const SizedBox(height: 20),
                ElevatedButton(onPressed: () => setState(() => _showAts = false), child: const Text('Close')),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController ctrl, String label, Color textColor, Color secondaryColor, {int maxLines = 1, String? Function(String?)? validator}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: TextFormField(
        controller: ctrl,
        maxLines: maxLines,
        style: TextStyle(color: textColor),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: secondaryColor),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        validator: validator,
      ),
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onAdd, Color textColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
        IconButton(onPressed: onAdd, icon: const Icon(Icons.add_circle, color: EdumateColors.primary)),
      ],
    );
  }

  Widget _buildEducationCard(int idx, Education edu, Color textColor, Color secondaryColor, Color cardColor) {
    return Card(
      color: cardColor,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextFormField(initialValue: edu.degree, decoration: const InputDecoration(labelText: 'Degree'), onChanged: (v) => _educationList[idx].degree = v),
            TextFormField(initialValue: edu.school, decoration: const InputDecoration(labelText: 'School'), onChanged: (v) => _educationList[idx].school = v),
            TextFormField(initialValue: edu.year, decoration: const InputDecoration(labelText: 'Year'), onChanged: (v) => _educationList[idx].year = v),
            Align(alignment: Alignment.centerRight, child: TextButton(onPressed: () => setState(() => _educationList.removeAt(idx)), child: const Text('Remove', style: TextStyle(color: EdumateColors.error)))),
          ],
        ),
      ),
    );
  }

  Widget _buildExperienceCard(int idx, Experience exp, Color textColor, Color secondaryColor, Color cardColor) {
    return Card(
      color: cardColor,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            TextFormField(initialValue: exp.title, decoration: const InputDecoration(labelText: 'Job Title'), onChanged: (v) => _experienceList[idx].title = v),
            TextFormField(initialValue: exp.company, decoration: const InputDecoration(labelText: 'Company'), onChanged: (v) => _experienceList[idx].company = v),
            TextFormField(initialValue: exp.dates, decoration: const InputDecoration(labelText: 'Dates'), onChanged: (v) => _experienceList[idx].dates = v),
            TextFormField(initialValue: exp.desc, decoration: const InputDecoration(labelText: 'Description'), maxLines: 3, onChanged: (v) => _experienceList[idx].desc = v),
            Align(alignment: Alignment.centerRight, child: TextButton(onPressed: () => setState(() => _experienceList.removeAt(idx)), child: const Text('Remove', style: TextStyle(color: EdumateColors.error)))),
          ],
        ),
      ),
    );
  }
}
