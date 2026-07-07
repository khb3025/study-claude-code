# Task 011: 관리자 대시보드 구현 (F011-1)

## 명세

관리자 대시보드의 더미 통계/목록을 실제 `events`/`profiles` 집계 쿼리로 교체한다.

## 관련 파일

- `app/admin/dashboard/page.tsx` (async server component로 전환)
- `app/events/event-list-data.ts` (`getEventListDisplayData` — 기존 구현, 변경 없음)

## 구현 내용

1. 통계 카드 4종을 병렬(`Promise.all`) count 쿼리로 교체: 총 이벤트(`deleted_at is null`), 진행중 이벤트(`status='recruiting' AND deleted_at is null`), 총 사용자(`profiles`), 이번 달 신규 가입(`profiles.created_at >= 이번달 1일`).
2. 최근 이벤트 5건: `events`를 `created_at desc`로 조회(삭제된 이벤트 제외), 주최자 이름은 `app/events/event-list-data.ts`의 `getEventListDisplayData`를 재사용해 조회.
3. 최근 가입자 5건: `profiles`를 `created_at desc`로 조회.
4. 목록이 비어 있을 때 안내 문구 표시(빈 상태 처리).

## 판단 근거

- 주최자 이름 조회를 위한 신규 헬퍼를 만들지 않고 이벤트 목록/상세 페이지에서 이미 쓰이는 `getEventListDisplayData`를 그대로 재사용했다 — 참여자 수 집계까지 포함된 함수라 대시보드에는 다소 과한 조회지만, 별도 함수로 쪼개는 것보다 기존 재사용이 코드 일관성 측면에서 낫다고 판단(MVP 규모라 성능 영향 미미).
- 데이터 규모가 작아 캐싱/RPC 없이 직접 count 쿼리로 구현했다.

## 검증

- `npm run type-check`, 변경 파일 대상 `lint`/`prettier`, `npm run build` 통과 확인 완료
- `mcp__supabase__get_advisors(security)` 신규 경고 없음 확인 필요

## 테스트 체크리스트 (Playwright)

- [ ] 관리자 계정으로 `/admin/dashboard` 접근 시 통계 카드 숫자가 실제 DB 값과 일치
- [ ] 최근 이벤트 목록이 최신순으로 노출되고 주최자 이름이 정상 표시
- [ ] 최근 가입자 목록이 최신순으로 노출
- [ ] 이벤트/가입자가 없는 경우 빈 상태 문구 노출
