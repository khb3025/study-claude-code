# Task 010: 관리자 인증 가드 및 레이아웃

## 명세

`admin_users`에 등록된 사용자만 `/admin/*`에 접근할 수 있도록 하고, 미등록 사용자는 404 처리한다. 등록된 사용자는 프로필 페이지에서 관리자 페이지로 바로 이동할 수 있어야 한다.

## 관련 파일

- `app/admin/layout.tsx` (server component 가드로 전환)
- `components/admin-sidebar.tsx` (사이드바 client 컴포넌트, 신규)
- `app/profile/page.tsx` (관리자 상태에 `/admin` 링크 추가)

## 구현 내용

1. `app/admin/layout.tsx`를 async server component로 전환: `auth.getUser()` → `admin_users` 조회(`app/profile/page.tsx`와 동일한 `maybeSingle()` 패턴 재사용) → 미로그인/미등록 시 `notFound()`.
2. 기존 사이드바(`ADMIN_NAV_ITEMS`, `usePathname` 활성 링크)는 `components/admin-sidebar.tsx`로 분리해 client component로 유지, 레이아웃은 권한 체크 후 이를 렌더.
3. `app/profile/page.tsx`의 "역할" 항목에서 관리자인 경우 텍스트 대신 `/admin/dashboard`로 이동하는 링크를 노출.

## 판단 근거

- 인증(로그인) 여부 체크가 아닌 권한(authorization) 체크이므로 `lib/supabase/proxy.ts`의 전역 인증 게이트와 별개 관심사이며, `shrimp-rules.md`의 "페이지 레벨 인증 리다이렉트 금지" 규칙과 충돌하지 않는다(참여자/카풀 탭의 `RestrictedTabNotice` 권한 분기와 동일 성격).
- 관리자 판별 쿼리를 별도 유틸 함수로 추상화하지 않고 프로필 페이지와 동일한 코드를 각자 유지했다 — 사용처가 2곳뿐이라 조기 추상화가 오히려 불필요한 간접 참조를 만든다고 판단.

## 추가 반영 사항 (관리자 진입/로그인 후 라우팅 정교화)

- `app/admin/page.tsx`(신규): `/admin` 직접 접근 시 `/admin/dashboard`로 리다이렉트. 레이아웃의 `AdminGuard`가 이미 로그인/관리자 여부를 검증하므로 이 페이지는 통과된 이후에만 렌더링된다.
- `components/login-form.tsx`: 이메일/비밀번호 로그인 성공 시 닉네임 미설정 → `/profile`, 관리자 계정(`admin_users` 조회) → `/admin/dashboard`, 그 외 일반 사용자 → `/events`로 분기.
- `app/auth/callback/route.ts`(Google OAuth): 동일하게 관리자 분기를 추가하되, 초대 링크 등 `next` 쿼리파라미터가 명시된 경우에는 관리자 여부와 무관하게 해당 경로를 그대로 우선한다(초대 수락 플로우 보존).
- 결과적으로 `/admin` 접근 시: 비로그인 → `proxy.ts` 전역 게이트가 `/auth/login`으로 리다이렉트(기존 동작 재사용, 신규 코드 불필요) → 로그인 후에는 관리자 여부에 따라 `/admin/dashboard` 또는 `/events`로 이동.

## 검증

- `npm run type-check`, 변경 파일 대상 `lint`/`prettier`, `npm run build` 통과 확인 완료
- 비로그인 상태 `/admin` 접근 시 `/auth/login`으로 307 리다이렉트되는 것을 curl 및 Playwright MCP로 확인 완료
- `khb3025@gmail.com` 계정을 `admin_users`에 등록 완료(수동 SQL)
- `mcp__supabase__get_advisors(security)` 신규 경고 없음 확인 필요
- **[2026-07-07 Playwright MCP 검증 완료]** 일반 계정(`khb1928@naver.com`, Google 로그인)으로 `/admin` 접근 시 404 확인. 관리자 계정(`khb3025@gmail.com`, 수동 Google 로그인)으로 `/admin` 접근 시 `/admin/dashboard`로 정상 리다이렉트 및 대시보드 렌더링 확인.
- 로그인 폼(`login-form.tsx`)/OAuth 콜백의 "로그인 성공 직후 관리자→dashboard, 일반→events" 자동 분기 코드 경로 자체는 이번 수동 로그인 검증에서는 타지 않음(이미 세션이 있는 상태에서 `/admin` 직접 접근만 검증) — 신규 계정으로 처음부터 로그인하는 시나리오는 추후 필요 시 추가 검증.

## 테스트 체크리스트 (Playwright)

- [x] 관리자 계정으로 `/admin`(→`/admin/dashboard`) 접근 시 정상 렌더링
- [x] 일반 계정으로 `/admin` 접근 시 404 페이지 노출
- [x] 비로그인 상태로 `/admin` 접근 시 `/auth/login`으로 리다이렉트
- [ ] 로그인 폼에서 최초 로그인 시 관리자 계정은 `/admin/dashboard`, 일반 계정은 `/events`로 자동 이동(별도 검증 필요)
- [ ] 관리자 계정의 프로필 페이지에서 "관리자" 링크 클릭 시 `/admin/dashboard`로 이동
