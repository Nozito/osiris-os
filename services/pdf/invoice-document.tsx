import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import { computeTotals } from "@/lib/validations/quote";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

type InvoicePdfProps = {
  number: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  vatRate: number;
  client: {
    company_name: string;
    contact_name: string | null;
    address: string | null;
    email: string | null;
  };
  items: { label: string; description: string | null; quantity: number; unit_price: number }[];
};

export function InvoiceDocument({
  number,
  issuedAt,
  dueAt,
  vatRate,
  client,
  items,
}: InvoicePdfProps) {
  const totals = computeTotals(items, vatRate);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Osiris Agency</Text>
            <Text style={styles.brandSub}>contact@osiris-agency.fr</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>FACTURE</Text>
            <Text style={styles.docNumber}>{number}</Text>
            {issuedAt && (
              <Text style={styles.docNumber}>
                {new Date(issuedAt).toLocaleDateString("fr-FR")}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.clientBlock}>
          <Text style={styles.label}>Facturé à</Text>
          <Text>{client.company_name}</Text>
          {client.contact_name && <Text>{client.contact_name}</Text>}
          {client.address && <Text>{client.address}</Text>}
          {client.email && <Text>{client.email}</Text>}
        </View>

        {dueAt && (
          <Text style={{ marginBottom: 12 }}>
            Échéance : {new Date(dueAt).toLocaleDateString("fr-FR")} — paiement par virement
            bancaire uniquement
          </Text>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colLabel}>Prestation</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colPrice}>Prix unitaire</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colLabel}>{item.label}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatEUR(item.unit_price)}</Text>
              <Text style={styles.colTotal}>
                {formatEUR(item.quantity * item.unit_price)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Total HT</Text>
            <Text>{formatEUR(totals.ht)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>TVA ({vatRate}%)</Text>
            <Text>{formatEUR(totals.vat)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalTtc]}>
            <Text>Total TTC</Text>
            <Text>{formatEUR(totals.ttc)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Osiris Agency — Facture générée par Osiris OS</Text>
      </Page>
    </Document>
  );
}
