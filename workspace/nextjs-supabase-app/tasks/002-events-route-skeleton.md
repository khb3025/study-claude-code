# Task 002: 이벤트 라우트 구조 및 페이지 골격 생성

## 목표

`app/protected/events/` 하위에 이벤트 목록/생성/상세(공지·참여자·카풀·정산 4개 탭) 빈 페이지 골격을 스캐폴딩하고, `app/protected/layout.tsx` 네비게이션에 "모임 이벤트" 진입 링크를 추가한다. 신규 라우트는 이미 `app/protected/` 하위이므로 `proxy.ts`의 전역 인증 게이트에 자동 포함되며, **페이지별 인증 체크 로직을 별도로 추가하지 않는다.**

## 관련 파일

- `app/protected/layout.tsx` — 네비게이션에 링크 추가 대상
- `app/protected/page.tsx` — 서버 컴포넌트 및 레이아웃 관례(`max-w-5xl`, `flex flex-col gap-*`) 참고
- `app/protected/events/page.tsx` (신규) — 이벤트 목록 페이지 골격
- `app/protected/events/new/page.tsx` (신규) — 이벤트 생성 페이지 골격
- `app/protected/events/[eventId]/page.tsx` (신규) — 이벤트 상세 페이지 골격(4개 탭)

## 선행 작업

- Task 001(도메인 타입) — 페이지 골격은 아직 더미 텍스트만 렌더하므로 강한 결합은 없으나, 이후 Task 003에서 `types/event.ts`를 참조한다.

## 확인 사항

- `proxy.ts`의 `config.matcher` 수정 불필요 — 이미 정적 자산/이미지 경로 제외 전체 요청에 적용됨.
- 페이지 내부에 `redirect("/auth/login")` 등 별도 로그인 체크 로직을 작성하지 않는다(전역 게이트가 이미 처리).
- 레이아웃 컨테이너 관례(`app/protected/page.tsx` 참고): `flex w-full flex-1 flex-col gap-12` 형태 유지.

## 구현 단계

- [ ] `app/protected/events/page.tsx` 생성 — 서버 컴포넌트 골격, "이벤트 목록" placeholder 텍스트
- [ ] `app/protected/events/new/page.tsx` 생성 — 서버 컴포넌트 골격, "이벤트 생성 폼 위치" placeholder 텍스트
- [ ] `app/protected/events/[eventId]/page.tsx` 생성 — 서버 컴포넌트, `params: Promise<{ eventId: string }>` 시그니처(Next.js 15 async params), shadcn `Tabs`로 공지/참여자/카풀/정산 4개 탭 골격(각 `TabsContent`는 빈 placeholder)
- [ ] `app/protected/layout.tsx` 수정 — 기존 nav의 `Link` 그룹(`DeployButton` 옆)에 `모임 이벤트 → /protected/events` 링크 추가, 기존 `AuthButton`/`ThemeSwitcher` 구조는 그대로 유지

## 수락 기준

- [ ] 4개 라우트(`/protected/events`, `/protected/events/new`, `/protected/events/[eventId]`, 그리고 layout 반영)가 빌드 에러 없이 접근 가능(임시 텍스트만 렌더)
- [ ] 네비게이션에서 "모임 이벤트" 링크 클릭 시 `/protected/events`로 이동 확인
- [ ] 비로그인 상태로 위 라우트 접근 시 기존 전역 게이트에 의해 `/auth/login`으로 리다이렉트됨(페이지별 추가 로직 없이도 동작 확인)

## 이후 의존 작업

- **Task 003**(UI/더미 데이터)이 이 골격 위에 이벤트 카드/폼/탭 콘텐츠를 채운다.
- **Task 004**는 라우트 구조에 영향 없음(데이터 조회 로직만 추가).
