// STATION Field OS Terminal — app shell state. Hub-and-spoke router + mission machine.
import 'dart:async';
import 'package:flutter/material.dart';

class TState extends ChangeNotifier {
  String route = 'overview';
  bool woke = false;
  bool relSeen = false;
  String mission = 'working'; // idle | working | paused
  bool worker = false;
  double progress = 62;
  String clock = '';
  String settingsSec = 'about';
  bool eeResolved = false;
  String? sheet; // 'details'
  Timer? _clock, _prog;

  TState() {
    _tick();
    _clock = Timer.periodic(const Duration(seconds: 5), (_) => _tick());
    _prog = Timer.periodic(const Duration(milliseconds: 1500), (_) {
      if (mission == 'working' && !worker) {
        progress = (progress + 0.15).clamp(0, 99);
        notifyListeners();
      }
    });
  }
  @override
  void dispose() { _clock?.cancel(); _prog?.cancel(); super.dispose(); }

  void _tick() {
    final d = DateTime.now();
    var h = d.hour; final m = d.minute.toString().padLeft(2, '0');
    final ap = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (h == 0) h = 12;
    clock = '$h:$m $ap';
    notifyListeners();
  }

  bool get working => mission == 'working' || mission == 'paused';
  int get progressInt => progress.round();
  String get remLabel {
    final rem = (88 * (100 - progress) / 100).round().clamp(1, 999);
    return rem >= 60 ? '${rem ~/ 60} h ${rem % 60} min' : '$rem min';
  }

  void go(String r) { route = r; sheet = null; notifyListeners(); }
  void setSheet(String? s) { sheet = s; notifyListeners(); }
  void wake() { woke = true; go(!relSeen ? 'relnotes' : mission == 'working' ? 'operate' : 'overview'); }
  void markRelSeen() { relSeen = true; notifyListeners(); }
  void setSettingsSec(String s) { settingsSec = s; notifyListeners(); }
  void resolveEE() { eeResolved = true; notifyListeners(); }

  void startMission() { mission = 'working'; notifyListeners(); }
  void pause() { mission = 'paused'; notifyListeners(); }
  void resume() { mission = 'working'; notifyListeners(); }
  void endMission() { mission = 'idle'; notifyListeners(); Future.delayed(const Duration(milliseconds: 350), () => go('summary')); }
  void triggerWorker() { worker = true; mission = 'paused'; notifyListeners(); }
  void clearWorker() { worker = false; mission = 'working'; notifyListeners(); }
}

class Scope extends InheritedNotifier<TState> {
  const Scope({super.key, required TState state, required super.child}) : super(notifier: state);
  static TState of(BuildContext c) => c.dependOnInheritedWidgetOfExactType<Scope>()!.notifier!;
}
