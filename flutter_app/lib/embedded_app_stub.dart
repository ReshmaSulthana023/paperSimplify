import "dart:async";

import "package:flutter/material.dart";
import "package:flutter/services.dart";
import "package:webview_windows/webview_windows.dart";

class EmbeddedApp extends StatefulWidget {
  const EmbeddedApp({super.key, required this.url});

  final String url;

  @override
  State<EmbeddedApp> createState() => _EmbeddedAppState();
}

class _EmbeddedAppState extends State<EmbeddedApp> {
  final WebviewController _controller = WebviewController();
  final List<StreamSubscription<dynamic>> _subscriptions = [];
  bool _initialized = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      await _controller.initialize();
      await _controller.setPopupWindowPolicy(
        WebviewPopupWindowPolicy.showInSameWindow,
      );
      await _controller.loadUrl(widget.url);
      if (!mounted) {
        return;
      }
      setState(() => _initialized = true);
    } on PlatformException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() => _error = "${error.code}: ${error.message}");
    }
  }

  @override
  void dispose() {
    for (final subscription in _subscriptions) {
      subscription.cancel();
    }
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(_error!, textAlign: TextAlign.center),
        ),
      );
    }
    if (!_initialized) {
      return const Center(child: CircularProgressIndicator());
    }
    return Webview(_controller);
  }
}
