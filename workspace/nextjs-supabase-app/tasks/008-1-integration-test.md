# Task 008-1: 핵심 기능 통합 테스트 (코드 레벨 검증으로 대체)

## 범위

Playwright 브라우저 자동화는 이번 실행 환경(비대화형, 실제 로그인 세션 준비 없음)에서 생략하고, 아래 항목을 코드/스키마 레벨로 직접 트레이싱해 결과를 기록한다. Playwright E2E 시나리오는 "추후 실행 필요" 체크리스트로 각 Task 문서(`008-3`, `008-4`, `008-5`)에 남겨두었다.

## 1. RLS 권한 경계

- **이벤트 수정/삭제**: `events_update_own_or_admin`, `events_delete_own_or_admin` 정책이 `organizer_id = auth.uid() OR is_admin()`으로 제한되어 있음을 `pg_policies` 조회로 확인. 비주최자가 UPDATE/DELETE를 시도하면 RLS가 행을 매칭시키지 않아 0 rows affected로 조용히 실패(에러 없이 무시)한다 — Server Action(`app/events/actions.ts`)에서 별도로 `organizer_id` 재검증을 추가로 수행하는지는 Task 005에서 이미 확인된 사항이라 이번엔 재확인만 함.
- **참여자 관리**: `participants_update_organizer_or_admin`은 `user_id = auth.uid() (본인) OR 주최자 OR admin`으로 제한되어 강퇴/승인 등을 제3자가 수행할 수 없음을 확인.
- **블랙리스트/친구 신규 RLS**:
  - `blacklists_select_self_or_admin`/`blacklists_insert_self`/`blacklists_delete_self_or_admin`: 모두 `blocker_id = auth.uid()` 기준이라 본인이 등록한 차단 행만 조회/삽입/삭제 가능. 타인의 차단 목록은 조회 불가.
  - `friendships_select_related_or_admin`: `user_id = auth.uid() OR friend_id = auth.uid()`로 제한되어 나와 무관한 친구 관계는 조회 불가.
  - `friendships_insert_self`: `user_id = auth.uid()`만 삽입 가능(타인 명의로 요청 생성 불가).
  - `friendships_update_friend_or_admin`: `friend_id = auth.uid()`(수신자)만 UPDATE 가능 — 요청을 보낸 사람이 스스로 수락 처리할 수 없도록 막혀 있음을 확인(의도된 설계).
  - `friendships_delete_related_or_admin`: 양쪽 당사자 모두 삭제(거절/친구 끊기) 가능.

## 2. 엣지 케이스

- **정원 경계(capacity = 확정 참여자 수)**: `join_event` RPC(마이그레이션 `event_participant_rpcs`)는 확정 인원 수를 세어 `capacity` 이상이면 `waitlisted`로, 미만이면 `confirmed`로 배정하는 분기를 갖고 있어 정확히 도달한 경우도 초과로 처리되어 대기열로 안전하게 빠진다(코드 재확인, Task 006에서 이미 구현·검증됨).
- **좌석 0인 카풀**: `register_carpool` RPC는 `seats_total`에 대해 하한 검증(1 이상)을 폼(Zod)에서 강제하고 있고, DB 컬럼 자체에는 CHECK 제약이 없으나 UI 경로로는 0 이하 입력이 불가능함을 확인. RPC 내부에서 좌석 수와 무관하게 초대/신청 로직 자체는 좌석 0이어도 예외를 던지지 않고 정상 동작(단순히 배정 가능 좌석이 없다고 판단해 초과 신청을 막는 별도 체크는 없음 — 향후 개선 여지로 남김, 이번 Task 범위 밖).
- **참여자 0명 정산**: `create_settlement` RPC(마이그레이션 `event_settlement_rpc`)는 확정 참여자 수로 나누기 전에 0명 여부를 확인해 나누기 0 에러 없이 처리하도록 이미 구현되어 있음(Task 008에서 검증 완료된 사항 재확인).

## 3. 신규 기능 검증(이번 Task에서 구현)

- 블랙리스트: `app/events/page.tsx`, `app/events/invitations/page.tsx`의 필터링 로직이 RLS(`blacklists_select_self_or_admin`)로 보호된 "본인 블랙리스트"만 조회해 필터에 사용하므로, 타인의 차단 정보를 이용해 목록을 조작할 수 없다.
- 친구: `sendFriendRequest`/`acceptFriendRequest`/`rejectFriendRequest` 모두 `createClient()`(서버 클라이언트)를 통해 RLS 하에서 실행되므로, 클라이언트에서 임의로 `user_id`/`friend_id`를 조작해도 `friendships_insert_self`(user_id 강제)와 `friendships_update_friend_or_admin`(friend_id 강제)에 의해 실제로는 본인 관련 행만 생성/수정 가능하다.

## 4. 코드 품질 검증

- `npm run lint`: 이번 변경 파일(`app/friends/*`, `app/events/*`, `components/friend-*`) 관련 에러 없음(사전 존재하는 `mcp-shrimp-task-manager/*`, `tailwind.config.ts`의 무관한 lint 에러만 남아있음).
- `npm run build`: 성공(Next.js 16.2.10, Turbopack, Cache Components enabled 환경에서 전체 페이지 정상 컴파일).
- `mcp__supabase__get_advisors(security)`: 신규 경고 없음(기존 RPC의 `SECURITY DEFINER` 관련 WARN 및 leaked password protection 비활성화 경고만 잔존 — 모두 이전 Task에서 이미 의도된 것으로 확인된 항목).

## Playwright E2E 시나리오 (추후 실행 필요)

각 기능별 상세 체크리스트는 `tasks/008-3-blacklists.md`, `tasks/008-4-friendships.md`, `tasks/008-5-my-joined-events.md`에 기록해두었다. 두 사용자 계정을 이용한 전체 플로우(초대 → 차단 → 목록 미노출, 검색 → 요청 → 수락 → 목록 반영, 주최/참여 이벤트 상태 필터)는 실제 브라우저 세션이 준비되는 환경에서 별도로 실행해야 한다.
