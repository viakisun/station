// STATION Field OS Terminal — design tokens (spec tokens.css, exact).
// Near-black, text-first, one green CTA. Deep-green state bands · neon green action.
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class Tk {
  // surfaces
  static const canvas = Color(0xFF0B0C0B);
  static const tile = Color(0xFF151715);
  static const tileHi = Color(0xFF1D201D);
  static const hairline = Color(0xFF242724);
  static const hairlineHi = Color(0xFF343834);
  // text — two steps only (+ faint)
  static const ink = Color(0xFFF2F4F1);
  static const mute = Color(0xFF9AA09A);
  static const faint = Color(0xFF5C625C);
  // green system
  static const green = Color(0xFF21C45D);
  static const greenHi = Color(0xFF2FE06F);
  static const greenDeep = Color(0xFF143D28);
  static const greenDeepHi = Color(0xFF1A4E33);
  static const onGreen = Color(0xFF06130B);
  // status (exceptions)
  static const amber = Color(0xFFF5A623);
  static const amberDeep = Color(0xFF41310E);
  static const red = Color(0xFFF0443B);
  static const redDeep = Color(0xFF471512);
  static const onRed = Color(0xFFFFFFFF);
  static const deviceBg = Color(0xFF060706);

  // shape / touch
  static const r = 14.0, rLg = 20.0, rowH = 64.0, ctaH = 72.0, barH = 96.0;
  static const ease = Cubic(.2, .7, .3, 1);

  // type — Inter Tight (sans) / JetBrains Mono (mono)
  static TextStyle sans(double size, {FontWeight w = FontWeight.w600, Color c = ink, double ls = -0.2}) =>
      GoogleFonts.interTight(fontSize: size, fontWeight: w, color: c, letterSpacing: ls, height: 1.1);
  static TextStyle mono(double size, {FontWeight w = FontWeight.w600, Color c = mute, double ls = 0}) =>
      GoogleFonts.jetBrainsMono(fontSize: size, fontWeight: w, color: c, letterSpacing: ls, fontFeatures: const [FontFeature.tabularFigures()]);
}
