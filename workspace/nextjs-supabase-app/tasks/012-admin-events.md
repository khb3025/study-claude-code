# Task 012: 관리자 이벤트 관리 구현 (F011-2)

## 명세

관리자가 이벤트를 제목으로 검색하고, 공지를 등록하며, 강제 삭제(소프트 삭제)할 수 있도록 한다.

## 관련 파일

- `supabase/migrations`(신규, `events_admin_notice`): `events.admin_notice`(nullable text) 컬럼 추가
- `types/database.types.ts`, `types/event.ts` (`admin_notice` 필드 반영)
- `app/admin/events/page.tsx` (server component, 제목 검색 + 실제 목록)
- `components/admin-event-row-actions.tsx` (신규, 공지 등록/강제 삭제 client 컴포넌트)
- `app/admin/actions.ts` (신규, `setAdminNotice` Server Action)
- `app/events/actions.ts` (`deleteEvent`에 관리자 허용 분기 + `skipRedirect` 옵션 추가)
- `app/events/[eventId]/page.tsx` (공지 탭에 `admin_notice` 표시 섹션 추가)

## 구현 내용

1. `mcp__supabase__apply_migration(name: "events_admin_notice")`로 `events.admin_notice` 컬럼을 추가하고 `generate_typescript_types`로 타입을 재생성했다.
2. `app/admin/events/page.tsx`를 server component로 전환: `searchParams.q`로 제목 ILIKE 검색, `getEventListDisplayData`(기존 구현 재사용)로 주최자 이름/참여자 수를 함께 조회.
3. `app/admin/actions.ts`의 `setAdminNotice`: 로그인 + `admin_users` 확인 후 `events.admin_notice` 업데이트, 빈 문자열이면 `null`로 저장(공지 제거).
4. `app/events/actions.ts`의 `deleteEvent`를 확장: `organizer_id !== user.id`인 경우 `admin_users` 조회로 관리자 여부를 추가 확인(관리자면 허용). 새 함수를 만들지 않고 기존 함수에 `options?: { skipRedirect?: boolean }` 파라미터만 추가해, 관리자 페이지에서 호출할 때는 `/events`로 리다이렉트하지 않고 현재 페이지(`/admin/events`)에 머무르도록 했다.
5. 이벤트 상세 공지 탭에 `admin_notice`가 있으면 노란색 강조 박스로 표시.

## 판단 근거

- RLS(`events_update_own_or_admin`/`events_delete_own_or_admin`)가 이미 `organizer_id = auth.uid() or private.is_admin()`을 허용하므로 DB 정책 변경 없이 코드 레벨의 하드코딩된 organizer 체크만 완화하면 되었다.
- 강제 삭제는 사용자 결정에 따라 하드 DELETE가 아닌 기존 `deleted_at` 소프트 삭제를 그대로 재사용했다(참여자 이력 보존 정책과 일관).
- 참여자 수/주최자 이름 조회를 위한 신규 쿼리를 작성하지 않고 `app/events/event-list-data.ts`의 `getEventListDisplayData`를 이벤트 목록·대시보드·관리자 페이지 3곳에서 공통으로 재사용했다.
- 검색은 "초대 코드" 등 존재하지 않는 컬럼 기반 검색은 제외하고 실제 스키마에 있는 제목(title) ILIKE 검색만 구현했다.

## 검증

- `npm run type-check`, 변경 파일 대상 `lint`/`prettier`, `npm run build` 통과 확인 완료
- **[2026-07-07 Playwright MCP E2E 검증 완료]** 관리자 계정으로 실제 검증:
  - 제목 검색 시 일치 결과/빈 결과("조건에 맞는 이벤트가 없습니다.") 모두 정상 동작
  - 공지 등록 → DB에 `admin_notice` 저장 확인(SQL) → 이벤트 상세 공지 탭에 "관리자 공지" 박스로 노출 확인
  - 강제 삭제 → 관리자 목록에서 즉시 사라짐, DB 확인 결과 하드 삭제가 아닌 `deleted_at` 소프트 삭제로 처리됨(레코드 보존)
  - 테스트에 사용한 이벤트는 검증 후 `deleted_at`/`admin_notice`를 초기화해 원상 복구함
- `mcp__supabase__get_advisors(security)` 신규 경고 점검 필요

## 테스트 체크리스트 (Playwright)

- [x] 제목 검색 필터 동작(일치/불일치)
- [x] 공지 등록 후 이벤트 상세 페이지에서 노출
- [x] 관리자가 타 주최자 이벤트 강제 삭제 성공(소프트 삭제, 참여 이력 유지)
- [ ] 참여자 관점에서 강제 삭제된 이벤트가 참여 이력(`/events/joined`)에 계속 노출되는지 별도 확인
