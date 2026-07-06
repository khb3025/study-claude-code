# Task 003: 공통 컴포넌트 및 더미 데이터로 UI 완성

## 목표

Task 002에서 만든 라우트 골격 위에, 이벤트 카드/목록/상태 배지/필터 UI, 생성 폼 UI(calendar+popover 날짜 선택), 상세 페이지 4개 탭(공지/참여자/카풀/정산) UI를 하드코딩 더미 데이터로 완성한다. 반응형 디자인을 확인하고, UI 작업 중 드러난 필드 요구사항 변경 사항을 Task 004로 전달할 수 있도록 문서화한다.

## 관련 파일

- `components/login-form.tsx` — 기존 폼 스타일 관례(Card+Label+Input, `grid gap-2`, `flex flex-col gap-6`) 참고
- `types/event.ts` — Task 001에서 정의된 도메인 타입/Zod 스키마/status enum
- `components/event-card.tsx` (신규) — 이벤트 카드 컴포넌트
- `components/event-status-badge.tsx` (신규) — 상태 배지 컴포넌트
- `components/event-form.tsx` (신규) — 이벤트 생성 폼 UI (RHF+Zod)
- `app/protected/events/page.tsx`, `app/protected/events/[eventId]/page.tsx` — Task 002 골격에 콘텐츠 채움

## 선행 작업

- Task 001(도메인 타입/Zod 스키마) — `event-status-badge.tsx`, `event-form.tsx`가 직접 참조
- Task 002(라우트 골격) — UI를 채워 넣을 대상 페이지

## 테스트 범위 참고

API 연동이 없는 순수 UI 작업이므로 Playwright E2E 필수 규정 대상이 아니다. 대신 아래 "브라우저 수동 확인 체크리스트"로 검증한다.

## 구현 단계

- [ ] `components/event-card.tsx` — 제목/일시/장소/상태 배지 표시, kebab-case 파일명 + PascalCase 컴포넌트(`EventCard`)
- [ ] `components/event-status-badge.tsx` — Task 001의 `EVENT_STATUS`/`PARTICIPANT_STATUS`/`CARPOOL_PASSENGER_STATUS` 한국어 라벨 매핑을 shadcn `Badge`로 표시
- [ ] `app/protected/events/page.tsx` — 더미 이벤트 배열(5~6건, 상태 혼합) 정의, `EventCard` 목록 렌더, 상태별 필터(`Tabs` 또는 `Select`)로 클라이언트 필터링
- [ ] `components/event-form.tsx` — `react-hook-form` + `zodResolver(eventFormSchema)`, `Input`(제목/장소/정원), `Textarea`(설명), `Calendar`+`Popover`(일시 선택) 구성. `login-form.tsx`의 `Card`+`CardHeader`+`CardContent` 레이아웃과 `grid gap-2` 필드 간격 관례를 따름
- [ ] `app/protected/events/[eventId]/page.tsx`의 4개 `TabsContent`에 더미 데이터 렌더
  - [ ] 공지 탭 — 더미 `description` 텍스트
  - [ ] 참여자 탭 — 더미 `Participant[]`를 `Table`로 렌더(이름/상태/신청 시각)
  - [ ] 카풀 탭 — 더미 `Carpool[]` + `CarpoolPassenger[]`를 `Table`로 렌더(운전자/좌석/출발지/탑승자 상태)
  - [ ] 정산 탭 — 더미 `Settlement[]` + `SettlementShare[]`를 `Table`로 렌더(항목/총액/참여자별 분담액/완료 여부)
- [ ] 반응형 — 이벤트 카드 목록 grid를 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`로 조정, 상세 페이지 `Tabs`는 모바일에서 가로 스크롤 또는 세로 스택 확인

## 브라우저 수동 확인 체크리스트

- [ ] `/protected/events` — 카드 목록이 더미 데이터로 렌더되고 상태 필터 클릭 시 목록이 즉시 필터링됨
- [ ] `/protected/events/new` — 폼 필드 입력, 날짜 Calendar+Popover 선택, 필수값 미입력 시 Zod 검증 에러 메시지 표시
- [ ] `/protected/events/[eventId]` — 4개 탭 전환이 정상 동작하고 각 탭에 더미 테이블이 렌더됨
- [ ] 모바일 뷰포트(375px)와 데스크톱 뷰포트(1280px)에서 레이아웃 깨짐 없음(가로 스크롤 발생 X, 텍스트 겹침 X)

## 스키마 반영 필요 사항

> UI 작업 중 PRD 데이터 모델(`docs/PRD.md`) 대비 추가/변경이 필요하다고 판단된 필드나 테이블이 있으면 아래에 기록하고, Task 004 실행 시 이 섹션을 입력으로 검토한다. (작업서 작성 시점에는 비어 있으며, 실제 UI 구현 단계에서 채워 넣는다.)

- (없음 — 구현 단계에서 발견 시 추가)

## 수락 기준

- [ ] 이벤트 목록/생성/상세(4개 탭) 화면이 모두 더미 데이터로 렌더됨
- [ ] 모바일/데스크톱 레이아웃 깨짐 없음(브라우저 수동 확인 체크리스트 완료)
- [ ] `event-form.tsx`의 Zod 검증이 Task 001의 `eventFormSchema`와 일치

## 이후 의존 작업

- **Task 004**는 이 문서의 "스키마 반영 필요 사항" 섹션을 반영해 DB 스키마를 확정한다.
