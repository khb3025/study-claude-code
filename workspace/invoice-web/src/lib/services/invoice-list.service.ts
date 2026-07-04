import { listInvoices } from "@/lib/notion";
import type { Invoice, Pagination, SortState } from "@/lib/types";
import { filterInvoices, type InvoiceFilterParams } from "@/lib/utils/search-filter";

export const INVOICE_LIST_PAGE_SIZE = 10;

export type InvoiceListSortColumn =
  | "invoiceNumber"
  | "clientName"
  | "issueDate"
  | "validUntil"
  | "status"
  | "totalAmount";

function compareInvoices(a: Invoice, b: Invoice, column: InvoiceListSortColumn): number {
  const left = a[column];
  const right = b[column];
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), "ko");
}

// Notion API는 페이지 번호가 아닌 커서 기반 페이지네이션만 지원하므로,
// 전체 견적서를 커서로 모두 모은 뒤 메모리에서 정렬·페이지 슬라이싱한다.
async function fetchAllInvoices(): Promise<Invoice[]> {
  const invoices: Invoice[] = [];
  let cursor: string | undefined;

  do {
    const response = await listInvoices({ pageSize: 100, startCursor: cursor });
    invoices.push(...response.invoices);
    cursor = response.nextCursor ?? undefined;
  } while (cursor);

  return invoices;
}

export async function getInvoiceListPage(params: {
  page: number;
  sort?: SortState<InvoiceListSortColumn>;
  filter?: InvoiceFilterParams;
}): Promise<{ invoices: Invoice[]; pagination: Pagination }> {
  const fetchedInvoices = await fetchAllInvoices();
  const allInvoices = params.filter ? filterInvoices(fetchedInvoices, params.filter) : fetchedInvoices;

  if (params.sort) {
    const { column, direction } = params.sort;
    allInvoices.sort((a, b) => {
      const result = compareInvoices(a, b, column);
      return direction === "asc" ? result : -result;
    });
  }

  const total = allInvoices.length;
  const totalPages = Math.max(1, Math.ceil(total / INVOICE_LIST_PAGE_SIZE));
  const page = Math.min(Math.max(1, params.page), totalPages);
  const start = (page - 1) * INVOICE_LIST_PAGE_SIZE;

  return {
    invoices: allInvoices.slice(start, start + INVOICE_LIST_PAGE_SIZE),
    pagination: { page, pageSize: INVOICE_LIST_PAGE_SIZE, total, totalPages },
  };
}
