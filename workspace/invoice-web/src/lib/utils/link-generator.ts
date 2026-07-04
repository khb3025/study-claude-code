import { SITE_CONFIG } from "@/lib/constants";

// 견적서 조회 페이지 라우트(src/app/invoice/[notionPageId]/page.tsx)와 반드시 일치해야 하는 경로 규칙
export function getInvoicePublicPath(notionPageId: string): string {
  return `/invoice/${notionPageId}`;
}

// 이메일/메신저 공유(Task 018)처럼 절대 URL이 필요한 곳에서 사용
export function getInvoicePublicUrl(notionPageId: string): string {
  return `${SITE_CONFIG.url}${getInvoicePublicPath(notionPageId)}`;
}
