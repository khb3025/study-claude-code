"use client";

import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Invoice } from "@/lib/types";

// @react-pdf/renderer는 번들이 무거워 실제 클릭 시점까지 지연 로딩(브라우저 전용 API 의존이라 ssr 비활성화)
// Next.js 16부터 `ssr: false` 옵션은 Server Component에서 직접 사용할 수 없어
// 이 Client Component 안으로 dynamic() 호출을 옮겨서 처리한다.
const PdfDownloadButton = dynamic(
  () => import("@/components/invoice/pdf-download-button").then((mod) => mod.PdfDownloadButton),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" disabled>
        <Download aria-hidden="true" />
        PDF 다운로드
      </Button>
    ),
  },
);

type PdfDownloadButtonLoaderProps = {
  invoice: Invoice;
};

export function PdfDownloadButtonLoader({ invoice }: PdfDownloadButtonLoaderProps) {
  return <PdfDownloadButton invoice={invoice} />;
}
