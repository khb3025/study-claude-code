"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// "새 이벤트" 탭은 우측 하단 플로팅 액션 버튼(NewEventFab)으로 이동했다
const NAV_ITEMS = [
  { href: "/protected", label: "홈", icon: Home },
  { href: "/events", label: "이벤트", icon: CalendarDays },
  { href: "/friends", label: "친구", icon: Users },
  { href: "/protected", label: "프로필", icon: User },
] as const;

export function EventsBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 w-full justify-center border-t bg-background md:hidden">
      <div className="flex w-full max-w-5xl items-center justify-around">
        {NAV_ITEMS.map((item, index) => {
          const isActive =
            item.href === "/events"
              ? pathname === "/events" || pathname.startsWith("/events/")
              : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
