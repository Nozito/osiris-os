import { Badge } from "@/components/ui/badge";
import { QUOTE_STATUS_LABELS } from "@/lib/validations/quote";
import type { Database } from "@/types/database.types";

type QuoteStatus = Database["public"]["Enums"]["quote_status"];

const VARIANT: Record<
  QuoteStatus,
  "secondary" | "default" | "destructive" | "success" | "warning"
> = {
  draft: "secondary",
  sent: "warning",
  viewed: "warning",
  accepted: "success",
  refused: "destructive",
  converted: "default",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return <Badge variant={VARIANT[status]}>{QUOTE_STATUS_LABELS[status]}</Badge>;
}
