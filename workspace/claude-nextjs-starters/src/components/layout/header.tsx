import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";

// Sticky 헤더 - 글라스 효과 적용, 반응형 네비게이션
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* 로고 */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          {SITE_CONFIG.name}
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              {...(item.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 우측 액션 영역 */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* 모바일 전용 햄버거 메뉴 */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
