"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/events", label: "이벤트 관리", icon: CalendarDays },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
] as const;

// 관리자 페이지 공통 레이아웃: 좌측 사이드바 + 우측 콘텐츠 영역
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-56 shrink-0 border-r p-4 sm:block">
        <Link href="/admin/dashboard" className="mb-6 block text-lg font-bold">
          관리자
        </Link>
        <nav className="flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
