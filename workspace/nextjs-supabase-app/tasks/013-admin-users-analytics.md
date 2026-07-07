# Task 013: 관리자 사용자 관리/통계 구현 (F011-3, 최소범위)

## 명세

관리자가 사용자를 이름/이메일로 검색·조회하고, 월별 이벤트 생성 수/신규 가입자 수 추이를 조회할 수 있도록 한다(PRD 명시대로 조회/검색까지만 지원, 정지 등 계정 관리 기능은 범위 밖).

## 관련 파일

- `app/admin/users/page.tsx` (server component, `profiles` 검색)
- `app/admin/analytics/page.tsx` (server component, `get_monthly_stats` RPC)
- `supabase/migrations`(신규, 원격 적용): `get_monthly_stats_rpc`, `fix_get_monthly_stats_ambiguous_column`
- `types/database.types.ts` (`get_monthly_stats` 함수 타입 반영)

## 구현 내용

1. `app/admin/users/page.tsx`: `searchParams.q` 기준 `profiles`를 `email`/`nickname` ILIKE로 검색(`app/events/friends-actions.ts`의 `searchUsers` 패턴 참고, 본인 제외 조건은 관리자 조회이므로 불필요). PRD상 "상태(활성/정지)" 같은 계정 관리 기능은 스키마에 없고 요구사항 범위 밖이라 더미에 있던 해당 컬럼은 제거했다.
2. `get_monthly_stats()` SECURITY DEFINER RPC를 신설: `events`/`profiles`를 `date_trunc('month', created_at)`로 그룹핑해 월별 이벤트 수/신규 가입자 수를 함께 반환. 내부에서 `private.is_admin()`을 확인해 비관리자는 예외를 던진다. 기존 프로젝트가 `event_participant_rpcs` 등 SECURITY DEFINER RPC를 다수 사용 중인 컨벤션을 따름.
3. `app/admin/analytics/page.tsx`: RPC 결과를 조회해 더미 `MONTHLY_STATS` 배열을 대체, 막대그래프/표 UI는 기존 마크업을 그대로 재사용.

## 발견 및 수정한 버그

- 최초 `get_monthly_stats()` 구현에서 `RETURNS TABLE(month date, ...)`의 OUT 파라미터명 `month`가 함수 본문 내 SQL의 `as month` 컬럼 별칭과 충돌해 `column reference "month" is ambiguous` 에러가 발생했다. Playwright로 관리자 계정 접근 시 화면에는 에러 없이 "집계할 데이터가 없습니다"만 표시되어(Server Action의 `{ data, error }` 중 `error`를 별도로 확인하지 않고 `data ?? []`만 사용했기 때문에 조용히 실패) 원인 파악에 서버 로그 확인이 필요했다. `fix_get_monthly_stats_ambiguous_column` 마이그레이션으로 함수를 `drop`후 재생성하며 반환 컬럼명을 `stat_month`로, 내부 CTE 컬럼명을 `bucket`으로 바꿔 완전히 분리해 해결했다.

## 판단 근거

- PostgREST가 SQL의 `GROUP BY`/`date_trunc` 집계를 직접 지원하지 않아 RPC로 구현했다(신규 쿼리 빌더 도입 대신 기존 RPC 컨벤션 재사용).
- 사용자 검색은 `friends-actions.ts`의 ILIKE 패턴을 그대로 참고하되, "친구 관계" 개념이 없는 관리자 조회이므로 관계 조회 로직은 제외해 최소 구현했다.

## 검증

- `npm run type-check`, 변경 파일 대상 `lint`/`prettier`, `npm run build` 통과 확인 완료
- **[2026-07-07 Playwright MCP E2E 검증 완료]** 관리자 계정으로 실제 검증:
  - 사용자 목록이 실제 `profiles` 데이터로 렌더링, `khb3025` 검색 시 해당 사용자만 필터링됨을 확인
  - 통계 페이지에서 최초 "집계할 데이터가 없습니다" 버그를 발견 → RPC 컬럼명 충돌 수정 후 재검증, "2026년 7월: 이벤트 2 · 신규가입 2"로 실제 데이터가 정확히 표시됨을 확인
- `mcp__supabase__get_advisors(security)` 확인: `get_monthly_stats`에 대해 기존 RPC들과 동일한 "SECURITY DEFINER 함수를 anon/authenticated가 호출 가능" 경고만 존재(의도된 설계, 함수 내부에서 `private.is_admin()`으로 재검증)

## 테스트 체크리스트 (Playwright)

- [x] 사용자 이메일/닉네임 검색 정상 동작
- [x] 월별 통계 표/그래프가 실제 데이터 기준으로 렌더링
- [x] RPC 컬럼명 충돌 버그 수정 후 재검증 완료
