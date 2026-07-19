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
    padding: 42,
    paddingBottom: 54,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: INK,
  },

  // Header — centered logo + kicker + title, mirrors the reference template's brand block.
  headerWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  kicker: {
    fontSize: 8,
    letterSpacing: 2.5,
    color: MUTED,
    marginBottom: 6,
  },
  docTitle: {
    fontSize: 21,
    fontWeight: 700,
    letterSpacing: 6,
  },
  titleRule: {
    marginTop: 9,
    width: "36%",
    borderTopWidth: 2,
    borderTopColor: ACCENT,
  },

  statusBadge: {
    marginTop: 9,
    alignSelf: "center",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 3,
    fontSize: 8,
    letterSpacing: 1,
  },

  // Meta row — number / date / due date, right-aligned like the reference.
  // The document number carries the most weight: it's what a client reads
  // back over the phone or types into an accounting tool, so it can't be
  // the same visual weight as the rest of the metadata.
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 14,
    marginBottom: 14,
    fontSize: 8.5,
  },
  metaLabel: {
    color: MUTED,
  },
  metaNumberValue: {
    fontWeight: 700,
    fontSize: 10,
  },

  // Emitter / client cards.
  cardGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    padding: 10,
  },
  cardLabel: {
    fontSize: 7.5,
    letterSpacing: 2,
    fontWeight: 700,
    color: MUTED,
    marginBottom: 6,
    paddingBottom: 5,
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
  cardDivider: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: RULE,
  },
  cardContactLabel: {
    fontSize: 7,
    letterSpacing: 1,
    color: FAINT,
    marginBottom: 2,
  },

  // Items table. A light header fill (not a hard black rule) reads as more
  // premium and stays print-safe — it survives grayscale printing as a
  // faint gray band instead of relying purely on a border for structure.
  table: {
    marginTop: 2,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f7f7f8",
    borderBottomWidth: 1,
    borderBottomColor: RULE,
    paddingVertical: 6,
    paddingHorizontal: 6,
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
    paddingVertical: 7,
    paddingHorizontal: 6,
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

  // Total block: a bounded, lightly tinted box (not a full-bleed color fill)
  // so the final amount is unmistakable at a glance without turning the
  // page into a poster — stays legible in grayscale printing too.
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: "#f3f7ff",
    borderWidth: 1,
    borderColor: "#dbe6fa",
    borderRadius: 3,
  },
  totalFinalLabel: {
    fontSize: 8.5,
    letterSpacing: 1.5,
    color: MUTED,
  },
  totalFinalValue: {
    fontSize: 15,
    fontWeight: 700,
    color: INK,
  },
  vatMention: {
    fontSize: 7.5,
    color: FAINT,
    textAlign: "right",
    fontStyle: "italic",
    marginTop: 6,
  },

  // Secondary total breakdown (HT/TVA) sits above the highlighted TTC box.
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

  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 2.5,
    fontWeight: 700,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: INK,
  },

  cond: {
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    padding: 10,
    fontSize: 8.5,
    lineHeight: 1.5,
    color: "#333333",
  },

  signGrid: {
    flexDirection: "row",
    gap: 20,
    marginTop: 16,
  },
  signBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: RULE,
    borderRadius: 3,
    height: 46,
    padding: 8,
    fontSize: 8,
    color: MUTED,
  },
  signedNotice: {
    marginTop: 16,
    fontSize: 8.5,
    color: "#333333",
    borderWidth: 1,
    borderColor: STATUS_TONES.success.bg,
    backgroundColor: STATUS_TONES.success.bg,
    borderRadius: 3,
    padding: 8,
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
