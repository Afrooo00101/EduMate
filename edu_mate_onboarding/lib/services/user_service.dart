import '../core/network/api_client.dart';
import '../shared/models/user_model.dart';

class UserService {
  final ApiClient _apiClient;

  UserService(this._apiClient);

  Future<UserModel> getCurrentUser() async {
    final response = await _apiClient.get('/users/me');
    return UserModel.fromMe(response);
  }

  Future<UserModel> updateUser({
    String? studentCode,
    String? fullName,
    String? email,
    int? majorId,
    int? graduationYear,
    String? skillsSummary,
    String? profileImageUrl,
  }) async {
    final body = {
      if (studentCode != null) 'student_code': studentCode,
      if (fullName != null) 'full_name': fullName,
      if (email != null) 'email': email,
      if (majorId != null) 'major_id': majorId,
      if (graduationYear != null) 'graduation_year': graduationYear,
      if (skillsSummary != null) 'skills_summary': skillsSummary,
      if (profileImageUrl != null) 'profile_image_url': profileImageUrl,
    };
    final response = await _apiClient.put('/users/me', data: body);
    return UserModel.fromMe(response);
  }
}