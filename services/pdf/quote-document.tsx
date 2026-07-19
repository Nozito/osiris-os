import path from "path";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles, STATUS_TONES, formatEUR } from "./styles";
import { computeTotals } from "@/lib/validations/quote";
import { QUOTE_STATUS_LABELS } from "@/lib/validations/quote";

const LOGO_PATH = path.join(process.cwd(), "public", "osiris-logo-black.png");

const STATUS_TONE: Record<string, keyof typeof STATUS_TONES> = {
  draft: "secondary",
  sent: "warning",
  viewed: "warning",
  accepted: "success",
  refused: "destructive",
  converted: "default",
};

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
  status,
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
  const tone = STATUS_TONES[STATUS_TONE[status] ?? "secondary"];
  const statusLabel =
    QUOTE_STATUS_LABELS[status as keyof typeof QUOTE_STATUS_LABELS] ?? status;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerWrap}>
          <Image src={LOGO_PATH} style={styles.logo} />
          <Text style={styles.kicker}>OSIRIS AGENCY</Text>
          <Text style={styles.docTitle}>DEVIS</Text>
          <View style={styles.titleRule} />
          <Text
            style={[
              styles.statusBadge,
              { backgroundColor: tone.bg, color: tone.fg },
            ]}
          >
            {statusLabel.toUpperCase()}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text>
            <Text style={styles.metaLabel}>N° </Text>
            {number}
          </Text>
          {issuedAt && (
            <Text>
              <Text style={styles.metaLabel}>Date </Text>
              {new Date(issuedAt).toLocaleDateString("fr-FR")}
            </Text>
          )}
          {validUntil && (
            <Text>
              <Text style={styles.metaLabel}>Validité </Text>
              {new Date(validUntil).toLocaleDateString("fr-FR")}
            </Text>
          )}
        </View>

        <View style={styles.cardGrid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>ÉMETTEUR</Text>
            <Text style={styles.cardLineStrong}>Osiris Agency</Text>
            <Text style={styles.cardLine}>contact@osiris-agency.fr</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>CLIENT</Text>
            <Text style={styles.cardLineStrong}>{client.company_name}</Text>
            {client.contact_name && <Text style={styles.cardLine}>{client.contact_name}</Text>}
            {client.address && <Text style={styles.cardLine}>{client.address}</Text>}
            {client.email && <Text style={styles.cardLine}>{client.email}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.colLabel]}>PRESTATION</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>QTÉ</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>PU HT</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>TOTAL HT</Text>
          </View>
          {items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.colLabel}>
                <Text style={styles.itemLabelStrong}>{item.label}</Text>
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatEUR(item.unit_price)}</Text>
              <Text style={styles.colTotal}>{formatEUR(item.quantity * item.unit_price)}</Text>
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
        </View>
        <View style={styles.totalRowFinal}>
          <Text style={styles.totalFinalLabel}>TOTAL TTC</Text>
          <Text style={styles.totalFinalValue}>{formatEUR(totals.ttc)}</Text>
        </View>
        {vatRate === 0 && (
          <Text style={styles.vatMention}>TVA non applicable – art. 293 B du CGI</Text>
        )}

        {terms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONDITIONS</Text>
            <View style={styles.cond}>
              <Text>{terms}</Text>
            </View>
          </View>
        )}

        {signedByName ? (
          <Text style={styles.signedNotice}>
            Bon pour accord — signé par {signedByName}
            {signedAt && ` le ${new Date(signedAt).toLocaleDateString("fr-FR")}`}
          </Text>
        ) : (
          <View style={styles.signGrid}>
            <Text style={styles.signBox}>Accepté et bon pour accord le :</Text>
            <Text style={styles.signBox}>
              Signature du client (précédée de « Lu et approuvé ») :
            </Text>
          </View>
        )}

        <Text style={styles.footer}>Osiris Agency — Devis généré par Osiris OS</Text>
      </Page>
    </Document>
  );
}
