// lib/screens/chat_screen.dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../profile/profile_notifier.dart';
import '../../core/theme/theme.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isTyping = false;

  // AI suggestions
  final List<String> _suggestions = [
    'How do I improve my resume?',
    'What courses should I take for Flutter?',
    'Tips for interview preparation',
    'Best career path for Computer Science',
    'How to build a portfolio?',
  ];

  // Bot responses
  final Map<String, String> _botResponses = {
    'resume': 'To improve your resume, focus on:\n• Quantifiable achievements\n• Relevant keywords for ATS\n• Clean, professional formatting\n• Projects and practical experience\n\nWould you like me to review your resume?',
    'course': 'For Flutter development, I recommend:\n• Flutter & Dart - The Complete Guide (Udemy)\n• Google\'s official Flutter courses\n• Building practical apps like weather or todo apps\n• Join Flutter communities on Discord/Reddit',
    'interview': 'Interview tips:\n• Practice STAR method (Situation, Task, Action, Result)\n• Research company culture\n• Prepare 3-5 questions for interviewer\n• Review common technical questions\n• Mock interviews with friends',
    'career': 'For CS careers, consider:\n• Software Engineer (Frontend/Backend/Mobile)\n• Data Scientist/Machine Learning Engineer\n• DevOps Engineer\n• Product Manager\n• Technical Consultant\n\nWhat interests you most?',
    'portfolio': 'Build your portfolio with:\n• 3-5 quality projects (not just tutorials)\n• GitHub with clean code and READMEs\n• Live demos when possible\n• Personal website showcasing work\n• Document your learning journey',
  };

  @override
  void initState() {
    super.initState();
    _addWelcomeMessage();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _addWelcomeMessage() {
    _messages.add({
      'isMe': false,
      'text': '👋 Hello! I\'m your AI career assistant. How can I help you today?',
      'time': _getCurrentTime(),
      'type': 'text',
    });
  }

  String _getCurrentTime() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }

  void _sendMessage(String text) {
    if (text.trim().isEmpty) return;

    // Add user message
    setState(() {
      _messages.add({
        'isMe': true,
        'text': text,
        'time': _getCurrentTime(),
        'type': 'text',
      });
      _isTyping = true;
    });

    _messageController.clear();
    _scrollToBottom();

    // Simulate bot response
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() {
          _messages.add({
            'isMe': false,
            'text': _generateResponse(text),
            'time': _getCurrentTime(),
            'type': 'text',
          });
          _isTyping = false;
        });
        _scrollToBottom();
      }
    });
  }

  String _generateResponse(String input) {
    final lower = input.toLowerCase();
    
    if (lower.contains('resume') || lower.contains('cv')) {
      return _botResponses['resume']!;
    } else if (lower.contains('course') || lower.contains('learn') || lower.contains('study')) {
      return _botResponses['course']!;
    } else if (lower.contains('interview') || lower.contains('job')) {
      return _botResponses['interview']!;
    } else if (lower.contains('career') || lower.contains('path') || lower.contains('future')) {
      return _botResponses['career']!;
    } else if (lower.contains('portfolio') || lower.contains('project')) {
      return _botResponses['portfolio']!;
    } else if (lower.contains('hello') || lower.contains('hi') || lower.contains('hey')) {
      return 'Hello! 👋 How can I assist with your career today?';
    } else if (lower.contains('thank')) {
      return 'You\'re welcome! 😊 Feel free to ask if you need anything else.';
    } else {
      return 'That\'s a great question! To give you the best advice, could you provide more details about what you\'re looking for? For example, are you interested in resumes, courses, interviews, or career paths?';
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _saveToProfile(String field, String text) async {
    final prefs = await SharedPreferences.getInstance();
    
    switch (field) {
      case 'name':
        await prefs.setString('profile_name', text);
        break;
      case 'bio':
        await prefs.setString('profile_bio', text);
        break;
      case 'skill':
        final skills = prefs.getString('profile_skills') ?? '';
        final updatedSkills = skills.isEmpty ? text : '$skills, $text';
        await prefs.setString('profile_skills', updatedSkills);
        break;
    }
    
    profileReloadNotifier.value++;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('✓ Saved to profile'),
        backgroundColor: EdumateColors.success,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showSaveOptions(String messageText) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).brightness == Brightness.dark 
              ? EdumateColors.darkCard 
              : EdumateColors.lightCard,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Save to Profile',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            _buildSaveOption(
              icon: Icons.person,
              title: 'Save as Name',
              onTap: () {
                Navigator.pop(ctx);
                _saveToProfile('name', messageText);
              },
            ),
            _buildSaveOption(
              icon: Icons.info,
              title: 'Save as Bio',
              onTap: () {
                Navigator.pop(ctx);
                _saveToProfile('bio', messageText);
              },
            ),
            _buildSaveOption(
              icon: Icons.code,
              title: 'Save as Skill',
              onTap: () {
                Navigator.pop(ctx);
                _saveToProfile('skill', messageText);
              },
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSaveOption({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: EdumateColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: EdumateColors.primary, size: 20),
      ),
      title: Text(title),
      onTap: onTap,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground;
    final cardColor = isDark ? EdumateColors.darkCard : EdumateColors.lightCard;
    final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
    final secondaryTextColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;
    const botColor = EdumateColors.primary;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: botColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.auto_awesome, color: botColor, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'AI Career Assistant',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: EdumateColors.success,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Online',
                      style: TextStyle(
                        fontSize: 12,
                        color: secondaryTextColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        actions: [
          GlassCard(
            blur: 8,
            opacity: 0.9,
            borderRadius: 20,
            padding: EdgeInsets.zero,
            child: IconButton(
              icon: Icon(Icons.refresh, color: secondaryTextColor),
              onPressed: () {
                setState(() {
                  _messages.clear();
                  _addWelcomeMessage();
                });
              },
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              itemCount: _messages.length,
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final message = _messages[index];
                final isMe = message['isMe'] as bool;
                
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: isMe ? botColor : cardColor,
                      borderRadius: BorderRadius.circular(16),
                      border: !isMe ? Border.all(
                        color: isDark ? EdumateColors.darkBorder : EdumateColors.lightBorder,
                        width: 1,
                      ) : null,
                    ),
                    child: Column(
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(
                          message['text'],
                          style: TextStyle(
                            color: isMe ? Colors.white : textColor,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          message['time'],
                          style: TextStyle(
                            color: isMe ? Colors.white70 : secondaryTextColor,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Text('AI is typing', style: TextStyle(color: secondaryTextColor)),
                  const SizedBox(width: 4),
                  const SizedBox(
                    width: 24,
                    height: 12,
                    child: LinearProgressIndicator(
                      backgroundColor: Colors.grey,
                      valueColor: AlwaysStoppedAnimation<Color>(botColor),
                    ),
                  ),
                ],
              ),
            ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: cardColor.withOpacity(0.9),
              border: Border(
                top: BorderSide(
                  color: isDark ? EdumateColors.darkBorder : EdumateColors.lightBorder,
                  width: 1,
                ),
              ),
            ),
            child: Column(
              children: [
                if (_messages.length <= 1)
                  SizedBox(
                    height: 80,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _suggestions.length,
                      itemBuilder: (context, index) {
                        return GestureDetector(
                          onTap: () => _sendMessage(_suggestions[index]),
                          child: GlassCard(
                            blur: 6,
                            opacity: 0.9,
                            borderRadius: 12,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            margin: const EdgeInsets.only(right: 8),
                            child: Center(
                              child: Text(
                                _suggestions[index],
                                style: TextStyle(color: textColor, fontSize: 12),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: GlassCard(
                        blur: 8,
                        opacity: 0.9,
                        borderRadius: 24,
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        child: TextField(
                          controller: _messageController,
                          style: TextStyle(color: textColor),
                          decoration: InputDecoration(
                            hintText: 'Ask me about careers, skills...',
                            hintStyle: TextStyle(color: secondaryTextColor),
                            border: InputBorder.none,
                          ),
                          onSubmitted: (text) => _sendMessage(text),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onLongPress: () {
                        if (_messageController.text.isNotEmpty) {
                          _showSaveOptions(_messageController.text);
                        }
                      },
                      child: Container(
                        width: 48,
                        height: 48,
                        decoration: const BoxDecoration(
                          color: botColor,
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.send, color: Colors.white, size: 18),
                          onPressed: () => _sendMessage(_messageController.text),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}