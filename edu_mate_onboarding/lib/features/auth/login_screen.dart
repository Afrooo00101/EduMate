import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'auth_provider.dart';
import '../../core/theme/theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _rememberMe = false;
  // Placeholder for CAPTCHA checkbox (disabled, just UI)
  bool _captchaChecked = true; // always true, using test-pass

  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) return 'Please enter your email';
    if (!value.contains('@') || !value.contains('.')) return 'Invalid email';
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.length < 6) return 'Min 6 chars';
    return null;
  }

  void _login(UserProvider provider) async {
    if (!_formKey.currentState!.validate()) return;

    await provider.login(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );

    if (!mounted) return;

    if (provider.status == Status.success) {
      context.go('/home');
      _snack('Login successful!');
    } else if (provider.status == Status.error) {
      _snack(provider.errorMessage ?? "Login failed", error: true);
    }
  }

  void _snack(String msg, {bool error = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: error ? EdumateColors.error : EdumateColors.success,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
    final hintColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;

    return Scaffold(
      body: Consumer<UserProvider>(
        builder: (context, provider, child) {
          final isLoading = provider.status == Status.loading;

          return Container(
            width: double.infinity,
            height: double.infinity,
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
                    constraints: const BoxConstraints(maxWidth: 450),
                    child: GlassCard(
                      blur: 15,
                      opacity: 0.95,
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Logo & Welcome Text
                            Center(
                              child: Column(
                                children: [
                                  Container(
                                    width: 80,
                                    height: 80,
                                    decoration: BoxDecoration(
                                      color: EdumateColors.primary.withOpacity(0.1),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.school,
                                        color: EdumateColors.primary, size: 40),
                                  ),
                                  const SizedBox(height: 16),
                                  const Text(
                                    "Welcome Back!",
                                    style: TextStyle(
                                      fontSize: 28,
                                      fontWeight: FontWeight.bold,
                                      color: EdumateColors.lightText,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    "Sign in to continue your learning journey",
                                    style: TextStyle(fontSize: 14, color: hintColor),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 30),

                            /// Email Field
                            Text("Email",
                                style: TextStyle(color: hintColor)),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _emailController,
                              validator: _validateEmail,
                              style: TextStyle(color: textColor),
                              decoration: InputDecoration(
                                hintText: "name@example.com",
                                prefixIcon: Icon(Icons.email_outlined, color: hintColor),
                              ),
                            ),

                            const SizedBox(height: 20),

                            /// Password Field
                            Text("Password",
                                style: TextStyle(color: hintColor)),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              validator: _validatePassword,
                              style: TextStyle(color: textColor),
                              decoration: InputDecoration(
                                hintText: "Enter password",
                                prefixIcon: Icon(Icons.lock_outline, color: hintColor),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword
                                        ? Icons.visibility_outlined
                                        : Icons.visibility_off_outlined,
                                  ),
                                  onPressed: () => setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  }),
                                ),
                              ),
                            ),

                            const SizedBox(height: 12),

                            /// Forgot Password?
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () {
                                  context.go('/forgot-password');
                                },
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                  minimumSize: const Size(0, 0),
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: Text(
                                  "Forgot Password?",
                                  style: TextStyle(
                                    color: EdumateColors.primary,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ),

                            const SizedBox(height: 16),

                            /// CAPTCHA Placeholder
                            GlassCard(
                              blur: 6,
                              opacity: 0.9,
                              borderRadius: 12,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 10,
                              ),
                              child: Row(
                                children: [
                                  Checkbox(
                                    value: true,
                                    onChanged: (_) {},
                                    activeColor: EdumateColors.primary,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      "I'm not a robot",
                                      style: TextStyle(
                                        color: textColor,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                  Icon(
                                    Icons.verified_user,
                                    color: EdumateColors.success,
                                    size: 22,
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 20),

                            /// Login Button
                            SizedBox(
                              width: double.infinity,
                              height: 54,
                              child: ElevatedButton(
                                onPressed: isLoading
                                    ? null
                                    : () => _login(provider),
                                child: isLoading
                                    ? const CircularProgressIndicator(
                                  color: Colors.white,
                                )
                                    : const Text("Sign In"),
                              ),
                            ),

                            const SizedBox(height: 24),

                            /// Don't have an account? Sign Up
                            Center(
                              child: RichText(
                                text: TextSpan(
                                  style: TextStyle(color: hintColor, fontSize: 14),
                                  children: [
                                    const TextSpan(text: "Don't have an account? "),
                                    TextSpan(
                                      text: "Sign Up",
                                      style: const TextStyle(
                                        color: EdumateColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                      recognizer: TapGestureRecognizer()
                                        ..onTap = () {
                                          context.go('/signup');
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
        },
      ),
    );
  }
}