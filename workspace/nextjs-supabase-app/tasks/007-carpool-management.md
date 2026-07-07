# Task 007: 카풀 관리 구현 (F003)

## 목표

카풀 탭의 마크업만 있던 4개 컴포넌트(`carpool-volunteer-dialog.tsx`, `carpool-invite-passenger-dialog.tsx`, `carpool-request-button.tsx`, `carpool-passenger-actions.tsx`)를 실제 Server Action/RPC 호출로 연결한다.

## 관련 파일

- `supabase/migrations/`(신규) — `register_carpool`/`invite_passenger`/`request_carpool`/`respond_carpool_passenger` RPC (`event_carpool_rpcs`)
- `app/events/carpool-actions.ts`(신규) — `registerCarpool`/`invitePassenger`/`requestCarpool`/`respondCarpoolPassenger` Server Action
- `components/carpool-volunteer-dialog.tsx`, `components/carpool-invite-passenger-dialog.tsx`, `components/carpool-request-button.tsx`, `components/carpool-passenger-actions.tsx`
- `app/events/[eventId]/page.tsx` — 위 컴포넌트에 `eventId`/`carpoolId` 등 실데이터 props 전달

## 구현 단계

- [x] `register_carpool(p_event_id, p_seats_total, p_departure_point, p_departure_time, p_force)` RPC: 확정 참여자만 등록 가능. 다른 운전자에게 활성(invited/requested/confirmed) 상태로 걸려 있으면 `force=false`일 때 `{conflict: true, status}`를 반환(에러 아님), `force=true`면 기존 레코드 삭제 후 등록
- [x] `invite_passenger(p_carpool_id, p_participant_user_id)` RPC: 운전자 본인 확인 후 `invited`/`initiated_by='driver'`로 insert(과거 `rejected` 레코드는 삭제 후 재삽입 — 재초대 항상 허용)
- [x] `request_carpool(p_carpool_id)` RPC: 해당 운전자에게 `rejected`+`initiated_by='passenger'` 이력이 있으면 차단, 그 외에는 `requested`로 insert
- [x] `respond_carpool_passenger(p_carpool_passenger_id, p_accept)` RPC: `invited`는 탑승자 본인만, `requested`는 카풀 운전자만 응답 가능하도록 분기
- [x] 4개 컴포넌트를 client component 상태(폼 입력값, 선택된 초대 대상, pending 상태)와 Server Action 호출로 연결(신규 컴포넌트 작성 없음)
- [x] `app/events/[eventId]/page.tsx`의 카풀 탭에서 `DUMMY_USERS` 대신 `profiles` 조회 기반 표시 이름을 사용하도록 교체

## 검증

- [x] `npm run lint` / `npm run build` 통과
- [x] `mcp__supabase__get_advisors(security)` — Task 006과 동일한 사유(SECURITY DEFINER 내부 auth.uid() 체크)로 의도된 WARN만 존재
- [ ] Playwright E2E는 생략(코드 레벨 트레이싱: 거절 후 재신청 차단/재초대 허용, 운전자 간 초대 불가, 타 운전자 확정 탑승자 제외 로직 확인)

## 이후 의존 작업

- Task 008(정산)과는 독립적이나, 동일한 확정 참여자/프로필 표시 패턴을 공유한다.
