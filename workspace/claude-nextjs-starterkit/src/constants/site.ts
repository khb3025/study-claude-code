/** 앱 전역 상수 — 매직 스트링 중앙 관리 */
export const SITE_NAME = "Next.js Starter Kit"
export const SITE_DESCRIPTION =
    "Next.js v15, TailwindCSS v4, shadcn/ui, TypeScript로 구성된 현대적인 웹 스타터 킷"

/** 기본 네비게이션 링크 */
export const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "About", href: "/about" },
] as const
