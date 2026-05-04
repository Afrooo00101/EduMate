// lib/utils/theme.dart
import 'package:flutter/material.dart';
import 'dart:ui';

// Edumate Colors from Web Version
class EdumateColors {
  // Primary Colors
  static const Color primary = Color(0xFF8B5CF6);      // #8B5CF6
  static const Color primaryDark = Color(0xFF5A4BD6);   // #5A4BD6
  static const Color accent = Color(0xFFA855F7);        // #A855F7
  
  // Background Colors
  static const Color darkBackground = Color(0xFF0F0B20); // #0f0b20
  static const Color darkCard = Color(0xFF1A0F24);       // #1a0f24
  static const Color lightBackground = Color(0xFFF5F5FF);
  static const Color lightCard = Colors.white;
  
  // Utility Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // Text Colors
  static const Color darkText = Color(0xFFE2E8F0);
  static const Color darkMuted = Color(0xFF94A3B8);
  static const Color lightText = Color(0xFF111827);
  static const Color lightMuted = Color(0xFF6B7280);
  
  // Border Colors
  static const Color darkBorder = Color(0x1AFFFFFF);
  static const Color lightBorder = Color(0xFFE6E9F2);
}

class EdumateTheme {
  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    primaryColor: EdumateColors.primary,
    scaffoldBackgroundColor: EdumateColors.lightBackground,
    fontFamily: 'Inter',
    useMaterial3: true,
    
    colorScheme: const ColorScheme.light(
      primary: EdumateColors.primary,
      secondary: EdumateColors.accent,
      surface: EdumateColors.lightCard,
      error: EdumateColors.error,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: EdumateColors.lightText,
    ),
    
    appBarTheme: const AppBarTheme(
      elevation: 0,
      centerTitle: false,
      backgroundColor: Colors.transparent,
      foregroundColor: EdumateColors.lightText,
      titleTextStyle: TextStyle(
        color: EdumateColors.lightText,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        fontFamily: 'Inter',
      ),
    ),
    
    cardTheme: CardThemeData(
      color: EdumateColors.lightCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: EdumateColors.lightBorder, width: 1),
      ),
    ),
    
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: EdumateColors.primary,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
      ),
    ),
    
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: EdumateColors.primary,
        side: const BorderSide(color: EdumateColors.primary),
        minimumSize: const Size(double.infinity, 48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: EdumateColors.lightCard,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: EdumateColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: EdumateColors.error, width: 1),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      hintStyle: const TextStyle(color: EdumateColors.lightMuted),
    ),
    
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: EdumateColors.lightText),
      headlineMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: EdumateColors.lightText),
      titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: EdumateColors.lightText),
      titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: EdumateColors.lightText),
      bodyLarge: TextStyle(fontSize: 16, color: EdumateColors.lightText),
      bodyMedium: TextStyle(fontSize: 14, color: EdumateColors.lightMuted),
    ),
  );
  
  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: EdumateColors.primary,
    scaffoldBackgroundColor: EdumateColors.darkBackground,
    fontFamily: 'Inter',
    useMaterial3: true,
    
    colorScheme: const ColorScheme.dark(
      primary: EdumateColors.primary,
      secondary: EdumateColors.accent,
      surface: EdumateColors.darkCard,
      error: EdumateColors.error,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: EdumateColors.darkText,
    ),
    
    appBarTheme: const AppBarTheme(
      elevation: 0,
      centerTitle: false,
      backgroundColor: Colors.transparent,
      foregroundColor: EdumateColors.darkText,
      titleTextStyle: TextStyle(
        color: EdumateColors.darkText,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        fontFamily: 'Inter',
      ),
    ),
    
    cardTheme: CardThemeData(
      color: EdumateColors.darkCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: EdumateColors.darkBorder, width: 1),
      ),
    ),
    
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: EdumateColors.primary,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
      ),
    ),
    
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: EdumateColors.primary,
        side: const BorderSide(color: EdumateColors.primary),
        minimumSize: const Size(double.infinity, 48),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: EdumateColors.darkCard,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: EdumateColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: EdumateColors.error, width: 1),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      hintStyle: const TextStyle(color: EdumateColors.darkMuted),
    ),
    
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: EdumateColors.darkText),
      headlineMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: EdumateColors.darkText),
      titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: EdumateColors.darkText),
      titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: EdumateColors.darkText),
      bodyLarge: TextStyle(fontSize: 16, color: EdumateColors.darkText),
      bodyMedium: TextStyle(fontSize: 14, color: EdumateColors.darkMuted),
    ),
  );
}

// Glassmorphism Widget
class GlassCard extends StatelessWidget {
  final Widget child;
  final double blur;
  final double opacity;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final Color? borderColor;
  final Color? backgroundColor;
  
  const GlassCard({
    super.key,
    required this.child,
    this.blur = 10,
    this.opacity = 0.85,
    this.borderRadius = 16,
    this.padding = const EdgeInsets.all(16),
    this.margin,
    this.onTap,
    this.borderColor,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final defaultBorderColor = isDark 
        ? EdumateColors.darkBorder 
        : EdumateColors.lightBorder.withOpacity(0.3);
    final defaultBackgroundColor = isDark 
        ? EdumateColors.darkCard 
        : EdumateColors.lightCard;
    
    return Container(
      margin: margin,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            decoration: BoxDecoration(
              color: (backgroundColor ?? defaultBackgroundColor).withOpacity(opacity),
              borderRadius: BorderRadius.circular(borderRadius),
              border: Border.all(
                color: borderColor ?? defaultBorderColor,
                width: 1,
              ),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(borderRadius),
                child: Padding(
                  padding: padding,
                  child: child,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}