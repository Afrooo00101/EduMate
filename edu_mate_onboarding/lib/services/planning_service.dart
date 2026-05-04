import 'dart:convert';
import '../core/network/api_client.dart';

class PlanningService {
  final ApiClient _apiClient;

  PlanningService(this._apiClient);

  Future<Map<String, dynamic>> getPlanningState() async {
    final response = await _apiClient.get('/planning/state/me');
    return response;
  }

  Future<void> savePlanningState(Map<String, dynamic> data) async {
    await _apiClient.put('/planning/state/me', data: data);
  }


  Future<Map<String, dynamic>> getGPASummary() async {
    final response = await _apiClient.get('/planning/gpa/me');
    return response;
  }
}