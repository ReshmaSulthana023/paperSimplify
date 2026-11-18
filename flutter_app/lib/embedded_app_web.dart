import "dart:html" as html;
import "dart:ui_web" as ui_web;

import "package:flutter/widgets.dart";

const String _webViewType = "next-paper-explainer-web-view";

class EmbeddedApp extends StatelessWidget {
  const EmbeddedApp({super.key, required this.url});

  final String url;

  @override
  Widget build(BuildContext context) {
    ui_web.platformViewRegistry.registerViewFactory(_webViewType, (int viewId) {
      final iframe = html.IFrameElement()
        ..src = url
        ..style.border = "0"
        ..style.width = "100%"
        ..style.height = "100%"
        ..style.display = "block";
      return iframe;
    });
    return const HtmlElementView(viewType: _webViewType);
  }
}
