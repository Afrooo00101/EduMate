import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:typed_data';
import '../../shared/models/user_model.dart';
import '../auth/auth_provider.dart';
import '../../../core/theme/theme.dart';
import 'edit_profile_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  Map<String, dynamic> _extraData = {};
  Uint8List? _localImage;

  Future<void> _loadExtraData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _extraData = {
        'bio': prefs.getString('profile_bio') ?? '',
        'city': prefs.getString('profile_city') ?? '',
        'dob': prefs.getString('profile_dob') ?? '',
        'gender': prefs.getString('profile_gender') ?? '',
        'country': prefs.getString('profile_country') ?? '',
        'language': prefs.getString('profile_language') ?? '',
        'educationStatus': prefs.getString('profile_education_status') ?? '',
        'university': prefs.getString('profile_university') ?? '',
        'universityGpa': prefs.getString('profile_university_gpa') ?? '',
        'schoolName': prefs.getString('profile_school_name') ?? '',
        'schoolGpa': prefs.getString('profile_school_gpa') ?? '',
        'skills': prefs.getString('profile_skills') ?? '',
      };
      final imageBase64 = prefs.getString('profile_image');
      _localImage = imageBase64 != null ? base64Decode(imageBase64) : null;
    });
  }
  double _calculateProfileCompletion(UserModel user) {
    int completed = 0;
    int total = 7; // الاسم، البريد، الكود، التخصص، سنة التخرج، المهارات، الصورة (أو أي معايير تختارها)
    if (user.name.isNotEmpty) completed++;
    if (user.email.isNotEmpty) completed++;
    if (user.studentCode != null && user.studentCode!.isNotEmpty) completed++;
    if (user.major?['name'] != null && user.major!['name'].toString().isNotEmpty) completed++;
    if (user.graduationYear != null && user.graduationYear! > 0) completed++;
    if (user.skillsSummary != null && user.skillsSummary!.isNotEmpty) completed++;
    if (user.profileImageUrl != null && user.profileImageUrl!.isNotEmpty) completed++;
    // يمكنك إضافة المزيد من الحقول حسب رغبتك مثل bio, university, إلخ
    return completed / total;
  }

  Widget _buildProfileCompletionCard(UserModel user, Color textColor, Color secondaryColor, Color cardColor) {
    final completion = _calculateProfileCompletion(user);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: secondaryColor.withAlpha(25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Profile Completion', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: secondaryColor)),
              Text('${(completion * 100).toInt()}%', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: EdumateColors.primary)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: completion,
              backgroundColor: secondaryColor.withAlpha(25),
              valueColor: const AlwaysStoppedAnimation<Color>(EdumateColors.primary),
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadExtraData();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<UserProvider>(
      builder: (context, provider, child) {
        final user = provider.user;
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
        final secondaryColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;
        final cardColor = isDark ? EdumateColors.darkCard : EdumateColors.lightCard;

        if (provider.status == Status.loading) {
          return Scaffold(
            backgroundColor: isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground,
            body: const Center(child: CircularProgressIndicator()),
          );
        }

        if (user == null) {
          return Scaffold(
            backgroundColor: isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.person_off, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text('No user data available', style: TextStyle(color: secondaryColor)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                    child: const Text('Go to Login'),
                  ),
                ],
              ),
            ),
          );
        }

        return Scaffold(
          backgroundColor: isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground,
          appBar: AppBar(
            title: const Text('My Profile'),
            backgroundColor: Colors.transparent,
            elevation: 0,
            actions: [
              IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const EditProfilePage()),
                  );
                },
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Avatar section (same)
                CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.white,
                  backgroundImage: _localImage != null ? MemoryImage(_localImage!) : null,
                  child: _localImage == null
                      ? const Icon(Icons.person, size: 50, color: EdumateColors.primary)
                      : null,
                ),
                const SizedBox(height: 12),
                Text(
                  user.name,
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textColor),
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  style: TextStyle(fontSize: 14, color: secondaryColor),
                ),
                if (_extraData['bio'].isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(_extraData['bio'], style: TextStyle(color: secondaryColor)),
                ],
                const SizedBox(height: 20),

                // ====== NEW: Profile Completion Progress ======
                _buildProfileCompletionCard(user, textColor, secondaryColor, cardColor),

                const SizedBox(height: 20),

                // Academic Information (from API)
                Card(
                  color: cardColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Academic Information', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor)),
                        const SizedBox(height: 12),
                        _infoRow('Student Code', user.studentCode ?? 'Not set', textColor, secondaryColor),
                        _infoRow('Major', user.major?['name'] ?? 'Not set', textColor, secondaryColor),
                        _infoRow('Graduation Year', user.graduationYear?.toString() ?? 'Not set', textColor, secondaryColor),
                        if ((user.gpa ?? 0.0) > 0) _infoRow('GPA', user.gpa!.toStringAsFixed(2), textColor, secondaryColor),
                        // إضافة المهارات من API إذا كانت موجودة
                        if (user.skillsSummary != null && user.skillsSummary!.isNotEmpty)
                          _infoRow('Skills Summary', user.skillsSummary!, textColor, secondaryColor),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Contact & Personal Details (from SharedPreferences)
                Card(
                  color: cardColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Personal Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor)),
                        const SizedBox(height: 12),
                        _infoRow('Gender', _extraData['gender']?.isNotEmpty == true ? _extraData['gender']! : 'Not provided', textColor, secondaryColor),
                        _infoRow('Date of Birth', _extraData['dob']?.isNotEmpty == true ? _extraData['dob']! : 'Not provided', textColor, secondaryColor),
                        _infoRow('Country', _extraData['country']?.isNotEmpty == true ? _extraData['country']! : 'Not provided', textColor, secondaryColor),
                        _infoRow('City', _extraData['city']?.isNotEmpty == true ? _extraData['city']! : 'Not provided', textColor, secondaryColor),
                        _infoRow('Language', _extraData['language']?.isNotEmpty == true ? _extraData['language']! : 'Not provided', textColor, secondaryColor),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Education Details
                Card(
                  color: cardColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Education Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor)),
                        const SizedBox(height: 12),
                        _infoRow('Education Status', _extraData['educationStatus']?.isNotEmpty == true ? _extraData['educationStatus']! : 'Not provided', textColor, secondaryColor),
                        if (_extraData['university']?.isNotEmpty == true)
                          _infoRow('University', _extraData['university']!, textColor, secondaryColor),
                        if (_extraData['universityGpa']?.isNotEmpty == true)
                          _infoRow('University GPA', _extraData['universityGpa']!, textColor, secondaryColor),
                        if (_extraData['schoolName']?.isNotEmpty == true)
                          _infoRow('School', _extraData['schoolName']!, textColor, secondaryColor),
                        if (_extraData['schoolGpa']?.isNotEmpty == true)
                          _infoRow('School GPA', _extraData['schoolGpa']!, textColor, secondaryColor),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Skills (from SharedPreferences)
                if (_extraData['skills']?.isNotEmpty == true)
                  Card(
                    color: cardColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Skills', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor)),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: _extraData['skills']!.split(',').map((skill) => Chip(
                              label: Text(skill.trim(), style: TextStyle(color: textColor)),
                              backgroundColor: EdumateColors.primary.withValues(alpha: 0.1),
                            )).toList(),
                          ),
                        ],
                      ),
                    ),
                  ),

                const SizedBox(height: 24),

                // Logout button
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      await provider.logout();
                      if (context.mounted) {
                        Navigator.pushReplacementNamed(context, '/login');
                      }
                    },
                    icon: const Icon(Icons.logout, color: Colors.red),
                    label: const Text('Logout', style: TextStyle(color: Colors.red)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _infoRow(String label, String value, Color textColor, Color secondaryColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text('$label:', style: TextStyle(fontWeight: FontWeight.w600, color: secondaryColor)),
          ),
          Expanded(
            child: Text(value, style: TextStyle(color: textColor)),
          ),
        ],
      ),
    );
  }
}
