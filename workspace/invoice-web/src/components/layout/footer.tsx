import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SITE_CONFIG, FOOTER_SECTIONS } from "@/lib/constants";

// 사이트 하단 푸터 - 링크 섹션 + 카피라이트
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* 상단: 브랜드 + 링크 섹션 그리드 */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* 브랜드 컬럼 */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-bold">{SITE_CONFIG.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* 링크 섹션들 */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-medium">{section.title}</p>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* 하단: 카피라이트 */}
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
