"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { EXAMPLE_SECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Header />
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] gap-0 px-4">
        {/* 예제 카테고리 사이드바 */}
        <aside className="hidden w-52 shrink-0 py-8 pr-6 md:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            예제 모음
          </p>
          <nav className="flex flex-col gap-1">
            <Link
              href="/examples"
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                pathname === "/examples"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              전체 보기
            </Link>
            {EXAMPLE_SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname === section.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {section.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* 본문 */}
        <main className="flex-1 border-l border-border py-8 pl-6 md:pl-8">
          {children}
        </main>
      </div>
    </>
  );
}
