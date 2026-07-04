import { APIErrorCode, APIResponseError, Client, isFullPage } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import { fetch as undiciFetch } from "undici";
import type {
  PageObjectResponse,
  QueryDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";

import { INVOICE_STATUS_MAP } from "@/lib/constants";
import type { Invoice, InvoiceItem, InvoiceStatus } from "@/lib/types";

// Notion 클라이언트 (서버 전용 — NOTION_API_KEY는 클라이언트에 노출 금지)
// SDK 기본값인 node-fetch, 그리고 Next.js가 패치한 전역 fetch 모두 이 환경에서 POST 응답을
// 스트리밍하는 도중 "Premature close"로 실패해 undici의 fetch를 직접 사용
const notion = new Client({ auth: process.env.NOTION_API_KEY, fetch: undiciFetch });

// 한글 Notion 속성 키를 한 곳에 모아 하드코딩 산재 방지 (실제 Notion DB 스키마와 1:1 대조 확인됨)
const PROPERTY_NAMES = {
  // 견적서 DB
  invoiceNumber: "견적서 번호",
  clientName: "클라이언트 명",
  issueDate: "발행일",
  validUntil: "유효기간",
  status: "상태",
  totalAmount: "총금액",
  // 항목 DB
  itemName: "항목명",
  quantity: "수량",
  unitPrice: "단가",
  amount: "금액",
  relatedInvoice: "Invoices", // 항목 DB → 견적서 DB 역참조 relation (항목 DB 쪽 속성명은 영문)
} as const;

// PageObjectResponse의 속성 값 유니온 타입
type NotionProperty = PageObjectResponse["properties"][string];

// 지정한 이름의 속성 값을 안전하게 조회 (없으면 undefined)
function getProperty(
  page: PageObjectResponse,
  name: string,
): NotionProperty | undefined {
  return page.properties[name];
}

// title 속성에서 plain_text 결합 문자열 추출
function extractTitle(page: PageObjectResponse, name: string): string {
  const prop = getProperty(page, name);
  if (prop?.type !== "title") return "";
  return prop.title.map((token) => token.plain_text).join("");
}

// rich_text 속성에서 plain_text 결합 문자열 추출
function extractRichText(page: PageObjectResponse, name: string): string {
  const prop = getProperty(page, name);
  if (prop?.type !== "rich_text") return "";
  return prop.rich_text.map((token) => token.plain_text).join("");
}

// number 속성 추출 (null이면 0)
function extractNumber(page: PageObjectResponse, name: string): number {
  const prop = getProperty(page, name);
  if (prop?.type !== "number") return 0;
  return prop.number ?? 0;
}

// number 또는 number 롤업 속성 추출 ("총 금액"이 Number/Rollup 양쪽일 수 있어 모두 대응)
function extractNumberOrRollup(page: PageObjectResponse, name: string): number {
  const prop = getProperty(page, name);
  if (prop?.type === "number") return prop.number ?? 0;
  if (prop?.type === "rollup" && prop.rollup.type === "number") {
    return prop.rollup.number ?? 0;
  }
  return 0;
}

// number 결과를 반환하는 formula 속성 추출 ("금액" = 수량*단가)
function extractFormulaNumber(page: PageObjectResponse, name: string): number {
  const prop = getProperty(page, name);
  if (prop?.type !== "formula") return 0;
  if (prop.formula.type !== "number") return 0;
  return prop.formula.number ?? 0;
}

// date 속성에서 시작일(ISO 문자열) 추출 (없으면 빈 문자열)
function extractDateStart(page: PageObjectResponse, name: string): string {
  const prop = getProperty(page, name);
  if (prop?.type !== "date") return "";
  return prop.date?.start ?? "";
}

// select 또는 status 속성의 한글 라벨을 InvoiceStatus로 변환 (매핑 실패 시 기본값 pending)
// Notion의 select와 status는 서로 다른 속성 타입이라 실제 DB 구성에 따라 둘 중 하나로 들어올 수 있음
function extractStatus(page: PageObjectResponse, name: string): InvoiceStatus {
  const prop = getProperty(page, name);
  const label =
    prop?.type === "select"
      ? (prop.select?.name ?? "")
      : prop?.type === "status"
        ? (prop.status?.name ?? "")
        : "";
  return INVOICE_STATUS_MAP.toStatus[label] ?? "pending";
}

// 항목 DB 페이지 → InvoiceItem 매핑
function mapNotionPageToInvoiceItem(page: PageObjectResponse): InvoiceItem {
  return {
    id: page.id,
    description: extractTitle(page, PROPERTY_NAMES.itemName),
    quantity: extractNumber(page, PROPERTY_NAMES.quantity),
    unitPrice: extractNumber(page, PROPERTY_NAMES.unitPrice),
    amount: extractFormulaNumber(page, PROPERTY_NAMES.amount),
  };
}

// 견적서 DB 페이지 + 연결된 항목 페이지들 → Invoice 매핑
function mapNotionPageToInvoice(
  page: PageObjectResponse,
  itemPages: PageObjectResponse[],
): Invoice {
  return {
    id: page.id,
    invoiceNumber: extractTitle(page, PROPERTY_NAMES.invoiceNumber),
    clientName: extractRichText(page, PROPERTY_NAMES.clientName),
    issueDate: extractDateStart(page, PROPERTY_NAMES.issueDate),
    validUntil: extractDateStart(page, PROPERTY_NAMES.validUntil),
    status: extractStatus(page, PROPERTY_NAMES.status),
    totalAmount: extractNumberOrRollup(page, PROPERTY_NAMES.totalAmount),
    items: itemPages.map(mapNotionPageToInvoiceItem),
  };
}

// Notion API 속도 제한 대응: 짧은 시간창(60초) 동안 동일 조회를 캐싱해 반복 호출을 줄임
// (이 앱은 Notion 데이터를 조회만 하고 앱에서 직접 쓰기를 하지 않으므로 시간 기반 재검증으로 충분)
const CACHE_REVALIDATE_SECONDS = 60;

// 단일 견적서 조회
// Notion Relation은 페이지 ID만 반환하므로 (1) 견적서 페이지 조회 →
// (2) 해당 견적서를 참조하는 항목들을 별도 쿼리, 두 단계의 순차 종속 호출이 필요하다.
async function fetchInvoiceByPageId(
  notionPageId: string,
): Promise<Invoice | null> {
  try {
    // (1) 견적서 페이지 조회
    const page = await notion.pages.retrieve({ page_id: notionPageId });
    if (!isFullPage(page)) return null;

    // (2) 항목 DB에서 "견적서 relation contains 해당 페이지ID" 필터로 조회
    const itemsResponse = await notion.databases.query({
      database_id: process.env.NOTION_ITEMS_DATABASE_ID!,
      filter: {
        property: PROPERTY_NAMES.relatedInvoice,
        relation: { contains: notionPageId },
      },
    });

    // 전체 페이지(PageObjectResponse)만 매핑 대상으로 추림
    const itemPages = itemsResponse.results.filter(isFullPage);

    return mapNotionPageToInvoice(page, itemPages);
  } catch (error) {
    // 존재하지 않는/잘못된 page_id는 404 계열(ObjectNotFound) 또는 ValidationError를 throw → null 반환
    // 인증 실패·rate limit 등 그 외 오류는 상위에서 처리하도록 재전파
    if (
      error instanceof APIResponseError &&
      (error.code === APIErrorCode.ObjectNotFound ||
        error.code === APIErrorCode.ValidationError)
    ) {
      return null;
    }
    throw error;
  }
}

export const getInvoiceByPageId = unstable_cache(
  fetchInvoiceByPageId,
  ["notion-invoice-by-page-id"],
  { revalidate: CACHE_REVALIDATE_SECONDS },
);

// 견적서 목록 조회 (골격만 — 정렬/검색/필터 상세 구현은 다음 작업 범위)
async function fetchInvoices(opts: {
  pageSize: number;
  startCursor?: string;
}): Promise<{ invoices: Invoice[]; nextCursor: string | null }> {
  const queryParams: QueryDatabaseParameters = {
    database_id: process.env.NOTION_DATABASE_ID!,
    page_size: opts.pageSize,
    start_cursor: opts.startCursor,
  };

  const response = await notion.databases.query(queryParams);

  // 목록 단계에서는 견적서별 항목까지 조회하지 않고 빈 items로 매핑 (상세 조회 시 채움)
  const invoices = response.results
    .filter(isFullPage)
    .map((page) => mapNotionPageToInvoice(page, []));

  return {
    invoices,
    nextCursor: response.next_cursor,
  };
}

export const listInvoices = unstable_cache(
  fetchInvoices,
  ["notion-list-invoices"],
  { revalidate: CACHE_REVALIDATE_SECONDS },
);
