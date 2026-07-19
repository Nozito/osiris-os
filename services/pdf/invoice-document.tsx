import path from "path";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles, STATUS_TONES, formatEUR } from "./styles";
import { computeTotals } from "@/lib/validations/quote";
import { INVOICE_STATUS_LABELS } from "@/lib/validations/invoice";

const LOGO_PATH = path.join(process.cwd(), "public", "osiris-logo-black.png");

const STATUS_TONE: Record<string, keyof typeof STATUS_TONES> = {
  created: "secondary",
  sent: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "destructive",
};

type InvoicePdfProps = {
  number: string | null;
  status: string;
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
  /** Salesperson in charge — always shown in the ÉMETTEUR card, never a lone footer line. */
  commercialName?: string | null;
  projectName?: string | null;
};

export function InvoiceDocument({
  number,
  status,
  issuedAt,
  dueAt,
  vatRate,
  client,
  items,
  commercialName,
  projectName,
}: InvoicePdfProps) {
  const totals = computeTotals(items, vatRate);
  const tone = STATUS_TONES[STATUS_TONE[status] ?? "secondary"];
  const statusLabel =
    INVOICE_STATUS_LABELS[status as keyof typeof INVOICE_STATUS_LABELS] ?? status;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerWrap}>
          <Image src={LOGO_PATH} style={styles.logo} />
          <Text style={styles.kicker}>OSIRIS AGENCY</Text>
          <Text style={styles.docTitle}>FACTURE</Text>
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
            <Text style={styles.metaNumberValue}>{number}</Text>
          </Text>
          {issuedAt && (
            <Text>
              <Text style={styles.metaLabel}>Date </Text>
              {new Date(issuedAt).toLocaleDateString("fr-FR")}
            </Text>
          )}
          {dueAt && (
            <Text>
              <Text style={styles.metaLabel}>Échéance </Text>
              {new Date(dueAt).toLocaleDateString("fr-FR")}
            </Text>
          )}
          {projectName && (
            <Text>
              <Text style={styles.metaLabel}>Réf. projet </Text>
              {projectName}
            </Text>
          )}
        </View>

        <View style={styles.cardGrid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>ÉMETTEUR</Text>
            <Text style={styles.cardLineStrong}>Osiris Agency</Text>
            <Text style={styles.cardLine}>contact@osiris-agency.fr</Text>
            {commercialName && (
              <View style={styles.cardDivider}>
                <Text style={styles.cardContactLabel}>VOTRE CONTACT</Text>
                <Text style={styles.cardLineStrong}>{commercialName}</Text>
              </View>
            )}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>FACTURÉ À</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MODALITÉS DE PAIEMENT</Text>
          <View style={styles.cond}>
            <Text>
              Paiement par virement bancaire uniquement.
              {dueAt &&
                ` Réglement attendu avant le ${new Date(dueAt).toLocaleDateString("fr-FR")}.`}{" "}
              Pénalités de retard applicables conformément à l&apos;article L441-10 du Code de
              commerce.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>Osiris Agency — Facture générée par Osiris OS</Text>
      </Page>
    </Document>
  );
}
