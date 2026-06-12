// STATION Field OS — on-robot Terminal HMI (design spec implementation).
import 'package:flutter/material.dart';
import 'tokens.dart';
import 'state.dart';
import 'terminal.dart';

void main() => runApp(const FieldHmiApp());

class FieldHmiApp extends StatefulWidget {
  const FieldHmiApp({super.key});
  @override
  State<FieldHmiApp> createState() => _FieldHmiAppState();
}

class _FieldHmiAppState extends State<FieldHmiApp> {
  final TState _state = TState();
  @override
  void dispose() { _state.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return Scope(
      state: _state,
      child: AnimatedBuilder(
        animation: _state,
        builder: (context, _) => MaterialApp(
          title: 'STATION Field OS Terminal',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(useMaterial3: true, brightness: Brightness.dark, scaffoldBackgroundColor: Tk.deviceBg),
          home: const Scaffold(backgroundColor: Tk.deviceBg, body: Terminal()),
        ),
      ),
    );
  }
}
