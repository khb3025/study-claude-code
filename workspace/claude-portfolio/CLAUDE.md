# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 개발 명령어

```bash
npm run dev      # 개발 서버 (Turbopack, 기본 포트 3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npx tsc --noEmit # 타입 오류 검사
```

shadcn 컴포넌트 추가 (`form` 컴포넌트는 shadcn 미지원 → `src/components/ui/form.tsx` 수동 관리):
```bash
npx shadcn@latest add <component-name>
```

## 기술 스택 핵심 사항

- **Next.js 16.2.9** — App Router, `"use client"` 경계 명시 필수
- **Tailwind CSS v4** — `tailwind.config` 파일 없음. `@import "tailwindcss"` 방식. CSS 변수는 `globals.css`의 `@theme inline` 블록에서 정의
- **shadcn/ui `radix-nova` 스타일** — 표준 `default`/`new-york`과 다름. `data-slot`, `group/button`, `Slot.Root` 패턴 사용
- **다크모드** — `globals.css`의 `@custom-variant dark (&:is(.dark *))` + `ThemeProvider attribute="class"` 조합. `.dark` 클래스를 `<html>`에 주입
- **Zod v4** — `required_error` 옵션 제거됨. `.min(1, 'msg')` 또는 `{ error: 'msg' }` 사용. 스키마에 `.default()` 사용 시 resolver 타입 불일치 발생 → `defaultValues`로 대신 처리
- **usehooks-ts** — 미디어쿼리(`useMediaQuery`), 로컬스토리지(`useLocalStorage`), 디바운스(`useDebounceValue`) 훅 소스

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (ThemeProvider + Toaster)
│   ├── globals.css                   # Tailwind v4 + shadcn 테마 CSS 변수
│   ├── (marketing)/
│   │   ├── layout.tsx                # Header + Footer 래핑
│   │   └── page.tsx                  # 랜딩 페이지 (Hero / Features / CTA)
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Sidebar + ThemeToggle 헤더
│   │   └── dashboard/page.tsx        # /dashboard — 스탯카드 + 주문 테이블
│   └── examples/
│       ├── layout.tsx                # Header + 예제 사이드바 (use client)
│       ├── page.tsx                  # 예제 인덱스
│       ├── buttons/page.tsx          # Button, Badge 모든 variant
│       ├── forms/page.tsx            # react-hook-form + Zod (use client)
│       ├── data-display/page.tsx     # Table, Tabs, Accordion, Avatar, Progress
│       └── feedback/page.tsx         # Dialog, Toast, Alert, Skeleton, Tooltip (use client)
├── components/
│   ├── ui/                           # shadcn 컴포넌트 (form.tsx는 수동 작성)
│   ├── layout/
│   │   ├── header.tsx                # Server — sticky 글라스 헤더
│   │   ├── footer.tsx                # Server — 링크 섹션 + 카피라이트
│   │   ├── mobile-nav.tsx            # Client — Sheet 기반 모바일 드로어
│   │   └── sidebar.tsx               # Client — 대시보드 사이드바 (usePathname 활성 링크)
│   └── shared/
│       ├── theme-toggle.tsx          # Client — mounted 패턴으로 hydration 안전
│       ├── theme-provider.tsx        # Client — next-themes 래핑
│       ├── page-header.tsx           # Server — 페이지 제목/설명/액션 블록
│       └── section.tsx               # Server — py-16 md:py-24 간격 래퍼
└── lib/
    ├── constants.ts                  # SITE_CONFIG, NAV_ITEMS, SIDEBAR_ITEMS, EXAMPLE_SECTIONS
    ├── utils.ts                      # cn, formatDate, formatNumber, formatCurrency, formatRelativeTime, formatBytes, truncate, getInitials
    ├── hooks/
    │   ├── use-media-query.ts        # useIsMobile/Tablet/Desktop + raw useMediaQuery (usehooks-ts)
    │   ├── use-local-storage.ts      # useLocalStorage 재내보내기 (usehooks-ts)
    │   └── use-debounce.ts           # useDebounceValue/Callback 재내보내기 (usehooks-ts)
    └── types/
        └── index.ts                  # ApiResponse, Pagination, Option, SortState, User, PageProps
```

## 아키텍처 규칙

**Route Group 충돌 주의**
- `(dashboard)`와 `(marketing)` 그룹이 같은 URL 경로를 가지면 빌드 오류 발생
- 각 그룹 내 페이지는 URL 세그먼트를 명시해야 함 (예: `(dashboard)/dashboard/page.tsx` → `/dashboard`)

**Server / Client 분리**
- `header.tsx`, `footer.tsx`, `page-header.tsx`, `section.tsx` — Server Component
- `useTheme`, `usePathname`, `useState` 등 브라우저 API 필요 시에만 `"use client"` 추가

**상수 중앙 관리**
- 사이트 메타·네비·사이드바·예제 섹션 모두 `lib/constants.ts`에서 관리

**shadcn 컴포넌트 주의**
- `components/ui/` 파일은 shadcn CLI가 덮어쓸 수 있음 (특히 `form.tsx`는 수동 작성본이므로 보호 필요)
- 스타일 커스터마이징은 `cn()` + className prop으로 처리


## 참고 컨텍스트
- PRD 문서: @docs/PRD.md
- 개발 로드맵: @docs/ROADMAP.md
