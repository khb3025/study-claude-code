import { Badge } from "@/components/ui/badge";
import { INVOICE_STATUS_MAP } from "@/lib/constants";
import type { InvoiceStatus } from "@/lib/types";

const STATUS_VARIANT: Record<InvoiceStatus, "secondary" | "default" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{INVOICE_STATUS_MAP.toLabel[status]}</Badge>;
}
