# Task 008: 정산 구현 (F004)

## 목표

정산 탭이 `DUMMY_SETTLEMENTS`/`DUMMY_SETTLEMENT_SHARES`로만 동작하던 것을, 확정 참여자 수 기준 1/N 자동 계산 RPC와 실제 `settlements`/`settlement_shares` 조회로 교체한다.

## 관련 파일

- `supabase/migrations/`(신규) — `create_settlement` RPC (`event_settlement_rpc`)
- `app/events/settlement-actions.ts`(신규) — `createSettlement`/`toggleSettlementPaid` Server Action
- `components/create-settlement-dialog.tsx`(신규) — 주최자 전용 정산 생성 다이얼로그
- `components/settlement-share-toggle.tsx`(신규) — 입금 완료 여부 토글(주최자만 편집 가능, 그 외는 텍스트만 표시)
- `app/events/[eventId]/page.tsx` — 정산 탭을 실제 데이터로 연동

## 구현 단계

- [x] `create_settlement(p_event_id, p_title, p_total_amount)` RPC: 주최자 전용, 확정 참여자 수로 `total_amount / count` 계산 후 나머지는 `joined_at` 최선순 참여자에게 가산, `settlements` + `settlement_shares`를 한 트랜잭션에서 일괄 생성
- [x] `toggleSettlementPaid(shareId, isPaid, eventId)`는 기존 RLS(`settlement_shares_update_organizer_or_self_paid_or_admin`)로 보호되는 일반 update로 구현
- [x] 조회 분기는 별도 쿼리 분기 없이 기존 RLS(`settlements_select_visible_or_privileged`, `settlement_shares_select_self_or_visible_or_privileged`)를 그대로 활용 — 주최자는 항상 전체 조회, 참여자는 `settlement_visible=true`일 때만 전체 조회, 비공개여도 본인 share는 항상 조회 가능
- [x] `app/events/[eventId]/page.tsx` 정산 탭에 `CreateSettlementDialog`(주최자 전용) 추가, 참여자 이름을 `profiles` 조회 기반으로 표시, 입금 완료 여부를 `SettlementShareToggle`로 교체

## 검증

- [x] `npm run lint` / `npm run build` 통과
- [x] `mcp__supabase__get_advisors(security)` — Task 006과 동일한 사유로 의도된 WARN만 존재
- [ ] Playwright E2E는 생략(코드 레벨 트레이싱: 1/N 계산 및 나머지 가산, 공개/비공개 열람 분기 로직 확인)

## 이후 의존 작업

- Task 008-1(핵심 기능 통합 테스트)에서 Task 006~008 전체 플로우를 Playwright E2E로 검증할 예정.
