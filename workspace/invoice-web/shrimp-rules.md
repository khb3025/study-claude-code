# Development Guidelines

이 문서는 AI 코딩 에이전트가 이 저장소에서 작업할 때 따라야 할 **프로젝트 전용 규칙**만 담습니다. React/Next.js 일반 지식이나 CLAUDE.md·AGENTS.md에 이미 있는 내용은 반복하지 않습니다. 작업 전 반드시 `@CLAUDE.md`, `@AGENTS.md`, `@docs/PRD.md`를 함께 참고하세요.

## 프로젝트 현재 상태

### 구현 완료

- `src/app/page.tsx` — 서비스 소개 홈페이지 (발행자/클라이언트 사용 흐름 안내)
- `src/components/shared/*`, `src/components/ui/*` — 공용 인프라
- `src/lib/constants.ts`, `src/lib/utils.ts`, `src/lib/hooks/*`

### 미구현 (PRD 정의됨, 착수 전)

- `/invoice/[notionPageId]` 견적서 조회 라우트
- 404 에러 페이지
- Notion API 연동 (`@notionhq/client` 미설치)
- PDF 다운로드 (`@react-pdf/renderer` 미설치)
- Invoice/InvoiceItem 데이터 타입 (`src/lib/types/index.ts`에 아직 없음)

**금지:** 위 미구현 기능을 "이미 있다"고 가정하고 코드를 작성하지 말 것. 작업 시작 전 `src/app/`, `src/lib/types/index.ts`를 직접 확인해 현재 상태를 재검증할 것.

## 신규 라우트 추가 규칙

### `/invoice/[notionPageId]` 구현 시

- 경로: `src/app/invoice/[notionPageId]/page.tsx` (Server Component 기본)
- Notion 데이터 조회 로직은 페이지 파일에 직접 작성하지 말고 `src/lib/notion.ts` (신규 생성)에 분리
- 존재하지 않는 `notionPageId` 접근 시 Next.js `notFound()`를 호출해 404 페이지로 위임할 것 (자체 에러 UI를 페이지 안에서 직접 그리지 말 것)
- PDF 다운로드 버튼은 클라이언트 상호작용이 필요하므로 별도 `"use client"` 하위 컴포넌트로 분리 (페이지 자체를 client component로 만들지 말 것)

### 404 에러 페이지 구현 시

- `src/app/invoice/[notionPageId]/not-found.tsx`에 작성 (전역 `src/app/not-found.tsx`가 아님 — PRD상 에러 대상이 견적서 조회 흐름에 한정되므로 라우트 스코프 유지)
- 문구는 PRD `docs/PRD.md`의 "404 에러 페이지" 섹션 문구(예: "견적서를 찾을 수 없습니다")를 따를 것

## 다중 파일 연동 규칙

Notion 데이터 모델(Invoice/InvoiceItem) 관련 기능을 추가하거나 수정할 때는 아래 파일을 **함께** 갱신할 것. 하나만 고치면 타입 불일치가 발생합니다.

1. `src/lib/types/index.ts` — `Invoice`, `InvoiceItem` 타입 정의/수정
2. `src/lib/notion.ts` (신규 생성 시) — Notion API 응답을 위 타입으로 매핑하는 함수
3. 이 타입을 사용하는 화면 컴포넌트 — props 타입을 동일하게 갱신

`SITE_CONFIG`(`src/lib/constants.ts`)의 서비스명/설명을 변경하면, `src/app/page.tsx`의 하드코딩된 문구도 함께 검토해 불일치가 없는지 확인할 것.

## 환경 변수 규칙

- Notion 연동 작업 시 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 두 값이 필요 (PRD `docs/PRD.md` 참조)
- 저장소 루트에 `.env.example`이 아직 없음 — Notion 연동 기능을 구현하는 첫 PR에서 루트에 `.env.example`을 새로 생성하고 두 키를 값 없이 등록할 것
- `mcp-shrimp-task-manager/.env.example`은 별도 하위 도구용 파일이므로 이 프로젝트의 환경 변수 문서와 혼동하지 말 것

## 데이터 타입 사용 규칙

- `src/lib/types/index.ts`의 `User` 타입은 "인증 구현 전 플레이스홀더" 주석이 붙어 있음. 이 프로젝트는 PRD상 회원가입/로그인이 없는 MVP이므로 새 기능에 `User` 타입을 사용하지 말 것. 클라이언트 식별이 필요하면 `notionPageId` 자체를 식별자로 사용할 것

## 금지 사항 (이전 스코프 재도입 금지)

다음은 이전 버전(이메일 인증 기반 견적서 열람 서비스)에서 의도적으로 제거된 것들입니다. 새 PRD와 맞지 않으므로 **재생성하지 말 것**:

- `src/lib/mock-data.ts`
- `/verify/[token]`, `/quotes/[id]`, `/error` 라우트
- 회원가입, 로그인, 이메일 인증 관련 페이지·폼·API 라우트

이런 기능이 요청되면 먼저 PRD 범위를 벗어난다는 점을 사용자에게 확인할 것.

## 로드맵/작업 관리 규칙 (`docs/ROADMAP.md` 기반)

### 현재 진행 상태

- `docs/ROADMAP.md`는 MVP 완료 이후의 고도화 계획(Phase 5~8, Task 013~024)이다. **아직 Phase 5(관리자 기능)조차 착수 전** — `src/app/`에 `/admin` 라우트가 존재하지 않고, `/tasks` 디렉터리도 아직 생성되지 않았음을 확인함
- 우선순위: `docs/PRD.md`의 MVP 범위(`/invoice/[notionPageId]`, 404, Notion 연동, PDF 다운로드)를 먼저 구현한 뒤 `docs/ROADMAP.md`의 Phase 5부터 순서대로 진행할 것. 사용자가 명시적으로 요청하지 않는 한 Phase 순서를 건너뛰지 말 것

### 작업 파일 규칙

- 새 로드맵 작업을 시작할 때 `/tasks/XXX-description.md` 형식으로 작업 파일을 생성할 것 (예: `013-admin-dashboard.md`)
- API/비즈니스 로직이 포함된 작업 파일에는 "## 테스트 체크리스트" 섹션을 반드시 포함하고 Playwright MCP 테스트 시나리오를 작성할 것
- `/tasks` 디렉터리가 비어 있는 상태이므로, 예시로 참조할 이전 작업 파일이 아직 없음 — 첫 작업 파일 작성 시 `docs/ROADMAP.md`의 "작업별 상세 구현 사항" 섹션(구현 내용/완료 기준)을 기준으로 구조를 잡을 것

### 구현 및 검증 규칙

- API 연동/비즈니스 로직 구현 후에는 Playwright MCP로 E2E 테스트를 실행하고, 통과를 확인한 뒤에만 다음 단계로 진행할 것
- 각 작업 단계 완료 후에는 임의로 다음 작업으로 넘어가지 말고 사용자의 추가 지시를 기다릴 것

### 완료 표시(✅) 규칙 — 중요

- **금지:** 실제로 동작하는 코드가 저장소에 존재하지 않는 작업을 `docs/ROADMAP.md`에서 ✅/완료로 표시하지 말 것. (과거 문서에 Task 013~015가 완료로 잘못 표시되어 있었으나, 실제 코드에는 해당 기능이 전혀 없어 바로잡은 사례가 있음)
- 작업을 완료 처리하기 전, 관련 라우트/컴포넌트/파일이 실제로 저장소에 존재하고 동작하는지 직접 확인(파일 읽기, 빌드/테스트 실행)한 뒤에만 `docs/ROADMAP.md`를 갱신할 것

## Route Group 사용 시 주의

Route Group(`(group)`)을 새로 만들 경우, 기존 라우트와 최종 URL 경로가 겹치지 않는지 반드시 확인할 것. 겹치면 Next.js 빌드 오류가 발생합니다 (`AGENTS.md`가 안내하는 대로 `node_modules/next/dist/docs/`의 라우팅 문서를 먼저 확인).

## 의사결정 기준

- 기능 요청이 `docs/PRD.md`의 "MVP 핵심 기능"/"MVP 필수 지원 기능" 표에 없고 "MVP 이후 기능 (제외)" 목록에 있다면, 구현 전 사용자에게 범위 확인을 요청할 것
- `package.json`에 없는 의존성(`@notionhq/client`, `@react-pdf/renderer` 등)이 필요한 코드를 작성하기 전에, 먼저 설치가 필요하다는 점을 사용자에게 알릴 것 (임의로 설치하지 말 것)
