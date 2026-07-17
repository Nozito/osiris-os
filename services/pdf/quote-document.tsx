import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import { computeTotals } from "@/lib/validations/quote";

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

type QuotePdfProps = {
  number: string | null;
  status: string;
  issuedAt: string | null;
  validUntil: string | null;
  terms: string | null;
  vatRate: number;
  signedByName: string | null;
  signedAt: string | null;
  client: {
    company_name: string;
    contact_name: string | null;
    address: string | null;
    email: string | null;
  };
  items: { label: string; description: string | null; quantity: number; unit_price: number }[];
};

export function QuoteDocument({
  number,
  issuedAt,
  validUntil,
  terms,
  vatRate,
  signedByName,
  signedAt,
  client,
  items,
}: QuotePdfProps) {
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
            <Text style={styles.docTitle}>DEVIS</Text>
            <Text style={styles.docNumber}>{number}</Text>
            {issuedAt && (
              <Text style={styles.docNumber}>
                {new Date(issuedAt).toLocaleDateString("fr-FR")}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.clientBlock}>
          <Text style={styles.label}>Destinataire</Text>
          <Text>{client.company_name}</Text>
          {client.contact_name && <Text>{client.contact_name}</Text>}
          {client.address && <Text>{client.address}</Text>}
          {client.email && <Text>{client.email}</Text>}
        </View>

        {validUntil && (
          <Text style={{ marginBottom: 12 }}>
            Valable jusqu&apos;au {new Date(validUntil).toLocaleDateString("fr-FR")}
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

        {terms && (
          <View style={styles.terms}>
            <Text style={styles.label}>Conditions générales</Text>
            <Text>{terms}</Text>
          </View>
        )}

        {signedByName && (
          <View style={styles.signature}>
            <Text>
              Bon pour accord — signé par {signedByName}
              {signedAt && ` le ${new Date(signedAt).toLocaleDateString("fr-FR")}`}
            </Text>
          </View>
        )}

        <Text style={styles.footer}>Osiris Agency — Devis généré par Osiris OS</Text>
      </Page>
    </Document>
  );
}
