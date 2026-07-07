# Task 005: 이벤트 CRUD 구현 (F001)

## 목표

`app/events/dummy-data.ts`의 `DUMMY_EVENTS`로만 동작하던 이벤트 목록/생성/상세(공지 탭) 화면을 Task 004에서 구축된 실제 `events`/`participants` 테이블과 RLS를 사용하는 Server Actions·서버 컴포넌트 쿼리로 교체한다. 이벤트 생성/수정/삭제는 주최자만 가능하도록 RLS(`events_insert_own`, `events_update_own_or_admin`, `events_delete_own_or_admin`)를 신뢰하되, Server Action에서도 `organizer_id` 비교를 명시적으로 수행해 방어적 이중 확인을 유지한다.

## 관련 파일

- `app/events/actions.ts` (신규) — `createEvent`/`updateEvent`/`deleteEvent` Server Action (`"use server"`)
- `app/events/page.tsx` — `DUMMY_EVENTS` 대신 실제 `events` 조회로 교체
- `app/events/new/page.tsx` — `EventForm`을 생성 모드로 연동
- `app/events/[eventId]/page.tsx` — 공지 탭을 실제 `event` row + 확정 참여자 수 조회로 교체, 주최자에게 수정/삭제 UI 노출
- `app/events/[eventId]/edit/page.tsx` (신규) — `EventForm`을 수정 모드로 연동
- `components/event-form.tsx` — `mode: "create" | "edit"` prop 추가, 수정 시 `defaultValues` 주입, 제출 시 Server Action 호출로 교체(현재는 `console.log`만 수행)
- `types/event.ts` — `eventFormSchema`, `Event` 인터페이스 (참조, 변경 없음)
- `lib/supabase/server.ts` — Server Action/서버 컴포넌트에서 재사용할 `createClient()` (참조, 변경 없음)
- `supabase/migrations/0003_events.sql` — `events` 테이블/RLS 정의 (참조)

## 선행 작업

- Task 001~003(더미 UI) — 이번 Task가 대체할 화면
- Task 004(DB 스키마 및 RLS) — `events` 테이블, RLS 정책, `types/database.types.ts` 완료됨

## 구현 단계

- [x] `app/events/actions.ts` 생성 — 파일 최상단에 `"use server"` 지시어
  - [x] `createEvent(values: EventFormValues)`: `createClient()` → `supabase.auth.getUser()`로 `user` 확보(미인증 시 에러) → `eventFormSchema`로 서버 재검증 → `join_type`이 `password`면 `password`를 해시(bcrypt 등)해 `password_hash`에 저장, 그 외 타입은 `password_hash: null` → `supabase.from("events").insert({ ...values, organizer_id: user.id, status: "recruiting" }).select().single()` → 성공 시 `redirect(`/events/${data.id}`)`, 실패 시 에러 메시지 반환. `values.image_url`은 Task 004-2에서 클라이언트가 Supabase Storage에 업로드를 이미 완료한 뒤 폼 값으로 넘어온 public URL 문자열이므로, 다른 필드와 함께 그대로 insert에 포함한다(Server Action은 파일 업로드를 수행하지 않음)
  - [x] `updateEvent(eventId: string, values: EventFormValues)`: `auth.getUser()` → 대상 event의 `organizer_id === user.id` 확인(불일치 시 에러 반환, RLS로도 차단되지만 명시적 메시지 제공 목적) → `eventFormSchema` 재검증 후 `update(...).eq("id", eventId)` → `revalidatePath(`/events/${eventId}`)` 후 리다이렉트. `image_url`도 다른 필드와 동일하게 update 대상에 포함(새 이미지로 교체 시 Task 004-2의 업로드 흐름으로 갱신된 URL을 그대로 반영)
  - [x] `deleteEvent(eventId: string)`: `organizer_id` 확인 → `delete().eq("id", eventId)` → `revalidatePath("/events")` → `redirect("/events")`
- [x] `app/events/page.tsx`를 async 서버 컴포넌트로 유지하되 데이터 소스 교체: `const supabase = await createClient(); const { data: events } = await supabase.from("events").select("*").order("starts_at");` — 상태별 필터(`EventQuickLinks`/클라이언트 필터)는 기존 UI 그대로 유지, `events`가 `null`/빈 배열일 때 빈 상태 안내 문구 추가
- [x] `app/events/[eventId]/page.tsx` 공지 탭: `DUMMY_EVENTS.find(...)` 대신 `supabase.from("events").select("*").eq("id", eventId).single()`(없으면 `notFound()`), 확정 참여자 수는 `supabase.from("participants").select("*", { count: "exact", head: true }).eq("event_id", eventId).eq("status", "confirmed")`로 조회. 참여자/카풀/정산 탭은 아직 Task 006~008 대상이므로 이번 Task에서는 더미 데이터(`DUMMY_PARTICIPANTS` 등)를 그대로 유지한다(점진적 전환)
- [x] 공지 탭에 주최자(`event.organizer_id === user.id`) 전용 "수정" 링크(`/events/${eventId}/edit`)와 "삭제" 버튼(`AlertDialog` 확인 후 `deleteEvent` 호출) 추가
- [x] `components/event-form.tsx`: `mode: "create" | "edit"`, `eventId?: string`, `defaultValues?: Partial<EventFormValues>` prop 추가. `edit` 모드에서는 `useForm`의 `defaultValues`에 기존 event row 값을 매핑(날짜 `starts_at`은 `string` → `Date` 변환) 하고, 제출 시 `mode`에 따라 `createEvent` 또는 `updateEvent(eventId, values)` 호출로 `onSubmit`의 `console.log` 대체
- [x] `app/events/new/page.tsx`: `<EventForm mode="create" />`로 연동
- [x] `app/events/[eventId]/edit/page.tsx` 신규 생성: event row 조회(주최자 아니면 `notFound()` 또는 리다이렉트) 후 `<EventForm mode="edit" eventId={event.id} defaultValues={...} />` 렌더

## 테스트 체크리스트 (Playwright MCP)

- [ ] 로그인 후 `/events/new`에서 선착순(`first_come`) 이벤트 생성 → 성공 시 상세 페이지로 이동 확인
- [ ] 비밀번호(`password`) 참가 방식으로 생성 → 비밀번호 입력 필드 노출 및 저장 확인(평문이 아닌 해시로 저장되는지는 DB 조회로 별도 확인)
- [ ] 승인(`approval`) 참가 방식으로 생성 → 저장 확인
- [ ] `/events` 목록에서 방금 생성한 이벤트가 노출되는지 확인
- [ ] 상세 페이지 공지 탭에서 확정 참석자 수(`0 / capacity`)가 정확히 표시되는지 확인
- [ ] 주최자 계정으로 이벤트 수정(제목 변경) → 저장 후 상세 페이지에 반영 확인
- [ ] 주최자 계정으로 이벤트 삭제(alert-dialog 확인) → `/events` 목록에서 사라짐 확인
- [ ] 비주최자 계정으로 동일 이벤트의 `/events/[eventId]/edit` 접근 또는 `updateEvent`/`deleteEvent` 호출 시도 → RLS/Server Action 이중 검증에 의해 거부되는지 확인

## 수락 기준

- [ ] 이벤트 생성이 실제 `events` 테이블에 반영되고 `organizer_id`가 현재 로그인 사용자로 저장됨
- [ ] `/events` 목록과 상세 공지 탭이 더미 데이터가 아닌 실제 DB 조회 결과를 렌더함
- [ ] 이벤트 수정/삭제가 주최자에게만 허용되고, 비주최자의 시도는 서버 액션과 RLS 양쪽에서 차단됨
- [ ] `EventForm`이 생성/수정 두 모드 모두에서 정상 동작함
- [ ] 확정 참여자 수(`확정 인원 / 정원`)가 `participants` 테이블 조회로 정확히 표시됨
- [x] `npx tsc --noEmit` 및 `npm run lint` 통과(변경 파일 대상 ESLint 확인, 나머지 항목은 Playwright E2E 미실행으로 미검증)

## 이후 의존 작업

- **Task 006**(참여자 관리)이 이 Task의 `app/events/[eventId]/page.tsx` 구조와 `participants` 조회 패턴을 확장해 참여자 탭을 실제 데이터로 교체한다.
- **Task 008-3**(블랙리스트)이 이 Task의 이벤트 목록 조회 쿼리에 블랙리스트 필터링을 추가한다.
- **Task 008-5**(나의 주최/참여 이벤트)가 이 Task의 `events` 조회 패턴과 `EventCard`/`EventList` 컴포넌트를 재사용한다.
