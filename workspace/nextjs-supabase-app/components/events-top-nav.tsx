"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 이벤트 목록 페이지에서만 사이트 브랜드/전역 내비게이션을 보여준다.
// 상세/하위 페이지는 뒤로가기 아이콘으로 충분하므로 노출하지 않는다.
export function EventsTopNav({ authSlot }: { authSlot: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname !== "/events") {
    return null;
  }

  return (
    <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
      <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
        <Link href={"/"} className="text-lg font-extrabold text-primary">
          Gather
        </Link>
        {authSlot}
      </div>
    </nav>
  );
}
