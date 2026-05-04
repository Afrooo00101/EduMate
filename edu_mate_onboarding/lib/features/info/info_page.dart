// lib/screens/info_page.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../profile/profile_notifier.dart';
import '../../core/theme/theme.dart';

class InfoPage extends StatefulWidget {
  const InfoPage({super.key});

  @override
  State<InfoPage> createState() => _InfoPageState();
}

class _InfoPageState extends State<InfoPage> {
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
  
  // Loading state
  final bool _isLoading = false;
  bool _isSaving = false;

  // Lists for dropdowns
  final List<String> _genders = ['Male', 'Female', 'Other'];
  final List<String> _countries = ['Egypt', 'Saudi Arabia', 'United Arab Emirates', 'USA', 'UK', 'Other'];
  final List<String> _languages = ['Arabic', 'English', 'French', 'Spanish', 'German'];
  final List<String> _educationStatuses = ['University Student', 'High School Student', 'Graduate'];

  @override
  void initState() {
    super.initState();
    _loadExistingData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    _cityController.dispose();
    _dobController.dispose();
    _majorController.dispose();
    _universityController.dispose();
    _gpaController.dispose();
    _schoolNameController.dispose();
    _schoolGpaController.dispose();
    _skillsController.dispose();
    super.dispose();
  }

  Future<void> _loadExistingData() async {
    final prefs = await SharedPreferences.getInstance();
    
    setState(() {
      _nameController.text = prefs.getString('profile_name') ?? '';
      _bioController.text = prefs.getString('profile_bio') ?? '';
      _cityController.text = prefs.getString('profile_city') ?? '';
      _dobController.text = prefs.getString('profile_dob') ?? '';
      _gender = prefs.getString('profile_gender');
      _country = prefs.getString('profile_country');
      _language = prefs.getString('profile_language');
      _educationStatus = prefs.getString('profile_education_status') ?? 'University Student';
      _majorController.text = prefs.getString('profile_major') ?? '';
      _universityController.text = prefs.getString('profile_university') ?? '';
      _gpaController.text = prefs.getString('profile_university_gpa') ?? '';
      _schoolNameController.text = prefs.getString('profile_school_name') ?? '';
      _schoolGpaController.text = prefs.getString('profile_school_gpa') ?? '';
      _skillsController.text = prefs.getString('profile_skills') ?? '';

      // Load image
      final imageBase64 = prefs.getString('profile_image');
      if (imageBase64 != null && imageBase64.isNotEmpty) {
        _imageBytes = base64Decode(imageBase64);
      }
    });
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
          if (!kIsWeb) {
            _pickedImage = File(image.path);
          }
        });
        
        _showSnackBar('✓ Photo selected', isError: false);
      }
    } catch (e) {
      _showSnackBar('Error picking image: $e', isError: true);
    }
  }

  Future<void> _pickImageFromCamera() async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
      );
      
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _imageBytes = bytes;
          if (!kIsWeb) {
            _pickedImage = File(image.path);
          }
        });
        _showSnackBar('✓ Photo captured', isError: false);
      }
    } catch (e) {
      _showSnackBar('Camera error: $e', isError: true);
    }
  }

  void _showImagePickerOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Profile Photo',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: EdumateColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.photo_library, color: EdumateColors.primary),
                ),
                title: const Text('Choose from Gallery'),
                onTap: () {
                  Navigator.pop(ctx);
                  _pickImage();
                },
              ),
              if (!kIsWeb)
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.camera_alt, color: Colors.green),
                  ),
                  title: const Text('Take a Photo'),
                  onTap: () {
                    Navigator.pop(ctx);
                    _pickImageFromCamera();
                  },
                ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancel'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _saveAndContinue() async {
    // Validate required fields
    if (_nameController.text.isEmpty) {
      _showSnackBar('Please enter your name', isError: true);
      return;
    }

    setState(() => _isSaving = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Save basic info
      await prefs.setString('profile_name', _nameController.text);
      await prefs.setString('profile_bio', _bioController.text);
      await prefs.setString('profile_city', _cityController.text);
      await prefs.setString('profile_dob', _dobController.text);
      await prefs.setString('profile_skills', _skillsController.text);
      
      // Save dropdowns
      if (_gender != null) await prefs.setString('profile_gender', _gender!);
      if (_country != null) await prefs.setString('profile_country', _country!);
      if (_language != null) await prefs.setString('profile_language', _language!);
      if (_educationStatus != null) await prefs.setString('profile_education_status', _educationStatus!);
      
      // Save education based on status
      if (_educationStatus == 'University Student' || _educationStatus == 'Graduate') {
        await prefs.setString('profile_major', _majorController.text);
        await prefs.setString('profile_university', _universityController.text);
        await prefs.setString('profile_university_gpa', _gpaController.text);
        // Clear high school data
        await prefs.remove('profile_school_name');
        await prefs.remove('profile_school_gpa');
      } else if (_educationStatus == 'High School Student') {
        await prefs.setString('profile_school_name', _schoolNameController.text);
        await prefs.setString('profile_school_gpa', _schoolGpaController.text);
        // Clear university data
        await prefs.remove('profile_major');
        await prefs.remove('profile_university');
        await prefs.remove('profile_university_gpa');
      }
      
      // Save image
      if (_imageBytes != null) {
        final base64Image = base64Encode(_imageBytes!);
        await prefs.setString('profile_image', base64Image);
      }

      // Notify profile page to reload
      profileReloadNotifier.value++;

      if (mounted) {
        context.go('/home');
      }
      
    } catch (e) {
      _showSnackBar('Error saving: $e', isError: true);
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
      ),
    );
  }

  Widget _buildAvatarImage() {
    if (_imageBytes != null) {
      return ClipOval(
        child: Image.memory(
          _imageBytes!,
          width: 120,
          height: 120,
          fit: BoxFit.cover,
        ),
      );
    } else if (!kIsWeb && _pickedImage != null) {
      return ClipOval(
        child: Image.file(
          _pickedImage!,
          width: 120,
          height: 120,
          fit: BoxFit.cover,
        ),
      );
    } else {
      return Container(
        width: 120,
        height: 120,
        decoration: BoxDecoration(
          color: Colors.grey[200],
          shape: BoxShape.circle,
        ),
        child: Icon(
          Icons.person,
          size: 60,
          color: Colors.grey[400],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [EdumateColors.primary, EdumateColors.accent],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Logo
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.school,
                    color: Colors.white,
                    size: 50,
                  ),
                ),
                
                const SizedBox(height: 16),
                
                const Text(
                  'Complete Your Profile',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                
                const SizedBox(height: 8),
                
                const Text(
                  "Tell us more about yourself",
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),

                const SizedBox(height: 24),

                // Profile Photo
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
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: EdumateColors.primary, width: 2),
                                ),
                                child: const Icon(
                                  Icons.camera_alt,
                                  color: EdumateColors.primary,
                                  size: 18,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: _showImagePickerOptions,
                        child: const Text(
                          'Upload Photo',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Form Card
                GlassCard(
                  blur: 15,
                  opacity: 0.95,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Full Name
                      const Text(
                        'Full Name',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: EdumateColors.lightText,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _nameController,
                        style: const TextStyle(color: EdumateColors.lightText),
                        decoration: const InputDecoration(
                          hintText: 'Enter your full name',
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Bio
                      const Text(
                        'Bio',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: EdumateColors.lightText,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _bioController,
                        maxLines: 3,
                        style: const TextStyle(color: EdumateColors.lightText),
                        decoration: const InputDecoration(
                          hintText: 'Tell us about yourself',
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Gender
                      const Text(
                        'Gender',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: EdumateColors.lightText,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: EdumateColors.lightCard,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _gender,
                            hint: const Text('Select gender', style: TextStyle(color: EdumateColors.lightMuted)),
                            isExpanded: true,
                            items: _genders.map((g) {
                              return DropdownMenuItem(
                                value: g,
                                child: Text(g, style: const TextStyle(color: EdumateColors.lightText)),
                              );
                            }).toList(),
                            onChanged: (v) => setState(() => _gender = v),
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Date of Birth
                      const Text(
                        'Date of Birth',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: EdumateColors.lightText,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _dobController,
                        readOnly: true,
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: DateTime(2000),
                            firstDate: DateTime(1900),
                            lastDate: DateTime.now(),
                          );
                          if (date != null) {
                            _dobController.text = '${date.day}/${date.month}/${date.year}';
                          }
                        },
                        style: const TextStyle(color: EdumateColors.lightText),
                        decoration: const InputDecoration(
                          hintText: 'DD/MM/YYYY',
                          suffixIcon: Icon(Icons.calendar_today, size: 18, color: EdumateColors.lightMuted),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // City and Country
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'City',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                    color: EdumateColors.lightText,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                TextField(
                                  controller: _cityController,
                                  style: const TextStyle(color: EdumateColors.lightText),
                                  decoration: const InputDecoration(
                                    hintText: 'City',
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Country',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                    color: EdumateColors.lightText,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  decoration: BoxDecoration(
                                    color: EdumateColors.lightCard,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: DropdownButtonHideUnderline(
                                    child: DropdownButton<String>(
                                      value: _country,
                                      hint: const Text('Country', style: TextStyle(color: EdumateColors.lightMuted)),
                                      isExpanded: true,
                                      items: _countries.map((c) {
                                        return DropdownMenuItem(
                                          value: c,
                                          child: Text(c, style: const TextStyle(color: EdumateColors.lightText)),
                                        );
                                      }).toList(),
                                      onChanged: (v) => setState(() => _country = v),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Language
                      const Text(
                        'Primary Language',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: EdumateColors.lightText,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: EdumateColors.lightCard,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _language,
                            hint: const Text('Select language', style: TextStyle(color: EdumateColors.lightMuted)),
                            isExpanded: true,
                            items: _languages.map((l) {
                              return DropdownMenuItem(
                                value: l,
                                child: Text(l, style: const TextStyle(color: EdumateColors.lightText)),
                              );
                            }).toList(),
                            onChanged: (v) => setState(() => _language = v),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Education Status
                      const Text(
                        'Education Status',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: EdumateColors.lightText,
                        ),
                      ),
                      const SizedBox(height: 12),

                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: EdumateColors.lightCard,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _educationStatus,
                            isExpanded: true,
                            items: _educationStatuses.map((s) {
                              return DropdownMenuItem(
                                value: s,
                                child: Text(s, style: const TextStyle(color: EdumateColors.lightText)),
                              );
                            }).toList(),
                            onChanged: (v) => setState(() => _educationStatus = v),
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Conditional fields based on education status
                      if (_educationStatus == 'University Student' || _educationStatus == 'Graduate') ...[
                        const Text(
                          'Major',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: EdumateColors.lightText,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _majorController,
                          style: const TextStyle(color: EdumateColors.lightText),
                          decoration: const InputDecoration(
                            hintText: 'e.g., Computer Science',
                          ),
                        ),
                        const SizedBox(height: 16),

                        const Text(
                          'University',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: EdumateColors.lightText,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _universityController,
                          style: const TextStyle(color: EdumateColors.lightText),
                          decoration: const InputDecoration(
                            hintText: 'e.g., Cairo University',
                          ),
                        ),
                        const SizedBox(height: 16),

                        const Text(
                          'GPA',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: EdumateColors.lightText,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _gpaController,
                          style: const TextStyle(color: EdumateColors.lightText),
                          decoration: const InputDecoration(
                            hintText: 'e.g., 3.5/4.0',
                          ),
                        ),
                      ],

                      if (_educationStatus == 'High School Student') ...[
                        const Text(
                          'School Name',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: EdumateColors.lightText,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _schoolNameController,
                          style: const TextStyle(color: EdumateColors.lightText),
                          decoration: const InputDecoration(
                            hintText: 'e.g., Cairo High School',
                          ),
                        ),
                        const SizedBox(height: 16),

                        const Text(
                          'GPA / Percentage',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: EdumateColors.lightText,
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _schoolGpaController,
                          style: const TextStyle(color: EdumateColors.lightText),
                          decoration: const InputDecoration(
                            hintText: 'e.g., 95%',
                          ),
                        ),
                      ],

                      const SizedBox(height: 24),

                      // Skills
                      const Text(
                        'Skills',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: EdumateColors.lightText,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _skillsController,
                        maxLines: 3,
                        style: const TextStyle(color: EdumateColors.lightText),
                        decoration: const InputDecoration(
                          hintText: 'e.g., Flutter, Python, UI/UX Design, Leadership',
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Continue Button
                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton(
                          onPressed: _isSaving ? null : _saveAndContinue,
                          child: _isSaving
                              ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                )
                              : const Text(
                                  'Continue to Dashboard',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Skip for now
                      Center(
                        child: TextButton(
                          onPressed: () {
                            context.go('/home');
                          },
                          child: const Text(
                            'Skip for now',
                            style: TextStyle(
                              color: EdumateColors.lightMuted,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}