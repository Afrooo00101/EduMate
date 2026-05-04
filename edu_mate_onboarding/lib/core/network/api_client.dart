import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;

typedef UnauthorizedCallback = void Function();

class ApiClient {
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://127.0.0.1:8000/api/v1';
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000/api/v1';
    }
    return 'http://127.0.0.1:8000/api/v1';
  }

  late final Dio _dio;
  final Logger _logger = Logger();
  final UnauthorizedCallback? onUnauthorized;

  ApiClient({String? token, this.onUnauthorized}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    if (token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }

    _addInterceptors();
  }

  void _addInterceptors() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        _logger.d('➡️ ${options.method} ${options.path}');
        return handler.next(options);
      },
      onResponse: (res, handler) {
        _logger.d('✅ ${res.statusCode} - ${res.requestOptions.path}');
        return handler.next(res);
      },
      onError: (err, handler) {
        _logger.e('❌ ${err.message}');
        if (err.response?.statusCode == 401) {
          onUnauthorized?.call();
        }
        return handler.next(err);
      },
    ));
  }

  void updateToken(String newToken) {
    _dio.options.headers['Authorization'] = 'Bearer $newToken';
  }
  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    try {
      final res = await _dio.get(path, queryParameters: query);
      return res.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> post(String path, {dynamic data}) async {
    try {
      final res = await _dio.post(path, data: data);
      return res.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> put(String path, {dynamic data}) async {
    try {
      final res = await _dio.put(path, data: data);
      return res.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> patch(String path, {dynamic data}) async {
    try {
      final res = await _dio.patch(path, data: data);
      return res.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<dynamic> delete(String path) async {
    try {
      final res = await _dio.delete(path);
      return res.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final data = e.response!.data;
      if (data is Map) {
        return data['detail'] ??
            data['message'] ??
            data['error'] ??
            'Server error: ${e.response!.statusCode}';
      }
      if (data is String) return data;
      return 'Server error: ${e.response!.statusCode}';
    }

    if (e.type == DioExceptionType.connectionTimeout) {
      return 'Connection timeout. Please check your internet.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Cannot connect to server. Please try again.';
    }
    return 'Network error: ${e.message}';
  }
}
