import 'package:flutter/material.dart';
import '../../shared/models/activity_model.dart';
import '../../shared/models/course_model.dart';
import '../../services/dashboard_service.dart';
import '../../core/network/api_client.dart';

class HomeProvider extends ChangeNotifier {
  bool isLoading = true;
  String userName = "Student";
  int careerScore = 72;
  int skillGrowth = 12;
  int learningTime = 12;
  List<ActivityModel> activities = [];
  List<CourseModel> courses = [];

  // ✅ دالة التهيئة الرئيسية تأخذ ApiClient بدلاً من البيانات الوهمية
  Future<void> init(ApiClient apiClient) async {
    isLoading = true;
    notifyListeners();
    await _loadDashboard(apiClient);
    isLoading = false;
    notifyListeners();
  }

  Future<void> _loadDashboard(ApiClient apiClient) async {
    try {
      final service = DashboardService(apiClient);
      final dashboard = await service.getDashboard();

      final stats = dashboard['stats'] as Map<String, dynamic>?;
      if (stats != null) {
        careerScore = stats['career_score'] ?? 72;
        skillGrowth = stats['skill_growth'] ?? 12;
        learningTime = stats['learning_time_hours'] ?? 12;
      }

      // تحويل recent_activity إلى ActivityModel
      final recent = dashboard['recent_activity'] as List?;
      if (recent != null) {
        activities = recent.map((a) {
          final text = a['text'] ?? '';
          final createdAt = a['created_at'] as String?;
          final time = _formatTimeAgo(createdAt);
          return ActivityModel(
            icon: '📝', // أيقونة افتراضية
            text: text,
            time: time,
            color: Colors.blue,
          );
        }).toList();
      }
    } catch (e) {
      // في حالة فشل الاتصال، استخدم القيم الافتراضية (الوهمية)
      _loadFallbackData();
    }
  }

  void _loadFallbackData() {
    // هذه البيانات تُستخدم فقط عند فشل الاتصال
    activities = [
      ActivityModel(icon: '✓', text: 'Resume Updated', time: '2h ago', color: Colors.green),
    ];
    courses = [
      CourseModel(
        id: '1',
        title: 'Flutter',
        provider: 'Google',
        category: 'Technology',
        difficulty: 'beginner',
        duration: '8 weeks',
        rating: 4.8,
        students: 1000,
        image: '',
        isEnrolled: false,
        progress: 0.0,
        description: '',
        price: 0,
        language: 'English',
        certificate: true,
      ),
    ];
  }

  String _formatTimeAgo(String? iso8601) {
    if (iso8601 == null) return '';
    try {
      final dt = DateTime.parse(iso8601);
      final diff = DateTime.now().difference(dt);
      if (diff.inHours < 1) return 'Just now';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (_) {
      return '';
    }
  }

  Future<void> refresh(ApiClient apiClient) async {
    isLoading = true;
    notifyListeners();
    await _loadDashboard(apiClient);
    isLoading = false;
    notifyListeners();
  }
}