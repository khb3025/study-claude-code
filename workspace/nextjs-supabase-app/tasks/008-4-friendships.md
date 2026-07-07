# Task 008-4: 친구 기능 구현 (F010)

## 명세

가입 사용자 간 이메일/닉네임으로 검색해 친구 요청을 보내고, 받은 요청을 수락/거절하며, 친구 목록을 조회한다.

## 관련 파일 (신규/수정)

- `app/events/friends-actions.ts` (신규) — `searchUsers`, `sendFriendRequest`, `acceptFriendRequest`, `rejectFriendRequest`
- `components/friend-search.tsx` (신규) — 검색 입력 + 결과 + 친구 추가 버튼(클라이언트 컴포넌트)
- `components/friend-request-actions.tsx` (신규) — 받은 요청의 수락/거절 버튼(클라이언트 컴포넌트)
- `app/friends/page.tsx` (전면 리팩토링) — 더미 데이터 제거, 서버 컴포넌트(얇은 wrapper + `Suspense` + async `FriendsContent`)로 전환

## 사전 확인 결과

- `friendships` 테이블에는 이미 `unique(user_id, friend_id)` 제약이 존재해 추가 마이그레이션이 필요 없었다.
- RLS 정책(`friendships_select_related_or_admin`, `friendships_insert_self`, `friendships_update_friend_or_admin`, `friendships_delete_related_or_admin`)이 이미 적절히 구성돼 있어 정책 변경 없이 그대로 사용.
- `profiles_select_authenticated` 정책이 로그인 사용자에게 전체 `profiles` SELECT를 허용하므로 검색 기능에 별도 RLS 추가가 필요 없었다.

## 판단해서 결정한 정책

1. **양방향 친구 조회**: `friendships`는 `user_id`(요청자) → `friend_id`(수신자) 단방향 행으로 저장된다. A가 B에게 요청해 `accepted`가 되면, B 입장에서 "내 친구 목록"을 조회할 때도 A가 보여야 한다. 따라서 친구 목록 조회 시 `user_id = 나 OR friend_id = 나`로 양방향 조회 후, 상대방 id를 `row.user_id === 나 ? row.friend_id : row.user_id`로 계산해 병합한다.
2. **동시 요청(맞요청) 처리**: A가 B에게 요청을 보내려는 시점에 이미 B가 A에게 보낸 대기중(`pending`) 요청이 존재하면, 새 행을 만들지 않고 그 반대 방향 요청을 즉시 `accepted`로 갱신한다(양방향 중복 pending 행 방지, 서로 동시에 추가하면 바로 친구가 되는 자연스러운 UX).
3. **거절 = 삭제**: 친구 요청 거절 시 상태를 별도로 두지 않고 행을 삭제한다. 이렇게 하면 이후 재요청이 unique 제약에 걸리지 않고 자유롭게 가능하다. 수락은 `friendships_update_friend_or_admin` 정책(수신자만 UPDATE 가능)에 맞춰 `friend_id`가 나인 요청만 update로 처리한다.
4. **표시 이름**: `app/events/[eventId]/page.tsx`, `app/events/invitations/page.tsx`에서 이미 쓰이는 `nickname ?? (name_visible ? full_name : null)` 패턴을 그대로 재사용해 닉네임 우선, 실명은 공개 설정에 따르도록 통일했다.

## 검증

- `npm run lint`, `npm run build` 통과.
- `get_advisors(security)`: 친구 기능 관련 신규 경고 없음.

## 테스트 체크리스트 (Playwright, 추후 실행 필요)

- [ ] A가 이메일로 B를 검색해 친구 요청을 보낸다.
- [ ] B의 "받은 친구 요청" 목록에 A가 보인다.
- [ ] B가 수락하면 A/B 양쪽의 "친구 목록"에 서로가 보인다.
- [ ] A가 다시 B에게 요청을 보내면 "이미 친구인 사용자입니다" 에러를 받는다.
- [ ] C가 D에게 요청을 보낸 상태에서 D가 C에게 요청을 보내면 즉시 친구가 된다(맞요청 자동 수락).
- [ ] 거절한 요청은 재요청이 가능하다.
