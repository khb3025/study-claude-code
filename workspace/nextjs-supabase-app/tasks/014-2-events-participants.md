# Task 014-2: 이벤트/참여자/목록 화면 로딩·빈상태 적용 (F001·F002·F006·F007)

## 명세

Task 014-1에서 확정한 Skeleton/EmptyState/error.tsx 패턴을 `app/events/mine`, `app/events/joined`, `app/events/[eventId]`, `app/events/[eventId]/edit` 세그먼트와 참여자/카풀/정산 탭 내부 빈 목록에 적용한다.

## 관련 파일

- `app/events/mine/page.tsx`, `loading.tsx`(신규), `error.tsx`(신규)
- `app/events/joined/page.tsx`, `loading.tsx`(신규), `error.tsx`(신규)
- `app/events/[eventId]/page.tsx`, `loading.tsx`(신규), `error.tsx`(신규)
- `app/events/[eventId]/edit/page.tsx`, `loading.tsx`(신규), `error.tsx`(신규)
- `components/event-list.tsx` (수정)

## 구현 내용

1. `mine`/`joined` 페이지: 기존에 각 파일에 중복 정의돼 있던 로컬 `EmptyState` 함수를 014-1의 공통 `components/empty-state.tsx`로 교체(문구 유지). `Suspense` fallback 텍스트를 `Skeleton` 카드 3개로 교체. 각각 `loading.tsx`/`error.tsx` 신설.
2. `app/events/[eventId]/page.tsx`: 라우트 세그먼트 `loading.tsx`/`error.tsx` 신설, 내부 `Suspense` fallback을 `EventDetailLoading`으로 교체. 참여자 테이블이 비어있을 때(`participants.length === 0`) `EmptyState`를 표시하도록 추가(기존에는 헤더만 있고 빈 본문이 그대로 보이는 갭이 있었음). 카풀/정산 목록의 기존 plain text 빈 상태("등록된 카풀이 없습니다." 등)도 `EmptyState`로 교체(문구 유지).
3. `app/events/[eventId]/edit/page.tsx`: `loading.tsx`/`error.tsx` 신설, 폼 필드 모양의 Skeleton으로 fallback 교체.
4. `components/event-list.tsx`: Task 014-1에서 발견한 갭(탭 필터 결과 0건일 때 완전히 빈 화면)을 수정 — `filteredEvents.length === 0`일 때 `EmptyState`를 표시하도록 추가.

## 판단 근거

- `mine`/`joined`에 이미 존재하던 로컬 `EmptyState` 함수가 신규 공통 컴포넌트와 마크업이 거의 동일해, 그대로 교체해도 시각적 회귀가 없음을 확인 후 진행했다(중복 제거).
- 참여자 탭의 빈 상태는 기존에 전혀 처리되지 않아(빈 테이블 바디만 렌더링) 사용자가 "로딩 중인지 실제로 없는지" 구분할 수 없는 문제였다. `RestrictedTabNotice`(권한 없음)와는 의미가 다르므로 별도 조건으로 분리했다.
- `event-list.tsx`의 탭 필터 빈 상태는 서버 zero-state(`app/events/page.tsx`)와 별개 레이어이므로, 014-1에서 발견한 대로 이번 서브태스크에서 이관 처리했다.

## 검증

- `npm run type-check`, 변경 파일 대상 `eslint`, `prettier --write`, `npm run build` 모두 통과.
- **[2026-07-07 Playwright MCP 검증]** 관리자 계정(Google 세션 자동 로그인)으로:
  - `/events/[eventId]` 상세 페이지 공지 탭 정상 렌더링 확인(회귀 없음)
  - 카풀 탭에 실제 데이터(운전자 1명, 탑승자 1명) 정상 렌더링 확인(회귀 없음)
  - `/events/mine` 목록 정상 렌더링(이벤트 2건) 확인
  - `/events/mine`의 "종료" 탭(해당 데이터 0건)에서 신규 `EmptyState`가 아이콘+"해당 조건의 이벤트가 없습니다." 문구로 정상 표시됨을 확인

## 테스트 체크리스트 (Playwright)

- [x] `/events/[eventId]` 공지/카풀 탭 회귀 없음 확인
- [x] `/events/mine` 목록 및 탭 필터 빈 상태(EmptyState) 렌더링 확인
- [ ] 참여자 탭 0건 EmptyState, `/events/[eventId]/edit` 로딩 스켈레톤 — 테스트 데이터에 참여자가 항상 1명 이상 존재해 직접 트리거하지 못함(코드 리뷰로 대체)
