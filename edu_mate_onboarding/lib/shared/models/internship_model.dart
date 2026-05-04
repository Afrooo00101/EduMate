class InternshipModel {
  final int id;
  final String title;
  final String companyName;
  final String? description;
  final String position;
  final bool isActive;

  InternshipModel({
    required this.id,
    required this.title,
    required this.companyName,
    this.description,
    required this.position,
    required this.isActive,
  });

  factory InternshipModel.fromJson(Map<String, dynamic> json) {
    return InternshipModel(
      id: json['id'],
      title: json['title'] ?? '',
      companyName: json['company_name'] ?? '',
      description: json['description'],
      position: json['position'] ?? '',
      isActive: json['is_active'] ?? true,
    );
  }
}

class SavedInternshipModel {
  final int id;
  final String title;
  final String companyName;
  final String positionCode;
  final int matchScore;
  final String? matchReason;
  final String? applyUrl;
  String status; // mutable

  SavedInternshipModel({
    required this.id,
    required this.title,
    required this.companyName,
    required this.positionCode,
    required this.matchScore,
    this.matchReason,
    this.applyUrl,
    required this.status,
  });

  factory SavedInternshipModel.fromJson(Map<String, dynamic> json) {
    return SavedInternshipModel(
      id: json['id'],
      title: json['title'] ?? '',
      companyName: json['company_name'] ?? '',
      positionCode: json['position_code'] ?? '',
      matchScore: json['match_score'] ?? 0,
      matchReason: json['match_reason'],
      applyUrl: json['apply_url'],
      status: json['status'] ?? 'saved',
    );
  }
}