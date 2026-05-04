import '../core/network/api_client.dart';
import '../shared/models/internship_model.dart';

class InternshipService {
  final ApiClient _apiClient;

  InternshipService(this._apiClient);


  Future<List<InternshipModel>> fetchInternships({required String position}) async {
    final response = await _apiClient.get('/internships', query: {'position': position});
    final List data = response as List;
    return data.map((json) => InternshipModel.fromJson(json)).toList();
  }

  // حفظ تدريب (إضافة إلى saved)
  Future<SavedInternshipModel> saveInternship({
    required int internshipId,
    required String title,
    required String companyName,
    required String positionCode,
    int matchScore = 80,
    String? matchReason,
    String? applyUrl,
    String status = 'saved',
  }) async {
    final body = {
      'internship_id': internshipId,
      'title': title,
      'company_name': companyName,
      'position_code': positionCode,
      'match_score': matchScore,
      'match_reason': matchReason,
      'apply_url': applyUrl,
      'status': status,
    };
    final response = await _apiClient.post('/internships/saved/me', data: body);
    return SavedInternshipModel.fromJson(response);
  }

  // جلب قائمة التدريبات المحفوظة للمستخدم
  Future<List<SavedInternshipModel>> fetchSavedInternships() async {
    final response = await _apiClient.get('/internships/saved/me');
    final List data = response as List;
    return data.map((json) => SavedInternshipModel.fromJson(json)).toList();
  }

  // تحديث حالة تدريب محفوظ
  Future<SavedInternshipModel> updateSavedInternshipStatus(int savedId, String status) async {
    final response = await _apiClient.patch('/internships/saved/me/$savedId', data: {'status': status});
    return SavedInternshipModel.fromJson(response);
  }

  // حذف تدريب محفوظ
  Future<void> deleteSavedInternship(int savedId) async {
    await _apiClient.delete('/internships/saved/me/$savedId');
  }

  // التقديم على تدريب (اختياري: إضافة سجل طلب)
  Future<void> applyForInternship(int internshipId, DateTime applicationDate) async {
    final body = {
      'internship_id': internshipId,
      'application_date': applicationDate.toIso8601String(),
    };
    await _apiClient.post('/internships/applications/me', data: body);
  }
}