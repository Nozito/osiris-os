import { StyleSheet } from "@react-pdf/renderer";

/**
 * react-pdf's built-in Helvetica only covers basic Latin. Intl's fr-FR
 * currency formatting inserts Unicode space characters (thousands
 * separator, space before the euro sign) that font doesn't have, and
 * they silently render as "/". Strip to plain ASCII spaces instead.
 */
export function formatEUR(value: number) {
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
  return Array.from(formatted)
    .map((ch) => (ch.charCodeAt(0) > 255 && /\s/u.test(ch) ? " " : ch))
    .join("");
}

// Print-first palette — matches the app's accent blue but stays high-contrast
// black-on-white for legibility once printed/exported, per the reference template.
const INK = "#111111";
const MUTED = "#666666";
const FAINT = "#999999";
const RULE = "#e5e5e5";
const ACCENT = "#0066FF";

export const STATUS_TONES = {
  secondary: { bg: "#f2f2f2", fg: "#444444" },
  warning: { bg: "#fdf1de", fg: "#b3690a" },
  success: { bg: "#e4f8ec", fg: "#1a9c53" },
  destructive: { bg: "#fdeaea", fg: "#c22b2b" },
  default: { bg: "#e6efff", fg: ACCENT },
} as const;

export const styles = StyleSheet.create({
  page: {
    padding: 48,
    paddingBottom: 64,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: INK,
  },

  // Header — centered logo + kicker + title, mirrors the reference template's brand block.
  headerWrap: {
    alignItems: "center",
    marginBottom: 22,
  },
  logo: {
    width: 34,
    height: 34,
    marginBottom: 10,
  },
  kicker: {
    fontSize: 8,
    letterSpacing: 2.5,
    color: MUTED,
    marginBottom: 8,
  },
  docTitle: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 6,
  },
  titleRule: {
    marginTop: 10,
    width: "36%",
    borderTopWidth: 2,
    borderTopColor: ACCENT,
  },

  statusBadge: {
    marginTop: 12,
    alignSelf: "center",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 3,
    fontSize: 8,
    letterSpacing: 1,
  },

  // Meta row — number / date / due date, right-aligned like the reference.
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 18,
    marginTop: 18,
    marginBottom: 18,
    fontSize: 8.5,
  },
  metaLabel: {
    color: MUTED,
  },

  // Emitter / client cards.
  cardGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    padding: 12,
  },
  cardLabel: {
    fontSize: 7.5,
    letterSpacing: 2,
    fontWeight: 700,
    color: MUTED,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: RULE,
  },
  cardLine: {
    marginBottom: 3,
  },
  cardLineStrong: {
    fontWeight: 700,
    marginBottom: 3,
  },

  // Items table.
  table: {
    marginTop: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: INK,
    paddingBottom: 6,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    letterSpacing: 1.5,
    color: MUTED,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingVertical: 8,
  },
  colLabel: { flex: 4 },
  colQty: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 1.3, textAlign: "right" },
  colTotal: { flex: 1.3, textAlign: "right" },
  itemDescription: {
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
  },
  itemLabelStrong: {
    fontWeight: 700,
  },

  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  totalFinalLabel: {
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: MUTED,
  },
  totalFinalValue: {
    fontSize: 15,
    fontWeight: 700,
  },
  vatMention: {
    fontSize: 7.5,
    color: FAINT,
    textAlign: "right",
    fontStyle: "italic",
    marginTop: 6,
  },

  // Secondary total breakdown (HT/TVA) — used when the header total isn't standalone.
  totals: {
    marginTop: 4,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
    fontSize: 9,
  },
  totalTtc: {
    fontWeight: 700,
    fontSize: 12,
    borderTopWidth: 1,
    borderTopColor: INK,
    paddingTop: 5,
    marginTop: 5,
  },

  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 2.5,
    fontWeight: 700,
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: INK,
  },

  cond: {
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    padding: 12,
    fontSize: 8.5,
    lineHeight: 1.5,
    color: "#333333",
  },

  signGrid: {
    flexDirection: "row",
    gap: 20,
    marginTop: 24,
  },
  signBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    height: 60,
    padding: 10,
    fontSize: 8,
    color: MUTED,
  },
  signedNotice: {
    marginTop: 24,
    fontSize: 8.5,
    color: "#333333",
    borderWidth: 1,
    borderColor: STATUS_TONES.success.bg,
    backgroundColor: STATUS_TONES.success.bg,
    borderRadius: 3,
    padding: 10,
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 48,
    right: 48,
    fontSize: 7.5,
    color: FAINT,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: RULE,
    paddingTop: 10,
  },
});
