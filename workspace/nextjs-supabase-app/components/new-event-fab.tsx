"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// 우측 하단 고정 플로팅 액션 버튼: "/events/new"로 이동하는 새 이벤트 생성 진입점
// 이벤트 목록 화면에서만 노출한다(상세/하위 페이지에서는 맥락에 맞지 않아 숨김).
export function NewEventFab() {
  const pathname = usePathname();

  if (pathname !== "/events") {
    return null;
  }

  return (
    <Button
      asChild
      size="icon"
      className="fixed bottom-20 right-5 z-50 h-14 w-14 rounded-full shadow-lg md:bottom-8"
    >
      <Link href="/events/new" aria-label="새 이벤트 생성">
        <PlusCircle className="h-6 w-6" />
      </Link>
    </Button>
  );
}
