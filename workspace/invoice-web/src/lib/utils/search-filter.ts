import type { Invoice, InvoiceStatus } from "@/lib/types";

export type InvoiceFilterParams = {
  search?: string;
  status?: InvoiceStatus;
  dateFrom?: string;
  dateTo?: string;
};

function matchesSearch(invoice: Invoice, search: string): boolean {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return true;
  return (
    invoice.invoiceNumber.toLowerCase().includes(keyword) ||
    invoice.clientName.toLowerCase().includes(keyword)
  );
}

function matchesStatus(invoice: Invoice, status?: InvoiceStatus): boolean {
  if (!status) return true;
  return invoice.status === status;
}

// issueDate가 [dateFrom, dateTo] 범위(양 끝 포함) 안에 있는지 확인 (경계값 미지정 시 해당 조건 통과)
function matchesDateRange(invoice: Invoice, dateFrom?: string, dateTo?: string): boolean {
  if (!invoice.issueDate) return !dateFrom && !dateTo;
  if (dateFrom && invoice.issueDate < dateFrom) return false;
  if (dateTo && invoice.issueDate > dateTo) return false;
  return true;
}

export function filterInvoices(invoices: Invoice[], params: InvoiceFilterParams): Invoice[] {
  return invoices.filter(
    (invoice) =>
      matchesSearch(invoice, params.search ?? "") &&
      matchesStatus(invoice, params.status) &&
      matchesDateRange(invoice, params.dateFrom, params.dateTo),
  );
}
