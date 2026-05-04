import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/theme.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final hintColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [EdumateColors.primary, EdumateColors.accent],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Container(
                width: double.infinity,
                constraints: const BoxConstraints(maxWidth: 450),
                child: GlassCard(
                  blur: 15,
                  opacity: 0.95,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title
                      const Center(
                        child: Text(
                          "Forgot password?",
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: EdumateColors.lightText,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),

                      Center(
                        child: Text(
                          "Enter your email address and we'll send you a link to reset your password",
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 15, color: hintColor),
                        ),
                      ),
                      const SizedBox(height: 30),

                      // Email Label
                      Text(
                        "Email",
                        style: TextStyle(
                          color: hintColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Email Input
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          hintText: "name@example.com",
                          hintStyle: TextStyle(color: hintColor),
                          prefixIcon: Icon(Icons.email_outlined, size: 20, color: hintColor),
                        ),
                      ),

                      const SizedBox(height: 25),

                      // Send reset link button
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: () {
                            if (_emailController.text.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text("Please enter your email address"),
                                  backgroundColor: EdumateColors.error,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              );
                              return;
                            }
                            // Show success message
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: const Text("Reset link sent to your email"),
                                backgroundColor: EdumateColors.success,
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            );
                            // Navigate back to login after a delay
                            Future.delayed(const Duration(seconds: 2), () {
                              if (mounted) {
                                context.go('/login');
                              }
                            });
                          },
                          child: const Text(
                            "Send reset link",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 30),

                      // Back to login link
                      Center(
                        child: RichText(
                          text: TextSpan(
                            style: TextStyle(color: hintColor),
                            children: [
                              TextSpan(
                                text: "Back to login",
                                style: const TextStyle(
                                  color: EdumateColors.primary,
                                  fontWeight: FontWeight.w500,
                                ),
                                recognizer: TapGestureRecognizer()
                                  ..onTap = () {
                                    context.go('/login');
                                  },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}