# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 15 (App Router) + Supabase 인증 스타터킷. `supabase-ssr`을 사용해 쿠키 기반 세션을 App Router 전체(서버 컴포넌트, 클라이언트 컴포넌트, 라우트 핸들러, 프록시)에서 공유한다.

## 명령어

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

별도의 테스트 스크립트는 아직 구성되어 있지 않다.

## 아키텍처

### Supabase 클라이언트 3분화

- `lib/supabase/client.ts` — 브라우저(클라이언트 컴포넌트)에서 사용하는 Supabase 클라이언트.
- `lib/supabase/server.ts` — 서버 컴포넌트/서버 액션에서 사용. **요청마다 새로 생성**해야 하며 전역 변수에 저장하면 안 됨(Fluid compute 대응).
- `lib/supabase/proxy.ts` — `updateSession()`이 프록시(`proxy.ts`, Next.js의 middleware 역할)에서 세션 쿠키를 갱신하고, 미인증 사용자를 `/auth/login`으로 리다이렉트한다. `createServerClient` 호출과 `supabase.auth.getClaims()` 사이에 다른 코드를 넣지 말 것 — 세션이 예기치 않게 끊길 수 있다(파일 내 주석 경고 참고).

루트의 `proxy.ts`는 Next.js의 middleware 파일로, `updateSession`을 호출하는 얇은 wrapper다. `config.matcher`가 정적 자산/이미지 경로를 제외하고 모든 요청에 적용된다.

### 인증 플로우

`app/auth/*`에 로그인, 회원가입, 비밀번호 재설정, 이메일 컨펌(`confirm/route.ts`) 페이지가 있다. `app/protected/`는 인증이 필요한 페이지 그룹이며, 인증 여부 체크는 개별 페이지가 아니라 proxy의 `updateSession`에서 전역적으로 처리된다.

### 환경 변수

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 `.env.local`에 필요하다. `lib/utils.ts`의 `hasEnvVars`로 존재 여부를 확인하며, 값이 없으면 proxy의 세션 체크를 건너뛴다(튜토리얼용 안전장치 — 실제 운영 전 제거 고려).

### 경로 별칭

`tsconfig.json` 기준 `@/*` → 프로젝트 루트. 즉 `@/components/...`, `@/lib/...`처럼 사용한다. `src/` 디렉터리는 없다 — `app/`, `components/`, `lib/`는 모두 리포 루트에 위치한다(`docs/guides/project-structure.md`는 `src/` 기준 이상적인 구조를 설명하지만 현재 코드베이스와는 다르다).

### UI

`components/ui/`는 shadcn/ui(new-york 스타일) 컴포넌트, `components/`에는 페이지 조립에 쓰는 도메인 컴포넌트(`login-form.tsx`, `auth-button.tsx` 등)가 평평하게 존재한다. 스타일링은 Tailwind CSS + `cn()`(`lib/utils.ts`, clsx + tailwind-merge) 조합을 사용한다.

## 참고 문서

`docs/guides/`에 스타일링, 컴포넌트 패턴, 폼(React Hook Form), Next.js 15 관련 상세 가이드가 있다. 다만 이 문서들은 `src/` 기반 구조를 전제로 작성되어 있어 실제 폴더 배치와는 차이가 있으니, 구조 관련 세부사항은 실제 코드를 우선 신뢰할 것.
