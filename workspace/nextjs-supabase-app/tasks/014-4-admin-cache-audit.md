# Task 014-4: 관리자 화면 적용 및 revalidatePath 이중 경로 감사 (F011)

## 명세

`app/admin/*` 4개 세그먼트(대시보드/이벤트/사용자/통계)에 로딩·빈 상태 패턴을 적용하고, 이벤트/참여자 관련 서버 액션 중 관리자 화면이 표시하는 데이터를 변경하면서도 `/admin/*` `revalidatePath`가 누락된 곳을 전수 점검해 보강한다.

## 관련 파일

- `app/admin/dashboard/page.tsx`, `loading.tsx`(신규), `error.tsx`(신규)
- `app/admin/events/page.tsx`, `loading.tsx`(신규), `error.tsx`(신규)
- `app/admin/users/page.tsx`, `loading.tsx`(신규), `error.tsx`(신규)
- `app/admin/analytics/loading.tsx`(신규), `error.tsx`(신규)
- `app/events/actions.ts` (수정)
- `app/events/participant-actions.ts` (수정)

## 구현 내용

1. 4개 관리자 세그먼트에 각각 `loading.tsx`(사이드바는 그대로 두고 콘텐츠 영역만 스켈레톤)와 `error.tsx`를 신설. 대시보드/이벤트/사용자 페이지의 plain text 빈 상태를 `EmptyState`로 교체(문구 유지).
2. **revalidatePath 감사표**:

   | 액션 | 기존 revalidate 경로 | 관리자 화면 노출 여부 | 보강 |
   |---|---|---|---|
   | `createEvent` | 없음(redirect만) | `/admin/events`(신규 이벤트), `/admin/dashboard`(총/진행중 카운트) | ✅ 추가 |
   | `updateEvent` | `/events/[id]` | `/admin/events`(제목/상태), `/admin/dashboard`(최근 이벤트 상태) | ✅ 추가 |
   | `deleteEvent` | `/events`, `/admin/events` | `/admin/dashboard`(총/진행중 카운트 감소) | ✅ `/admin/dashboard` 추가 |
   | `setAdminNotice` | `/admin/events`, `/events/[id]` | 이미 충족 | 변경 없음 |
   | `joinEvent`/`cancelParticipation`/`approveParticipant`/`rejectParticipant`/`kickParticipant` | `/events/[id]`만 | `/admin/events`(참여자 수 컬럼) | ✅ `/admin/events` 각각 추가 |

   카풀/정산 관련 서버 액션(`carpool-actions.ts`, `settlement-actions.ts`)은 관리자 화면 어디에도 해당 데이터가 노출되지 않으므로 대상에서 제외했다(Task 014-3에서 정한 범위 원칙 유지).

## 판단 근거

- "무분별하게 모든 액션에 `/admin/*`을 추가하지 않는다"는 지침에 따라, 실제로 admin 화면(대시보드 카운트/최근 목록, 이벤트 관리 테이블)이 참조하는 데이터를 변경하는 액션만 선별해 추가했다.
- `createEvent`는 `redirect()`로 끝나 revalidate 없이도 방문 시점에 새로 fetch되는 것처럼 보이지만, `cacheComponents: true` 환경에서는 캐시된 admin 페이지가 갱신되지 않을 수 있어 명시적으로 추가했다(Task 012의 `deleteEvent` 이중 revalidate 선례를 그대로 확장).

## 검증

- `npm run type-check`, 변경 파일 대상 `eslint`, `prettier --write`, `npm run build` 모두 통과.
- **[2026-07-07 Playwright MCP 검증]** 관리자 계정으로:
  - `/admin/dashboard`: 통계 카드(총 이벤트 1·총 사용자 2·진행중 1·신규가입 2), 최근 이벤트/가입자 테이블 정상 렌더링 확인(회귀 없음)
  - `/admin/events?q=<존재하지 않는 검색어>`: `EmptyState`("조건에 맞는 이벤트가 없습니다.") 정상 렌더링 확인
  - `/admin/users?q=<존재하지 않는 검색어>`: `EmptyState`("조건에 맞는 사용자가 없습니다.") 정상 렌더링 확인
- `mcp__supabase__get_advisors(security)` 재점검: 기존 RPC 관련 경고(SECURITY DEFINER 함수 anon/authenticated 호출 가능 — 의도된 설계)와 `auth_leaked_password_protection` 경고만 존재, 신규 이슈 없음 확인.

## 테스트 체크리스트 (Playwright)

- [x] `/admin/dashboard` 통계/목록 회귀 없음 확인
- [x] `/admin/events`, `/admin/users` 검색 결과 0건 시 EmptyState 렌더링 확인
- [ ] `createEvent`/참여자 액션 실행 후 `/admin/events` 즉시 갱신 — 실제 신규 이벤트 생성/참여 신청은 테스트 데이터 오염을 피하기 위해 직접 트리거하지 않고 코드 리뷰로 대체(기존 `deleteEvent` 이중 revalidate 패턴과 동일 구조임을 확인)
