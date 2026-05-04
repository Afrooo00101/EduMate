// lib/features/profile/edit_profile_page.dart
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/theme/theme.dart';
import '../../../services/user_service.dart';
import '../../../core/network/api_client.dart';
import '../auth/auth_provider.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  // Controllers
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _bioController = TextEditingController();
  final TextEditingController _cityController = TextEditingController();
  final TextEditingController _dobController = TextEditingController();
  final TextEditingController _majorController = TextEditingController();
  final TextEditingController _universityController = TextEditingController();
  final TextEditingController _gpaController = TextEditingController();
  final TextEditingController _schoolNameController = TextEditingController();
  final TextEditingController _schoolGpaController = TextEditingController();
  final TextEditingController _skillsController = TextEditingController();

  // Dropdown values
  String? _gender;
  String? _country;
  String? _language;
  String? _educationStatus = 'University Student';

  // Image
  File? _pickedImage;
  Uint8List? _imageBytes;

  // Loading states
  bool _isLoading = true;
  bool _isSaving = false;

  // Lists for dropdowns
  final List<String> _genders = ['Male', 'Female', 'Other'];
  final List<String> _countries = [
    'Egypt', 'Saudi Arabia', 'United Arab Emirates', 'USA', 'UK', 'Other'
  ];
  final List<String> _languages = ['Arabic', 'English', 'French', 'Spanish', 'German'];
  final List<String> _educationStatuses = ['University Student', 'High School Student', 'Graduate'];

  late UserService _userService;

  @override
  void initState() {
    super.initState();
    final token = context.read<UserProvider>().user?.token ?? '';
    final apiClient = ApiClient();
    if (token.isNotEmpty) apiClient.updateToken(token);
    _userService = UserService(apiClient);
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    try {
      final user = await _userService.getCurrentUser();
      setState(() {
        _nameController.text = user.name;
        _bioController.text = user.skillsSummary ?? '';
        _cityController.text = '';
        _dobController.text = '';
        _gender = null;
        _country = null;
        _language = null;
        _educationStatus = 'University Student';
        _majorController.text = user.major?['name'] ?? '';
        _universityController.text = '';
        _gpaController.text = '';
        _schoolNameController.text = '';
        _schoolGpaController.text = '';
        _skillsController.text = user.skillsSummary ?? '';
        _imageBytes = null;
      });
    } catch (e) {
      _showSnackBar('Failed to load profile: $e', isError: true);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveProfile() async {
    if (_nameController.text.isEmpty) {
      _showSnackBar('Please enter your name', isError: true);
      return;
    }

    setState(() => _isSaving = true);
    try {
      final updatedUser = await _userService.updateUser(
        fullName: _nameController.text,
        skillsSummary: _skillsController.text,
      );

      final provider = context.read<UserProvider>();
      final currentToken = provider.user?.token ?? '';
      provider.user = updatedUser.copyWith(token: currentToken);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_name', updatedUser.name);
      await prefs.setString('user_email', updatedUser.email);

      _showSnackBar('Profile updated successfully', isError: false);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      _showSnackBar('Error saving profile: $e', isError: true);
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showSnackBar(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? EdumateColors.error : EdumateColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
      ),
    );
  }


  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
        maxWidth: 500,
        maxHeight: 500,
      );
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _imageBytes = bytes;
          if (!kIsWeb) _pickedImage = File(image.path);
        });
        _showSnackBar('Photo selected', isError: false);
      }
    } catch (e) {
      _showSnackBar('Error picking image: $e', isError: true);
    }
  }

  Future<void> _pickImageFromCamera() async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(source: ImageSource.camera, imageQuality: 80);
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _imageBytes = bytes;
          if (!kIsWeb) _pickedImage = File(image.path);
        });
        _showSnackBar('Photo captured', isError: false);
      }
    } catch (e) {
      _showSnackBar('Camera error: $e', isError: true);
    }
  }

  void _showImagePickerOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => SafeArea(
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Profile Photo', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: EdumateColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.photo_library, color: EdumateColors.primary),
                ),
                title: const Text('Choose from Gallery'),
                onTap: () { Navigator.pop(ctx); _pickImage(); },
              ),
              if (!kIsWeb)
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.camera_alt, color: Colors.green),
                  ),
                  title: const Text('Take a Photo'),
                  onTap: () { Navigator.pop(ctx); _pickImageFromCamera(); },
                ),
              const SizedBox(height: 8),
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatarImage() {
    if (_imageBytes != null) {
      return ClipOval(child: Image.memory(_imageBytes!, width: 120, height: 120, fit: BoxFit.cover));
    } else if (!kIsWeb && _pickedImage != null) {
      return ClipOval(child: Image.file(_pickedImage!, width: 120, height: 120, fit: BoxFit.cover));
    } else {
      return Container(
        width: 120,
        height: 120,
        decoration: BoxDecoration(color: Colors.grey[200], shape: BoxShape.circle),
        child: Icon(Icons.person, size: 60, color: Colors.grey[400]),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
    final secondaryTextColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: const Text('Edit Profile', style: TextStyle(fontWeight: FontWeight.w600)),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _saveProfile,
            child: _isSaving
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Save', style: TextStyle(color: EdumateColors.primary, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar section
            Center(
              child: Column(
                children: [
                  GestureDetector(
                    onTap: _showImagePickerOptions,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        _buildAvatarImage(),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(color: EdumateColors.primary, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                            child: const Icon(Icons.camera_alt, color: Colors.white, size: 18),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextButton(onPressed: _showImagePickerOptions, child: const Text('Change Photo', style: TextStyle(color: EdumateColors.primary))),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Personal Information
            _buildSectionTitle('Personal Information', textColor),
            const SizedBox(height: 12),
            _buildTextField('Full Name', _nameController, isDark, textColor, secondaryTextColor),
            const SizedBox(height: 12),
            _buildTextField('Bio', _bioController, isDark, textColor, secondaryTextColor, maxLines: 3, hint: 'Tell us about yourself'),
            const SizedBox(height: 12),
            _buildDropdown('Gender', _gender, _genders, (val) => setState(() => _gender = val), isDark, textColor, secondaryTextColor),
            const SizedBox(height: 12),
            _buildTextField('Date of Birth', _dobController, isDark, textColor, secondaryTextColor, hint: 'DD/MM/YYYY'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildDropdown('Country', _country, _countries, (val) => setState(() => _country = val), isDark, textColor, secondaryTextColor)),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField('City', _cityController, isDark, textColor, secondaryTextColor)),
              ],
            ),
            const SizedBox(height: 20),

            // Education
            _buildSectionTitle('Educational Status', textColor),
            const SizedBox(height: 12),
            _buildDropdown('Status', _educationStatus, _educationStatuses, (val) => setState(() => _educationStatus = val), isDark, textColor, secondaryTextColor),
            const SizedBox(height: 12),
            if (_educationStatus == 'University Student' || _educationStatus == 'Graduate') ...[
              _buildTextField('Major', _majorController, isDark, textColor, secondaryTextColor),
              const SizedBox(height: 12),
              _buildTextField('University', _universityController, isDark, textColor, secondaryTextColor),
              const SizedBox(height: 12),
              _buildTextField('GPA', _gpaController, isDark, textColor, secondaryTextColor, hint: 'e.g., 3.5/4.0'),
            ],
            if (_educationStatus == 'High School Student') ...[
              _buildTextField('School Name', _schoolNameController, isDark, textColor, secondaryTextColor),
              const SizedBox(height: 12),
              _buildTextField('GPA', _schoolGpaController, isDark, textColor, secondaryTextColor, hint: 'e.g., 95%'),
            ],
            const SizedBox(height: 12),
            _buildTextField('Skills', _skillsController, isDark, textColor, secondaryTextColor, hint: 'e.g., Flutter, Python, Design'),

            const SizedBox(height: 20),
            _buildSectionTitle('Preferences', textColor),
            const SizedBox(height: 12),
            _buildDropdown('Primary Language', _language, _languages, (val) => setState(() => _language = val), isDark, textColor, secondaryTextColor),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: color));
  }

  Widget _buildTextField(
      String label,
      TextEditingController controller,
      bool isDark,
      Color textColor,
      Color secondaryTextColor, {
        int maxLines = 1,
        String? hint,
      }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: secondaryTextColor, fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          maxLines: maxLines,
          style: TextStyle(color: textColor),
          decoration: InputDecoration(
            hintText: hint ?? 'Enter $label',
            hintStyle: TextStyle(color: isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted),
            filled: true,
            fillColor: isDark ? EdumateColors.darkCard : EdumateColors.lightCard,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown(
      String label,
      String? value,
      List<String> items,
      Function(String?) onChanged,
      bool isDark,
      Color textColor,
      Color secondaryTextColor,
      ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: secondaryTextColor, fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(color: isDark ? EdumateColors.darkCard : EdumateColors.lightCard, borderRadius: BorderRadius.circular(10)),
          child: DropdownButtonFormField<String>(
            value: value,
            items: items.map((item) => DropdownMenuItem(value: item, child: Text(item, style: TextStyle(color: textColor)))).toList(),
            onChanged: onChanged,
            decoration: const InputDecoration(border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
            dropdownColor: isDark ? EdumateColors.darkCard : EdumateColors.lightCard,
            icon: Icon(Icons.arrow_drop_down, color: secondaryTextColor),
          ),
        ),
      ],
    );
  }
}