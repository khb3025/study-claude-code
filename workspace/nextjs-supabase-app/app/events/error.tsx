"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

// 이벤트 세그먼트 에러 바운더리: 렌더링/데이터 조회 중 예외 발생 시 표시
export default function EventsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <EmptyState
        icon={<AlertTriangle />}
        title="문제가 발생했습니다"
        description="이벤트 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요."
        action={<Button onClick={reset}>다시 시도</Button>}
      />
    </div>
  );
}
