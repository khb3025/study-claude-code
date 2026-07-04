# CLAUDE.md

**노션 기반 견적서 관리 시스템**은 노션(Notion)을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 고유 URL로 웹에서 조회하고 PDF로 다운로드할 수 있게 하는 MVP 서비스입니다. 회원가입/이메일 인증 없이 노션 데이터베이스 ID 기반의 공개 URL(`/invoice/[notionPageId]`)로 누구나 접근합니다.

📋 상세 프로젝트 요구사항은 @/docs/PRD.md 참조
📋 프로젝트 계획은 @/docs/ROADMAP.md 참조
📋 관리자 기능 사용법은 @/docs/ADMIN_GUIDE.md 참조
📋 Vercel 배포 절차 및 체크리스트는 @/docs/DEPLOYMENT.md 참조
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
- 아래 항목은 PRD에 정의되었으나 아직 설치/구현되지 않음 (다음 개발 단계에서 추가 예정): `@notionhq/client`, `@react-pdf/renderer`

## 프로젝트 구조

스타터킷 초기화가 완료된 상태로, 데모/예제 콘텐츠와 이전 스코프(이메일 인증 기반 견적서 열람 서비스)의 산출물은 모두 제거되었고 재사용 가능한 핵심 인프라만 남아 있습니다. 새 PRD에 정의된 실제 페이지(견적서 조회 페이지, 404 에러 페이지)는 아직 구현 전입니다.

```
src/
├── app/
│   ├── layout.tsx                    # 루트 레이아웃 (ThemeProvider + Toaster)
│   └── globals.css                   # Tailwind v4 + shadcn 테마 CSS 변수
│   # (실제 라우트는 PRD 기반으로 추후 추가: /invoice/[notionPageId], 404 에러)
├── components/
│   ├── ui/                           # shadcn 컴포넌트 (form.tsx는 수동 작성)
│   └── shared/
│       ├── theme-toggle.tsx          # Client — mounted 패턴으로 hydration 안전
│       ├── theme-provider.tsx        # Client — next-themes 래핑
│       ├── page-header.tsx           # Server — 페이지 제목/설명/액션 블록
│       └── section.tsx               # Server — py-16 md:py-24 간격 래퍼
└── lib/
    ├── constants.ts                  # SITE_CONFIG (사이트 메타데이터)
    ├── utils.ts                      # cn, formatDate, formatNumber, formatCurrency, formatRelativeTime, formatBytes, truncate, getInitials
    ├── hooks/
    │   ├── use-media-query.ts        # useIsMobile/Tablet/Desktop + raw useMediaQuery (usehooks-ts)
    │   ├── use-local-storage.ts      # useLocalStorage 재내보내기 (usehooks-ts)
    │   └── use-debounce.ts           # useDebounceValue/Callback 재내보내기 (usehooks-ts)
    └── types/
        └── index.ts                  # ApiResponse, Pagination, Option, SortState, User, PageProps (범용 타입 — Invoice/Item 등 PRD 데이터 모델은 추후 별도 정의 필요)
```

## 아키텍처 규칙

**Server / Client 분리**
- `page-header.tsx`, `section.tsx` — Server Component
- `useTheme`, `usePathname`, `useState` 등 브라우저 API 필요 시에만 `"use client"` 추가

**상수 중앙 관리**
- 사이트 메타는 `lib/constants.ts`의 `SITE_CONFIG`에서 관리. 향후 페이지/네비게이션이 추가되면 관련 상수도 이곳에 정의

**shadcn 컴포넌트 주의**
- `components/ui/` 파일은 shadcn CLI가 덮어쓸 수 있음 (특히 `form.tsx`는 수동 작성본이므로 보호 필요)
- 스타일 커스터마이징은 `cn()` + className prop으로 처리

**라우트 추가 시 주의**
- PRD의 페이지 구조(견적서 조회 페이지 `/invoice/[notionPageId]` / 404 에러 페이지)에 맞춰 `src/app/` 하위에 라우트를 구성할 것. 별도의 홈페이지나 이메일 인증 페이지는 없음 (이전 스코프였던 `/`, `/verify/[token]`, `/quotes/[id]`, `/error` 및 `src/lib/mock-data.ts`는 새 PRD와 맞지 않아 제거됨)
- Route Group을 사용할 경우, 서로 다른 그룹이 동일한 URL 경로를 갖지 않도록 주의 (Next.js 빌드 오류 원인)

