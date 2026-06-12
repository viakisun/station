// STATION Field OS Terminal — boot smoke test.
import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:field_hmi_flutter/main.dart';

void main() {
  testWidgets('terminal boots', (tester) async {
    GoogleFonts.config.allowRuntimeFetching = false; // no network in tests
    await tester.pumpWidget(const FieldHmiApp());
    expect(find.byType(FieldHmiApp), findsOneWidget);
    await tester.pumpWidget(const SizedBox()); // dispose → cancels timers
  });
}
