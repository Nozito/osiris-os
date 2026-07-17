import { Badge } from "@/components/ui/badge";
import { INVOICE_STATUS_LABELS } from "@/lib/validations/invoice";
import type { Database } from "@/types/database.types";

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

const VARIANT: Record<
  InvoiceStatus,
  "secondary" | "default" | "destructive" | "success" | "warning"
> = {
  created: "secondary",
  sent: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "destructive",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={VARIANT[status]}>{INVOICE_STATUS_LABELS[status]}</Badge>;
}
