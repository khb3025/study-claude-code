# Task 001: 도메인 타입 정의 및 패키지/컴포넌트 사전 설치

## 목표

`docs/PRD.md`의 6개 테이블 데이터 모델에 대응하는 임시 도메인 타입/Zod 스키마/status enum을 `types/event.ts`에 정의하고, Phase 1(UI 골격) 구현에 필요한 npm 패키지 및 shadcn/ui 컴포넌트를 설치한다. 이 산출물은 Task 002(라우트)·Task 003(UI/폼)·Task 004(DB 정합화)가 공통으로 참조하므로 필드 누락이 없어야 한다.

## 관련 파일

- `docs/PRD.md` — 데이터 모델 및 기능 요구사항 근거
- `package.json` — 현재 설치된 의존성
- `components.json` — shadcn alias(`@/components/ui`)/style(`new-york`) 설정
- `types/event.ts` (신규) — 도메인 타입/Zod 스키마/status enum

## 선행 작업

없음

## 네이밍 규칙

전역 `CLAUDE.md`는 camelCase를 기본 방침으로 하지만, 아래 항목은 의도적 예외이며 각 이유를 명시한다.

| 대상 | 규칙 | 예시 | 이유 |
|---|---|---|---|
| DB 경계 인터페이스 필드 | 스네이크케이스(DB 컬럼명 그대로) | `organizer_id`, `starts_at`, `is_paid` | Task 004에서 생성되는 Supabase `Database` 제네릭 타입과 필드명을 1:1로 맞춰 정합화 비용(매핑 계층 추가)을 없애기 위한 명시적 예외 |
| 상태 상수 객체명 | SCREAMING_SNAKE_CASE | `EVENT_STATUS`, `PARTICIPANT_STATUS` | 값이 바뀌지 않는 도메인 상수 컬렉션임을 구분 |
| Zod 스키마 변수명 | camelCase + `Schema` 접미사 | `eventFormSchema` | 프로젝트 전역 camelCase 방침 준수 + 스키마임을 식별 |
| 컴포넌트 | PascalCase | `EventCard` | 기존 컨벤션 |
| 파일명 | kebab-case | `event-card.tsx` | 기존 컨벤션(`components/` 평평한 구조) |

## 구현 단계

- [ ] npm 패키지 설치: `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`
- [ ] shadcn/ui 컴포넌트 추가(`@/components/ui` alias, new-york 스타일): `form`, `dialog`, `select`, `table`, `tabs`, `textarea`, `avatar`, `calendar`, `popover`, `alert-dialog`
- [ ] `types/event.ts`에 status enum(코드값 + 한국어 라벨 매핑) 정의
  - [ ] `EVENT_STATUS` — 모집중 / 마감 / 종료
  - [ ] `PARTICIPANT_STATUS` — 확정 / 대기 / 취소
  - [ ] `CARPOOL_PASSENGER_STATUS` — 신청 / 확정 / 거절
- [ ] `types/event.ts`에 도메인 인터페이스 정의(PRD 필드 그대로, DB 경계는 스네이크케이스)
  - [ ] `Event` — `id`, `organizer_id`, `title`, `description`, `location`, `starts_at`, `capacity`, `status`
  - [ ] `Participant` — `id`, `event_id`, `user_id`, `status`, `joined_at`
  - [ ] `Carpool` — `id`, `event_id`, `driver_id`, `seats_total`, `departure_point`, `departure_time`
  - [ ] `CarpoolPassenger` — `id`, `carpool_id`, `passenger_id`, `status`
  - [ ] `Settlement` — `id`, `event_id`, `title`, `total_amount`, `created_by`
  - [ ] `SettlementShare` — `id`, `settlement_id`, `user_id`, `amount`, `is_paid`
- [ ] 폼 입력 전용 Zod 스키마 정의(서버 생성 필드 `id`/`organizer_id`/`status` 등 제외한 부분집합)
  - [ ] `eventFormSchema` — 이벤트 생성/수정 폼(`title`, `description`, `location`, `starts_at`, `capacity`)

## 수락 기준

- [ ] 4개 npm 패키지 설치 완료
- [ ] shadcn/ui 10종 컴포넌트가 `components/ui/`에 생성됨
- [ ] `types/event.ts`가 타입 에러 없이 컴파일됨(`npm run type-check`)
- [ ] PRD 6개 테이블(`events`, `participants`, `carpools`, `carpool_passengers`, `settlements`, `settlement_shares`)의 모든 필드가 인터페이스에 매핑됨

## 이후 의존 작업

- **Task 002**(이벤트 라우트/페이지 골격)는 `types/event.ts`의 인터페이스와 status enum을 페이지 골격 타입으로 참조한다.
- **Task 003**(UI/더미 데이터)은 `eventFormSchema`와 status 라벨 매핑을 폼/배지 UI에 직접 사용한다.
- **Task 004**(DB 스키마/RLS)는 이 파일의 스네이크케이스 필드를 실제 컬럼명과 대조해 정합화한다.

필드 누락이나 네이밍 불일치가 이 문서에서 발생하면 하위 작업(002/003/004) 전체에 영향이 전파되므로, 구현 단계 완료 후 PRD 데이터 모델과 재대조할 것.
