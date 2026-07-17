import { z } from "zod";

export const quoteItemSchema = z.object({
  label: z.string().min(1),
  description: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().min(0),
  unit_price: z.coerce.number().min(0),
});

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;

export const quoteSchema = z.object({
  client_id: z.string().uuid("Client requis"),
  project_id: z.string().uuid().optional().or(z.literal("")),
  vat_rate: z.coerce.number().min(0).max(100),
  terms: z.string().optional().or(z.literal("")),
  valid_until: z.string().optional().or(z.literal("")),
  items: z.array(quoteItemSchema).min(1, "Ajoutez au moins une ligne"),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export const QUOTE_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "refused",
  "converted",
] as const;

export const QUOTE_STATUS_LABELS: Record<(typeof QUOTE_STATUSES)[number], string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  viewed: "Vu",
  accepted: "Accepté",
  refused: "Refusé",
  converted: "Converti en facture",
};

export function computeTotals(
  items: { quantity: number; unit_price: number }[],
  vatRate: number
) {
  const ht = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const vat = ht * (vatRate / 100);
  return { ht, vat, ttc: ht + vat };
}
