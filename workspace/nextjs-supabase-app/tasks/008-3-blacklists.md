# Task 008-3: 블랙리스트 구현 (F009)

## 명세

참여자가 특정 주최자를 차단하면, 이후 해당 주최자의 이벤트/초대가 목록에서 보이지 않도록 한다.

## 관련 파일

- `app/events/invite-actions.ts` (`blockOrganizer` — 기존 구현, 변경 없음)
- `components/invitation-actions.tsx` (차단 버튼 — 기존 구현, 변경 없음)
- `app/events/page.tsx` (이벤트 목록 필터링 추가)
- `app/events/invitations/page.tsx` (초대 목록 필터링 추가)

## 사전 확인 결과

- `blacklists` 테이블에는 이미 `unique(blocker_id, blocked_organizer_id)` 제약이 존재해(Task 004 마이그레이션에서 생성됨) 추가 마이그레이션이 필요 없었다.
- `blockOrganizer` Server Action은 Task 008-2에서 이미 구현되어 있었고, `error.code === "23505"`(unique 위반)인 경우 에러를 사용자에게 노출하지 않고 조용히 성공 처리하는 방어 로직도 이미 포함돼 있었다. 신규 작성 없이 그대로 재사용했다.

## 구현 내용

1. `app/events/page.tsx`의 `EventListSection`: 로그인 사용자의 `blacklists.blocker_id = 나` 행을 조회해 `blocked_organizer_id` 집합을 만들고, `events` 목록에서 해당 집합에 속한 `organizer_id`의 이벤트를 제외.
2. `app/events/invitations/page.tsx`의 `InvitationList`: 동일하게 블랙리스트를 조회해 `inviter_id`가 블랙리스트에 있는 초대 행을 제외.

## 판단 근거

- 차단 해제 기능은 필수 요구사항이 아니었고(요청서에서 "선택 사항"으로 명시), 기존 UI에도 해제 진입점이 없어 이번 범위에서는 추가하지 않았다. 필요 시 `blacklists_delete_self_or_admin` RLS 정책이 이미 존재하므로 추후 UI만 추가하면 된다.

## 검증

- `npm run lint`, `npm run build` 통과(아래 008-1 문서 참고).
- `get_advisors(security)`: 블랙리스트 테이블 관련 신규 경고 없음(사전 존재하던 RPC의 `SECURITY DEFINER` 경고만 남아있으며 Task 006/007에서 의도된 설계로 확인됨).

## 테스트 체크리스트 (Playwright, 추후 실행 필요)

- [ ] A가 B의 이벤트로부터 초대를 받는다.
- [ ] A가 초대 목록에서 B를 차단한다.
- [ ] 차단 후 이벤트 목록(`/events`)에 B가 주최한 이벤트가 보이지 않는다.
- [ ] 차단 후 초대 목록(`/events/invitations`)에 B가 보낸 기존 초대가 보이지 않는다.
- [ ] 동일 주최자를 다시 차단 시도해도 에러 없이 정상 처리된다(unique 위반 방어).
