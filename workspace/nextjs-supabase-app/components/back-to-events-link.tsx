import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// 이벤트 목록 외 하위 페이지(상세/나의 주최/참여/초대/친구 등)에서 공통으로 쓰는 뒤로가기 아이콘
export function BackToEventsLink() {
  return (
    <Link
      href="/events"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-muted-foreground hover:bg-accent"
      aria-label="이벤트 목록으로 돌아가기"
    >
      <ArrowLeft className="h-4 w-4" />
    </Link>
  );
}
