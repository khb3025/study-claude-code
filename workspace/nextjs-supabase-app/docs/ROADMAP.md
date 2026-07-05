# 모임 이벤트 관리 MVP 개발 로드맵

흩어진 카톡/엑셀 없이 모임의 공지·참여자·카풀·정산을 한 곳에서 처리하는 이벤트 관리 기능을 기존 스타터킷 위에 추가한다.

## 개요

**모임 이벤트 관리**는 정기/비정기 모임을 운영하는 주최자와 참여자를 위한 통합 관리 기능으로 다음을 제공합니다:

- **이벤트 생성/관리(F001)**: 주최자가 모임을 생성·수정·삭제하고 공지사항을 작성
- **참여자 관리(F002)**: 참여 신청/취소, 정원 초과 시 대기자 처리 및 취소 시 자동 승격
- **카풀 관리(F003)**: 운전자 좌석/출발 정보 등록, 탑승 신청 및 매칭 확정
- **정산(F004)**: 항목별 총액을 확정 참여자 수로 1/N 계산, 입금 완료 여부 체크

> 기존 인증(`app/auth/*`, `app/protected/*`, proxy 세션 체크)과 Supabase 클라이언트(`lib/supabase/*`)는 이미 완성되어 있어 **재사용**한다. 본 로드맵은 신규 이벤트 관리 기능 개발에만 집중한다.

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
- **DB**: `events`, `participants`, `carpools`, `carpool_passengers`, `settlements`, `settlement_shares` 6개 테이블, 전 테이블 RLS, `auth.users` 직접 FK 참조
- **신규 shadcn 컴포넌트**: form, dialog, select, table, tabs, textarea, avatar, calendar, popover, alert-dialog
- **신규 npm 패키지**: react-hook-form, zod, @hookform/resolvers, date-fns
- **상태관리**: zustand 미도입 (서버 컴포넌트 + Server Actions로 충분)

## 개발 단계

### Phase 1: UI 우선 골격 구축 및 데이터 스키마 확정

> UI/UX를 더미 데이터로 먼저 완성해 화면 요구사항을 확정한 뒤 마지막에 DB 스키마를 구축한다. 화면 작업 중 드러나는 필드/상태 변경 요구를 스키마에 한 번에 반영해 테이블 재작업을 줄이는 순서다. Task 001~003은 스키마와 독립적이므로 병렬 진행 가능하다.

- **Task 001: 도메인 타입 정의 및 패키지/컴포넌트 사전 설치** - 우선순위
  - react-hook-form, zod, @hookform/resolvers, date-fns 설치
  - 신규 shadcn 컴포넌트(form, dialog, select, table, tabs, textarea, avatar, calendar, popover, alert-dialog) 추가
  - 이벤트/참여자/카풀/정산 도메인 타입 및 Zod 스키마를 수기로 정의 (DB 스키마 확정 전이므로 `database.types.ts` 의존 없이 임시 인터페이스로 작성, 이후 Task 004에서 생성될 타입과 정합성 맞춤)
  - status enum(모집중/마감/종료, 확정/대기/취소, 신청/확정/거절) 상수화

- **Task 002: 이벤트 라우트 구조 및 페이지 골격 생성**
  - `app/protected/events/`(목록), `app/protected/events/new`(생성), `app/protected/events/[eventId]`(상세) 빈 페이지 스캐폴딩
  - 상세 페이지 공지/참여자/카풀/정산 4개 탭 골격(tabs) 구성
  - protected 영역 네비게이션에 "모임 이벤트" 진입 링크 추가

- **Task 003: 공통 컴포넌트 및 더미 데이터로 UI 완성**
  - 이벤트 카드/목록, 상태 배지, 상태별 필터 UI 구현 (하드코딩 더미 데이터)
  - 이벤트 생성 폼 UI(제목/설명/일시/장소/정원, calendar+popover 날짜 선택) 정적 구현
  - 상세 페이지 각 탭(공지·참여자 목록·카풀 목록·정산 목록) UI를 더미 데이터로 완성
  - 반응형 디자인 및 모바일 최적화, 사용자 플로우/네비게이션 검증
  - UI 작업 중 확인된 필드 추가/변경 요구사항을 정리해 Task 004 스키마 설계에 반영

- **Task 004: 데이터베이스 스키마 및 RLS 정책 구축**
  - Task 003까지 확정된 화면/필드 요구사항을 반영해 `supabase/migrations`에 6개 테이블(events, participants, carpools, carpool_passengers, settlements, settlement_shares) 생성 마이그레이션 작성
  - 각 테이블 FK(`auth.users` 직접 참조) 및 status 컬럼 CHECK 제약 정의
  - 전 테이블 RLS 활성화 및 정책 작성 (이벤트 조회는 전체 로그인 사용자, 수정/삭제는 주최자 한정 등)
  - `mcp__supabase__apply_migration`으로 원격 적용 후 `generate_typescript_types`로 `database.types.ts` 생성
  - Task 001에서 임시로 작성한 도메인 타입/Zod 스키마를 `database.types.ts` 기반으로 정합화
  - `get_advisors`로 RLS/보안 경고 점검

### Phase 2: 핵심 기능 구현 (더미 → 실제 데이터 연동)

> 구현 순서(스키마→이벤트→참여자→카풀→정산)를 따른다. 각 Task는 Server Actions와 RLS를 통해 실제 데이터로 교체하며, Playwright MCP E2E 테스트로 검증한다.

- **Task 005: 이벤트 CRUD 구현 (F001)** - 우선순위
  - 이벤트 생성 Server Action (Zod 재검증, organizer_id = 현재 사용자)
  - 목록 페이지 서버 컴포넌트에서 실제 events 조회 + 상태별 필터
  - 상세 페이지 공지사항 표시 및 주최자 수정, 이벤트 삭제(alert-dialog 확인)
  - 주최자 권한 검증(RLS + 서버 액션 이중 확인), 저장 성공 시 상세 페이지 리다이렉트
  - Playwright MCP로 생성→목록노출→상세→수정→삭제 E2E 테스트

- **Task 006: 참여자 관리 및 대기자 자동 승격 구현 (F002)**
  - 참여 신청 Server Action: 확정 인원 < 정원이면 "확정", 아니면 "대기" 등록
  - 참여 취소 Server Action: 확정자 취소 시 `joined_at` 최선순 대기자 자동 "확정" 승격 (동시성 고려, DB 트랜잭션/RPC)
  - 참여자 탭에서 상태(확정/대기/취소) 목록 표시, 주최자 강제 취소 처리
  - Playwright MCP로 정원 초과 대기 등록 및 취소 시 승격 시나리오 E2E 테스트

- **Task 007: 카풀 관리 구현 (F003)**
  - 확정 참여자의 운전자 등록 Server Action (좌석 수, 출발지, 출발 시간)
  - 탑승 신청 Server Action: 잔여 좌석 범위 내에서만 허용, 초과 시 신청 불가
  - 운전자/주최자의 탑승 신청 확정·거절 처리, 카풀 탭 UI 실제 데이터 연동
  - Playwright MCP로 운전자 등록→탑승 신청→매칭 확정/거절 및 좌석 초과 차단 E2E 테스트

- **Task 008: 정산 구현 (F004)**
  - 정산 항목 생성 Server Action (총액 입력, 확정 참여자 수로 1/N 자동 계산 후 settlement_shares 일괄 생성)
  - 참여자별 입금 완료/미완료 토글(주최자), 정산 탭 UI 실제 데이터 연동
  - 나눗셈 나머지 처리 정책 정의(예: 첫 대상자에 잔액 가산) 및 표시
  - Playwright MCP로 항목 생성→1/N 계산 검증→완료 체크 E2E 테스트

- **Task 008-1: 핵심 기능 통합 테스트**
  - Playwright MCP로 두 사용자 시나리오(정기 수영 강습, 비정기 캠핑+카풀) 전체 플로우 E2E 테스트
  - RLS 권한 경계(비주최자 수정 차단 등) 및 비즈니스 로직 검증
  - 정원 경계, 좌석 0, 참여자 0명 정산 등 엣지 케이스 및 에러 핸들링 테스트

### Phase 3: 마감 및 최적화

- **Task 009: 사용자 경험 개선 및 품질 보증**
  - 로딩/에러/빈 상태(Empty State) 처리, 폼 검증 피드백 정교화
  - 서버 컴포넌트 데이터 페칭 최적화 및 캐시 무효화(revalidatePath) 정리
  - 접근성 점검, `get_advisors` 재점검, ESLint/타입 체크 및 프로덕션 빌드 검증
