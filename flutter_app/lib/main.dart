import "dart:convert";

import "package:flutter/material.dart";
import "package:http/http.dart" as http;
import "embedded_app.dart";

void main() {
  runApp(const PaperExplainerApp());
}

class PaperExplainerApp extends StatefulWidget {
  const PaperExplainerApp({super.key});

  @override
  State<PaperExplainerApp> createState() => _PaperExplainerAppState();
}

class _PaperExplainerAppState extends State<PaperExplainerApp> {
  static const String apiUrl = String.fromEnvironment(
    "DOTNET_API_URL",
    defaultValue: "http://localhost:5100",
  );
  static const String webAppUrl = String.fromEnvironment(
    "NEXT_APP_URL",
    defaultValue: "http://localhost:3000",
  );

  String status = "Checking .NET API...";
  bool showWebApp = false;

  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    try {
      final response = await http.get(Uri.parse("$apiUrl/api/status"));
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        setState(() {
          status = "${body["service"]}: ${body["status"]}";
        });
      } else {
        setState(() => status = "API returned ${response.statusCode}");
      }
    } catch (_) {
      setState(() => status = "Unable to reach the .NET API");
    }
  }

  void _openWebApp() {
    setState(() => showWebApp = true);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "AI Research Paper Explainer",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.amber),
        useMaterial3: true,
      ),
      home: Scaffold(
        appBar: AppBar(
          leading: showWebApp
              ? IconButton(
                  tooltip: "Back",
                  onPressed: () => setState(() => showWebApp = false),
                  icon: const Icon(Icons.arrow_back),
                )
              : null,
          title: const Text("AI Research Paper Explainer"),
          centerTitle: true,
        ),
        body: showWebApp
            ? EmbeddedApp(url: webAppUrl)
            : Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.description_outlined, size: 64),
                      const SizedBox(height: 16),
                      const Text(
                        "AI Research Paper Explainer",
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Text(status, textAlign: TextAlign.center),
                      const SizedBox(height: 24),
                      FilledButton.icon(
                        onPressed: _openWebApp,
                        icon: const Icon(Icons.open_in_new),
                        label: const Text("Open paper explainer"),
                      ),
                      const SizedBox(height: 10),
                      OutlinedButton(
                        onPressed: _checkStatus,
                        child: const Text("Check API status"),
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}
