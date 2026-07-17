import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brand: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0066FF",
  },
  brandSub: {
    fontSize: 9,
    color: "#666666",
    marginTop: 2,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: "right",
  },
  docNumber: {
    fontSize: 10,
    color: "#666666",
    textAlign: "right",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 8,
    color: "#888888",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  clientBlock: {
    marginBottom: 24,
  },
  table: {
    marginTop: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    paddingBottom: 6,
    fontWeight: 700,
  },
  colLabel: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totals: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 4,
  },
  totalTtc: {
    fontWeight: 700,
    fontSize: 12,
    borderTopWidth: 1,
    borderTopColor: "#111111",
    paddingTop: 4,
    marginTop: 4,
  },
  terms: {
    marginTop: 24,
    fontSize: 8,
    color: "#666666",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
  signature: {
    marginTop: 24,
    fontSize: 9,
    color: "#333333",
  },
});
