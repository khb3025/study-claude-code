# Development Guidelines (AI Agent 전용)

이 문서는 AI Agent가 이 저장소에서 코드를 수정할 때 반드시 지켜야 할 규칙만 담는다. 일반적인 Next.js/React/TypeScript 지식은 기술하지 않는다.

## 프로젝트 개요

- Next.js 15 App Router + Supabase(`@supabase/ssr`) 인증 스타터킷.
- 폴더 루트: `app/`, `components/`, `lib/`, `types/`, `docs/` — **`src/` 디렉터리는 존재하지 않는다.**
- `mcp-shrimp-task-manager/`는 별도의 서브프로젝트(MCP 서버 자체 소스)이며 이 앱의 런타임 코드와 무관하다. 이 앱 기능 작업 시 `mcp-shrimp-task-manager/` 내부 파일을 수정하지 않는다.

## Supabase 클라이언트 3분화 — 위반 금지

- 브라우저(클라이언트 컴포넌트)에서는 반드시 `lib/supabase/client.ts`의 클라이언트를 사용한다.
- 서버 컴포넌트/서버 액션/라우트 핸들러에서는 반드시 `lib/supabase/server.ts`의 클라이언트를 **요청마다 새로 생성**해서 사용한다. 이 클라이언트를 모듈 스코프 전역 변수나 싱글턴에 저장하는 코드를 작성하지 않는다(Fluid compute에서 사용자 세션이 섞이는 문제 발생).
- `lib/supabase/proxy.ts`의 `updateSession()`은 세션 쿠키 갱신과 미인증 리다이렉트를 전역 처리한다. 개별 페이지/레이아웃에 자체적인 인증 체크·리다이렉트 로직을 추가하지 않는다 — 인증 게이트는 이 함수 하나로 유지한다.

## `lib/supabase/proxy.ts` 수정 시 절대 규칙

- `createServerClient(...)` 호출과 `supabase.auth.getClaims()` 호출 사이에 **어떤 코드도 추가하지 않는다.** 파일 내 주석에 이미 경고되어 있으며, 위반 시 사용자가 무작위로 로그아웃되는 버그가 발생한다.
- `getAll`/`setAll` 쿠키 핸들러와 `supabaseResponse` 재생성 로직을 변경하지 않는다. 새 `NextResponse`를 만들어야 하는 경우 반드시 (1) `request`를 전달, (2) `supabaseResponse.cookies.getAll()`을 복사, (3) 쿠키 자체는 건드리지 않고 나머지만 수정, (4) 그 새 객체를 반환 — 이 4단계를 모두 지킨다.
- 인증이 필요 없는 공개 경로를 추가할 때는 `pathname.startsWith(...)` 조건에 경로를 추가하되, 기존 조건(`/login`, `/auth`)을 삭제하지 않는다.

## 루트 `proxy.ts`와 관계

- 루트의 `proxy.ts`는 Next.js middleware 파일로 `lib/supabase/proxy.ts`의 `updateSession`을 호출하는 wrapper다. 인증/세션 로직은 `lib/supabase/proxy.ts`에만 작성하고, 루트 `proxy.ts`에는 로직을 추가하지 않는다.
- `proxy.ts`의 `config.matcher`를 변경해 정적 자산 제외 규칙을 깨지 않는다.

## 환경 변수 및 `hasEnvVars`

- 필수 환경 변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`.env.local`).
- `lib/utils.ts`의 `hasEnvVars`로 존재 여부를 확인한다. 이 값이 false일 때 프록시의 세션 체크를 건너뛰는 것은 튜토리얼용 안전장치이며, 별도 지시 없이 이 분기를 제거하지 않는다.

## 경로 별칭

- import 시 반드시 `@/*` 별칭을 사용한다 (예: `@/components/...`, `@/lib/...`). 상대경로(`../../lib/...`)로 깊은 import를 만들지 않는다.
- `src/`를 기준으로 한 import 경로를 생성하지 않는다 — 존재하지 않는 디렉터리다.

## UI 컴포넌트 배치 규칙

- shadcn/ui 컴포넌트(new-york 스타일)는 `components/ui/`에만 추가한다. `npx shadcn add`로 생성된 결과를 그대로 유지하고 임의로 스타일 프리셋을 바꾸지 않는다.
- 페이지 조립용 도메인 컴포넌트(`login-form.tsx`, `auth-button.tsx` 스타일)는 하위 폴더 없이 `components/` 바로 아래 평평하게 추가한다. 새로 만드는 인증/폼 관련 컴포넌트도 이 평평한 구조를 따른다(예: `components/reset-form.tsx`, `components/xxx-button.tsx`).
- 스타일링은 Tailwind CSS + `lib/utils.ts`의 `cn()`(clsx + tailwind-merge) 조합만 사용한다. 별도의 CSS-in-JS나 styled-components를 도입하지 않는다.

## `docs/guides/` 참고 시 주의

- `docs/guides/`의 스타일링/컴포넌트/폼 가이드는 `src/` 기반 구조를 전제로 작성되어 실제 폴더 배치(`app/`, `components/`, `lib/`가 루트)와 다르다. 경로 관련 지시는 이 가이드보다 실제 코드 구조를 우선한다.
- `docs/ROADMAP.md`를 갱신해야 하는 작업(기능 완료 체크 등)은 `docs:update-roadmap` 스킬을 사용한다.

## 인증 플로우 파일 위치

- 로그인/회원가입/비밀번호 재설정/이메일 컨펌 페이지는 `app/auth/*` 아래에 추가한다 (예: `app/auth/login/page.tsx` 패턴 유지).
- 인증 후 진입해야 하는 보호된 페이지는 `app/protected/` 그룹 아래에 추가한다. 보호 여부 체크 코드를 페이지 안에 직접 작성하지 않는다 — `lib/supabase/proxy.ts`가 전역 처리한다.

## 커밋 및 문서 언어

- 커밋 메시지, 코드 주석(비즈니스 로직 관련), 문서(`docs/*.md`)는 한국어로 작성한다. 변수명·함수명·타입명은 영어를 유지한다.

## 금지 사항 요약

- `src/` 기준 경로/import 생성 금지.
- `lib/supabase/server.ts` 클라이언트를 전역 변수에 캐싱 금지.
- `createServerClient`와 `getClaims()` 사이 코드 삽입 금지.
- 페이지 레벨 개별 인증 리다이렉트 로직 추가 금지(중앙 집중은 `proxy.ts`/`lib/supabase/proxy.ts`).
- `components/ui/`가 아닌 곳에 shadcn 컴포넌트 배치 금지.
- `mcp-shrimp-task-manager/` 내부 코드를 이 앱 기능 작업 범위로 수정 금지.
