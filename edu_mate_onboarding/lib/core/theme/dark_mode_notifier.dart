import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

final ValueNotifier<bool> darkModeNotifier = ValueNotifier<bool>(false);
Future<void> toggleDarkMode() async {
  final newValue = !darkModeNotifier.value;
  darkModeNotifier.value = newValue;
  final prefs = await SharedPreferences.getInstance();
  await prefs.setBool('dark_mode', newValue);
}