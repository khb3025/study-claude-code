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

### Phase 1: UI 우선 골격 구축 및 데이터 스키마 확정

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

- **Task 004: 데이터베이스 스키마 및 RLS 정책 구축 (확장)**
  - Task 003까지 확정된 화면/필드 요구사항과 신규 기능(F006~F011) 요구사항을 반영해 `supabase/migrations`에 기존 6개 테이블(events, participants, carpools, carpool_passengers, settlements, settlement_shares) + 신규 3개 테이블(invitations, blacklists, friendships) 생성 마이그레이션 작성
  - `events`에 `join_type`(선착순/비밀번호/승인) CHECK 제약 컬럼과 `password_hash` 컬럼 추가, 더불어 `schedule`/`items_to_bring`(nullable text), `recurrence_type`(CHECK IN none/daily/weekly/monthly_nth_weekday/monthly_date), `settlement_visible`(boolean, DEFAULT true) 컬럼 추가
  - `participants`에 `pending_approval`/`kicked` status 값 추가 및 `kicked_at`/`kick_reason`/`kick_reason_visible` 컬럼 추가
  - `carpool_passengers`의 status를 `invited`/`requested`/`confirmed`/`rejected` 4가지로 CHECK 제약 확장하고, 제안 주체 구분을 위한 `initiated_by`(CHECK IN driver/passenger) 컬럼 추가
  - 각 테이블 FK(`auth.users` 직접 참조) 및 status 컬럼 CHECK 제약 정의
  - 전 테이블 RLS 활성화 및 정책 작성 (이벤트 조회는 전체 로그인 사용자이되 블랙리스트 등록된 주최자 이벤트 제외, 수정/삭제는 주최자 한정 등)
  - `mcp__supabase__apply_migration`으로 원격 적용 후 `generate_typescript_types`로 `database.types.ts` 생성
  - Task 001에서 임시로 작성한 도메인 타입/Zod 스키마를 `database.types.ts` 기반으로 정합화
  - `get_advisors`로 RLS/보안 경고 점검

- **Task 004-1: 관리자 권한 부트스트랩**
  - `admin_users` 테이블(user_id → auth.users.id PK, granted_at) 생성 마이그레이션 작성
  - RLS에서 사용할 `is_admin()` 헬퍼 함수(`EXISTS(SELECT 1 FROM admin_users WHERE user_id = auth.uid())`) 작성
  - 최초 관리자 계정을 수동 등록하는 SQL 스크립트 작성 및 문서화

### Phase 2: 핵심 기능 구현 (더미 → 실제 데이터 연동)

> 구현 순서(스키마→이벤트→참여자→카풀→정산)를 따른다. 각 Task는 Server Actions와 RLS를 통해 실제 데이터로 교체하며, Playwright MCP E2E 테스트로 검증한다.

- **Task 005: 이벤트 CRUD 구현 (F001)** - 우선순위
  - 이벤트 생성 Server Action (Zod 재검증, organizer_id = 현재 사용자, join_type 선택 및 password_hash 저장, schedule/items_to_bring/recurrence_type/settlement_visible 저장 포함)
  - 목록 페이지 서버 컴포넌트에서 실제 events 조회 + 상태별 필터 + 블랙리스트 등록된 주최자 이벤트 제외
  - 상세 페이지 공지 탭(설명/장소/일시/현재 확정 참석자 수/일정/준비물) 표시 및 주최자 수정, 이벤트 삭제(alert-dialog 확인)
  - 주최자 권한 검증(RLS + 서버 액션 이중 확인), 저장 성공 시 상세 페이지 리다이렉트
  - Playwright MCP로 생성(3가지 join_type, 반복 설정 각 유형)→목록노출→상세(참석자 수 표시 확인)→수정→삭제 E2E 테스트

- **Task 006: 참여자 관리, 대기자 자동 승격, 강퇴 구현 (F002)**
  - 참여 신청 Server Action: `join_type`별 분기(선착순 확정/대기, 비밀번호 검증 후 확정/대기, 승인 유형은 `pending_approval` 등록)
  - 참여 취소 Server Action: 확정자 취소 시 `joined_at` 최선순 대기자 자동 "확정" 승격 (동시성 고려, DB 트랜잭션/RPC)
  - 참여자 탭에서 상태(확정/대기/승인대기/취소/강퇴) 목록 표시, 주최자 승인 처리, 강제 취소 처리
  - 강퇴 Server Action: 강퇴 사유 입력 + "사유 비공개" 체크박스(alert-dialog), `kicked` 상태 전환 및 `kicked_at`/`kick_reason`/`kick_reason_visible` 기록
  - 참여자 탭 조회 쿼리에 주최자/확정 참여자만 열람 가능하도록 접근 제어 적용(그 외 사용자는 잠금 안내)
  - Playwright MCP로 정원 초과 대기 등록/취소 시 승격, 비밀번호 검증 실패, 승인 대기→승인, 강퇴(공개/비공개), 비확정 참여자의 탭 접근 차단 시나리오 E2E 테스트

- **Task 007: 카풀 관리 구현 (F003)**
  - 확정 참여자의 운전자 등록 Server Action (좌석 수, 출발지, 출발 시간)
  - 운전자→탑승자 초대 Server Action(`initiated_by='driver'`, status `invited`) 및 탑승자→운전자 신청 Server Action(`initiated_by='passenger'`, status `requested`)
  - 초대/신청에 대한 수락·거절 Server Action: 탑승자는 자신에게 온 `invited` 건을, 운전자는 자신의 카풀에 걸린 `requested` 건을 각각 수락/거절 가능
  - 운전자가 신청을 거절(`rejected`+`initiated_by='passenger'`)하면 해당 탑승자의 동일 운전자 재신청을 서버에서 차단, 반대로 탑승자가 초대를 거절(`rejected`+`initiated_by='driver'`)한 경우는 재신청 허용
  - 초대 대상자 조회 쿼리는 현재 활성(`invited`/`requested`/`confirmed`) 상태가 아닌 확정 참여자를 모두 포함(거절 이력 있어도 재초대 가능하도록), **단 이벤트 내 다른 카풀의 운전자와 다른 운전자에게 이미 `confirmed`된 참여자는 제외**
  - 운전자 등록(운전자로 지원하기) Server Action: 신청자가 다른 운전자에게 `invited`/`requested`/`confirmed` 상태로 걸려 있으면 곧바로 등록하지 않고 상태별 확인 메시지를 반환, 클라이언트가 "무시하고 지원하기"를 확정 제출하면 기존 다른 운전자 카풀의 탑승자 레코드를 삭제한 뒤 운전자로 등록
  - 카풀 탭 UI(운전자별 카드, 초대/신청 버튼, 수락/거절 버튼, 운전자 지원 시 상태별 확인 다이얼로그) 실제 데이터 연동
  - Playwright MCP로 운전자 등록→상호 초대/신청→수락/거절→거절 후 재신청 차단·재초대 허용, 운전자 간 초대 불가, 타 운전자 확정 탑승자 초대 불가, 탑승 대상자의 운전자 지원 시 경고→무시하고 지원 시 기존 카풀 탑승 레코드 제거 E2E 테스트

- **Task 008: 정산 구현 (F004)**
  - 정산 항목 생성 Server Action (총액 입력, 확정 참여자 수로 1/N 자동 계산 후 settlement_shares 일괄 생성)
  - 참여자별 입금 완료/미완료 토글(주최자), 정산 탭 UI 실제 데이터 연동
  - 나눗셈 나머지 처리 정책 정의(예: 첫 대상자에 잔액 가산) 및 표시
  - `settlement_visible` 값에 따라 정산 탭 조회 쿼리/화면을 분기(주최자는 항상 조회, 참여자는 공개 설정 시에만 조회, 비공개 시 안내 문구 표시)
  - Playwright MCP로 항목 생성→1/N 계산 검증→완료 체크, 공개/비공개 설정별 참여자 열람 가능 여부 E2E 테스트

- **Task 008-1: 핵심 기능 통합 테스트**
  - Playwright MCP로 두 사용자 시나리오(정기 수영 강습, 비정기 캠핑+카풀) 전체 플로우 E2E 테스트
  - RLS 권한 경계(비주최자 수정 차단 등) 및 비즈니스 로직 검증
  - 정원 경계, 좌석 0, 참여자 0명 정산 등 엣지 케이스 및 에러 핸들링 테스트

- **Task 008-2: 이메일 초대 구현 (F008)**
  - 이벤트 상세에서 가입자 이메일로 초대 생성 Server Action (`invitations` insert, invitee_id는 이메일 매칭되는 가입자가 있으면 채움)
  - 초대 목록 페이지(`app/events/invitations`) 서버 컴포넌트에서 본인 초대 조회, 수락/거절 Server Action
  - 수락 시 참여자 등록(해당 이벤트 join_type 규칙 적용), 거절 시 상태만 변경
  - Playwright MCP로 초대 생성→목록 노출→수락→참여자 반영, 거절 E2E 테스트

- **Task 008-3: 블랙리스트 구현 (F009)**
  - 초대 목록에서 주최자 차단 Server Action (`blacklists` insert, unique 제약 위반 처리)
  - 이벤트 목록/초대 목록 조회 쿼리에 블랙리스트 필터링 반영
  - Playwright MCP로 차단→이벤트 목록/초대 목록에서 해당 주최자 이벤트 미노출 검증 E2E 테스트

- **Task 008-4: 친구 기능 구현 (F010)**
  - 이메일/닉네임으로 사용자 검색, 친구 요청 생성 Server Action (`friendships` insert)
  - 친구 요청 수락/거절 Server Action, 친구 목록 페이지(`app/friends`)
  - Playwright MCP로 검색→요청→수락→목록 반영 E2E 테스트

- **Task 008-5: 나의 주최/참여 이벤트 목록 구현 (F006, F007)**
  - `app/events/mine`, `app/events/joined` 페이지 서버 컴포넌트 구현, 전체/모집중/마감/종료 탭 필터
  - 주최 이벤트가 없을 때 "생성한 이벤트가 없습니다." 빈 상태 안내 컴포넌트
  - Playwright MCP로 상태별 필터 노출 및 빈 상태 안내 E2E 테스트

### Phase 3: 관리자 기능

> 관리자 기능은 권한 모델(`admin_users`)이 일반 사용자 플로우와 분리되어 있고 결합도가 낮아 별도 Phase로 분리한다.

- **Task 010: 관리자 인증 가드 및 레이아웃**
  - `app/admin/layout.tsx`에서 `admin_users` 조회 기반 서버 컴포넌트 가드 구현, 미등록 사용자는 404 처리
  - 사이드바 레이아웃(대시보드/이벤트 관리/사용자 관리/통계 분석) 구성
  - Playwright MCP로 관리자 계정 접근 허용, 일반 계정 접근 차단(404) E2E 테스트

- **Task 011: 관리자 대시보드 구현 (F011-1)**
  - 총 이벤트/총 사용자/진행 중 이벤트/이번 달 신규(이벤트/사용자) 집계 쿼리 작성
  - 최근 이벤트 목록, 최근 가입 사용자 목록 표시
  - Playwright MCP로 대시보드 통계 카드/최근 목록 렌더링 검증 E2E 테스트

- **Task 012: 관리자 이벤트 관리 구현 (F011-2)**
  - 이벤트 검색 필터, 목록 테이블(제목/이벤트 비밀번호/날짜/상태/호스트/참여자 수) 구현
  - 강제 삭제(alert-dialog 확인) Server Action, 관리자 공지 등록 모달/Server Action
  - Playwright MCP로 검색→강제 삭제→공지 등록 E2E 테스트

- **Task 013: 관리자 사용자 관리/통계 구현 (F011-3, 최소범위)**
  - 사용자 목록/검색 페이지(`app/admin/users`) 구현
  - 월별 이벤트 생성 수/신규 가입자 수 추이 조회 페이지(`app/admin/analytics`) 구현(조회 전용)
  - Playwright MCP로 사용자 검색, 통계 조회 E2E 테스트

### Phase 4: 마감 및 최적화

- **Task 014: 사용자 경험 개선 및 품질 보증** (기존 Task 009, 대상 범위를 F001~F011 전체로 확장)
  - 로딩/에러/빈 상태(Empty State) 처리, 폼 검증 피드백 정교화 (강퇴/초대/블랙리스트/친구/관리자 화면 포함)
  - 서버 컴포넌트 데이터 페칭 최적화 및 캐시 무효화(revalidatePath) 정리
  - 접근성 점검, `get_advisors` 재점검, ESLint/타입 체크 및 프로덕션 빌드 검증
