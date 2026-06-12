// STATION Field OS Terminal — shared components (text-first, one green CTA).
import 'dart:async';
import 'package:flutter/material.dart';
import 'tokens.dart';

Color toneColor(String t) {
  switch (t) {
    case 'green': case 'ok2': return Tk.green;
    case 'amber': return Tk.amber;
    case 'red': return Tk.red;
    case 'ok': return Tk.ink;
    default: return Tk.mute;
  }
}

/// GreenBar — the single global CTA surface. tone: green|amber|red|idleflat.
class GreenBar extends StatelessWidget {
  final String tone, line1;
  final String? line2, live;
  final List<Widget> actions;
  const GreenBar({super.key, this.tone = 'green', required this.line1, this.line2, this.live, this.actions = const []});
  @override
  Widget build(BuildContext context) {
    final bg = tone == 'amber' ? Tk.amberDeep : tone == 'red' ? Tk.redDeep : tone == 'idleflat' ? Tk.tile : Tk.greenDeep;
    final sub = (tone == 'amber' || tone == 'red') ? const Color(0xBFFFFFFF) : Tk.mute;
    final liveC = tone == 'amber' ? Tk.amber : tone == 'red' ? const Color(0xFFFFB1AC) : Tk.green;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250), curve: Tk.ease,
      height: Tk.barH,
      margin: const EdgeInsets.fromLTRB(24, 14, 24, 18),
      padding: const EdgeInsets.only(left: 24, right: 14),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(Tk.rLg)),
      child: Row(children: [
        Expanded(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(line1, maxLines: 1, overflow: TextOverflow.ellipsis, style: Tk.sans(18, w: FontWeight.w700)),
          if (line2 != null) Padding(padding: const EdgeInsets.only(top: 3), child: Text(line2!, maxLines: 1, overflow: TextOverflow.ellipsis, style: Tk.sans(14, w: FontWeight.w500, c: sub, ls: 0))),
        ])),
        if (live != null) Padding(
          padding: const EdgeInsets.only(right: 14),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 9, height: 9, decoration: BoxDecoration(color: liveC, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text(live!, style: Tk.mono(14, w: FontWeight.w600, c: liveC)),
          ]),
        ),
        for (final a in actions) Padding(padding: const EdgeInsets.only(left: 10), child: a),
      ]),
    );
  }
}

/// CTA — green primary / ghost / disabled / red.
class Cta extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool ghost, red;
  const Cta(this.label, {super.key, this.onTap, this.ghost = false, this.red = false});
  @override
  Widget build(BuildContext context) {
    final disabled = onTap == null;
    final Color bg = disabled ? Tk.hairlineHi : ghost ? Colors.transparent : red ? Tk.red : Tk.green;
    final Color fg = disabled ? Tk.faint : ghost ? Tk.ink : red ? Tk.onRed : Tk.onGreen;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: Tk.ctaH,
        padding: const EdgeInsets.symmetric(horizontal: 32),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: bg, borderRadius: BorderRadius.circular(16),
          border: ghost && !disabled ? Border.all(color: const Color(0x47FFFFFF), width: 1.5) : null,
        ),
        child: Text(label, style: Tk.sans(20, w: FontWeight.w800, c: fg)),
      ),
    );
  }
}

/// Hold-to-confirm CTA — red fill over ~1300ms (irreversible).
class HoldCta extends StatefulWidget {
  final String label;
  final VoidCallback onConfirm;
  const HoldCta({super.key, required this.label, required this.onConfirm});
  @override
  State<HoldCta> createState() => _HoldCtaState();
}

class _HoldCtaState extends State<HoldCta> {
  double pct = 0;
  bool armed = false, done = false;
  Timer? _t; int _start = 0;
  void _begin() {
    if (done) return;
    setState(() => armed = true);
    _start = DateTime.now().millisecondsSinceEpoch;
    _t?.cancel();
    _t = Timer.periodic(const Duration(milliseconds: 30), (_) {
      final p = ((DateTime.now().millisecondsSinceEpoch - _start) / 1300 * 100).clamp(0, 100).toDouble();
      setState(() => pct = p);
      if (p >= 100 && !done) { _t?.cancel(); setState(() => done = true); widget.onConfirm(); }
    });
  }
  void _end() { if (done) return; _t?.cancel(); setState(() { armed = false; pct = 0; }); }
  @override
  void dispose() { _t?.cancel(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _begin(), onTapUp: (_) => _end(), onTapCancel: _end,
      child: Container(
        height: Tk.ctaH, constraints: const BoxConstraints(minWidth: 120),
        padding: const EdgeInsets.symmetric(horizontal: 32),
        alignment: Alignment.center,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0x47FFFFFF), width: 1.5)),
        clipBehavior: Clip.antiAlias,
        child: Stack(alignment: Alignment.center, children: [
          Positioned.fill(child: FractionallySizedBox(alignment: Alignment.centerLeft, widthFactor: pct / 100, child: Container(color: Tk.red))),
          Text(done ? 'Ending…' : armed ? 'Keep holding' : widget.label, style: Tk.sans(21, w: FontWeight.w800, c: armed ? Colors.white : Tk.ink)),
        ]),
      ),
    );
  }
}

/// Text row — list item without icons (lead reserved for gate dots).
class TRow extends StatelessWidget {
  final String k;
  final String? sub, v, vTone;
  final bool chev, sel, last;
  final VoidCallback? onTap;
  final Widget? lead;
  const TRow(this.k, {super.key, this.sub, this.v, this.vTone, this.chev = false, this.sel = false, this.last = false, this.onTap, this.lead});
  @override
  Widget build(BuildContext context) {
    return Material(
      color: sel ? const Color(0x1421C45D) : Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Container(
          constraints: const BoxConstraints(minHeight: Tk.rowH),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: BoxDecoration(
            border: Border(
              bottom: last ? BorderSide.none : const BorderSide(color: Tk.hairline),
              left: sel ? const BorderSide(color: Tk.green, width: 2.5) : BorderSide.none,
            ),
          ),
          child: Row(children: [
            if (lead != null) Padding(padding: const EdgeInsets.only(right: 16), child: lead!),
            Expanded(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(k, maxLines: 1, overflow: TextOverflow.ellipsis, style: Tk.sans(18, w: FontWeight.w600)),
              if (sub != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(sub!, maxLines: 1, overflow: TextOverflow.ellipsis, style: Tk.sans(14, w: FontWeight.w500, c: Tk.mute, ls: 0))),
            ])),
            if (v != null) Padding(padding: const EdgeInsets.only(left: 14), child: Text(v!, textAlign: TextAlign.right, style: Tk.sans(16, w: FontWeight.w600, c: toneColor(vTone ?? '')))),
            if (chev) Padding(padding: const EdgeInsets.only(left: 12), child: const Icon(Icons.chevron_right, color: Tk.faint, size: 22)),
          ]),
        ),
      ),
    );
  }
}

/// Boxed list container.
class Rows extends StatelessWidget {
  final List<Widget> children;
  const Rows(this.children, {super.key});
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        decoration: BoxDecoration(color: Tk.tile, borderRadius: BorderRadius.circular(Tk.rLg)),
        padding: const EdgeInsets.symmetric(vertical: 4),
        clipBehavior: Clip.antiAlias,
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: children),
      );
}

/// Hub tile — icon inside a circle (Lucide), label + sub.
class Tile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? sub, badge;
  final VoidCallback onTap;
  const Tile(this.icon, this.label, {super.key, this.sub, this.badge, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Tk.tile, borderRadius: BorderRadius.circular(Tk.rLg),
      child: InkWell(
        onTap: onTap, borderRadius: BorderRadius.circular(Tk.rLg),
        child: Container(
          constraints: const BoxConstraints(minHeight: 132),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Container(width: 52, height: 52, decoration: const BoxDecoration(color: Color(0x12FFFFFF), shape: BoxShape.circle), child: Icon(icon, color: Tk.ink, size: 24)),
            Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
              Text(label, style: Tk.sans(18, w: FontWeight.w700)),
              if (sub != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(sub!, style: Tk.sans(14, w: FontWeight.w500, c: Tk.mute, ls: 0))),
              if (badge != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(badge!, style: Tk.sans(12, w: FontWeight.w800, c: Tk.amber))),
            ]),
          ]),
        ),
      ),
    );
  }
}

/// Top strip — Back + title + battery + clock.
class TopStrip extends StatelessWidget {
  final String? title;
  final bool back;
  final VoidCallback? onBack;
  final int battery;
  final String clock;
  final List<Widget> trailing;
  const TopStrip({super.key, this.title, this.back = true, this.onBack, required this.battery, required this.clock, this.trailing = const []});
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(children: [
        if (back) GestureDetector(
          onTap: onBack,
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.chevron_left, color: Tk.mute, size: 24),
            const SizedBox(width: 6),
            Text('Back', style: Tk.sans(16, w: FontWeight.w600, c: Tk.mute)),
          ]),
        ),
        if (back && title != null) const SizedBox(width: 12),
        if (title != null) Text(title!, style: Tk.sans(21, w: FontWeight.w700)),
        const Spacer(),
        ...trailing,
        if (trailing.isNotEmpty) const SizedBox(width: 14),
        Battery(battery),
        const SizedBox(width: 14),
        Text(clock, style: Tk.mono(14, w: FontWeight.w700, c: Tk.ink)),
      ]),
    );
  }
}

class Battery extends StatelessWidget {
  final int pct;
  const Battery(this.pct, {super.key});
  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 30, height: 15, padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(border: Border.all(color: Tk.faint, width: 1.5), borderRadius: BorderRadius.circular(3)),
        child: Align(alignment: Alignment.centerLeft, child: FractionallySizedBox(widthFactor: pct / 100, child: Container(decoration: BoxDecoration(color: Tk.green, borderRadius: BorderRadius.circular(1))))),
      ),
      const SizedBox(width: 8),
      Text('$pct%', style: Tk.mono(14, w: FontWeight.w700, c: Tk.ink)),
    ]);
  }
}

class Dot extends StatelessWidget {
  final Color color;
  const Dot(this.color, {super.key});
  @override
  Widget build(BuildContext context) => Container(width: 9, height: 9, decoration: BoxDecoration(color: color, shape: BoxShape.circle));
}

/// Count-up number (eased).
class CountUp extends StatefulWidget {
  final int value;
  final TextStyle style;
  const CountUp(this.value, this.style, {super.key});
  @override
  State<CountUp> createState() => _CountUpState();
}

class _CountUpState extends State<CountUp> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..forward();
  @override
  void dispose() { _c.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => AnimatedBuilder(
        animation: _c,
        builder: (context, _) {
          final p = Curves.easeOutCubic.transform(_c.value);
          final v = (widget.value * p).round();
          return Text(_fmt(v), style: widget.style);
        },
      );
  String _fmt(int n) => n.toString().replaceAllMapped(RegExp(r'(\d)(?=(\d{3})+$)'), (m) => '${m[1]},');
}

/// Sparkline.
class Spark extends StatelessWidget {
  final List<double> data;
  const Spark(this.data, {super.key});
  @override
  Widget build(BuildContext context) => SizedBox(height: 38, width: double.infinity, child: CustomPaint(painter: _SparkPainter(data)));
}

class _SparkPainter extends CustomPainter {
  final List<double> data;
  _SparkPainter(this.data);
  @override
  void paint(Canvas canvas, Size size) {
    final max = data.reduce((a, b) => a > b ? a : b), min = data.reduce((a, b) => a < b ? a : b);
    final pts = <Offset>[];
    for (var i = 0; i < data.length; i++) {
      final x = i / (data.length - 1) * size.width;
      final y = size.height - 5 - (max == min ? 0 : (data[i] - min) / (max - min)) * (size.height - 12);
      pts.add(Offset(x, y));
    }
    final line = Path()..addPolygon(pts, false);
    final area = Path()..moveTo(0, size.height)..addPolygon(pts, false)..lineTo(size.width, size.height)..close();
    canvas.drawPath(area, Paint()..color = const Color(0x1A21C45D));
    canvas.drawPath(line, Paint()..color = Tk.green..style = PaintingStyle.stroke..strokeWidth = 2.5..strokeJoin = StrokeJoin.round..strokeCap = StrokeCap.round);
  }
  @override
  bool shouldRepaint(covariant _SparkPainter old) => false;
}

/// Section header label.
class RowsH extends StatelessWidget {
  final String text;
  const RowsH(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 10),
        child: Text(text.toUpperCase(), style: Tk.sans(13, w: FontWeight.w700, c: Tk.faint, ls: 0.8)),
      );
}
