import Link from "next/link"
import { Nav } from "./nav"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { SITE_NAME } from "@/constants/site"

/** 스티키 사이트 헤더 — 로고, 네비게이션, 테마 토글 포함 */
export function Header() {
    return (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    {SITE_NAME}
                </Link>
                <div className="flex items-center gap-4">
                    <Nav />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}
