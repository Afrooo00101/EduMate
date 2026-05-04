import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:typed_data';

class UserRepository {
  final SharedPreferences _prefs;
  UserRepository(this._prefs);

  // ==================== SETTERS ====================
  Future<void> setName(String name) => _prefs.setString('profile_name', name);
  Future<void> setBio(String bio) => _prefs.setString('profile_bio', bio);
  Future<void> setCity(String city) => _prefs.setString('profile_city', city);
  Future<void> setDob(String dob) => _prefs.setString('profile_dob', dob);
  Future<void> setGender(String gender) => _prefs.setString('profile_gender', gender);
  Future<void> setCountry(String country) => _prefs.setString('profile_country', country);
  Future<void> setLanguage(String language) => _prefs.setString('profile_language', language);
  Future<void> setEducationStatus(String status) => _prefs.setString('profile_education_status', status);
  Future<void> setMajor(String major) => _prefs.setString('profile_major', major);
  Future<void> setUniversity(String university) => _prefs.setString('profile_university', university);
  Future<void> setUniversityGpa(String gpa) => _prefs.setString('profile_university_gpa', gpa);
  Future<void> setSchoolName(String name) => _prefs.setString('profile_school_name', name);
  Future<void> setSchoolGpa(String gpa) => _prefs.setString('profile_school_gpa', gpa);
  Future<void> setSkills(String skills) => _prefs.setString('profile_skills', skills);
  Future<void> setProfileImage(Uint8List image) async {
    final base64 = base64Encode(image);
    await _prefs.setString('profile_image', base64);
  }

  // ==================== GETTERS ====================
  Future<String?> getName() async => _prefs.getString('profile_name');
  Future<String?> getBio() async => _prefs.getString('profile_bio');
  Future<String?> getCity() async => _prefs.getString('profile_city');
  Future<String?> getDob() async => _prefs.getString('profile_dob');
  Future<String?> getGender() async => _prefs.getString('profile_gender');
  Future<String?> getCountry() async => _prefs.getString('profile_country');
  Future<String?> getLanguage() async => _prefs.getString('profile_language');
  Future<String?> getEducationStatus() async => _prefs.getString('profile_education_status');
  Future<String?> getMajor() async => _prefs.getString('profile_major');
  Future<String?> getUniversity() async => _prefs.getString('profile_university');
  Future<String?> getUniversityGpa() async => _prefs.getString('profile_university_gpa');
  Future<String?> getSchoolName() async => _prefs.getString('profile_school_name');
  Future<String?> getSchoolGpa() async => _prefs.getString('profile_school_gpa');
  Future<String?> getSkills() async => _prefs.getString('profile_skills');
  Future<Uint8List?> getProfileImage() async {
    final base64 = _prefs.getString('profile_image');
    return base64 != null ? base64Decode(base64) : null;
  }

  // ==================== SAVE ALL ====================
  Future<void> saveAll({
    required String name,
    String? bio,
    String? city,
    String? dob,
    String? gender,
    String? country,
    String? language,
    String? educationStatus,
    String? major,
    String? university,
    String? universityGpa,
    String? schoolName,
    String? schoolGpa,
    String? skills,
    Uint8List? image,
  }) async {
    if (name.isNotEmpty) await setName(name);
    if (bio != null) await setBio(bio);
    if (city != null) await setCity(city);
    if (dob != null) await setDob(dob);
    if (gender != null) await setGender(gender);
    if (country != null) await setCountry(country);
    if (language != null) await setLanguage(language);
    if (educationStatus != null) await setEducationStatus(educationStatus);
    if (major != null) await setMajor(major);
    if (university != null) await setUniversity(university);
    if (universityGpa != null) await setUniversityGpa(universityGpa);
    if (schoolName != null) await setSchoolName(schoolName);
    if (schoolGpa != null) await setSchoolGpa(schoolGpa);
    if (skills != null) await setSkills(skills);
    if (image != null) await setProfileImage(image);
  }

  // ==================== LOAD ALL ====================
  Future<Map<String, dynamic>> loadAll() async {
    return {
      'name': await getName(),
      'bio': await getBio(),
      'city': await getCity(),
      'dob': await getDob(),
      'gender': await getGender(),
      'country': await getCountry(),
      'language': await getLanguage(),
      'educationStatus': await getEducationStatus(),
      'major': await getMajor(),
      'university': await getUniversity(),
      'universityGpa': await getUniversityGpa(),
      'schoolName': await getSchoolName(),
      'schoolGpa': await getSchoolGpa(),
      'skills': await getSkills(),
      'image': await getProfileImage(),
    };
  }
}