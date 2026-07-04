import type { InvoiceStatus } from "@/lib/types";

// 사이트 전반 메타데이터 설정
export const SITE_CONFIG = {
  name: "견적서 관리 시스템",
  description: "노션 데이터베이스로 관리하는 견적서를 고유 URL로 조회하고 PDF로 다운로드하는 서비스",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  author: {
    name: "개발자",
  },
} as const;

// Notion Select 한글 라벨 ↔ InvoiceStatus 값 양방향 매핑
// toStatus: Notion에서 읽어온 한글 라벨을 앱 내부 상태 값으로 변환
// toLabel: 앱 내부 상태 값을 Notion에 기록/표시할 한글 라벨로 변환
export const INVOICE_STATUS_MAP: {
  toStatus: Record<string, InvoiceStatus>;
  toLabel: Record<InvoiceStatus, string>;
} = {
  toStatus: {
    대기: "pending",
    승인: "approved",
    거절: "rejected",
  },
  toLabel: {
    pending: "대기",
    approved: "승인",
    rejected: "거절",
  },
};
