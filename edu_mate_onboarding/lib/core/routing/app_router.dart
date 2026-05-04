import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../features/auth/login_screen.dart';
import '../../../features/auth/sign_up_screen.dart';
import '../../../features/home/home_screen.dart';
import '../../../features/chat/chat_screen.dart';
import '../../../features/courses/courses_screen.dart';
import '../../../features/planning/planning_screen.dart';
import '../../../features/cv_builder/cv_builder_screen.dart';
import '../../../features/profile/profile_page.dart';
import '../../../features/profile/edit_profile_page.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../../features/internships/internships_screen.dart';


class AppRouter {
  static const String login = '/login';
  static const String signUp = '/signup';
  static const String home = '/home';
  static const String chat = '/chat';
  static const String courses = '/courses';
  static const String planning = '/planning';
  static const String cvBuilder = '/cvBuilder';
  static const String profile = '/profile';
  static const String editProfile = '/editProfile';
  static const String onboarding = '/onboarding';
  static const String resume = '/resume';
  static const String internships = '/internships';

  static final GoRouter router = GoRouter(
    initialLocation: onboarding,
    routes: [
      GoRoute(
        path: onboarding,
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: signUp,
        name: 'signUp',
        builder: (context, state) => const SignUpScreen(),
      ),
      GoRoute(
        path: home,
        name: 'home',
        builder: (context, state) => const HomePageContent(),
      ),
      GoRoute(
        path: chat,
        name: 'chat',
        builder: (context, state) => const ChatScreen(),
      ),
      GoRoute(
        path: courses,
        name: 'courses',
        builder: (context, state) => const CoursesScreen(),
      ),
      GoRoute(
        path: planning,
        name: 'planning',
        builder: (context, state) => const PlanningScreen(),
      ),
      GoRoute(
        path: cvBuilder,
        name: 'cvBuilder',
        builder: (context, state) => const CVBuilderScreen(),
      ),
      GoRoute(
        path: profile,
        name: 'profile',
        builder: (context, state) => const ProfilePage(),
      ),
      GoRoute(
        path: editProfile,
        name: 'editProfile',
        builder: (context, state) => const EditProfilePage(),
      ),
      GoRoute(
        path: resume,
        name: 'resume',
        builder: (context, state) => const CVBuilderScreen(),
      ),
      GoRoute(
        path: internships,
        name: 'internships',
        builder: (context, state) => const InternshipsScreen(),
      ),
    ],
  );
}