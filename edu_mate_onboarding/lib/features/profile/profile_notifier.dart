import 'package:flutter/foundation.dart';

/// Simple notifier to tell ProfilePage to reload stored profile data.
final ValueNotifier<int> profileReloadNotifier = ValueNotifier<int>(0);
