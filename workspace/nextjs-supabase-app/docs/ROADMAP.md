# 모임 이벤트 관리 MVP 개발 로드맵

흩어진 카톡/엑셀 없이 모임의 공지·참여자·카풀·정산을 한 곳에서 처리하는 이벤트 관리 기능을 기존 스타터킷 위에 추가한다.

## 개요

**모임 이벤트 관리**는 정기/비정기 모임을 운영하는 주최자와 참여자를 위한 통합 관리 기능으로 다음을 제공합니다:

- **이벤트 생성/관리(F001)**: 주최자가 모임을 생성·수정·삭제하고 공지사항을 작성, 참여 방식(선착순/비밀번호/승인) 선택
- **참여자 관리(F002)**: 참여 신청/취소, 정원 초과 시 대기자 처리 및 취소 시 자동 승격, 주최자의 참여자 강퇴(사유/비공개 옵션)
- **카풀 관리(F003)**: 운전자 좌석/출발 정보 등록, 운전자→탑승자 초대 및 탑승자→운전자 신청 양방향 매칭, 거절 시 재신청 차단·재초대 허용
- **정산(F004)**: 항목별 총액을 확정 참여자 수로 1/N 계산, 입금 완료 여부 체크, 공개/비공개 열람 범위 설정
- **나의 주최 이벤트(F006)** / **참여 이벤트(F007)**: 상태별(전체/모집중/마감/종료) 목록 조회
- **이메일 초대(F008)** / **블랙리스트(F009)**: 가입자 이메일로 이벤트 초대, 참여자의 주최자 차단
- **친구(F010)**: 가입자 간 친구 요청/수락 및 목록 조회
- **관리자 페이지(F011)**: 대시보드 통계, 이벤트 관리(검색/강제삭제/공지), 사용자 관리/통계 분석(최소범위)

> 기존 인증(`app/auth/*`, `app/protected/*`, proxy 세션 체크)과 Supabase 클라이언트(`lib/supabase/*`)는 이미 완성되어 있어 **재사용**한다. 본 로드맵은 신규 이벤트 관리 기능 개발에만 집중한다.
>
> **[문서 정정]** 이벤트 관련 라우트는 `app/events/*`에 위치한다(과거 문서의 `app/protected/events/*` 표기는 오기이며 실제 구현과 일치하도록 수정됨). `app/protected/` 그룹 밖이지만 `lib/supabase/proxy.ts`가 `/`, `/auth/*`, `/login` 제외 전체 경로에 인증을 강제하므로 보호된 라우트다.

## 개발 워크플로우

1. **작업 계획**

- 기존 코드베이스를 학습하고 현재 상태를 파악
- 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
- 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**

- `/tasks` 디렉토리에 새 작업 파일 생성 (명명 형식: `XXX-description.md`, 예: `001-schema.md`)
- 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
- **API/비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
- 마지막 완료된 작업을 예시로 참조. 초기 상태 샘플은 `000-sample.md` 참조
- 새 작업 문서는 빈 체크박스 상태로 시작하고 변경 사항 요약은 없어야 함

3. **작업 구현**

- 작업 파일의 명세서를 따라 기능 구현
- **API 연동 및 비즈니스 로직 구현 시 Playwright MCP로 E2E 테스트 수행 필수**
- 각 단계 후 작업 파일 내 진행 상황 업데이트
- 테스트 통과 확인 후 다음 단계로 진행, 각 단계 완료 후 중단하고 추가 지시 대기

4. **로드맵 업데이트**

- 로드맵에서 완료된 작업을 ✅로 표시

## 기술 스택 및 사전 준비

- **베이스**: Next.js 15 App Router + Supabase Auth (기존 스타터킷, 재사용)
- **데이터 조회**: 서버 컴포넌트 + `lib/supabase/server.ts`
- **폼 제출**: Server Actions (React Hook Form + Zod 클라이언트 검증 → 서버 액션 재검증)
- **DB**: `events`, `participants`, `carpools`, `carpool_passengers`, `settlements`, `settlement_shares`, `invitations`, `blacklists`, `friendships`, `admin_users` 10개 테이블, 전 테이블 RLS, `auth.users` 직접 FK 참조
- **관리자 권한**: `admin_users` 테이블 + `is_admin()` RLS 헬퍼 함수 (custom claims 대비 관리자 추가/제거가 CRUD로 즉시 반영되는 장점 채택)
- **신규 shadcn 컴포넌트**: form, dialog, select, table, tabs, textarea, avatar, calendar, popover, alert-dialog
- **신규 npm 패키지**: react-hook-form, zod, @hookform/resolvers, date-fns
- **상태관리**: zustand 미도입 (서버 컴포넌트 + Server Actions로 충분)

## 개발 단계

### Phase 1: UI 우선 골격 구축 및 데이터 스키마 확정 ✅

> UI/UX를 더미 데이터로 먼저 완성해 화면 요구사항을 확정한 뒤 마지막에 DB 스키마를 구축한다. 화면 작업 중 드러나는 필드/상태 변경 요구를 스키마에 한 번에 반영해 테이블 재작업을 줄이는 순서다. Task 001~003은 스키마와 독립적이므로 병렬 진행 가능하다.

- **Task 001: 도메인 타입 정의 및 패키지/컴포넌트 사전 설치** ✅
  - react-hook-form, zod, @hookform/resolvers, date-fns 설치
  - 신규 shadcn 컴포넌트(form, dialog, select, table, tabs, textarea, avatar, calendar, popover, alert-dialog) 추가
  - 이벤트/참여자/카풀/정산 도메인 타입 및 Zod 스키마를 수기로 정의 (DB 스키마 확정 전이므로 `database.types.ts` 의존 없이 임시 인터페이스로 작성, 이후 Task 004에서 생성될 타입과 정합성 맞춤)
  - status enum(모집중/마감/종료, 확정/대기/취소, 신청/확정/거절) 상수화

- **Task 002: 이벤트 라우트 구조 및 페이지 골격 생성** ✅
  - `app/events/`(목록), `app/events/new`(생성), `app/events/[eventId]`(상세) 페이지 스캐폴딩
  - 상세 페이지 공지/참여자/카풀/정산 4개 탭 골격(tabs) 구성
  - `app/protected/layout.tsx` 네비게이션에 "모임 이벤트" 진입 링크 추가
  - **[변경 사항]** 최초 계획은 `app/protected/events/` 하위 배치였으나, `/events`라는 짧은 URL을 위해 `app/events/`(protected 그룹 밖)로 이동했다. `lib/supabase/proxy.ts`의 인증 게이트는 특정 경로가 아니라 "/", "/auth/*", "/login"을 제외한 전체 경로에 전역 적용되므로 인증 보호는 그대로 유지된다. `/events` 전용 `app/events/layout.tsx`를 새로 만들어 모바일 하단 탭 내비게이션(홈/이벤트/새 이벤트/프로필)을 추가했다.

- **Task 003: 공통 컴포넌트 및 더미 데이터로 UI 완성** ✅
  - 이벤트 카드/목록, 상태 배지, 상태별 필터 UI 구현 (하드코딩 더미 데이터)
  - 이벤트 생성 폼 UI(제목/설명/일시/장소/정원, calendar+popover 날짜 선택) 정적 구현
  - 상세 페이지 각 탭(공지·참여자 목록·카풀 목록·정산 목록) UI를 더미 데이터로 완성
  - 반응형 디자인 및 모바일 최적화, 사용자 플로우/네비게이션 검증
  - UI 작업 중 확인된 필드 추가/변경 요구사항을 정리해 Task 004 스키마 설계에 반영
  - **[변경 사항]** 참고 모임 앱 스크린샷을 반영해 `EventCard`를 모바일 앱 스타일(장식용 썸네일 + 상태 배지 + 날짜 아이콘 + 주최자 아바타/이름 + 참여자 수 아이콘)의 가로형 카드로 재디자인했다. 썸네일은 이벤트 id 해시로 결정되는 그라디언트+아이콘이며 **DB에 신규 컬럼을 추가하지 않은 순수 장식 요소**다. 주최자 표시를 위해 더미데이터에 `DUMMY_ORGANIZERS`(user_id → 이름/이니셜) 맵과, 카드에 참여자 수를 보여주기 위해 이벤트 2~4에도 `DUMMY_PARTICIPANTS`를 보강했다. 목록 그리드는 가로형 카드에 맞춰 `grid-cols-1 lg:grid-cols-2`로 조정했다.
  - **[각주]** F006~F011(나의 주최/참여 이벤트, 초대, 블랙리스트, 친구, 관리자) 관련 화면/타입은 Task 001~003 범위 밖이며 Task 004(스키마 확장)부터 반영한다. 또한 본 로드맵과 `tasks/001~003.md` 문서에 남아있던 `app/protected/events/*` 라우트 표기는 실제 구현인 `app/events/*`에 맞게 정정되었다.
  - **[추가 변경 사항]** 이후 대화에서 요청된 세부 요구사항을 더미 데이터 기반으로 계속 반영했다:
    - 이벤트 생성 폼에 참여 방식(선착순/비밀번호/승인), 이벤트 일정, 준비물, 반복 설정(없음/매일/매주/매달 N번째 요일/매달 특정 일자), **정산 내역 공개/비공개 선택** 필드 추가.
    - 이벤트 상세 공지 탭에 이벤트 장소/일시, **현재 확정 참석자 수(`확정 인원 / 정원`)**, 이벤트 일정, 준비물 표시.
    - 참여자/카풀 탭은 주최자 또는 확정 참여자만 열람 가능하도록 잠금 안내(`RestrictedTabNotice`) UI 추가. 정산 탭은 추가로 `settlement_visible`(공개/비공개)에 따라 참여자 열람 여부를 분기.
    - 카풀 탭을 운전자별 카드 레이아웃으로 재구성: 운전자 등록(`CarpoolVolunteerDialog`), 운전자→탑승자 초대(`CarpoolInvitePassengerDialog`), 탑승자→운전자 신청(`CarpoolRequestButton`), 초대/신청 수락·거절(`CarpoolPassengerActions`, `viewerRole` 기반 분기)을 구현. 탑승 상태를 `초대중(invited)`/`신청(requested)`/`확정(confirmed)`/`거절(rejected)`로 세분화하고 `initiated_by`(운전자/탑승자)로 제안 주체를 구분해, 운전자가 신청을 거절하면 해당 탑승자는 재신청이 막히되(재초대는 가능) 탑승자가 초대를 거절한 경우는 재신청이 가능하도록 규칙을 분리했다.
    - 위 항목은 모두 마크업/더미데이터 단계이며 실제 Server Actions/DB 반영은 Task 004 이후로 이연.

- **Task 004: 데이터베이스 스키마 및 RLS 정책 구축 (확장)** ✅
  - Task 003까지 확정된 화면/필드 요구사항과 신규 기능(F006~F011) 요구사항을 반영해 `supabase/migrations`에 기존 6개 테이블(events, participants, carpools, carpool_passengers, settlements, settlement_shares) + 신규 3개 테이블(invitations, blacklists, friendships) 생성 마이그레이션 작성
  - `events`에 `join_type`(선착순/비밀번호/승인) CHECK 제약 컬럼과 `password_hash` 컬럼 추가, 더불어 `schedule`/`items_to_bring`(nullable text), `recurrence_type`(CHECK IN none/daily/weekly/monthly_nth_weekday/monthly_date), `settlement_visible`(boolean, DEFAULT true) 컬럼 추가
  - `participants`에 `pending_approval`/`kicked` status 값 추가 및 `kicked_at`/`kick_reason`/`kick_reason_visible` 컬럼 추가
  - `carpool_passengers`의 status를 `invited`/`requested`/`confirmed`/`rejected` 4가지로 CHECK 제약 확장하고, 제안 주체 구분을 위한 `initiated_by`(CHECK IN driver/passenger) 컬럼 추가
  - 각 테이블 FK(`auth.users` 직접 참조) 및 status 컬럼 CHECK 제약 정의
  - 전 테이블 RLS 활성화 및 정책 작성 (이벤트 조회는 전체 로그인 사용자이되 블랙리스트 등록된 주최자 이벤트 제외, 수정/삭제는 주최자 한정 등)
  - `mcp__supabase__apply_migration`으로 원격 적용 후 `generate_typescript_types`로 `database.types.ts` 생성
  - Task 001에서 임시로 작성한 도메인 타입/Zod 스키마를 `database.types.ts` 기반으로 정합화
  - `get_advisors`로 RLS/보안 경고 점검

- **Task 004-1: 관리자 권한 부트스트랩** ✅
  - `admin_users` 테이블(user_id → auth.users.id PK, granted_at) 생성 마이그레이션 작성
  - RLS에서 사용할 `is_admin()` 헬퍼 함수(`EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())`) 작성
  - 최초 관리자 계정을 수동 등록하는 SQL 스크립트 작성 및 문서화
  - **[비고]** Task 004 실행 시 별도 문서 없이 마이그레이션(`0002_admin_users_and_helpers.sql`)으로 함께 적용 완료됨.

- **Task 004-2: 이벤트 사진 업로드 기능** ✅ - 완료
  - See: `tasks/004-2-event-image-upload.md`
  - ✅ `events.image_url`(nullable text) 컬럼, `event-images` Storage 버킷 및 `storage.objects` RLS(업로드/삭제) 마이그레이션 적용 완료(`0014`~`0016`)
  - ✅ 브라우저 클라이언트(`lib/supabase/client.ts`) 직접 업로드 방식으로 `EventForm`에 파일 검증·업로드·미리보기 구현
  - ✅ 이벤트 상세 페이지 조건부 이미지 표시, `next.config.ts`(`images.remotePatterns`) 반영
  - ✅ Task 005의 `createEvent`/`updateEvent`가 `image_url`을 다른 필드와 함께 그대로 저장

### Phase 2: 핵심 기능 구현 (더미 → 실제 데이터 연동) ✅

> 구현 순서(스키마→이벤트→참여자→카풀→정산)를 따른다. 각 Task는 Server Actions와 RLS를 통해 실제 데이터로 교체하며, Playwright MCP E2E 테스트로 검증한다.

- **Task 005: 이벤트 CRUD 구현 (F001)** ✅ - 완료
  - See: `tasks/005-event-crud.md`
  - ✅ `app/events/actions.ts`: `createEvent`/`updateEvent`/`deleteEvent` Server Action (Zod 재검증, organizer_id = 현재 사용자, join_type별 password_hash(scrypt) 저장, schedule/items_to_bring/recurrence_type 및 세부 필드/settlement_visible/**image_url**(Task 004-2) 저장 포함)
  - ✅ 목록 페이지(`app/events/page.tsx`) 서버 컴포넌트에서 실제 `events` 조회로 교체(상태별 필터는 기존 클라이언트 UI 유지)
  - ✅ 상세 페이지 공지 탭을 실제 `events`/`participants`(확정 인원 수) 조회로 교체, 주최자 전용 "수정하기"/"삭제" 버튼 추가(`DeleteEventButton`, alert-dialog 확인)
  - ✅ 주최자 권한 검증(RLS + 서버 액션 이중 확인), 저장 성공 시 상세 페이지 리다이렉트
  - ✅ `EventForm`이 `mode`("create"|"edit")에 따라 `createEvent`/`updateEvent` 호출로 동작(기존 `console.log` 더미 제출 대체)
  - **[비고]** `recurrence_weekday`/`recurrence_week_of_month`/`recurrence_day_of_month`/`recurrence_time` 컬럼이 Task 004 마이그레이션에 누락되어 있어 이번 Task에서 `0017_events_recurrence_details.sql`로 추가 적용함. 참여자/카풀/정산 탭은 계획대로 Task 006~008에서 실제 데이터로 전환 예정이며 이번 Task에서는 더미 데이터 유지. Playwright E2E 테스트는 미실행.

- **Task 005-1: 프로필 페이지 구현 (닉네임/아바타/공개 설정)** ✅ - 완료(Task 001~005 진행 중 누락 발견되어 추가)
  - `profiles.nickname`(text, nullable), `profiles.name_visible`(boolean, default false) 컬럼 마이그레이션(`0018_profiles_nickname.sql`), `avatars` Storage 버킷 + 본인 폴더 한정 RLS(`0019_avatars_storage_policy.sql`)
  - `app/profile/actions.ts`의 `updateProfile` Server Action, `app/profile/page.tsx`(아바타/닉네임/실명 공개 토글/만든·참여한 이벤트 수/계정 정보/로그아웃)
  - 닉네임 미설정 사용자는 프로필 페이지가 곧 온보딩 화면으로 전환되어 안내(설정 전에는 통계 대신 설정 폼만 노출)
  - Google OAuth 콜백(`app/auth/callback/route.ts`) 및 이메일/비밀번호 로그인(`login-form.tsx`) 양쪽에서, 닉네임 미설정 사용자는 `/events` 대신 `/profile`로 리다이렉트
  - 모바일 하단 내비게이션의 "프로필" 탭과 데스크톱 상단 `AuthButton`(아바타+닉네임 링크)이 모두 `/profile`로 연결되도록 수정
  - **[비고]** PRD 원문(400행)은 "별도 profiles 테이블 없음, auth.users 직접 FK 참조"를 원칙으로 전제했으나, `auth.users`는 Supabase Auth 스키마 소유라 PostgREST(REST API)로 직접 조회가 불가능하다(관리자 Admin API/서버 전용 클라이언트로만 접근 가능). 주최자·참여자 등 "타인"의 닉네임/아바타/실명 공개 여부를 클라이언트에서 표시하려면 조회 가능한 테이블이 필요해, Task 004에서 삭제되지 않고 남아있던 스타터킷 기본 `profiles` 테이블(가입 시 `handle_new_user()` 트리거로 auth.users 정보 자동 복제)을 되살려 사용자 표시 정보의 저장소로 채택함. PRD.md의 `profiles` 섹션에 근거를 보강 기재함.

- **Task 006: 참여자 관리, 대기자 자동 승격, 강퇴 구현 (F002)** ✅ - 완료
  - `join_event`/`cancel_participation`/`approve_participant` RPC(`SECURITY DEFINER`, 마이그레이션 `event_participant_rpcs`)로 정원 체크·대기자 승격을 원자적으로 처리
  - `app/events/participant-actions.ts` Server Action(승인/거절/강퇴는 기존 RLS 업데이트 정책으로 보호되는 일반 update)
  - `components/participant-row-actions.tsx`를 실제 액션 호출로 연결, `app/events/[eventId]/page.tsx`가 참여자 탭을 실제 DB 데이터로 렌더링하고 `isConfirmedParticipant` 판별을 실제 로그인 사용자(`supabase.auth.getUser()`)로 교체
  - **[비고]** `get_advisors` security에 각 RPC의 "SECURITY DEFINER 함수를 익명/로그인 사용자가 호출 가능" 경고가 있으나, 함수 내부에서 `auth.uid()` 기반 권한 체크를 직접 수행하는 의도된 설계임(원자적 정원/대기열 처리를 위해 RLS 우회가 필요).
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 실제 계정(주최자 Google 로그인, 참여자 이메일/비밀번호 로그인)으로 승인제 이벤트 생성 → 참가 신청(승인 대기) → 주최자 승인(확정 전환) → 강퇴(사유 노출) → 재초대 수락 시 강퇴 기록 삭제·재확정까지 전 과정 검증. 참가 방식별 참가 버튼(선착순 즉시/비밀번호 모달/승인 대기) UI(`components/join-event-button.tsx`)도 함께 추가 구현 및 검증됨.
  - **[추가]** 참여자 본인 취소 UI(`components/participant-cancel-button.tsx`)를 참여자 탭에 연결하고, `cancel_participation` RPC(마이그레이션 `add_cancel_participation_cutoff`)에 이벤트 시작 24시간 전 취소 금지 컷오프를 추가함(confirmed 상태만 적용, waitlisted/pending_approval은 정원에 반영되지 않아 컷오프 없이 항상 취소 허용). 컷오프 여부는 서버 컴포넌트에서 `event.starts_at` 기준으로 미리 계산해 버튼 대신 안내 문구로 노출.

- **Task 007: 카풀 관리 구현 (F003)** ✅ - 완료
  - `register_carpool`(force 파라미터로 충돌 확인/무시 지원)/`invite_passenger`/`request_carpool`/`respond_carpool_passenger` RPC(마이그레이션 `event_carpool_rpcs`)
  - `app/events/carpool-actions.ts` Server Action, 기존 4개 카풀 컴포넌트(`carpool-volunteer-dialog.tsx`, `carpool-invite-passenger-dialog.tsx`, `carpool-request-button.tsx`, `carpool-passenger-actions.tsx`)를 신규 작성 없이 실제 액션 호출로 연결
  - **[비고]** get_advisors 경고는 Task 006과 동일한 사유로 의도된 설계.
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 운전자 등록 → 탑승자 초대 → 참여자 수락까지 실제 계정으로 검증, "확정" 상태 전환 확인.

- **Task 008: 정산 구현 (F004)** ✅ - 완료
  - `create_settlement` RPC(마이그레이션 `event_settlement_rpc`, 확정 참여자 수 1/N + 나머지는 `joined_at` 최선순 참여자에게 가산)
  - `app/events/settlement-actions.ts`의 `createSettlement`/`toggleSettlementPaid`, 신규 `components/create-settlement-dialog.tsx`(주최자 전용 정산 생성 다이얼로그), `components/settlement-share-toggle.tsx`(입금 완료 토글)
  - 정산 탭 조회는 기존 RLS(`settlement_shares_select_self_or_visible_or_privileged`)가 `settlement_visible`/본인 여부를 이미 분기하고 있어 별도 쿼리 분기 없이 그대로 활용
  - **[비고]** get_advisors 경고는 Task 006과 동일한 사유로 의도된 설계.
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 정산 생성 시 1/N 자동 계산(확정 참여자 1명 → 전액 배분) 확인, 완료 처리 확인 알림창 및 되돌리기 불가 확인, **강퇴된 이후에도 정산 완료 확인증이 유지**되는 핵심 요구사항까지 실제 계정으로 검증.

- **Task 008-1: 핵심 기능 통합 테스트** ✅ - 완료(2026-07-07 Playwright MCP E2E로 재검증)
  - See: `tasks/008-1-integration-test.md`
  - Task 006~008-5 전 기능(참여 신청/승인/강퇴, 카풀 등록/초대/수락, 정산 생성/완료/확인증, 이메일 초대, 블랙리스트, 친구, 나의 주최/참여 목록)을 실제 계정(주최자 Google 로그인, 참여자 이메일/비밀번호 로그인)으로 Playwright MCP를 통해 브라우저에서 직접 검증 완료
  - **[비고]** 관리자 페이지(Phase 3) 시나리오는 범위 밖이며 미실행

- **Task 008-2: 이메일 초대 구현 (F008)** ✅ - 완료
  - `app/events/invite-actions.ts`: `inviteByEmail`(가입자 이메일 매칭 후 `invitations` insert), `acceptInvitation`(RPC `accept_invitation`), `declineInvitation`, `blockOrganizer` Server Action
  - 이벤트 상세 참여자 탭 상단에 주최자 전용 "초대하기" 버튼(`components/invite-by-email-dialog.tsx`) 추가
  - 초대 목록 페이지(`app/events/invitations`)를 더미 데이터에서 실제 서버 컴포넌트 조회로 전환, `components/invitation-actions.tsx`로 수락/거절/차단 버튼을 실제 Server Action에 연결
  - 초대 수락은 `accept_invitation` RPC(`SECURITY DEFINER`)로 승인 절차 없이 바로 confirmed/waitlisted 배정, 거절은 상태만 `declined`로 변경
  - `invitations_insert_organizer_or_admin` RLS 정책을 "본인을 inviter로 지정하면 누구나 삽입 가능"에서 "실제 이벤트 주최자만 삽입 가능"하도록 보강(마이그레이션 `invitations_insert_organizer_only`)
  - **[비고]** 코드 레벨 트레이싱으로 검증.
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 초대 생성 → 초대 목록 노출 → 수락 → 참여자 등록(재초대 시 강퇴 기록 삭제 후 재확정 포함)까지 실제 계정으로 검증.

- **Task 008-3: 블랙리스트 구현 (F009)** ✅ - 완료
  - See: `tasks/008-3-blacklists.md`
  - ✅ 초대 목록의 "이 주최자 차단" 버튼(`components/invitation-actions.tsx`)은 Task 008-2에서 이미 `blockOrganizer` Server Action(`app/events/invite-actions.ts`)에 연결되어 있었음 — 신규 작성 없이 그대로 재사용
  - ✅ `blacklists(blocker_id, blocked_organizer_id)` unique 제약은 Task 004 스키마에 이미 존재함을 확인(추가 마이그레이션 불필요), `blockOrganizer`가 `23505` 위반 시 조용히 무시 처리
  - ✅ `app/events/page.tsx`(이벤트 목록), `app/events/invitations/page.tsx`(초대 목록) 조회에 "내 블랙리스트에 있는 주최자" 필터링 추가
  - **[비고]** 코드 레벨 트레이싱으로 검증(`tasks/008-1-integration-test.md` 참고)
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 주최자 검색 → 차단 → 전체 이벤트 목록에서 필터링(단, 이미 참여 중인 이벤트는 참여 이력에서 계속 노출) 실제 계정으로 검증.

- **Task 008-4: 친구 기능 구현 (F010)** ✅ - 완료
  - See: `tasks/008-4-friendships.md`
  - ✅ `app/events/friends-actions.ts`: `searchUsers`(이메일/닉네임 ILIKE, 본인 제외), `sendFriendRequest`(양방향 중복/기존 친구 방지, 상대가 먼저 보낸 대기 요청이 있으면 즉시 수락 처리), `acceptFriendRequest`, `rejectFriendRequest`(행 삭제) Server Action
  - ✅ `app/friends/page.tsx`를 서버 컴포넌트(얇은 wrapper + `Suspense` + async `FriendsContent`)로 전면 리팩토링, 검색/요청 UI는 `components/friend-search.tsx`, 수락/거절 버튼은 `components/friend-request-actions.tsx`로 분리
  - ✅ 친구 목록은 `friendships`를 `user_id`/`friend_id` 양방향으로 조회해 병합(A가 B에게 요청해 accepted가 되면 B 쪽 목록에도 노출)
  - **[비고]** `friendships(user_id, friend_id)` unique 제약은 Task 004 스키마에 이미 존재함을 확인.
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 검색 시 이미 친구인 사용자에게 "이미 친구인 사용자입니다" 에러 노출을 확인하는 과정에서, 검색 결과 카드가 기존 관계 상태(친구/요청중)를 반영하지 않고 항상 "친구 추가" 버튼을 보여주는 것을 발견 → `searchUsers`가 `friendships` 조회로 `relationship`(none/pending/accepted) 필드를 함께 반환하도록 수정하고, `FriendSearch` 버튼을 관계 상태에 따라 "친구 추가"/"요청됨"/"친구"(비활성화)로 분기하도록 개선.

- **Task 008-5: 나의 주최/참여 이벤트 목록 구현 (F006, F007)** ✅ - 완료
  - See: `tasks/008-5-my-joined-events.md`
  - ✅ `app/events/mine/page.tsx`, `app/events/joined/page.tsx`를 서버 컴포넌트(얇은 wrapper + `Suspense`)로 전환, 실제 `events`/`participants` 조회로 교체
  - ✅ 상태별(전체/모집중/마감/종료/삭제됨) 탭 필터는 `components/event-list.tsx`가 클라이언트 사이드로 구현
  - ✅ `joined` 목록은 `participants.status not in (cancelled, kicked)` 조건으로 취소/강퇴된 참여 기록을 제외(취소/강퇴 시 더 이상 "참여 중"이 아니므로 목록에 남기지 않는 것이 자연스러움)
  - ✅ 빈 상태 안내("생성한 이벤트가 없습니다." / "참여 중인 이벤트가 없습니다.") 유지
  - **[비고]** 프로필 페이지의 "만든 이벤트"/"참여한 이벤트" 통계 카드를 각각 `/events/mine`, `/events/joined`로 연결하는 링크를 추가 반영(`app/profile/page.tsx`). 이후 이벤트 소프트 삭제(주최자 삭제 시에도 참여자가 참여/정산 이력을 계속 조회할 수 있도록 `events.deleted_at` 도입) 대응으로 "삭제됨" 필터와 읽기 전용 상세 페이지가 추가됨.
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 전체/모집중/마감/종료/삭제됨 필터 동작, 소프트 삭제된 이벤트도 참여 이력에 남아 조회 가능함을 실제 계정으로 검증.

- **Task 009: 참가비 자동 정산 및 이벤트 문의 정보 추가** ✅ - 완료
  - `events`에 `participation_fee_enabled`(boolean, default false), `participation_fee_amount`(nullable integer) 컬럼 추가(마이그레이션 `events_participation_fee`)
  - `EventForm`에 "참가비 금액 설정" 체크박스와 활성화 시에만 노출되는 "이벤트 참가비(1인 기준)" 입력 필드 추가, `eventFormSchema`에 `superRefine`으로 활성화 시 1원 이상 필수 검증 추가
  - 참가비 활성화 시 참여자가 confirmed로 전환될 때(신규 참여/승인/대기 승격/초대 수락 등 모든 경로) "참가비 정산" 항목에 자동으로 분담액이 추가되도록 `participants` 테이블에 `AFTER INSERT OR UPDATE` 트리거(`participants_settlement_fee_trigger`)를 추가(마이그레이션 `participation_fee_settlement_automation`) — 개별 RPC를 일일이 수정하지 않고 상태 전환 지점을 한 곳에서 감지해 일관되게 처리
  - confirmed → cancelled/kicked 전환 시 **미납(is_paid=false) 상태의 참가비 분담액만 삭제**하고, 이미 입금 완료 처리된 분담액은 정산 기록 보존을 위해 유지하는 정책 채택
  - 이벤트 상세 공지 탭에 "이벤트 문의" 섹션(주최자 표시 이름 + 가입 이메일) 추가. `profiles.email` 전체를 열람 가능하게 여는 대신, 주최자 본인 또는 확정 참여자만 호출 가능한 `get_event_organizer_contact` RPC(`SECURITY DEFINER`, 내부에서 권한 재검증)를 신설해 이메일 노출 범위를 좁힘
  - **[비고]** 기존 3번 항목(정산 완료/미완료 토글)은 `components/settlement-share-toggle.tsx` + `toggleSettlementPaid`로 이미 구현되어 있어 그대로 재사용, 별도 변경 없음.

### Phase 3: 관리자 기능 ✅

> 관리자 기능은 권한 모델(`admin_users`)이 일반 사용자 플로우와 분리되어 있고 결합도가 낮아 별도 Phase로 분리한다.

- **Task 010: 관리자 인증 가드 및 레이아웃** ✅ - 완료
  - See: `tasks/010-admin-guard.md`
  - ✅ `app/admin/layout.tsx`를 `Suspense` + 비동기 `AdminGuard`(`app/admin/admin-guard.tsx`) 구조로 전환해 `admin_users` 미등록 사용자는 404 처리(Next.js 16 Cache Components 요구사항에 맞춰 비동기 데이터 접근을 `Suspense` 하위로 분리)
  - ✅ 사이드바(`components/admin-sidebar.tsx`)를 client 컴포넌트로 분리해 대시보드/이벤트 관리/사용자 관리/통계 분석 메뉴 구성 유지
  - ✅ `app/admin/page.tsx` 신설로 `/admin` 직접 접근 시 `/admin/dashboard`로 리다이렉트, `app/profile/page.tsx`의 "관리자" 표시를 `/admin/dashboard` 링크로 교체
  - ✅ 로그인 직후 라우팅 분기 추가: `login-form.tsx`/`app/auth/callback/route.ts`에서 닉네임 미설정→`/profile`, 관리자→`/admin/dashboard`, 일반 사용자→`/events`(초대 링크 등 명시적 `next` 파라미터는 그대로 우선)
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 비로그인 상태 `/admin` 접근 시 `/auth/login` 리다이렉트, 일반 계정(`khb1928@naver.com`) 접근 시 404, 관리자 계정(`khb3025@gmail.com`, 검증을 위해 `admin_users`에 수동 등록) 접근 시 `/admin/dashboard` 정상 렌더링을 실제 계정으로 확인. 로그인 폼에서 최초 로그인 시 자동 분기 시나리오는 별도 검증 필요(작업서에 미완료 체크리스트로 기록).
  - ✅ 추가: `components/admin-sidebar.tsx` 하단에 기존 `LogoutButton`을 재사용해 관리자 페이지 어디서든 로그아웃 가능하도록 보강, Playwright로 로그아웃 후 재접근 시 로그인 요구됨을 확인.

- **Task 011: 관리자 대시보드 구현 (F011-1)** ✅ - 완료
  - See: `tasks/011-admin-dashboard.md`
  - ✅ `events`/`profiles` 병렬 count 쿼리(총 이벤트/진행중 이벤트/총 사용자/이번 달 신규 가입)로 더미 통계 카드 교체
  - ✅ 최근 이벤트 5건/최근 가입자 5건을 최신순 조회로 교체, 주최자 이름은 `app/events/event-list-data.ts`의 `getEventListDisplayData` 재사용
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 관리자 계정으로 실제 DB 값(총 이벤트 1, 총 사용자 2 등)과 화면 숫자 일치 확인

- **Task 012: 관리자 이벤트 관리 구현 (F011-2)** ✅ - 완료
  - See: `tasks/012-admin-events.md`
  - ✅ `events.admin_notice`(nullable text) 컬럼 마이그레이션 추가 및 타입 재생성
  - ✅ 이벤트 검색 필터(제목 ILIKE), 목록 테이블(제목/비밀번호 유무/날짜/상태/호스트/참여자 수) 구현
  - ✅ 강제 삭제는 신규 하드 삭제 로직 없이 기존 `deleteEvent`에 관리자 허용 분기(`admin_users` 확인) + `skipRedirect` 옵션을 추가해 재사용, 관리자 공지 등록은 신규 `setAdminNotice` Server Action으로 구현하고 이벤트 상세 공지 탭에 노출
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 제목 검색(일치/불일치), 공지 등록 후 상세 페이지 노출, 관리자의 타 주최자 이벤트 강제 삭제(DB 확인 결과 소프트 삭제 유지) 전 과정을 실제 계정으로 검증. 테스트 후 데이터는 원상 복구.

- **Task 013: 관리자 사용자 관리/통계 구현 (F011-3, 최소범위)** ✅ - 완료
  - See: `tasks/013-admin-users-analytics.md`
  - ✅ 사용자 목록/검색 페이지(`app/admin/users`)를 `profiles` 이메일/닉네임 ILIKE 검색으로 구현
  - ✅ 월별 이벤트 생성 수/신규 가입자 수 추이는 신규 `get_monthly_stats()` SECURITY DEFINER RPC(내부 `private.is_admin()` 검증)로 집계해 `app/admin/analytics` 조회 전용 페이지에 표시
  - **[비고]** 최초 구현에서 RPC 반환 컬럼명 `month`가 PL/pgSQL 내부적으로 SQL 별칭과 충돌해 `ambiguous column` 에러가 발생했으나 화면엔 조용히 빈 데이터로만 표시됨 — 서버 로그 확인으로 원인 파악 후 컬럼명을 `stat_month`로 변경해 수정.
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 실제 관리자 계정으로 사용자 검색 필터링, 월별 통계(2026년 7월: 이벤트 2 · 신규가입 2) 정상 렌더링 확인. `get_advisors` 경고는 기존 RPC들과 동일한 의도된 설계.

### Phase 4: 마감 및 최적화 ✅

- **Task 014: 사용자 경험 개선 및 품질 보증** ✅ - 완료 (기존 Task 009, 대상 범위를 F001~F011 전체로 확장, Shrimp 서브태스크 014-1~014-5로 분할 실행)
  - See: `tasks/014-1-common-components.md`, `tasks/014-2-events-participants.md`, `tasks/014-3-carpool-settlement-social.md`, `tasks/014-4-admin-cache-audit.md`, `tasks/014-5-final-verification.md`
  - ✅ 로딩/에러/빈 상태: `components/ui/skeleton.tsx`(shadcn), `components/empty-state.tsx`(공통 도메인 컴포넌트)를 신설하고 `app/events`, `app/events/mine`, `app/events/joined`, `app/events/[eventId]`, `app/events/[eventId]/edit`, `app/friends`, `app/events/invitations`, `app/admin/dashboard`, `app/admin/events`, `app/admin/users`, `app/admin/analytics` 세그먼트에 `loading.tsx`/`error.tsx`를 적용, 개별 구현되어 있던 plain-text 빈 상태를 공통 컴포넌트로 통합
  - ✅ 접근성: 카풀/정산 아이콘 전용 체크박스(`settlement-share-toggle.tsx`, `carpool-invite-passenger-dialog.tsx`)와 프로필 사진 변경 버튼(`profile-edit-form.tsx`)에 `aria-label` 추가. 조사 결과 대부분의 버튼은 이미 아이콘+텍스트로 접근 가능한 이름을 갖고 있어 불필요한 변경은 하지 않음
  - ✅ 폼 검증 피드백: 인증 관련 폼(`login-form`, `sign-up-form`, `forgot-password-form`, `update-password-form`)의 에러 텍스트 색상을 `text-red-500` → `text-destructive`로 통일
  - ✅ `revalidatePath` 감사: `createEvent`/`updateEvent`/`deleteEvent`에 `/admin/dashboard`를, 참여자 관련 5개 액션(`joinEvent`/`cancelParticipation`/`approveParticipant`/`rejectParticipant`/`kickParticipant`)에 `/admin/events`를 추가해 관리자 화면 캐시 무효화 누락을 해소(카풀/정산 액션은 관리자 화면에 노출되지 않아 범위에서 제외)
  - **[2026-07-07 Playwright MCP E2E 검증 완료]** 관리자 계정으로 이벤트/참여자/카풀/친구/초대/관리자 화면 전반의 회귀 없음과 다수의 EmptyState 렌더링(빈 검색 결과, 빈 탭 필터 등)을 확인. `get_advisors`(security/performance) 재점검 결과 기존 대비 신규 이슈 없음.
