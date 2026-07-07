# Task 008-5: 나의 주최/참여 이벤트 목록 구현 (F006, F007)

## 명세

내가 주최한 이벤트(F006)와 내가 참여 중인 이벤트(F007)를 상태별(전체/모집중/마감/종료)로 조회한다.

## 관련 파일 (수정)

- `app/events/mine/page.tsx` — 더미 데이터 제거, 서버 컴포넌트(`Suspense` + async `MyEventsList`)로 전환
- `app/events/joined/page.tsx` — 더미 데이터 제거, 서버 컴포넌트(`Suspense` + async `JoinedEventsList`)로 전환

## 구현 내용

- `mine`: `events` 테이블에서 `organizer_id = 로그인 사용자` 조건으로 직접 조회.
- `joined`: `participants` 테이블에서 `user_id = 로그인 사용자`이고 `status`가 `cancelled`/`kicked`가 아닌 행의 `event_id`를 모아, 해당 id들로 `events`를 조회.
- 상태별(전체/모집중/마감/종료) 탭 필터는 **새로 만들지 않고** 기존 `components/event-list.tsx`(클라이언트 컴포넌트, `EVENT_STATUS` 기반 탭)를 그대로 재사용했다. 이 컴포넌트는 이미 `app/events/page.tsx`에서 쓰이고 있었고 두 페이지 모두 `EventList`에 실제 조회 결과 배열만 넘기면 되므로 중복 구현을 피했다.
- 빈 상태(생성한 이벤트 없음 / 참여 중인 이벤트 없음) 안내는 기존 문구·아이콘을 그대로 유지.

## 판단해서 결정한 정책

- **joined 목록에서 취소/강퇴 제외**: `participants.status`가 `cancelled` 또는 `kicked`인 행은 "참여 이벤트" 목록에서 제외했다. 근거: 취소는 사용자 본인이 참여 의사를 철회한 것이고, 강퇴는 주최자가 참여 자격을 박탈한 것이므로 두 경우 모두 더 이상 "참여 중"이라고 볼 수 없다. `confirmed`/`waitlisted`/`pending_approval` 상태는 여전히 참여 절차가 진행 중이거나 확정된 상태이므로 목록에 포함했다.

## 검증

- `npm run lint`, `npm run build` 통과.
- RLS: `participants_select_self_or_organizer_or_admin` 정책이 `user_id = 나`인 행 조회를 허용하고, `events_select_authenticated`가 로그인 사용자의 전체 이벤트 조회를 허용해 별도 정책 변경 없이 그대로 동작.

## 테스트 체크리스트 (Playwright, 추후 실행 필요)

- [ ] 이벤트를 주최한 적 없는 사용자는 "나의 주최 이벤트"에서 빈 상태 안내를 본다.
- [ ] 이벤트를 주최하면 "나의 주최 이벤트" 목록에 보이고, 상태 탭(모집중/마감/종료) 필터가 정상 동작한다.
- [ ] 이벤트에 참여(confirmed)하면 "참여 이벤트" 목록에 보인다.
- [ ] 참여를 취소하거나 강퇴당하면 "참여 이벤트" 목록에서 사라진다.
