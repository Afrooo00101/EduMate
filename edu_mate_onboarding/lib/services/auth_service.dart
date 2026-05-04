import '../core/network/api_client.dart';
import '../shared/models/user_model.dart';

class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  Future<UserModel> register({
    required String email,
    required String password,
    String? fullName,
    String? studentCode,
    int? majorId,
    int? graduationYear,
    String? skillsSummary,
  }) async {
    final body = <String, dynamic>{
      'email': email,
      'password': password,
    };

    if (studentCode != null && studentCode.isNotEmpty) {
      body['student_code'] = studentCode;
    }
    if (fullName != null && fullName.isNotEmpty) {
      body['full_name'] = fullName;
    }
    if (majorId != null) body['major_id'] = majorId;
    if (graduationYear != null) body['graduation_year'] = graduationYear;
    if (skillsSummary != null && skillsSummary.isNotEmpty) {
      body['skills_summary'] = skillsSummary;
    }

    final response = await _apiClient.post('/auth/register', data: body);
    return UserModel.fromMe(response);
  }

  Future<void> logout() async {
    try {
      await _apiClient.post('/auth/logout');
    } catch (_) {
    }
  }
}