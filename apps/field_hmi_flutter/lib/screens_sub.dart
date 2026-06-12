// STATION Field OS Terminal — spoke screens: Safety, Settings, Camera, Manual, History, E-stop.
import 'package:flutter/material.dart';
import 'tokens.dart';
import 'data.dart';
import 'state.dart';
import 'widgets.dart';

Widget _scaffold(TState s, String title, Widget body, {Widget? bar, List<Widget> trailing = const []}) => Column(children: [
      TopStrip(title: title, battery: Robot.battery, clock: s.clock, onBack: () => s.go('overview'), trailing: trailing),
      Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 24), child: body)),
      if (bar != null) bar,
    ]);

// ---------- Safety ----------
class SafetyScreen extends StatelessWidget {
  final TState s;
  const SafetyScreen({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    final worker = s.worker;
    final rows = worker
        ? const [KV('E-stop relay', 'Clear', 'ok'), KV('Perception', 'Person detected · 4.1 m', 'red'), KV('Command gates', 'Autonomy blocked', 'red'), KV('Localization', '0.97 confidence', 'ok')]
        : safetyRows;
    return _scaffold(s, 'Safety',
      SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Rows([for (var i = 0; i < rows.length; i++) TRow(rows[i].k, v: rows[i].v, vTone: rows[i].tone, last: i == rows.length - 1)]),
        const RowsH('Recent incidents'),
        Rows([for (var i = 0; i < incidents.length; i++) TRow(incidents[i].k, sub: incidents[i].v, last: i == incidents.length - 1)]),
        const SizedBox(height: 16),
        const RowsH('Scenario (demo)'),
        Row(children: [
          Expanded(child: OutlinedButton(onPressed: () => worker ? s.clearWorker() : s.triggerWorker(),
            style: OutlinedButton.styleFrom(side: const BorderSide(color: Tk.amber), padding: const EdgeInsets.symmetric(vertical: 16), foregroundColor: Tk.amber),
            child: Text(worker ? 'Clear aisle' : 'Trigger person detected', style: Tk.sans(15, w: FontWeight.w700, c: Tk.amber)))),
          const SizedBox(width: 12),
          Expanded(child: OutlinedButton(onPressed: () => s.go('estop'),
            style: OutlinedButton.styleFrom(side: const BorderSide(color: Tk.red), padding: const EdgeInsets.symmetric(vertical: 16), foregroundColor: Tk.red),
            child: Text('Physical E-stop', style: Tk.sans(15, w: FontWeight.w700, c: Tk.red)))),
        ]),
      ])),
      bar: worker
          ? GreenBar(tone: 'red', line1: 'Person detected', line2: 'Two safety rows failing', actions: [Cta('Go to Operate', onTap: () => s.go('operate'))])
          : GreenBar(tone: 'green', line1: 'All clear', line2: 'E-stop clear · perception normal · gates open', live: 'safe'),
    );
  }
}

// ---------- Settings (master-detail) ----------
class SettingsScreen extends StatelessWidget {
  final TState s;
  const SettingsScreen({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    return _scaffold(s, 'Settings',
      Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        SizedBox(width: 360, child: Rows([
          for (var i = 0; i < settingsGroups.length; i++)
            TRow(settingsGroups[i].v, sel: s.settingsSec == settingsGroups[i].k, chev: true, last: i == settingsGroups.length - 1,
                onTap: () => s.setSettingsSec(settingsGroups[i].k)),
        ])),
        const SizedBox(width: 16),
        Expanded(child: Container(
          decoration: BoxDecoration(color: Tk.tile, borderRadius: BorderRadius.circular(Tk.rLg)),
          clipBehavior: Clip.antiAlias,
          child: SingleChildScrollView(child: _detail(s)),
        )),
      ]),
    );
  }

  Widget _detail(TState s) {
    switch (s.settingsSec) {
      case 'network': return _kvList(network);
      case 'modules': return Column(children: [for (var i = 0; i < modules.length; i++) TRow(modules[i].k, sub: modules[i].tone == 'ok' ? null : modules[i].v, v: modules[i].tone == 'ok' ? modules[i].v : (modules[i].tone == 'red' ? 'Conflict' : 'Warning'), vTone: modules[i].tone, last: i == modules.length - 1)]);
      case 'calib': return _kvList(const [KV('CAL-VPU-RGB', 'Calibrated · Jun 2', 'ok'), KV('CAL-VPU-NIR', 'Calibrated · Jun 2', 'ok'), KV('CAL-TOOL-EE', 'Calibrated · Jun 5', 'ok')]);
      case 'updates': return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Padding(padding: const EdgeInsets.all(20), child: Row(children: [
            Text('${updatesAvailable()} updates available', style: Tk.sans(18, w: FontWeight.w700)),
            const Spacer(),
            Cta('Open Update Center', ghost: true, onTap: () => s.go('updates')),
          ])),
          for (final u in updates.where((u) => u.available || u.blocked))
            TRow(u.name, sub: '${u.owner} · ${u.type.toUpperCase()}', v: u.blocked ? 'Blocked' : '${u.cur} → ${u.next}', vTone: u.blocked ? 'red' : 'green', chev: true, onTap: () => s.go(u.audit != null ? 'audit' : 'updates')),
        ]);
      case 'dev': return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const RowsH('Live signals (read-only)'),
          for (final n in nodes) TRow(n.id, sub: n.sig, v: n.bus, vTone: 'ok'),
          const RowsH('Command ACK log'),
          ...const [
            TRow('scan.start → ACU', sub: 'received → accepted → executed', v: '246 ms', vTone: 'ok'),
            TRow('motion.set_speed_limit → MCU', sub: 'received → accepted → executed', v: '88 ms', vTone: 'ok', last: true),
          ],
        ]);
      default: return _kvList(about);
    }
  }

  Widget _kvList(List<KV> rows) => Column(children: [for (var i = 0; i < rows.length; i++) TRow(rows[i].k, v: rows[i].v, vTone: rows[i].tone == '' ? 'ok' : rows[i].tone, last: i == rows.length - 1)]);
}

// ---------- Camera ----------
class CameraScreen extends StatefulWidget {
  final TState s;
  const CameraScreen({super.key, required this.s});
  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  int cam = 0;
  bool rec = false;
  @override
  Widget build(BuildContext context) {
    final s = widget.s;
    return Column(children: [
      TopStrip(title: 'Camera', battery: Robot.battery, clock: s.clock, onBack: () => s.go('overview')),
      Expanded(child: Padding(padding: const EdgeInsets.fromLTRB(24, 0, 24, 12), child: Column(children: [
        Expanded(child: ClipRRect(borderRadius: BorderRadius.circular(Tk.rLg), child: Stack(children: [
          Positioned.fill(child: CustomPaint(painter: _CamPainter(cam))),
          Positioned(left: 16, top: 16, child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: BoxDecoration(color: const Color(0xB3080C09), borderRadius: BorderRadius.circular(Tk.r)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
              Text(cameras[cam], style: Tk.sans(16, w: FontWeight.w800)),
              const SizedBox(height: 6),
              Text(_camSub(cam), style: Tk.mono(13, c: Tk.mute)),
            ]),
          )),
          Positioned(right: 16, top: 16, child: GestureDetector(
            onTap: () => setState(() => rec = !rec),
            child: Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
              decoration: BoxDecoration(color: const Color(0x9E080C09), borderRadius: BorderRadius.circular(999)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [Dot(rec ? Tk.red : Tk.faint), const SizedBox(width: 8), Text(rec ? 'REC' : 'Record', style: Tk.mono(13, w: FontWeight.w700, c: Tk.ink))])),
          )),
        ]))),
        const SizedBox(height: 12),
        Row(children: [for (var i = 0; i < cameras.length; i++) Expanded(child: Padding(
          padding: EdgeInsets.only(right: i < cameras.length - 1 ? 6 : 0),
          child: GestureDetector(onTap: () => setState(() => cam = i), child: Container(
            height: 56, alignment: Alignment.center,
            decoration: BoxDecoration(color: cam == i ? Tk.greenDeep : Tk.tile, borderRadius: BorderRadius.circular(Tk.r), border: cam == i ? Border.all(color: Tk.green, width: 1.5) : null),
            child: Text(cameras[i], style: Tk.sans(16, w: FontWeight.w700, c: cam == i ? Tk.ink : Tk.mute)),
          )),
        ))]),
      ]))),
    ]);
  }

  String _camSub(int i) => ['semantic drive scene · 29.6 fps', 'heat by distance · 0.5–12 m', 'end-effector zoom · cut point locked', 'skeleton tracking · stop-hand pauses'][i];
}

class _CamPainter extends CustomPainter {
  final int cam;
  _CamPainter(this.cam);
  @override
  void paint(Canvas canvas, Size size) {
    final base = cam == 1 ? const Color(0xFF120A18) : const Color(0xFF0A0F0B);
    canvas.drawRect(Offset.zero & size, Paint()..color = base);
    final vanish = Offset(size.width * 0.5, size.height * 0.32);
    final line = Paint()..color = const Color(0x223BE08A)..strokeWidth = 1.4;
    for (double fx = -0.2; fx <= 1.2; fx += 0.1) {
      canvas.drawLine(Offset(size.width * fx, size.height), vanish, line);
    }
    if (cam == 0 || cam == 2) {
      for (final d in const [Offset(0.34, 0.46), Offset(0.6, 0.4), Offset(0.72, 0.6)]) {
        final r = Rect.fromCenter(center: Offset(d.dx * size.width, d.dy * size.height), width: size.width * 0.09, height: size.height * 0.12);
        canvas.drawRRect(RRect.fromRectAndRadius(r, const Radius.circular(6)), Paint()..color = Tk.green..style = PaintingStyle.stroke..strokeWidth = 2);
      }
    }
  }
  @override
  bool shouldRepaint(covariant _CamPainter o) => o.cam != cam;
}

// ---------- Manual ----------
class ManualScreen extends StatelessWidget {
  final TState s;
  const ManualScreen({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    return _scaffold(s, 'Manual drive',
      Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Expanded(flex: 11, child: Container(
          decoration: BoxDecoration(color: Tk.tile, borderRadius: BorderRadius.circular(Tk.rLg)),
          padding: const EdgeInsets.all(26),
          child: Column(children: [
            Expanded(child: _padBtn(Icons.keyboard_arrow_up)),
            const SizedBox(height: 12),
            Expanded(child: Row(children: [Expanded(child: _padBtn(Icons.keyboard_arrow_left)), const SizedBox(width: 12), Expanded(child: _padBtn(Icons.stop, stop: true)), const SizedBox(width: 12), Expanded(child: _padBtn(Icons.keyboard_arrow_right))])),
            const SizedBox(height: 12),
            Expanded(child: _padBtn(Icons.keyboard_arrow_down)),
          ]),
        )),
        const SizedBox(width: 16),
        Expanded(flex: 10, child: Column(children: [
          Container(width: double.infinity, padding: const EdgeInsets.all(22), decoration: BoxDecoration(color: Tk.tile, borderRadius: BorderRadius.circular(Tk.rLg)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Speed', style: Tk.sans(14, w: FontWeight.w600, c: Tk.mute, ls: 0)),
              Text('0.4 m/s', style: Tk.mono(34, w: FontWeight.w700, c: Tk.ink, ls: -1)),
              SliderTheme(data: SliderThemeData(activeTrackColor: Tk.green, inactiveTrackColor: Tk.hairlineHi, thumbColor: Tk.green), child: Slider(value: 0.4, onChanged: (_) {})),
            ])),
          const SizedBox(height: 14),
          Expanded(child: Rows(const [
            TRow('Grip', v: 'Hold to act', vTone: 'amber'),
            TRow('Cut', v: 'Hold to act', vTone: 'amber'),
            TRow('Home', v: 'Tap', vTone: 'ok', last: true),
          ])),
        ])),
      ]),
      bar: GreenBar(tone: 'amber', line1: 'Manual mode', line2: 'Autonomy suspended while you drive', actions: [Cta('Return to auto', onTap: () => s.go(s.working ? 'operate' : 'overview'))]),
    );
  }

  Widget _padBtn(IconData ic, {bool stop = false}) => Container(
        decoration: BoxDecoration(color: stop ? const Color(0x24F0443B) : const Color(0x0FFFFFFF), borderRadius: BorderRadius.circular(18)),
        child: Icon(ic, color: stop ? Tk.red : Tk.ink, size: 34),
      );
}

// ---------- History ----------
class HistoryScreen extends StatelessWidget {
  final TState s;
  const HistoryScreen({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    return _scaffold(s, 'History',
      SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        const RowsH('Sessions'),
        Rows(const [
          TRow('Thinning · Zone A-3', sub: 'Jun 10 · 3.2 h · 1,240 fruits · 2 interruptions', v: 'Complete', vTone: 'green'),
          TRow('Growth scan · Zone A-1', sub: 'Jun 9 · 0.9 h · 380 observations', v: 'Complete', vTone: 'green'),
          TRow('Thinning · Zone B-2', sub: 'Jun 8 · 2.1 h · 1 yield', v: 'Complete', vTone: 'green', last: true),
        ]),
        const RowsH('Incidents'),
        Rows([for (var i = 0; i < incidents.length; i++) TRow(incidents[i].k, sub: incidents[i].v, chev: true, last: i == incidents.length - 1, onTap: () => s.go('safety'))]),
      ])),
    );
  }
}

// ---------- E-stop ----------
class EstopScreen extends StatelessWidget {
  final TState s;
  const EstopScreen({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    return Container(color: Tk.canvas, child: Column(children: [
      Container(width: double.infinity, color: Tk.red, padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 26),
        child: Row(children: [
          Container(width: 18, height: 18, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle)),
          const SizedBox(width: 16),
          Text('EMERGENCY STOP', style: Tk.sans(30, w: FontWeight.w900, c: Colors.white, ls: 1.5)),
          const Spacer(),
          Text('RBT-THIN-0001', style: Tk.sans(14, w: FontWeight.w600, c: const Color(0xE6FFFFFF), ls: 0)),
        ])),
      Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 48), child: Row(children: [
        Expanded(child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Stopped.', style: Tk.sans(56, w: FontWeight.w900, c: Tk.ink, ls: -1.5)),
          const SizedBox(height: 16),
          SizedBox(width: 460, child: Text.rich(TextSpan(children: [
            const TextSpan(text: 'The physical relay cut motor power. '),
            TextSpan(text: 'This screen cannot release it.', style: Tk.sans(21, w: FontWeight.w700, c: Tk.ink, ls: 0)),
          ]), style: Tk.sans(21, w: FontWeight.w500, c: Tk.mute, ls: 0))),
        ])),
        Expanded(child: Rows(const [
          TRow('1 · Make the aisle safe', v: '', last: false),
          TRow('2 · Twist the physical E-stop to release', v: ''),
          TRow('3 · Press Reset on the base', v: '', last: true),
        ])),
      ]))),
      Padding(padding: const EdgeInsets.only(bottom: 26), child: Cta('Physically released (demo)', ghost: true, onTap: () => s.go(s.working ? 'operate' : 'overview'))),
    ]));
  }
}
