// STATION Field OS Terminal — main screens: Wake, Overview, Pre-flight, Operate, Summary.
import 'dart:async';
import 'package:flutter/material.dart';
import 'tokens.dart';
import 'data.dart';
import 'state.dart';
import 'widgets.dart';

// ---------- Wake ----------
class WakeScreen extends StatefulWidget {
  final VoidCallback onDone;
  const WakeScreen({super.key, required this.onDone});
  @override
  State<WakeScreen> createState() => _WakeScreenState();
}

class _WakeScreenState extends State<WakeScreen> {
  static const lines = ['Connecting agent', 'Nodes 5 / 5', 'Map GH-A v7', 'Authority — Field', 'Audit set — G5', 'Checking updates'];
  static const vals = ['ok', 'ok', 'ok', 'ok', 'verified', '6 found'];
  int n = 0;
  final _timers = <Timer>[];
  @override
  void initState() {
    super.initState();
    for (var i = 0; i < lines.length; i++) {
      _timers.add(Timer(Duration(milliseconds: 500 + i * 420), () => setState(() => n = i + 1)));
    }
    _timers.add(Timer(Duration(milliseconds: 500 + lines.length * 420 + 600), widget.onDone));
  }
  @override
  void dispose() { for (final t in _timers) { t.cancel(); } super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Tk.canvas, alignment: Alignment.center,
      child: SizedBox(width: 420, child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        for (var i = 0; i < lines.length; i++)
          Padding(padding: const EdgeInsets.symmetric(vertical: 7), child: Row(children: [
            Text(lines[i], style: Tk.mono(16, c: i < n ? Tk.mute : Tk.faint)),
            const Spacer(),
            if (i < n) Text(vals[i], style: Tk.mono(16, w: FontWeight.w700, c: Tk.green)),
          ])),
        const SizedBox(height: 6),
        Container(width: 10, height: 22, color: Tk.green),
      ])),
    );
  }
}

// ---------- shared top meta ----------
List<Widget> topMeta(TState s, {Color? dot}) => [
      if (dot != null) Padding(padding: const EdgeInsets.only(right: 4), child: Dot(dot)),
    ];

// ---------- Overview (hub) ----------
class OverviewScreen extends StatelessWidget {
  final TState s;
  const OverviewScreen({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    final working = s.working;
    final n = updatesAvailable();
    return Column(children: [
      TopStrip(back: false, title: 'Zone ${Robot.zone}, ${Robot.site}', battery: Robot.battery, clock: s.clock),
      Expanded(child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          // stat band
          SizedBox(height: 156, child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Expanded(flex: 3, child: _statCard('Today', [
              Row(crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, children: [
                CountUp(todayFruits, Tk.mono(44, w: FontWeight.w700, c: Tk.ink, ls: -1.5).copyWith(height: 1.0)),
                const SizedBox(width: 8), Flexible(child: Text('fruits thinned', maxLines: 1, overflow: TextOverflow.ellipsis, style: Tk.sans(20, w: FontWeight.w600, c: Tk.mute, ls: 0))),
              ]),
              const Spacer(), Spark(todaySpark),
            ])),
            const SizedBox(width: 14),
            Expanded(flex: 2, child: _statCard(working ? 'Battery' : 'Battery · charging', [
              Row(crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, children: [
                Text('${Robot.battery}', style: Tk.mono(44, w: FontWeight.w700, c: Tk.ink, ls: -1.5).copyWith(height: 1.0)),
                Text('%', style: Tk.sans(20, w: FontWeight.w600, c: Tk.mute, ls: 0)),
              ]),
              const SizedBox(height: 6),
              Flexible(child: Text(working ? '${Robot.batteryHours} h remaining · charge at dock 4' : 'Charging at dock 4 · 1.2 h to full', maxLines: 2, overflow: TextOverflow.ellipsis, style: Tk.sans(14, w: FontWeight.w500, c: Tk.mute, ls: 0))),
            ])),
          ])),
          const SizedBox(height: 14),
          // tiles
          Expanded(child: GridView.count(
            crossAxisCount: 3, mainAxisSpacing: 14, crossAxisSpacing: 14, childAspectRatio: 1.95, physics: const NeverScrollableScrollPhysics(),
            children: [
              Tile(Icons.play_arrow_rounded, 'Start task', sub: working ? 'Thinning running' : '3 tasks ready', onTap: () => s.go(working ? 'operate' : 'preflight')),
              Tile(Icons.videocam_outlined, 'Camera', sub: '4 sources', onTap: () => s.go('camera')),
              Tile(Icons.sports_esports_outlined, 'Manual', sub: 'Drive & end-effector', onTap: () => s.go('manual')),
              Tile(Icons.verified_user_outlined, 'Safety', sub: 'All clear', onTap: () => s.go('safety')),
              Tile(Icons.history, 'History', sub: '2 incidents this week', onTap: () => s.go('history')),
              Tile(Icons.settings_outlined, 'Settings', sub: n > 0 ? '$n updates available' : 'Up to date', onTap: () => s.go('settings')),
            ],
          )),
        ]),
      )),
      if (working)
        GreenBar(
          tone: s.worker ? 'red' : 'green',
          line1: s.worker ? 'Person detected — autonomy paused' : 'Thinning active',
          line2: s.worker ? 'Zone A-3 · waiting for clear' : 'Zone A-3 · ${s.remLabel} left',
          live: s.worker ? null : '${s.progressInt}%',
          actions: [Cta(s.worker ? 'Review' : 'Open', onTap: () => s.go('operate'))],
        )
      else
        GreenBar(
          tone: 'idleflat', line1: 'Charging · ready when you are',
          line2: n > 0 ? 'All systems go · $n updates available — install while idle' : 'All systems go · software up to date',
          live: 'idle',
          actions: [Cta('Start task', onTap: () => s.go('preflight')), if (n > 0) Cta('Updates', ghost: true, onTap: () => s.go('updates'))],
        ),
    ]);
  }

  Widget _statCard(String k, List<Widget> body) => Container(
        padding: const EdgeInsets.fromLTRB(22, 20, 22, 20),
        decoration: BoxDecoration(color: Tk.tile, borderRadius: BorderRadius.circular(Tk.rLg)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(k, style: Tk.sans(14, w: FontWeight.w600, c: Tk.mute, ls: 0)),
          const SizedBox(height: 4),
          ...body,
        ]),
      );
}

// ---------- Pre-flight ----------
class PreflightScreen extends StatefulWidget {
  final TState s;
  const PreflightScreen({super.key, required this.s});
  @override
  State<PreflightScreen> createState() => _PreflightScreenState();
}

class _PreflightScreenState extends State<PreflightScreen> {
  String sel = 'thin';
  int checked = 0;
  final _timers = <Timer>[];
  late List<Task> list;

  @override
  void initState() { super.initState(); _runChecks(); }
  @override
  void dispose() { for (final t in _timers) { t.cancel(); } super.dispose(); }

  Task get task => list.firstWhere((t) => t.id == sel);
  bool get blocked => task.state == 'blocked';

  void _runChecks() {
    for (final t in _timers) { t.cancel(); }
    _timers.clear();
    list = tasks.map((t) => t.id == 'pinch' && widget.s.eeResolved ? const Task('pinch', 'Pinching', 'ready', 'Zone A-2 · est 45 min', ['Route valid', 'End-effector', 'Version match']) : t).toList();
    checked = 0;
    if (blocked) { checked = task.gates.length; return; }
    for (var i = 0; i < task.gates.length; i++) {
      _timers.add(Timer(Duration(milliseconds: 350 + i * 380), () => setState(() => checked = i + 1)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.s;
    final allOk = !blocked && checked >= task.gates.length;
    return Column(children: [
      TopStrip(title: 'Start task', battery: Robot.battery, clock: s.clock, onBack: () => s.go('overview')),
      Expanded(child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Rows([
            for (var i = 0; i < list.length; i++)
              TRow(list[i].name, sub: list[i].meta, sel: sel == list[i].id, last: i == list.length - 1,
                  v: list[i].state == 'running' ? 'Running' : list[i].state == 'blocked' ? 'Blocked' : 'Ready',
                  vTone: list[i].state == 'running' ? 'green' : list[i].state == 'blocked' ? 'red' : 'ok',
                  onTap: () => setState(() { sel = list[i].id; _runChecks(); })),
          ]),
          const RowsH('Pre-flight checks'),
          Rows([
            for (var i = 0; i < task.gates.length; i++)
              _gateRow(task.gates[i], i, i == task.gates.length - 1),
          ]),
        ]),
      )),
      if (blocked)
        GreenBar(tone: 'red', line1: 'Cannot start', line2: 'Resolve end-effector mismatch in Settings → Modules',
            actions: [Cta('Open settings', ghost: true, onTap: () { s.setSettingsSec('modules'); s.go('settings'); })])
      else
        GreenBar(tone: allOk ? 'green' : 'idleflat', line1: allOk ? 'Ready to start' : 'Running checks…',
            line2: '${task.name} · Zone ${Session.zone} · est ${sel == 'thin' ? '38 min' : '55 min'}',
            actions: [Cta('Start ${task.name.toLowerCase()}', onTap: allOk ? () { s.startMission(); s.go('operate'); } : null)]),
    ]);
  }

  Widget _gateRow(String g, int i, bool last) {
    final bad = blocked && i == 1;
    final ok = i < checked;
    final running = i == checked && !blocked;
    final state = bad ? 'bad' : ok ? 'ok' : running ? 'run' : '';
    final bg = state == 'ok' ? const Color(0x2921C45D) : state == 'bad' ? const Color(0x29F0443B) : const Color(0x12FFFFFF);
    final fg = state == 'ok' ? Tk.green : state == 'bad' ? Tk.red : Tk.faint;
    return TRow(g, last: last,
        lead: Container(width: 26, height: 26, decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
            child: Icon(bad ? Icons.close : ok ? Icons.check : Icons.refresh, size: 15, color: fg)),
        v: bad ? 'Pinching tool not mounted' : ok ? 'Passed' : running ? 'Checking…' : '—',
        vTone: bad ? 'red' : ok ? 'ok' : '',
        chev: bad,
        onTap: bad ? () { widget.s.setSettingsSec('modules'); widget.s.go('settings'); } : null);
  }
}

// ---------- Operate (2D map) ----------
class OperateScreen extends StatelessWidget {
  final TState s;
  const OperateScreen({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    final worker = s.worker;
    final paused = s.mission == 'paused' && !worker;
    return Column(children: [
      TopStrip(back: false, title: 'Operating', battery: Robot.battery, clock: s.clock,
          trailing: [Dot(worker ? Tk.red : Tk.green)]),
      Expanded(child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(Tk.rLg),
          child: Stack(children: [
            Positioned.fill(child: CustomPaint(painter: _MapPainter(progress: s.progressInt, worker: worker))),
            // HUD
            Positioned(left: 16, top: 16, child: GestureDetector(
              onTap: () => s.setSheet('details'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(color: const Color(0x9E080C09), borderRadius: BorderRadius.circular(Tk.r)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                    Text(Session.task, style: Tk.sans(18, w: FontWeight.w800)),
                    Text('RAIL 20 · BED 5', style: Tk.mono(13, c: Tk.mute)),
                  ]),
                  const SizedBox(width: 14),
                  const Icon(Icons.chevron_right, color: Tk.faint, size: 20),
                ]),
              ),
            )),
            // alert band
            if (worker)
              Positioned(top: 16, left: 0, right: 0, child: Center(child: _alertBand(
                Icons.warning_amber_rounded, Tk.red, Colors.white, 'Person detected · 4.1 m', 'Autonomy paused — clear the aisle to resume'))),
            // strip
            Positioned(left: 0, right: 0, bottom: 0, child: Container(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 16),
              decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.bottomCenter, end: Alignment.topCenter, colors: [Color(0xC7050806), Color(0x00050806)])),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  RichText(text: TextSpan(children: [
                    TextSpan(text: s.remLabel, style: Tk.mono(34, w: FontWeight.w700, c: Tk.ink, ls: -1)),
                    TextSpan(text: ' left', style: Tk.sans(14, w: FontWeight.w600, c: Tk.mute, ls: 0)),
                  ])),
                  const SizedBox(width: 14),
                  Expanded(child: Text(worker ? 'Waiting for clear' : 'Next — ${Session.next}', maxLines: 1, overflow: TextOverflow.ellipsis, style: Tk.sans(14, w: FontWeight.w500, c: Tk.mute, ls: 0))),
                  Text('${s.progressInt}% · ETA ${Session.eta}', style: Tk.mono(14, c: Tk.mute)),
                ]),
                const SizedBox(height: 9),
                ClipRRect(borderRadius: BorderRadius.circular(3), child: LinearProgressIndicator(value: s.progressInt / 100, minHeight: 5, backgroundColor: const Color(0x21FFFFFF), valueColor: const AlwaysStoppedAnimation(Tk.green))),
              ]),
            )),
            // demo worker trigger
            if (!worker) Positioned(right: 16, bottom: 86, child: GestureDetector(
              onTap: s.triggerWorker,
              child: Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                decoration: BoxDecoration(color: const Color(0x9A080C09), borderRadius: BorderRadius.circular(999)),
                child: Text('▶ Demo: person enters aisle', style: Tk.sans(13, w: FontWeight.w600, c: Tk.faint))),
            )),
          ]),
        ),
      )),
      GreenBar(
        tone: worker ? 'red' : paused ? 'amber' : 'green',
        line1: worker ? 'Person in aisle' : paused ? 'Paused' : 'Thinning active',
        line2: worker ? 'Resume blocked by safety gate' : 'Zone ${Session.zone} · ${Session.done} of ${Session.total} done',
        live: worker ? null : '${s.progressInt}%',
        actions: [
          if (worker) Cta('Confirm clear', onTap: s.clearWorker)
          else if (paused) Cta('Resume', onTap: s.resume)
          else Cta('Pause', onTap: s.pause),
          Cta('Manual', ghost: true, onTap: () => s.go('manual')),
          HoldCta(label: 'End', onConfirm: s.endMission),
        ],
      ),
    ]);
  }

  Widget _alertBand(IconData ic, Color bg, Color fg, String a1, String a2) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(Tk.r)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(ic, color: fg, size: 26), const SizedBox(width: 12),
          Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(a1, style: Tk.sans(18, w: FontWeight.w800, c: fg)),
            Text(a2, style: Tk.sans(13, w: FontWeight.w500, c: fg.withValues(alpha: 0.9), ls: 0)),
          ]),
        ]),
      );
}

class _MapPainter extends CustomPainter {
  final int progress;
  final bool worker;
  _MapPainter({required this.progress, required this.worker});
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Offset.zero & size, Paint()..color = const Color(0xFF0A0F0B));
    final pad = 40.0;
    final wingW = size.width * 0.16;
    // service wing (left)
    canvas.drawRect(Rect.fromLTWH(0, 0, wingW, size.height), Paint()..color = const Color(0xFF0E140F));
    canvas.drawLine(Offset(wingW, 0), Offset(wingW, size.height), Paint()..color = Tk.hairlineHi..strokeWidth = 2);
    // rails area
    final railL = wingW + pad, railR = size.width - pad;
    final railTop = pad, railBot = size.height - pad * 1.6;
    const rails = 32;
    final cur = (progress / 100 * rails).clamp(0, rails - 1).round();
    for (var i = 0; i < rails; i++) {
      final x = railL + (railR - railL) * (i / (rails - 1));
      final done = i < cur;
      final isCur = i == cur;
      final p = Paint()..strokeWidth = isCur ? 3 : 2..color = done ? Tk.green : isCur ? Tk.ink : Tk.hairlineHi;
      canvas.drawLine(Offset(x, railTop), Offset(x, railBot), p);
    }
    // corridor (bottom)
    canvas.drawLine(Offset(wingW, railBot + 14), Offset(size.width - pad, railBot + 14), Paint()..color = Tk.hairline..strokeWidth = 4);
    // robot marker at current rail bottom
    final rx = railL + (railR - railL) * (cur / (rails - 1));
    canvas.drawCircle(Offset(rx, railBot + 14), 9, Paint()..color = worker ? Tk.red : Tk.green);
    canvas.drawCircle(Offset(rx, railBot + 14), 9, Paint()..color = Colors.white24..style = PaintingStyle.stroke..strokeWidth = 2);
    if (worker) {
      // person marker up the current rail
      canvas.drawCircle(Offset(rx, (railTop + railBot) / 2), 7, Paint()..color = Tk.red);
    }
  }
  @override
  bool shouldRepaint(covariant _MapPainter o) => o.progress != progress || o.worker != worker;
}

// ---------- Summary ----------
class SummaryScreen extends StatelessWidget {
  final TState s;
  const SummaryScreen({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    return Column(children: [
      TopStrip(back: false, title: 'Task complete', battery: Robot.battery, clock: s.clock),
      Expanded(child: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text('Thinning · Zone ${Session.zone}', style: Tk.sans(21, w: FontWeight.w600, c: Tk.mute, ls: 0)),
        const SizedBox(height: 26),
        SizedBox(width: 860, child: Row(children: [
          _sumCard('${todayFruits + 900}', 'fruits thinned'),
          const SizedBox(width: 16), _sumCard('3.2 h', 'run time'),
          const SizedBox(width: 16), _sumCard('2', 'interruptions'),
        ])),
      ]))),
      GreenBar(tone: 'green', line1: 'Logged to cloud', line2: 'Session WKS-20260601-00045', actions: [Cta('Done', onTap: () => s.go('overview'))]),
    ]);
  }

  Widget _sumCard(String v, String k) => Expanded(child: Container(
        padding: const EdgeInsets.all(26),
        decoration: BoxDecoration(color: Tk.tile, borderRadius: BorderRadius.circular(Tk.rLg)),
        child: Column(children: [
          Text(v, style: Tk.mono(52, w: FontWeight.w700, c: Tk.ink, ls: -1.5)),
          const SizedBox(height: 6),
          Text(k, style: Tk.sans(14, w: FontWeight.w500, c: Tk.mute, ls: 0)),
        ]),
      ));
}

// ---------- Details sheet ----------
class DetailsSheet extends StatelessWidget {
  final TState s;
  const DetailsSheet({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    if (s.sheet != 'details') return const SizedBox.shrink();
    return Positioned.fill(child: GestureDetector(
      onTap: () => s.setSheet(null),
      child: Container(
        color: const Color(0x8C040604),
        alignment: Alignment.bottomCenter,
        child: GestureDetector(
          onTap: () {},
          child: Container(
            width: double.infinity,
            decoration: const BoxDecoration(color: Color(0xFF121412), borderRadius: BorderRadius.vertical(top: Radius.circular(Tk.rLg))),
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Center(child: Container(width: 44, height: 5, margin: const EdgeInsets.symmetric(vertical: 12), decoration: BoxDecoration(color: Tk.hairlineHi, borderRadius: BorderRadius.circular(3)))),
              Row(children: [Text('Task details', style: Tk.sans(21, w: FontWeight.w800)), const Spacer(),
                GestureDetector(onTap: () => s.setSheet(null), child: Container(width: 48, height: 48, decoration: const BoxDecoration(color: Tk.tile, shape: BoxShape.circle), child: const Icon(Icons.close, color: Tk.mute, size: 20)))]),
              const SizedBox(height: 8),
              const TRow('Route', v: Session.route, vTone: 'ok'),
              const TRow('Progress', v: '198 of 320 clusters', vTone: 'ok'),
              const TRow('ETA', v: Session.eta, vTone: 'ok'),
              const TRow('Map', v: Session.map, vTone: 'ok'),
              const TRow('Vision', v: '29.6 fps · 38 ms', vTone: 'ok'),
              const TRow('App', v: Session.appId, last: true),
            ]),
          ),
        ),
      ),
    ));
  }
}
