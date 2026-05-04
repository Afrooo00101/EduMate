// lib/features/home/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';
import 'home_provider.dart';
import '../../core/theme/theme.dart';
import '../../core/theme/dark_mode_notifier.dart';
import '../../core/utils/responsive.dart';
import '../../shared/widgets/stat_card.dart';
import '../../shared/widgets/activity_item.dart';
import '../auth/auth_provider.dart';
import '../../core/network/api_client.dart';

class HomePageContent extends StatefulWidget {
  const HomePageContent({super.key});

  @override
  State<HomePageContent> createState() => _HomePageContentState();
}

class _HomePageContentState extends State<HomePageContent> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final userProvider = context.read<UserProvider>();
        final token = userProvider.user?.token ?? '';
        final apiClient = ApiClient(token: token);
        context.read<HomeProvider>().init(apiClient);
      }
    });
  }

  String _getFormattedDate() {
    final now = DateTime.now();
    return '${_getWeekday(now.weekday)}, ${now.day} ${_getMonth(now.month)} ${now.year}';
  }

  String _getWeekday(int w) {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays[w - 1];
  }

  String _getMonth(int m) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[m - 1];
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? EdumateColors.darkText : EdumateColors.lightText;
    final secondaryTextColor = isDark ? EdumateColors.darkMuted : EdumateColors.lightMuted;
    final cardColor = isDark ? EdumateColors.darkCard : EdumateColors.lightCard;

    return Consumer2<HomeProvider, UserProvider>(
      builder: (context, homeProvider, userProvider, child) {
        final userName = userProvider.user?.name ?? homeProvider.userName ?? 'User';

        if (homeProvider.isLoading && homeProvider.activities.isEmpty) {
          return Scaffold(
            backgroundColor: isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground,
            body: const Center(child: CircularProgressIndicator()),
          );
        }

        return Scaffold(
          key: _scaffoldKey,
          backgroundColor: isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground,
          drawer: _buildDrawer(context, isDark, textColor, secondaryTextColor, cardColor, userName, userProvider.user?.email ?? ''),
          appBar: AppBar(
            elevation: 0,
            backgroundColor: Colors.transparent,
            leading: IconButton(
              icon: const Icon(Icons.menu),
              onPressed: () => _scaffoldKey.currentState?.openDrawer(),
            ),
            actions: [
              ValueListenableBuilder(
                valueListenable: darkModeNotifier,
                builder: (context, mode, child) {
                  return IconButton(
                    icon: Icon(mode ? Icons.light_mode : Icons.dark_mode),
                    onPressed: () async {
                      final newValue = !mode;
                      darkModeNotifier.value = newValue;
                      final prefs = await SharedPreferences.getInstance();
                      await prefs.setBool('dark_mode', newValue);
                    },
                  );
                },
              ),
              IconButton(
                icon: const Icon(Icons.person),
                onPressed: () => context.push('/profile'),
              ),
              const SizedBox(width: 8),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () async {
              final token = userProvider.user?.token ?? '';
              final apiClient = ApiClient(token: token);
              await homeProvider.refresh(apiClient);
            },
            color: EdumateColors.primary,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hello, $userName! 👋',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textColor),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _getFormattedDate(),
                    style: TextStyle(fontSize: 14, color: secondaryTextColor),
                  ),
                  const SizedBox(height: 24),
                  _buildStatsSection(homeProvider, textColor, secondaryTextColor),
                  const SizedBox(height: 24),
                  _buildMainGrid(homeProvider, textColor, secondaryTextColor, cardColor),
                  const SizedBox(height: 24),
                  _buildLearningProgressCard(homeProvider, textColor, secondaryTextColor, cardColor),
                  const SizedBox(height: 20),
                  _buildRecentActivity(homeProvider, textColor, secondaryTextColor, cardColor),
                ],
              ),
            ),
          ),
        );
      },
    );
  }


  Widget _buildRecentActivity(HomeProvider provider, Color textColor, Color secondaryColor, Color cardColor) {
    if (provider.activities.isEmpty) return const SizedBox();

    return Card(
      color: cardColor,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: secondaryColor.withOpacity(0.1)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('📅 Recent Activity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: provider.activities.length,
              separatorBuilder: (context, index) => Divider(height: 1, color: secondaryColor.withOpacity(0.1)),
              itemBuilder: (context, index) {
                return ActivityItem(
                  activity: provider.activities[index],
                  textColor: textColor,
                  secondaryColor: secondaryColor,
                  isLast: index == provider.activities.length - 1,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMainGrid(HomeProvider provider, Color textColor, Color secondaryColor, Color cardColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('🚀 Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: [
            _actionBtn(Icons.description, 'Resume', EdumateColors.primary, cardColor, () => context.push('/resume')),
            _actionBtn(Icons.business_center, 'Internships', EdumateColors.info, cardColor, () => context.push('/internships')),
            _actionBtn(Icons.calendar_month, 'Planning', EdumateColors.warning, cardColor, () => context.push('/planning')),
            _actionBtn(Icons.chat, 'AI Chat', EdumateColors.accent, cardColor, () => context.push('/chat')),
          ],
        ),
      ],
    );
  }

  Widget _actionBtn(IconData icon, String label, Color color, Color cardColor, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection(HomeProvider provider, Color textColor, Color secondaryColor) {
    return Row(
      children: [
        Expanded(child: StatCard(icon: '🎯', label: 'Score', value: '${provider.careerScore}', unit: '/100', color: EdumateColors.primary, textColor: textColor, secondaryColor: secondaryColor)),
        const SizedBox(width: 12),
        Expanded(child: StatCard(icon: '📈', label: 'Growth', value: '+${provider.skillGrowth}%', unit: 'mo', color: EdumateColors.success, textColor: textColor, secondaryColor: secondaryColor)),
      ],
    );
  }

  Widget _buildLearningProgressCard(HomeProvider provider, Color textColor, Color secondaryColor, Color cardColor) {
    return Card(
      color: cardColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('📚 Learning Progress', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 12),
            LinearProgressIndicator(value: 0.6, backgroundColor: secondaryColor.withOpacity(0.1), color: EdumateColors.primary, minHeight: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context, bool isDark, Color textColor, Color secondaryColor, Color cardColor, String name, String email) {
    return Drawer(
      backgroundColor: isDark ? EdumateColors.darkBackground : EdumateColors.lightBackground,
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            accountName: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            accountEmail: Text(email),
            currentAccountPicture: const CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.person, color: EdumateColors.primary, size: 40),
            ),
            decoration: const BoxDecoration(
              color: EdumateColors.primary,
              image: DecorationImage(
                image: NetworkImage('https://www.transparenttextures.com/patterns/cubes.png'), // شكل جمالي في الخلفية
                opacity: 0.1,
              ),
            ),
          ),

          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _drawerItem(context, Icons.home_outlined, 'Home', null), // null لأننا في الهوم بالفعل

                _drawerItem(context, Icons.person_outline, 'My Profile', '/profile'),

                _drawerItem(context, Icons.description_outlined, 'My Resume', '/resume'),

                const Divider(),

                _drawerItem(context, Icons.book_outlined, 'Courses', '/courses'),

                _drawerItem(context, Icons.business_center_outlined, 'Internships', '/internships'),

                _drawerItem(context, Icons.calendar_month_outlined, 'Academic Planning', '/planning'),

                _drawerItem(context, Icons.chat_outlined, 'AI Edumate Chat', '/chat'),

                const Divider(),
              ],
            ),
          ),

          _drawerItem(
              context,
              Icons.logout,
              'Logout',
              null,
              isLogout: true,
              onTap: () async {
                await context.read<UserProvider>().logout();
                if (context.mounted) context.go('/login');
              }
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _drawerItem(BuildContext context, IconData icon, String title, String? route, {bool isLogout = false, VoidCallback? onTap}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListTile(
      leading: Icon(
          icon,
          color: isLogout ? Colors.red : (isDark ? Colors.white70 : Colors.black87)
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isLogout ? Colors.red : (isDark ? Colors.white : Colors.black87),
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, size: 16, color: Colors.grey),
      onTap: onTap ?? () {
        Navigator.pop(context);
        if (route != null) {
          context.push(route);
        }
      },
    );
  }}