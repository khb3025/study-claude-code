import { FilterPanel } from "@/components/admin/filter-panel";
import { InvoiceTable } from "@/components/admin/invoice-table";
import { SearchBar } from "@/components/admin/search-bar";
import { PageHeader } from "@/components/shared/page-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getInvoiceListPage,
  type InvoiceListSortColumn,
} from "@/lib/services/invoice-list.service";
import { INVOICE_STATUS_MAP } from "@/lib/constants";
import type { PageProps, SortState } from "@/lib/types";
import type { InvoiceFilterParams } from "@/lib/utils/search-filter";

const SORT_COLUMNS: InvoiceListSortColumn[] = [
  "invoiceNumber",
  "clientName",
  "issueDate",
  "validUntil",
  "status",
  "totalAmount",
];

function parseSort(searchParams: Record<string, string | string[]>): SortState<InvoiceListSortColumn> | undefined {
  const column = searchParams.sort;
  const direction = searchParams.dir;
  if (typeof column !== "string" || !SORT_COLUMNS.includes(column as InvoiceListSortColumn)) {
    return undefined;
  }
  return {
    column: column as InvoiceListSortColumn,
    direction: direction === "asc" ? "asc" : "desc",
  };
}

function parsePage(searchParams: Record<string, string | string[]>): number {
  const page = Number(searchParams.page);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function parseFilter(searchParams: Record<string, string | string[]>): InvoiceFilterParams {
  const search = searchParams.search;
  const status = searchParams.status;
  const dateFrom = searchParams.dateFrom;
  const dateTo = searchParams.dateTo;

  return {
    search: typeof search === "string" ? search : undefined,
    status:
      typeof status === "string" && status in INVOICE_STATUS_MAP.toLabel
        ? (status as InvoiceFilterParams["status"])
        : undefined,
    dateFrom: typeof dateFrom === "string" ? dateFrom : undefined,
    dateTo: typeof dateTo === "string" ? dateTo : undefined,
  };
}

function buildHref(
  page: number,
  sort?: SortState<InvoiceListSortColumn>,
  filter?: InvoiceFilterParams,
): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (sort) {
    params.set("sort", sort.column);
    params.set("dir", sort.direction);
  }
  if (filter?.search) params.set("search", filter.search);
  if (filter?.status) params.set("status", filter.status);
  if (filter?.dateFrom) params.set("dateFrom", filter.dateFrom);
  if (filter?.dateTo) params.set("dateTo", filter.dateTo);
  return `/admin/invoices?${params.toString()}`;
}

export default async function AdminInvoicesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentSort = parseSort(resolvedSearchParams);
  const currentPage = parsePage(resolvedSearchParams);
  const currentFilter = parseFilter(resolvedSearchParams);

  const { invoices, pagination } = await getInvoiceListPage({
    page: currentPage,
    sort: currentSort,
    filter: currentFilter,
  });

  function buildSortHref(column: InvoiceListSortColumn): string {
    const nextDirection = currentSort?.column === column && currentSort.direction === "asc" ? "desc" : "asc";
    return buildHref(1, { column, direction: nextDirection }, currentFilter);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="견적서 목록"
        description={`전체 ${pagination.total}건 · ${pagination.page}/${pagination.totalPages}페이지`}
      />

      <div className="flex flex-col gap-4">
        <SearchBar />
        <FilterPanel />
      </div>

      <InvoiceTable invoices={invoices} sort={currentSort} buildSortHref={buildSortHref} />

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={buildHref(Math.max(1, pagination.page - 1), currentSort, currentFilter)}
                aria-disabled={pagination.page <= 1}
              />
            </PaginationItem>
            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href={buildHref(page, currentSort, currentFilter)} isActive={page === pagination.page}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={buildHref(Math.min(pagination.totalPages, pagination.page + 1), currentSort, currentFilter)}
                aria-disabled={pagination.page >= pagination.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
