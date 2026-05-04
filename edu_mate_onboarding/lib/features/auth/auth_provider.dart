import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/network/api_client.dart';
import '../../shared/models/user_model.dart';
import '../../../services/user_service.dart';
import '../../../services/auth_service.dart';

enum Status { idle, loading, success, error }

class UserProvider extends ChangeNotifier {
  late final ApiClient _apiClient;
  late final UserService _userService;
  late final AuthService _authService;

  UserModel? user;
  Status status = Status.idle;
  String? errorMessage;

  UserProvider() {
    _apiClient = ApiClient(
      onUnauthorized: () {

        logout();
      },
    );
    _userService = UserService(_apiClient);
    _authService = AuthService(_apiClient);
  }


  Future<void> register({
    required String email,
    required String password,
    String? fullName,
    String? studentCode,
    int? majorId,
    int? graduationYear,
    String? skillsSummary,
  }) async {
    status = Status.loading;
    errorMessage = null;
    notifyListeners();

    try {
      await _authService.register(
        email: email,
        password: password,
        fullName: fullName,
        studentCode: studentCode,
        majorId: majorId,
        graduationYear: graduationYear,
        skillsSummary: skillsSummary,
      );
      status = Status.success;
    } catch (e) {
      status = Status.error;
      errorMessage = e.toString();
    }
    notifyListeners();
  }


  Future<void> login(String email, String password) async {
    status = Status.loading;
    errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.post('/auth/login', data: {
        'email': email,
        'password': password,
        'captcha_token': 'test-pass',
      });

      final tempUser = UserModel.fromJson(response);
      _apiClient.updateToken(tempUser.token);


      final expiresInMinutes = response['expires_in_minutes'] as int? ?? 30;
      final expiry = DateTime.now().add(Duration(minutes: expiresInMinutes));

      final fullUser = await _userService.getCurrentUser();

      user = UserModel(
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        token: tempUser.token,
        studentCode: fullUser.studentCode,
        graduationYear: fullUser.graduationYear,
        skillsSummary: fullUser.skillsSummary,
        profileImageUrl: fullUser.profileImageUrl,
        majorId: fullUser.majorId,
        major: fullUser.major,
        gpa: fullUser.gpa,
        lastLogin: fullUser.lastLogin,
        isActive: fullUser.isActive,
        isAdmin: fullUser.isAdmin,
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', user!.token);
      await prefs.setInt('token_expires_at', expiry.millisecondsSinceEpoch);
      await prefs.setString('user_name', user!.name);
      await prefs.setString('user_email', user!.email);
      await prefs.setBool('is_logged_in', true);

      status = Status.success;
    } catch (e) {
      status = Status.error;
      errorMessage = e.toString();
    }
    notifyListeners();
  }


  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final isLoggedIn = prefs.getBool('is_logged_in') ?? false;
    if (!isLoggedIn) return false;


    final expiresAt = prefs.getInt('token_expires_at');
    if (expiresAt != null) {
      final expiry = DateTime.fromMillisecondsSinceEpoch(expiresAt);
      if (DateTime.now().isAfter(expiry)) {
        await logout();
        return false;
      }
    }

    final token = prefs.getString('token');
    final name = prefs.getString('user_name');
    final email = prefs.getString('user_email');

    if (token == null || name == null || email == null) return false;

    user = UserModel(
      id: 0,
      name: name,
      email: email,
      token: token,
      studentCode: '',
      graduationYear: 0,
    );
    _apiClient.updateToken(token);

    try {
      final fullUser = await _userService.getCurrentUser();
      user = UserModel(
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        token: token,
        studentCode: fullUser.studentCode,
        graduationYear: fullUser.graduationYear,
        skillsSummary: fullUser.skillsSummary,
        profileImageUrl: fullUser.profileImageUrl,
        majorId: fullUser.majorId,
        major: fullUser.major,
        gpa: fullUser.gpa,
      );
      await prefs.setString('user_name', user!.name);
      await prefs.setString('user_email', user!.email);
    } catch (e) {
      await logout();
      return false;
    }

    status = Status.success;
    notifyListeners();
    return true;
  }

  Future<void> logout() async {
    try {
      await _authService.logout();
    } catch (_) {}

    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    user = null;
    status = Status.idle;
    errorMessage = null;
    notifyListeners();
  }
}