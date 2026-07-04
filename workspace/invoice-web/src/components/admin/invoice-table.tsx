import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import Link from "next/link";

import { CopyButton } from "@/components/admin/copy-button";
import { LinkColumn } from "@/components/admin/link-column";
import { ShareButton } from "@/components/admin/share-button";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceListSortColumn } from "@/lib/services/invoice-list.service";
import type { Invoice, SortState } from "@/lib/types";
import { formatCurrency, formatDateOrFallback } from "@/lib/utils";

const COLUMNS: { key: InvoiceListSortColumn; label: string; align?: "right" }[] = [
  { key: "invoiceNumber", label: "견적서 번호" },
  { key: "clientName", label: "클라이언트명" },
  { key: "issueDate", label: "발행일" },
  { key: "validUntil", label: "유효기간" },
  { key: "status", label: "상태" },
  { key: "totalAmount", label: "총 금액", align: "right" },
];

type InvoiceTableProps = {
  invoices: Invoice[];
  sort?: SortState<InvoiceListSortColumn>;
  buildSortHref: (column: InvoiceListSortColumn) => string;
};

export function InvoiceTable({ invoices, sort, buildSortHref }: InvoiceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((column) => {
            const isActive = sort?.column === column.key;
            const Icon = isActive ? (sort?.direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
            return (
              <TableHead key={column.key} className={column.align === "right" ? "text-right" : ""}>
                <Link
                  href={buildSortHref(column.key)}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  {column.label}
                  <Icon aria-hidden="true" className="size-3.5 text-muted-foreground" />
                </Link>
              </TableHead>
            );
          })}
          <TableHead>링크</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COLUMNS.length + 1} className="text-center text-muted-foreground">
              등록된 견적서가 없습니다.
            </TableCell>
          </TableRow>
        ) : (
          invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.clientName}</TableCell>
              <TableCell>{formatDateOrFallback(invoice.issueDate)}</TableCell>
              <TableCell>{formatDateOrFallback(invoice.validUntil)}</TableCell>
              <TableCell>
                <StatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <LinkColumn notionPageId={invoice.id} />
                  <CopyButton notionPageId={invoice.id} />
                  <ShareButton notionPageId={invoice.id} invoiceNumber={invoice.invoiceNumber} />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
