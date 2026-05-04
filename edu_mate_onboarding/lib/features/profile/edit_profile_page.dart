// lib/screens/edit_profile_page.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'profile_notifier.dart';
import '../../core/theme/dark_mode_notifier.dart';
import '../../core/theme/theme.dart';

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
  
  // Settings
  bool _notificationsEnabled = true;
  bool _darkModeEnabled = false;
  
  // Loading state
  bool _isLoading = true;
  bool _isSaving = false;

  // Lists for dropdowns
  final List<String> _genders = ['Male', 'Female', 'Other'];
  final List<String> _countries = ['Egypt', 'Saudi Arabia', 'United Arab Emirates', 'USA', 'UK', 'Other'];
  final List<String> _languages = ['Arabic', 'English', 'French', 'Spanish', 'German'];
  final List<String> _educationStatuses = ['University Student', 'High School Student', 'Graduate'];

  @override
  void initState() {
    super.initState();
    _loadProfile();
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

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    
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
      _notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
      _darkModeEnabled = prefs.getBool('dark_mode') ?? false;

      // Load image
      final imageBase64 = prefs.getString('profile_image');
      if (imageBase64 != null && imageBase64.isNotEmpty) {
        _imageBytes = base64Decode(imageBase64);
      }
      
      _isLoading = false;
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
                    color: const Color(0xFF7C4DFF).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.photo_library, color: Color(0xFF7C4DFF)),
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

  Future<void> _saveProfile() async {
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
      
      // Save settings
      await prefs.setBool('notifications_enabled', _notificationsEnabled);
      await prefs.setBool('dark_mode', _darkModeEnabled);
      
      // Save image
      if (_imageBytes != null) {
        final base64Image = base64Encode(_imageBytes!);
        await prefs.setString('profile_image', base64Image);
      }

      // Notify profile page to reload
      profileReloadNotifier.value++;
      
      // Update dark mode if changed
      if (_darkModeEnabled != darkModeNotifier.value) {
        darkModeNotifier.value = _darkModeEnabled;
      }

      if (mounted) {
        _showSnackBar('✓ Profile updated successfully', isError: false);
        Navigator.pop(context); // Go back to profile page
      }
      
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
        backgroundColor: isError ? Colors.red : Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF121212) : const Color(0xFFF5F5FF);
    final cardColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final secondaryTextColor = isDark ? Colors.grey[400] : Colors.black54;

    if (_isLoading) {
      return Scaffold(
        backgroundColor: bgColor,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF7C4DFF)),
              ),
              const SizedBox(height: 16),
              Text(
                'Loading profile...',
                style: TextStyle(color: secondaryTextColor),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: Text(
          'Edit Profile',
          style: TextStyle(
            color: textColor,
            fontWeight: FontWeight.w600,
            fontSize: 18,
          ),
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: _isSaving ? null : _saveProfile,
            child: _isSaving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text(
                    'Save',
                    style: TextStyle(
                      color: Color(0xFF7C4DFF),
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Photo Section
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
                              color: const Color(0xFF7C4DFF),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: const Icon(
                              Icons.camera_alt,
                              color: Colors.white,
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
                      'Change Photo',
                      style: TextStyle(
                        color: Color(0xFF7C4DFF),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Personal Information Section
            _buildSectionTitle('Personal Information', textColor),
            const SizedBox(height: 12),

            _buildTextField('Full Name', _nameController, isDark, textColor, secondaryTextColor!),
            const SizedBox(height: 12),

            _buildTextField('Bio', _bioController, isDark, textColor, secondaryTextColor,
                maxLines: 3, hint: 'Tell us about yourself'),
            const SizedBox(height: 12),

            _buildDropdown('Gender', _gender, _genders, (val) {
              setState(() => _gender = val);
            }, isDark, textColor, secondaryTextColor),
            const SizedBox(height: 12),

            _buildTextField('Date of Birth', _dobController, isDark, textColor, secondaryTextColor,
                hint: 'DD/MM/YYYY'),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildDropdown('Country', _country, _countries, (val) {
                    setState(() => _country = val);
                  }, isDark, textColor, secondaryTextColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextField('City', _cityController, isDark, textColor, secondaryTextColor),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Educational Status Section
            _buildSectionTitle('Educational Status', textColor),
            const SizedBox(height: 12),

            _buildDropdown('Status', _educationStatus, _educationStatuses, (val) {
              setState(() => _educationStatus = val);
            }, isDark, textColor, secondaryTextColor),
            const SizedBox(height: 12),

            // Conditional fields based on education status
            if (_educationStatus == 'University Student' || _educationStatus == 'Graduate') ...[
              _buildTextField('Major', _majorController, isDark, textColor, secondaryTextColor),
              const SizedBox(height: 12),
              _buildTextField('University', _universityController, isDark, textColor, secondaryTextColor),
              const SizedBox(height: 12),
              _buildTextField('GPA', _gpaController, isDark, textColor, secondaryTextColor,
                  hint: 'e.g., 3.5/4.0'),
              const SizedBox(height: 12),
            ],

            if (_educationStatus == 'High School Student') ...[
              _buildTextField('School Name', _schoolNameController, isDark, textColor, secondaryTextColor),
              const SizedBox(height: 12),
              _buildTextField('GPA', _schoolGpaController, isDark, textColor, secondaryTextColor,
                  hint: 'e.g., 95%'),
              const SizedBox(height: 12),
            ],

            // Skills
            _buildSectionTitle('Skills', textColor),
            const SizedBox(height: 12),
            _buildTextField(
              'Skills',
              _skillsController,
              isDark,
              textColor,
              secondaryTextColor,
              hint: 'e.g., Flutter, Python, Design',
            ),

            const SizedBox(height: 20),

            // Preferences Section
            _buildSectionTitle('Preferences', textColor),
            const SizedBox(height: 12),

            _buildDropdown('Language', _language, _languages, (val) {
              setState(() => _language = val);
            }, isDark, textColor, secondaryTextColor),
            const SizedBox(height: 12),

            _buildSwitchTile(
              title: 'Notifications',
              subtitle: 'Get updates and news',
              value: _notificationsEnabled,
              onChanged: (val) => setState(() => _notificationsEnabled = val),
              cardColor: cardColor,
              textColor: textColor,
              secondaryColor: secondaryTextColor,
            ),

            const SizedBox(height: 12),

            _buildSwitchTile(
              title: 'Dark Mode',
              subtitle: 'Reduce eye strain',
              value: _darkModeEnabled,
              onChanged: (val) => setState(() => _darkModeEnabled = val),
              cardColor: cardColor,
              textColor: textColor,
              secondaryColor: secondaryTextColor,
            ),

            const SizedBox(height: 20),

            // Account Settings Section
            _buildSectionTitle('Account Settings', textColor),
            const SizedBox(height: 12),

            _buildSettingsTile(
              title: 'Change Password',
              icon: Icons.lock_outline,
              onTap: () {
                _showSnackBar('Coming soon!', isError: false);
              },
              cardColor: cardColor,
              textColor: textColor,
            ),
            const SizedBox(height: 8),

            _buildSettingsTile(
              title: 'Linked Accounts',
              icon: Icons.link,
              onTap: () {
                _showSnackBar('Coming soon!', isError: false);
              },
              cardColor: cardColor,
              textColor: textColor,
            ),

            const SizedBox(height: 24),

            // Danger Zone
            _buildSectionTitle('Danger Zone', Colors.red),
            const SizedBox(height: 12),

            _buildDangerButton(
              title: 'Logout',
              icon: Icons.logout,
              onTap: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Logout'),
                    content: const Text('Are you sure you want to logout?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          context.go('/login');
                        },
                        style: TextButton.styleFrom(foregroundColor: Colors.red),
                        child: const Text('Logout'),
                      ),
                    ],
                  ),
                );
              },
              cardColor: cardColor,
            ),
            const SizedBox(height: 12),

            _buildDangerButton(
              title: 'Delete Account',
              icon: Icons.delete,
              onTap: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Delete Account'),
                    content: const Text(
                      'This action cannot be undone. All your data will be permanently deleted.',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('Cancel'),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          _showSnackBar('Account deletion coming soon', isError: true);
                        },
                        style: TextButton.styleFrom(foregroundColor: Colors.red),
                        child: const Text('Delete'),
                      ),
                    ],
                  ),
                );
              },
              cardColor: cardColor,
              isDelete: true,
            ),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: color,
      ),
    );
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
        Text(
          label,
          style: TextStyle(
            color: secondaryTextColor,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
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
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide.none,
            ),
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
        Text(
          label,
          style: TextStyle(
            color: secondaryTextColor,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: isDark ? EdumateColors.darkCard : EdumateColors.lightCard,
            borderRadius: BorderRadius.circular(10),
          ),
          child: DropdownButtonFormField<String>(
            initialValue: value,
            items: items.map((item) {
              return DropdownMenuItem(
                value: item,
                child: Text(
                  item,
                  style: TextStyle(color: textColor),
                ),
              );
            }).toList(),
            onChanged: onChanged,
            decoration: const InputDecoration(
              border: InputBorder.none,
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            dropdownColor: isDark ? EdumateColors.darkCard : EdumateColors.lightCard,
            icon: Icon(Icons.arrow_drop_down, color: secondaryTextColor),
          ),
        ),
      ],
    );
  }

    Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required Function(bool) onChanged,
    required Color cardColor,
    required Color textColor,
    required Color secondaryColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: Colors.grey.withOpacity(0.1),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: textColor,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: secondaryColor,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: EdumateColors.primary,
          ),
        ],
      ),
    );
  }

    Widget _buildSettingsTile({
    required String title,
    required IconData icon,
    required VoidCallback onTap,
    required Color cardColor,
    required Color textColor,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: Colors.grey.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: EdumateColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: EdumateColors.primary, size: 20),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: textColor,
                  ),
                ),
              ],
            ),
            Icon(Icons.chevron_right, color: Colors.grey[400], size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildDangerButton({
    required String title,
    required IconData icon,
    required VoidCallback onTap,
    required Color cardColor,
    bool isDelete = false,
  }) {
    final color = isDelete ? EdumateColors.error : EdumateColors.warning;
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: color.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: color,
                      fontSize: 15,
                    ),
                  ),
                  if (isDelete)
                    const Text(
                      'Permanently delete your account',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 12,
                      ),
                    ),
                ],
              ),
            ),
            Icon(Icons.chevron_right, color: color, size: 20),
          ],
        ),
      ),
    );
  }
}