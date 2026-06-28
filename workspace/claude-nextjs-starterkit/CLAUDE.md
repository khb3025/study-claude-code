# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code(claude.ai/code)에게 안내를 제공합니다.

@AGENTS.md

## 명령어

```bash
npm run dev      # 개발 서버 시작 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
```

이 프로젝트에는 테스트 러너가 구성되어 있지 않습니다.

## 아키텍처

TypeScript strict 모드를 사용하는 Next.js 16.2.9 App Router 기반 스타터 킷입니다.

**중요:** Next.js 16은 이전 버전과 호환되지 않는 변경 사항이 있습니다. Next.js 관련 코드를 작성하기 전에 반드시 `node_modules/next/dist/docs/`를 먼저 읽으세요.

### 주요 기술 스택

- **Next.js 16 / React 19** — App Router, 기본적으로 React Server Components 사용
- **TailwindCSS v4** — `tailwind.config.*` 파일 없음; `globals.css`의 CSS import로 설정
- **shadcn/ui (base-nova 스타일)** — `src/components/ui/`에 위치, Base-UI 프리미티브 기반
- **Base-UI** (`@base-ui/react`) — shadcn 컴포넌트 내부에서 사용하는 헤드리스 컴포넌트 프리미티브
- **CVA** (`class-variance-authority`) — UI 컴포넌트의 variant 패턴 정의
- **next-themes** — 라이트/다크 모드; `ThemeProvider`가 루트 레이아웃을 감쌈
- **경로 별칭:** `@/*`는 `src/*`로 해석됨

### 소스 구조

```
src/
├── app/            # Next.js App Router (레이아웃, 페이지, 전역 CSS)
├── components/
│   ├── layout/     # Header, Nav, Footer (서버 컴포넌트)
│   ├── theme/      # ThemeProvider, ThemeToggle ("use client")
│   └── ui/         # shadcn/ui 프리미티브 (Button, Card, Badge, Separator)
├── constants/
│   └── site.ts     # SITE_NAME, SITE_DESCRIPTION, NAV_LINKS — 내비게이션 항목은 여기에 추가
└── lib/
    └── utils.ts    # cn() 헬퍼 (clsx + tailwind-merge)
```

### 패턴

- 브라우저 API나 훅이 필요한 컴포넌트는 파일 상단에 `"use client"`를 선언하고, 나머지는 모두 서버 컴포넌트로 작성합니다.
- UI 컴포넌트의 variant는 CVA로 정의하고, 클래스 병합 시 `src/lib/utils.ts`의 `cn()`을 사용합니다.
- 새로운 shadcn 컴포넌트 추가: `npx shadcn@latest add <component>` (스타일: `base-nova`, 기본 색상: `neutral`)
- 내비게이션 링크는 `src/constants/site.ts`에서 중앙 관리합니다. 라우트를 인라인으로 추가하지 마세요.
- 색상용 OKLCh 기반 CSS 변수는 `src/app/globals.css`의 `:root`와 `.dark`에 정의되어 있습니다.
