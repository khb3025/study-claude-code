# Task 006: 참여자 관리, 대기자 자동 승격, 강퇴 구현 (F002)

## 목표

이벤트 상세 페이지의 참여자 탭이 `app/events/dummy-data.ts`의 `DUMMY_PARTICIPANTS`/`CURRENT_USER_ID`로만 동작하던 것을, 정원 체크·대기자 자동 승격을 원자적으로 처리하는 Postgres RPC와 실제 `participants` 테이블 조회로 교체한다.

## 관련 파일

- `supabase/migrations/`(신규) — `join_event`/`cancel_participation`/`approve_participant` RPC (`event_participant_rpcs`)
- `app/events/participant-actions.ts`(신규) — `joinEvent`/`cancelParticipation`/`approveParticipant`/`rejectParticipant`/`kickParticipant` Server Action
- `components/participant-row-actions.tsx` — 승인/거절/강퇴 버튼을 실제 액션 호출로 연결(client component로 상태 관리 추가)
- `app/events/[eventId]/page.tsx` — 참여자/카풀/정산 탭 데이터를 실제 DB 조회로 교체, `isConfirmedParticipant` 판별을 실제 로그인 사용자(`supabase.auth.getUser()`)로 교체
- `types/database.types.ts` — RPC 타입 반영을 위해 재생성
- `supabase/migrations/`(신규) — `cancel_participation` RPC에 이벤트 시작 24시간 전 취소 금지 컷오프 추가(`add_cancel_participation_cutoff`)
- `components/participant-cancel-button.tsx`(신규) — 참여자 본인의 참여 취소 버튼(AlertDialog + useTransition), 컷오프 구간에는 버튼 대신 안내 문구 표시
- `app/events/[eventId]/page.tsx` — 참여자 탭에서 본인 행에 `ParticipantCancelButton`을 렌더링, `event.starts_at` 기준 컷오프 여부(`isCancelCutoff`)를 서버에서 계산해 prop으로 전달

## 구현 단계

- [x] `join_event(p_event_id)` RPC: `join_type`별 분기(선착순 정원 체크 후 confirmed/waitlisted, 승인은 pending_approval), `for update` 잠금으로 정원 체크·insert를 원자적으로 처리
- [x] `cancel_participation(p_participant_id)` RPC: confirmed 취소 시 `joined_at` 최선순 waitlisted 1명을 자동 confirmed 승격
- [x] `approve_participant(p_participant_id)` RPC: 주최자 전용, 정원 재확인 후 confirmed/waitlisted 분기
- [x] `rejectParticipant`/`kickParticipant`는 기존 RLS(`participants_update_organizer_or_admin`)로 보호되는 일반 update로 구현(추가 RPC 불필요)
- [x] `participant-row-actions.tsx`를 client component로 전환해 `useTransition` + Server Action 호출 연결, 강퇴 사유/비공개 여부 입력값을 실제로 전달
- [x] `app/events/[eventId]/page.tsx`: participants/carpools/carpool_passengers/settlements/settlement_shares를 모두 실제 쿼리로 교체, `profiles` 테이블 조회로 표시용 이름 맵(`getUserDisplay`) 구성
- [x] `cancel_participation` RPC에 24시간 컷오프 추가: confirmed 상태에서 `now() >= events.starts_at - interval '24 hours'`이면 예외 발생. waitlisted/pending_approval은 정원에 반영되지 않은 상태이므로 컷오프 없이 항상 취소 허용(주최자 피해는 confirmed 참가자의 임박 이탈이 핵심이라는 판단)
- [x] 참여자 탭에 본인 취소 버튼(`ParticipantCancelButton`) 추가: `isOrganizer`가 아니고 본인 행이며 상태가 confirmed/waitlisted/pending_approval일 때만 렌더링, confirmed이면서 컷오프 구간이면 버튼 대신 안내 문구 표시(RPC와 동일 정책을 서버 컴포넌트에서 미리 계산)

## 검증

- [x] `npm run lint` 통과(신규/수정 파일 기준, 프로젝트 내 기존 lint 에러는 `mcp-shrimp-task-manager`/`tailwind.config.ts`의 기존 이슈로 무관)
- [x] `npm run build` 통과
- [x] `mcp__supabase__get_advisors(security)` 확인 — RPC들이 `SECURITY DEFINER`로 익명/로그인 사용자에게 노출된다는 WARN이 있으나, 함수 내부에서 `auth.uid()` 기반 권한 체크를 직접 수행하는 의도된 설계(원자적 정원/대기열 처리 목적)
- [ ] Playwright E2E는 생략(코드 레벨 트레이싱으로 로직 검증)

## 이후 의존 작업

- Task 007(카풀 관리)이 이 Task의 확정 참여자 조회 패턴을 재사용한다.
- Task 008(정산)이 이 Task의 확정 참여자 목록으로 1/N 분담을 계산한다.
