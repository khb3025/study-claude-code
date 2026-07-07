"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

// 관리자 대시보드 세그먼트 에러 바운더리
export default function AdminDashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <EmptyState
        icon={<AlertTriangle />}
        title="문제가 발생했습니다"
        description="대시보드 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요."
        action={<Button onClick={reset}>다시 시도</Button>}
      />
    </div>
  );
}
