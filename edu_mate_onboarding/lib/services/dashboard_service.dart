import '../core/network/api_client.dart';

class DashboardService {
  final ApiClient _apiClient;

  DashboardService(this._apiClient);

  Future<Map<String, dynamic>> getDashboard() async {
    final response = await _apiClient.get('/analytics/dashboard/me');
    // الـ backend بيرجع DashboardResponse (stats, recent_activity, upcoming_events)
    return response;
  }
}