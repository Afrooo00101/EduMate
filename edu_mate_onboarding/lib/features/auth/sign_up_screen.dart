// lib/screens/sign_up_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/theme.dart';
import 'auth_provider.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _acceptTerms = false;
  bool _loading = false;

  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _snack(String msg, {bool error = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: error ? EdumateColors.error : EdumateColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Future<void> _handleSignUp() async {
    if (_formKey.currentState?.validate() != true) return;

    if (!_acceptTerms) {
      _snack('Please accept terms and conditions', error: true);
      return;
    }

    setState(() => _loading = true);

    try {
      final provider = context.read<UserProvider>();
      await provider.register(
        email: _emailController.text.trim(),
        password: _passwordController.text.trim(),
        fullName: _nameController.text.trim(),
        studentCode: '',
        graduationYear: 0,
      );

      if (!mounted) return;

      if (provider.status == Status.success) {
        context.go('/login');
        _snack('Account created! Please log in.');
      } else {
        _snack(provider.errorMessage ?? 'Registration failed', error: true);
      }
    } catch (e) {
      _snack("Registration failed: $e", error: true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String? _validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your name';
    }
    if (value.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your email';
    }
    if (!value.contains('@') || !value.contains('.')) {
      return 'Please enter a valid email';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your password';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!value.contains(RegExp(r'[A-Z]'))) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!value.contains(RegExp(r'[0-9]'))) {
      return 'Password must contain at least one number';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }
    if (value != _passwordController.text) {
      return 'Passwords do not match';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
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
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Title
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
                                child: const Icon(
                                  Icons.person_add,
                                  color: EdumateColors.primary,
                                  size: 40,
                                ),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                "Create Account",
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: EdumateColors.lightText,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                "Sign up to start your learning journey",
                                textAlign: TextAlign.center,
                                style: TextStyle(fontSize: 14, color: hintColor),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 30),

                        // Full Name
                        Text("Full Name",
                            style: TextStyle(color: hintColor, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _nameController,
                          style: TextStyle(color: textColor),
                          validator: _validateName,
                          decoration: InputDecoration(
                            hintText: "Enter your full name",
                            hintStyle: TextStyle(color: hintColor),
                            prefixIcon: Icon(Icons.person_outline, size: 20, color: hintColor),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Email
                        Text("Email",
                            style: TextStyle(color: hintColor, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          style: TextStyle(color: textColor),
                          validator: _validateEmail,
                          decoration: InputDecoration(
                            hintText: "name@example.com",
                            hintStyle: TextStyle(color: hintColor),
                            prefixIcon: Icon(Icons.email_outlined, size: 20, color: hintColor),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Password
                        Text("Password",
                            style: TextStyle(color: hintColor, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: _obscurePassword,
                          style: TextStyle(color: textColor),
                          validator: _validatePassword,
                          decoration: InputDecoration(
                            hintText: "Create a strong password",
                            hintStyle: TextStyle(color: hintColor),
                            prefixIcon: Icon(Icons.lock_outline, size: 20, color: hintColor),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                size: 20,
                                color: hintColor,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                        ),

                        // Password strength indicator
                        if (_passwordController.text.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: _buildPasswordStrength(),
                          ),

                        const SizedBox(height: 20),

                        // Confirm Password
                        Text("Confirm Password",
                            style: TextStyle(color: hintColor, fontWeight: FontWeight.w500)),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _confirmPasswordController,
                          obscureText: _obscureConfirmPassword,
                          style: TextStyle(color: textColor),
                          validator: _validateConfirmPassword,
                          decoration: InputDecoration(
                            hintText: "Re-enter your password",
                            hintStyle: TextStyle(color: hintColor),
                            prefixIcon: Icon(Icons.lock_outline, size: 20, color: hintColor),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureConfirmPassword
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                size: 20,
                                color: hintColor,
                              ),
                              onPressed: () => setState(
                                  () => _obscureConfirmPassword = !_obscureConfirmPassword),
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Terms and Conditions
                        Row(
                          children: [
                            Checkbox(
                              value: _acceptTerms,
                              onChanged: (v) => setState(() => _acceptTerms = v ?? false),
                              activeColor: EdumateColors.primary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                            Expanded(
                              child: RichText(
                                text: TextSpan(
                                  style: TextStyle(color: hintColor, fontSize: 13),
                                  text: "I agree to the ",
                                  children: [
                                    TextSpan(
                                      text: "Terms of Service",
                                      style: const TextStyle(
                                        color: EdumateColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                      recognizer: TapGestureRecognizer()
                                        ..onTap = () {
                                          _snack("Terms of Service");
                                        },
                                    ),
                                    const TextSpan(text: " and "),
                                    TextSpan(
                                      text: "Privacy Policy",
                                      style: const TextStyle(
                                        color: EdumateColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                      recognizer: TapGestureRecognizer()
                                        ..onTap = () {
                                          _snack("Privacy Policy");
                                        },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // Sign up button
                        SizedBox(
                          width: double.infinity,
                          height: 54,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _handleSignUp,
                            child: _loading
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                    ),
                                  )
                                : const Text(
                                    "Create Account",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Sign in link
                        Center(
                          child: RichText(
                            text: TextSpan(
                              style: TextStyle(color: hintColor, fontSize: 14),
                              text: "Already have an account? ",
                              children: [
                                TextSpan(
                                  text: "Sign in",
                                  style: const TextStyle(
                                    color: EdumateColors.primary,
                                    fontWeight: FontWeight.w600,
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
      ),
    );
  }

  Widget _buildPasswordStrength() {
    final password = _passwordController.text;
    int strength = 0;

    if (password.length >= 6) strength++;
    if (password.contains(RegExp(r'[A-Z]'))) strength++;
    if (password.contains(RegExp(r'[0-9]'))) strength++;
    if (password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) strength++;

    Color color;
    String text;

    switch (strength) {
      case 0:
      case 1:
        color = EdumateColors.error;
        text = 'Weak';
        break;
      case 2:
        color = EdumateColors.warning;
        text = 'Fair';
        break;
      case 3:
        color = EdumateColors.info;
        text = 'Good';
        break;
      case 4:
        color = EdumateColors.success;
        text = 'Strong';
        break;
      default:
        color = Colors.grey;
        text = '';
    }

    return Row(
      children: [
        Expanded(
          child: LinearProgressIndicator(
            value: strength / 4,
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 4,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          text,
          style: TextStyle(
            color: color,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}