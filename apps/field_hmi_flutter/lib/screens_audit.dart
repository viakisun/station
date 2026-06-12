// STATION Field OS Terminal — Release notes (boot), Update Center, Audit (per audit.jsx).
import 'package:flutter/material.dart';
import 'tokens.dart';
import 'data.dart';
import 'state.dart';
import 'widgets.dart';

const _typeLabel = {'sw': 'Software / firmware', 'model': 'AI model', 'data': 'Data · map · policy'};
// [label, tone]
(String, String) _stChip(String s) => switch (s) {
      'blocked' => ('Blocked — audit', 'red'),
      'update_available' => ('Available', 'green'),
      'staged' => ('Staged', 'ok'),
      _ => ('Up to date', 'ok'),
    };

const _orgList = [
  ('VIA', 'Platform · Local Agent · HMI · Telemetry'),
  ('AGE Robotics', 'Mobile base — MCU, drive/steer/E-stop'),
  ('MetaFarmers', 'VPU · ACU · work modules · work apps'),
  ('Daedong', 'Localization — LPU, LPS · maps'),
  ('KIRO', 'Pinching end-effector (variant)'),
  ('NAS', 'Thinning end-effector (variant)'),
];

// ---------- Release notes (after wake) ----------
class RelNotesScreen extends StatelessWidget {
  final TState s;
  const RelNotesScreen({super.key, required this.s});
  @override
  Widget build(BuildContext context) {
    final notes = releaseNotes();
    final installable = notes.where((u) => u.available).length;
    return Column(children: [
      TopStrip(back: false, title: 'Updates found', battery: Robot.battery, clock: s.clock),
      Expanded(child: SingleChildScrollView(padding: const EdgeInsets.symmetric(horizontal: 24), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(
          'Checked at wake · audit set verified (G5) · $installable installable, 1 blocked',
          style: Tk.sans(14, w: FontWeight.w500, c: Tk.mute, ls: 0))),
        for (final g in const ['sw', 'model', 'data'])
          if (notes.any((u) => u.type == g)) ...[
            RowsH(_typeLabel[g]!),
            Rows([
              for (final u in notes.where((u) => u.type == g))
                TRow(u.name,
                    sub: '${u.id} · ${u.cur} → ${u.next}${u.note != null ? " · ${u.note}" : ""}',
                    v: u.blocked ? 'Blocked — audit' : u.gate,
                    vTone: u.blocked ? 'red' : g == 'data' ? 'ok' : 'green',
                    last: u == notes.where((x) => x.type == g).last),
            ]),
            const SizedBox(height: 14),
          ],
      ]))),
      GreenBar(
        tone: 'green',
        line1: '$installable ready to install · map & model apply next session',
        line2: 'Pinching EE blocked by audit (G2) — excluded',
        actions: [
          Cta('Review & install', onTap: () { s.markRelSeen(); s.go('updates'); }),
          Cta('Later', ghost: true, onTap: () { s.markRelSeen(); s.go(s.mission == 'working' ? 'operate' : 'overview'); }),
        ],
      ),
    ]);
  }
}

// ---------- Update Center ----------
class UpdateCenterScreen extends StatefulWidget {
  final TState s;
  const UpdateCenterScreen({super.key, required this.s});
  @override
  State<UpdateCenterScreen> createState() => _UpdateCenterScreenState();
}

class _UpdateCenterScreenState extends State<UpdateCenterScreen> {
  Update? sel;
  @override
  Widget build(BuildContext context) {
    final s = widget.s;
    final idle = s.mission == 'idle';
    final checks = [for (final c in precheck) (c.k, c.v, (c.k == 'robot_idle' || c.k == 'no_active_mission') ? idle : true)];
    final allOk = checks.every((c) => c.$3);
    final ready = updatesAvailable();
    return Stack(children: [
      Column(children: [
        TopStrip(title: 'Update Center', battery: Robot.battery, clock: s.clock, onBack: () => s.go('settings')),
        Expanded(child: SingleChildScrollView(padding: const EdgeInsets.symmetric(horizontal: 24), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            for (final g in const ['sw', 'model', 'data']) ...[
              RowsH(_typeLabel[g]!),
              Rows([
                for (final u in updates.where((u) => u.type == g))
                  () { final c = _stChip(u.status); return TRow(u.name,
                      sub: '${u.id} · ${u.owner} · ${u.cur}${u.cur != u.next ? " → ${u.next}" : ""} · ${u.gate}',
                      v: c.$1, vTone: c.$2, chev: true,
                      last: u == updates.where((x) => x.type == g).last,
                      onTap: () => setState(() => sel = u)); }(),
              ]),
              const SizedBox(height: 14),
            ],
          ])),
          const SizedBox(width: 16),
          SizedBox(width: 360, child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const RowsH('Pre-check — G7 freeze'),
            Rows([for (final c in checks) TRow(c.$1, v: c.$3 ? 'ok' : 'blocked — working', vTone: c.$3 ? 'green' : 'red', last: c == checks.last)]),
            const RowsH('Recovery & compatibility'),
            Rows(const [
              TRow('Rollback point', v: 'A/B banks · 1-step return', vTone: 'ok'),
              TRow('Compatibility', v: 'contracts ↔ fw ↔ apps', vTone: 'ok'),
              TRow('Authority', v: 'Field ③ · risky + Cloud ④', vTone: 'ok', last: true),
            ]),
          ])),
        ]))),
        GreenBar(
          tone: allOk ? 'green' : 'amber',
          line1: allOk ? '$ready updates ready' : 'Robot working — gate G7',
          line2: allOk ? 'Map & model apply next session · firmware needs idle' : 'Updates install automatically at idle',
          actions: [Cta('Update all', onTap: allOk ? () {} : null)],
        ),
      ]),
      if (sel != null) _UpdateSheet(s: s, u: sel!, onClose: () => setState(() => sel = null)),
    ]);
  }
}

class _UpdateSheet extends StatelessWidget {
  final TState s;
  final Update u;
  final VoidCallback onClose;
  const _UpdateSheet({required this.s, required this.u, required this.onClose});
  @override
  Widget build(BuildContext context) {
    final a = audits.where((x) => x.target == u.audit).firstOrNull;
    return Positioned.fill(child: GestureDetector(
      onTap: onClose,
      child: Container(color: const Color(0x8C040604), alignment: Alignment.bottomCenter, child: GestureDetector(
        onTap: () {},
        child: Container(
          width: double.infinity, constraints: const BoxConstraints(maxHeight: 640),
          decoration: const BoxDecoration(color: Color(0xFF121412), borderRadius: BorderRadius.vertical(top: Radius.circular(Tk.rLg))),
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Center(child: Container(width: 44, height: 5, margin: const EdgeInsets.symmetric(vertical: 12), decoration: BoxDecoration(color: Tk.hairlineHi, borderRadius: BorderRadius.circular(3)))),
            Row(children: [Text(u.name, style: Tk.sans(21, w: FontWeight.w800)), const Spacer(),
              GestureDetector(onTap: onClose, child: Container(width: 48, height: 48, decoration: const BoxDecoration(color: Tk.tile, shape: BoxShape.circle), child: const Icon(Icons.close, color: Tk.mute, size: 20)))]),
            const SizedBox(height: 8),
            Flexible(child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              RowsH('Release notes · ${u.cur}${u.cur != u.next ? " → ${u.next}" : " · current"}${u.date != null ? " · ${u.date}" : ""}'),
              if (u.rel != null) Padding(padding: const EdgeInsets.fromLTRB(20, 0, 20, 14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(u.rel!.sum, style: Tk.sans(18, w: FontWeight.w700)),
                const SizedBox(height: 10),
                _bullets('Improvements', u.rel!.imp, Tk.green, '↑'),
                _bullets('New', u.rel!.add, Tk.ink, '+'),
                _bullets('Fixed', u.rel!.fix, Tk.mute, '✓'),
              ]))
              else TRow(u.cur != u.next ? u.next : u.cur, sub: u.note ?? 'Maintenance release — no functional changes', v: _typeLabel[u.type], vTone: 'ok'),
              Rows([
                TRow('Type', v: _typeLabel[u.type], vTone: 'ok'),
                TRow('Owner', v: '${u.owner} · ${u.id}', vTone: 'ok'),
                TRow('Gate', v: u.gate, vTone: u.blocked ? 'red' : 'ok'),
                TRow('Restart impact', v: u.restart, vTone: 'ok'),
                TRow('Rollback', v: 'A/B banks · 1-step return', vTone: 'ok', last: a == null),
                if (a != null) ...[
                  TRow('Linked audit — ${a.target}', v: a.state, vTone: a.state == 'approved' ? 'green' : a.state == 'waiver_required' ? 'red' : 'ok'),
                  if (a.note != null) TRow('Findings', v: a.note, vTone: a.state == 'waiver_required' ? 'red' : 'ok'),
                  TRow('Open audit', v: a.org, vTone: 'ok', chev: true, last: true, onTap: () { onClose(); s.go('audit'); }),
                ],
              ]),
            ]))),
          ]),
        ),
      )),
    ));
  }

  Widget _bullets(String h, List<String> arr, Color c, String mark) {
    if (arr.isEmpty) return const SizedBox.shrink();
    return Padding(padding: const EdgeInsets.only(bottom: 10), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(h.toUpperCase(), style: Tk.sans(13, w: FontWeight.w800, c: Tk.faint, ls: 0.8)),
      const SizedBox(height: 5),
      for (final line in arr) Padding(padding: const EdgeInsets.symmetric(vertical: 3), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(width: 16, child: Text(mark, style: Tk.sans(14, w: FontWeight.w700, c: c, ls: 0))),
        Expanded(child: Text(line, style: Tk.sans(14, w: FontWeight.w500, c: Tk.ink, ls: 0))),
      ])),
    ]));
  }
}

// ---------- Audit (org master-detail) ----------
class AuditScreen extends StatefulWidget {
  final TState s;
  const AuditScreen({super.key, required this.s});
  @override
  State<AuditScreen> createState() => _AuditScreenState();
}

class _AuditScreenState extends State<AuditScreen> {
  String sel = 'KIRO';
  @override
  Widget build(BuildContext context) {
    final s = widget.s;
    final targets = audits.where((a) => a.org == sel).toList();
    return Column(children: [
      TopStrip(title: 'Audit', battery: Robot.battery, clock: s.clock, onBack: () => s.go('updates')),
      Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 24), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(width: 330, child: Rows([
          for (var i = 0; i < _orgList.length; i++)
            () {
              final id = _orgList[i].$1;
              final ts = audits.where((a) => a.org == id).toList();
              final bad = ts.any((a) => a.state == 'waiver_required' || a.state == 'failed');
              return TRow(id, sub: '${ts.isEmpty ? "—" : ts.length} ${ts.length == 1 ? "target" : "targets"}',
                  sel: sel == id, last: i == _orgList.length - 1,
                  v: ts.isEmpty ? '—' : bad ? 'Action needed' : 'Clear', vTone: bad ? 'red' : 'ok',
                  onTap: () => setState(() => sel = id));
            }(),
        ])),
        const SizedBox(width: 16),
        Expanded(child: Container(
          decoration: BoxDecoration(color: Tk.tile, borderRadius: BorderRadius.circular(Tk.rLg)),
          clipBehavior: Clip.antiAlias,
          child: targets.isEmpty
              ? const Padding(padding: EdgeInsets.all(20), child: RowsH('No audit targets'))
              : SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  for (final a in targets) ..._targetRows(a),
                ])),
        )),
      ]))),
    ]);
  }

  List<Widget> _targetRows(Audit a) {
    String stageV(String r) => r == 'na' ? 'N/A — module' : r == 'critical' ? '3 critical findings' : r == 'warn' ? '2 warnings' : r;
    String stageTone(String r) => r == 'pass' ? 'green' : (r == 'critical' || r == 'fail') ? 'red' : r == 'warn' ? 'amber' : 'ok';
    return [
      RowsH('${a.target} · ${a.kind} · ${a.lang} · ${a.ts}'),
      TRow('State', v: a.state, vTone: a.state == 'approved' ? 'green' : a.state == 'passed' ? 'ok' : (a.state == 'waiver_required' || a.state == 'failed') ? 'red' : 'ok'),
      TRow('Gate', v: a.gate, vTone: a.gate.contains('blocked') ? 'red' : a.gate.contains('confirm') ? 'amber' : 'green'),
      for (var i = 0; i < stageNames.length; i++)
        TRow('${i + 1} · ${stageNames[i]}', v: stageV(a.stages[i]), vTone: stageTone(a.stages[i])),
      if (a.note != null) TRow('Notes', v: a.note, vTone: 'ok'),
      TRow('Artifacts', v: '14 submitted — ${artifacts.take(3).join(" · ")} …', vTone: 'ok'),
      const SizedBox(height: 8),
    ];
  }
}
