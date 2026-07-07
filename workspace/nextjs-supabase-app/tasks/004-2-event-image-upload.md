# Task 004-2: 이벤트 사진 업로드 기능

## 목표

이벤트 생성/수정 페이지에서 이벤트 사진(썸네일)을 실제로 업로드할 수 있게 한다. 파일은 Supabase Storage 버킷(`event-images`)에 업로드하고, `events` 테이블에는 업로드된 파일의 public URL만 `image_url`(nullable text) 컬럼으로 저장한다. Task 005(이벤트 CRUD)가 아직 코드로 구현되지 않았으므로, 이 Task를 먼저 반영해 `createEvent`/`updateEvent`가 `image_url`까지 함께 저장하도록 `tasks/005-event-crud.md`를 보강한다.

## 방식 결정

- **업로드 경로**: 브라우저에서 `lib/supabase/client.ts`의 `createClient()`(브라우저 클라이언트)로 `supabase.storage.from("event-images").upload(...)`를 직접 호출한다. Server Action을 경유하지 않는다.
  - 이유: Server Action의 기본 body 크기 제한(약 1MB)을 피할 수 있고, Storage 자체가 RLS 기반 업로드 인가를 지원해 별도 서버 검증 없이도 안전하게 업로드 가능. 파일은 Server Action에 전달하지 않고, 업로드 후 반환된 public URL 문자열만 폼 값(`image_url`)으로 제출한다.
- **DB 저장 형태**: `events.image_url text null` — 파일 자체가 아닌 URL 문자열만 저장.

## 관련 파일

- `supabase/migrations/0014_events_image_url.sql` (신규, 계획만) — `events.image_url` 컬럼 추가
- `supabase/migrations/0015_event_images_storage_policy.sql` (신규, 계획만) — `event-images` 버킷 및 `storage.objects` RLS 정책
- `types/event.ts` — `Event` 인터페이스에 `image_url`, `eventFormSchema`에 `image_url` 필드 추가
- `components/event-form.tsx` — 파일 업로드 입력 + 업로드 로직 추가
- `app/events/[eventId]/page.tsx` — 이미지 placeholder를 실제 이미지로 교체
- `lib/supabase/client.ts` — 브라우저 클라이언트 재사용(변경 없음)
- `next.config.ts` — `images.remotePatterns`에 Supabase Storage 호스트 추가
- `tasks/005-event-crud.md` — `createEvent`/`updateEvent` 계획에 `image_url` 저장 반영(보강 대상)

## 선행 작업

- Task 004(DB 스키마 및 RLS) — `events` 테이블이 이미 존재해야 컬럼 추가 가능
- Task 005(이벤트 CRUD 작업서) — 이 Task의 산출물을 반영해 보강됨(코드 구현은 아직 안 됨)

## 구현 단계

- [ ] `supabase/migrations/0014_events_image_url.sql` 계획: `alter table public.events add column image_url text;` (nullable, 기본값 없음)
- [ ] `supabase/migrations/0015_event_images_storage_policy.sql` 계획:
  - `event-images` Storage 버킷 생성(Supabase 대시보드 또는 `supabase.storage.createBucket("event-images", { public: true })`) — 공개 버킷으로 생성해 별도 서명 URL 없이 `getPublicUrl()`로 바로 접근 가능하게 함
  - `storage.objects`에 대한 RLS 정책 3종 계획:
    - `event_images_insert_authenticated`: `for insert to authenticated with check (bucket_id = 'event-images')` — 인증 사용자면 업로드 가능
    - `event_images_select_public`: `for select using (bucket_id = 'event-images')` — 누구나 조회 가능(공개 버킷과 일치)
    - `event_images_delete_own`: `for delete to authenticated using (bucket_id = 'event-images' and owner = (select auth.uid()))` — 업로드한 본인만 삭제 가능
- [ ] `types/event.ts`:
  - `Event` 인터페이스에 `image_url: string | null;` 추가
  - `eventFormSchema`에 `image_url: z.string().url().optional().nullable()` 추가(필수 아님 — 이미지 없이도 이벤트 생성 가능)
- [ ] `components/event-form.tsx`:
  - 제목 입력 필드 위(또는 상세 페이지 placeholder와 대응하는 위치)에 이미지 업로드 UI 추가: `<Input type="file" accept="image/*">` + 현재 선택/기존 이미지 미리보기(`<img>` 또는 `next/image`)
  - `onChange` 핸들러: 파일 크기 5MB 초과 또는 `file.type`이 `image/*`가 아니면 폼 에러로 표시하고 업로드 중단
  - 검증 통과 시 업로드 상태(`isUploadingImage`)를 `true`로 설정 → `createClient()`(브라우저)로 `supabase.storage.from("event-images").upload(`${crypto.randomUUID()}-${file.name}`, file)` 호출 → 성공 시 `supabase.storage.from("event-images").getPublicUrl(data.path)`로 public URL 획득 → `form.setValue("image_url", publicUrl)` → 실패 시 에러 토스트/메시지 표시
  - 수정(edit) 모드에서는 기존 `defaultValues.image_url`을 미리보기로 표시, 새 파일을 선택하면 교체
- [ ] `app/events/[eventId]/page.tsx`: 공지 탭의 기존 `ImageIcon` placeholder 블록을 `event.image_url`이 있으면 `next/image`(`fill` 또는 고정 크기, `alt={event.title}`)로 표시하고, 없으면 기존 placeholder를 그대로 유지하는 조건부 렌더로 교체
- [ ] `next.config.ts`: `mcp__supabase__get_project_url`로 확인한 프로젝트 호스트를 기반으로 `images: { remotePatterns: [{ protocol: "https", hostname: "<project-ref>.supabase.co", pathname: "/storage/v1/object/public/event-images/**" }] }` 추가
- [ ] `tasks/005-event-crud.md` 보강: `createEvent`/`updateEvent` 구현 단계 설명에 "폼의 `image_url` 값을 다른 필드와 함께 그대로 insert/update에 포함한다(파일 업로드 자체는 Task 004-2에서 클라이언트가 이미 완료, Server Action은 URL 문자열만 저장)" 문구 추가

## 테스트 체크리스트 (Playwright MCP)

- [ ] 이벤트 생성 폼에서 이미지 파일(5MB 이하, `image/*`) 선택 → 업로드 진행 표시 → 미리보기 노출 확인
- [ ] 이미지 첨부 상태로 이벤트 생성 → 상세 페이지 공지 탭에 업로드한 이미지가 표시되는지 확인
- [ ] 5MB 초과 파일 선택 시 업로드가 진행되지 않고 에러 메시지가 표시되는지 확인
- [ ] `image/*`가 아닌 파일(예: `.pdf`) 선택 시 에러 메시지 확인
- [ ] 이미지 없이 이벤트 생성 → 상세 페이지에 기존 `ImageIcon` placeholder가 그대로 표시되는지 확인
- [ ] 이벤트 수정 화면에서 기존 이미지가 미리보기로 노출되고, 새 이미지로 교체 시 정상 반영되는지 확인

## 수락 기준

- [ ] `events.image_url` 컬럼 추가 마이그레이션과 `event-images` Storage 버킷/RLS 정책 계획이 문서화됨
- [ ] `types/event.ts`의 `Event`/`eventFormSchema`에 `image_url`이 optional/nullable로 추가되는 계획이 명시됨
- [ ] `EventForm`의 파일 선택→검증→업로드→미리보기→폼 값 반영 흐름이 구체적으로 문서화됨
- [ ] 상세 페이지의 이미지 표시 조건부 로직과 `next.config.ts`의 `remotePatterns` 설정이 문서화됨
- [ ] `tasks/005-event-crud.md`에 `image_url` 저장 연동이 반영됨(본 문서 작성과 함께 완료)
- [ ] Playwright 테스트 체크리스트 6항목이 포함됨

## 이후 의존 작업

- **Task 005**(이벤트 CRUD)가 실제 코드로 구현될 때 이 문서의 마이그레이션/타입/UI 계획을 함께 반영한다.
- 실제 마이그레이션 적용(`0014_events_image_url.sql`, `0015_event_images_storage_policy.sql`)과 Storage 버킷 생성은 이 작업서 승인 후 별도 확인을 거쳐 진행한다(이번 단계에서는 미적용).
