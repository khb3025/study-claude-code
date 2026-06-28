import { SITE_NAME } from "@/constants/site"

const FOUNDING_YEAR = 2025

/** 사이트 푸터 — 카피라이트 표시 */
export function Footer() {
    const currentYear = new Date().getFullYear()
    const yearDisplay =
        currentYear > FOUNDING_YEAR
            ? `${FOUNDING_YEAR}–${currentYear}`
            : String(FOUNDING_YEAR)

    return (
        <footer className="border-t py-8">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>
                    © {yearDisplay} {SITE_NAME}. Built with Next.js, TailwindCSS v4, and shadcn/ui.
                </p>
            </div>
        </footer>
    )
}
