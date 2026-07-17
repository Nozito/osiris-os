import { z } from "zod";
import { quoteItemSchema } from "./quote";

export const invoiceSchema = z.object({
  client_id: z.string().uuid("Client requis"),
  quote_id: z.string().uuid().optional().or(z.literal("")),
  vat_rate: z.coerce.number().min(0).max(100),
  due_at: z.string().optional().or(z.literal("")),
  items: z.array(quoteItemSchema).min(1, "Ajoutez au moins une ligne"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const INVOICE_STATUSES = ["created", "sent", "paid", "overdue", "cancelled"] as const;

export const INVOICE_STATUS_LABELS: Record<(typeof INVOICE_STATUSES)[number], string> = {
  created: "Créée",
  sent: "Envoyée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
};
