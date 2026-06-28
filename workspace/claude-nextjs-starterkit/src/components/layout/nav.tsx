import Link from "next/link"
import { NAV_LINKS } from "@/constants/site"

/** 수평 네비게이션 링크 목록 */
export function Nav() {
    return (
        <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    )
}
