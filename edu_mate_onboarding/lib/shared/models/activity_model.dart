// lib/models/activity_model.dart
import 'package:flutter/material.dart';

class ActivityModel {
  final String icon;
  final String text;
  final String time;
  final Color color;

  ActivityModel({
    required this.icon,
    required this.text,
    required this.time,
    required this.color,
  });
}