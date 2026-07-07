# Task 014-1: 공통 로딩/빈상태 컴포넌트 확정 및 시범 적용

## 명세

Phase 4(Task 014)의 선행 작업으로, 프로젝트 전체에 부재했던 라우트 레벨 로딩/에러 UI와 공통 빈 상태(Empty State) 컴포넌트를 확정한다. `app/events` 세그먼트에 시범 적용해 이후 서브태스크(014-2~014-4)가 그대로 복제할 수 있는 기준 패턴을 세운다.

## 관련 파일

- `components/ui/skeleton.tsx` (신규, `npx shadcn add skeleton`)
- `components/empty-state.tsx` (신규)
- `app/events/loading.tsx` (신규)
- `app/events/error.tsx` (신규)
- `app/events/page.tsx` (수정)

## 구현 내용

1. `npx shadcn add skeleton`으로 `components/ui/skeleton.tsx`를 표준 설치(수정 없이 그대로 유지, shrimp-rules.md 규칙 준수).
2. `components/empty-state.tsx`: `icon`(선택), `title`, `description`(선택), `action`(선택) props를 받는 도메인 컴포넌트. 기존 14개 페이지의 "~없습니다" 문구를 그대로 재사용할 수 있도록 최소한의 마크업(점선 테두리 박스 + 중앙 정렬)으로 설계.
3. `app/events/loading.tsx`: `EventCard`의 레이아웃(썸네일 80x80 + 텍스트 3줄)을 흉내낸 Skeleton 카드 4개를 렌더링.
4. `app/events/error.tsx`: Next.js App Router 컨벤션에 따라 `"use client"` + `reset()` prop을 받는 에러 바운더리. `EmptyState`를 재사용해 "다시 시도" 버튼 제공.
5. `app/events/page.tsx`: 기존 "아직 등록된 이벤트가 없습니다." 텍스트 2곳을 `EmptyState`로 교체, 내부 `Suspense` fallback(`불러오는 중...` 텍스트)을 `Skeleton` 3개로 교체.

## 판단 근거

- 새 전역 알림(toast) 시스템이나 React Hook Form 전면 도입 없이, 기존 컨벤션(shadcn new-york, Tailwind, `cn()`)만으로 공통 컴포넌트를 구성해 "범위 확장 금지" 제약을 지켰다.
- `app/events/layout.tsx`가 이미 여러 `Suspense`로 감싸는 구조이므로, `loading.tsx`/`error.tsx`는 이 구조와 독립적으로(형제 파일) 추가되어 기존 로직 변경이 불필요했다.
- `EmptyState`는 아이콘을 optional로 두어, 아이콘이 없는 기존 페이지들도 점진적으로 적용할 수 있게 설계했다.

## 검증

- `npm run type-check`, 변경 파일 대상 `eslint`, `prettier --write` 통과.
- `npm run build` 통과 (Turbopack, Cache Components 환경에서 정상 빌드 확인).
- **[2026-07-07 Playwright MCP 검증]** 관리자 계정(`khb3025@gmail.com`, 브라우저에 남아있던 Google 세션으로 자동 로그인)으로 `/events` 접근 시 실제 데이터(승인제 테스트 모임)가 정상 렌더링됨을 확인. 현재 테스트 데이터가 1건 존재해 서버 레벨 EmptyState(0건 상태)는 실제 데이터 삭제 없이는 재현하지 못했으나, 코드 경로는 빌드 타임 타입체크와 정적 리뷰로 검증했다.
- **[발견 사항]** `/events`의 탭 필터(모집중/마감/종료/삭제됨)는 `components/event-list.tsx`의 클라이언트 사이드 필터링이며, 결과가 0건일 때 완전히 빈 화면만 표시됨(별도 빈 상태 UI 없음). 이는 `app/events/page.tsx` 서버 레벨 zero-state와는 다른 영역이므로 이번 서브태스크 범위에 포함하지 않고, Task 014-2에서 `event-list.tsx`에 `EmptyState`를 적용하도록 이관한다.

## 테스트 체크리스트 (Playwright)

- [x] `/events` 정상 렌더링(회귀 없음) 확인
- [ ] 서버 레벨 zero-state(EmptyState) 실제 렌더링 확인 — 테스트 데이터 보호를 위해 이번 라운드에서는 생략, 코드 리뷰로 대체
- [x] `event-list.tsx` 탭 필터 빈 상태 갭 발견 → Task 014-2로 이관 기록
