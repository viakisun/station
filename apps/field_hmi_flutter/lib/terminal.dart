// STATION Field OS Terminal — device frame + hub-and-spoke router.
import 'package:flutter/material.dart';
import 'tokens.dart';
import 'state.dart';
import 'screens_main.dart';
import 'screens_sub.dart';
import 'screens_audit.dart';

class Terminal extends StatelessWidget {
  const Terminal({super.key});
  @override
  Widget build(BuildContext context) {
    final s = Scope.of(context);
    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(center: Alignment(0, -1), radius: 1.3, colors: [Color(0xFF131513), Color(0xFF090A09), Color(0xFF050605)], stops: [0, 0.55, 1]),
      ),
      alignment: Alignment.center,
      child: FittedBox(
        fit: BoxFit.contain,
        child: Container(
          width: 1372, height: 892, padding: const EdgeInsets.all(46),
          decoration: BoxDecoration(
            gradient: const LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xFF1A1C1A), Color(0xFF101110)], stops: [0, 0.7]),
            borderRadius: BorderRadius.circular(26),
            boxShadow: const [BoxShadow(color: Color(0xA6000000), blurRadius: 80, offset: Offset(0, 36))],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: SizedBox(
              width: 1280, height: 800,
              child: Container(
                color: Tk.canvas,
                child: Stack(children: [
                  Positioned.fill(child: _screen(s)),
                  if (!s.woke) Positioned.fill(child: WakeScreen(onDone: s.wake)),
                  DetailsSheet(s: s),
                ]),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _screen(TState s) {
    if (s.route == 'estop') return EstopScreen(s: s);
    switch (s.route) {
      case 'preflight': return PreflightScreen(s: s);
      case 'operate': return s.mission == 'idle' ? OverviewScreen(s: s) : OperateScreen(s: s);
      case 'camera': return CameraScreen(s: s);
      case 'manual': return ManualScreen(s: s);
      case 'safety': return SafetyScreen(s: s);
      case 'settings': return SettingsScreen(s: s);
      case 'history': return HistoryScreen(s: s);
      case 'summary': return SummaryScreen(s: s);
      case 'relnotes': return RelNotesScreen(s: s);
      case 'updates': return UpdateCenterScreen(s: s);
      case 'audit': return AuditScreen(s: s);
      default: return OverviewScreen(s: s);
    }
  }
}
