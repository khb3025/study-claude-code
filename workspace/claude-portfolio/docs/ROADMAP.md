# 개발자 이력관리 웹 개발 로드맵

Notion을 Headless CMS로 활용해, 웹에서 이력을 렌더링하고 관리자 페이지의 수정이 Notion 원본에도 반영되는 **양방향 동기화** 개발자 이력 개인 페이지.

## 개요

개발자 이력관리 웹은 **개발자 본인(관리자)과 이력을 열람하는 방문자**를 위한 Notion 기반 이력 관리 서비스로, 다음 기능을 제공합니다:

- **Notion 이력 정보 웹 렌더링(Read)**: Notion 데이터베이스/페이지 blocks를 가져와 공개 웹 페이지로 표시
- **프로젝트별 필터링(Read)**: Category / Tags 기준 프로젝트 목록 필터링 및 상세 렌더링
- **웹 → Notion 반영(Write-back)**: 관리자 편집 화면에서 속성/본문 수정 시 Notion 이력 페이지에 양방향 반영
- **반응형 디자인(UI)**: 모바일 / 태블릿 / 데스크톱 대응

> 본 로드맵은 `docs/PRD.md`(v1.0, 확정)를 **구조 우선 접근법(Structure-First Approach)** 에 맞게 재분해한 것입니다. PRD의 "11. 구현 단계"(6단계)를 그대로 옮기지 않고, 골격 → UI(더미) → 핵심 로직 → 최적화 순으로 재배열했습니다.

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - `/tasks` 디렉토리에 새 작업 파일 생성
   - 명명 형식: `XXX-description.md` (예: `001-setup.md`)
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API / 비즈니스 로직 작업 시 "## 테스트 체크리스트" 섹션 필수 포함 (Playwright MCP 테스트 시나리오 작성)**
   - 예시를 위해 마지막 완료된 작업 참조. 초기 상태 샘플은 `000-sample.md` 참조.

3. **작업 구현**
   - 작업 파일의 명세서를 따름
   - **Notion 연동 및 write-back Server Actions 구현 시 Playwright MCP로 테스트 수행 필수**
   - 각 단계 후 작업 파일 내 진행 상황 업데이트
   - 구현 완료 후 Playwright MCP E2E 테스트 실행 및 통과 확인
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 로드맵에서 완료된 작업을 ✅로 표시

## 아키텍처 준수 사항 (전 Task 공통)

- **라우트 그룹 충돌 주의**: `(marketing)`과 `(dashboard)`가 동일 URL 세그먼트를 갖지 않도록 각 페이지는 URL 세그먼트를 명시 (`(dashboard)/dashboard/resume/page.tsx` → `/dashboard/resume`)
- **Server / Client 분리**: `useState`, `usePathname`, BlockNote 등 브라우저 API 필요 시에만 `"use client"` 명시
- **상수 중앙 관리**: 네비/사이드바 항목은 `src/lib/constants.ts`에서 관리 (`SIDEBAR_ITEMS`에 "이력 편집" → `/dashboard/resume` 추가)
- **시크릿 관리**: `NOTION_API_KEY`, `NOTION_DATABASE_ID`는 서버 전용 env, `NEXT_PUBLIC_*` 절대 금지, 앱 시작 시 Zod로 env 스키마 검증
- **Next.js 16 breaking change**: 구현 전 반드시 `node_modules/next/dist/docs/` 관련 가이드 확인 (AGENTS.md 경고)
- **Notion 연동 컨벤션**: `.claude/agents/notion-api-database-expert.md` 준수 (try-catch 에러 핸들링, rate limit 초당 3회 고려, 한국어 주석, 타입 안정성)

---

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

> **목적**: 실제 Notion 연동 전에, 라우트 구조 · 타입 · 서버 전용 클라이언트 골격 · 환경변수 검증을 먼저 완성한다. 이 Phase가 이후 모든 Phase의 타입/파일 기반이 되므로 가장 먼저 수행한다.
>
> **왜 이 순서인가**: 타입(`ResumeProject`, `NotionBlock`)과 라우트 골격이 먼저 확정되어야 Phase 2의 UI가 동일한 타입 계약 위에서 더미 데이터를 구성할 수 있고, Phase 3의 Notion 연동이 이미 정의된 함수 시그니처를 채우는 방식으로 진행될 수 있다. 여기서 만드는 것은 대부분 "빈 껍데기"이므로 외부 의존성(Notion 실계정)이 없어 병렬 착수가 쉽다.

- **Task 001: 프로젝트 의존성 설치 및 환경변수 검증 설정** - 우선순위
  - **작업 내용**
    - `@notionhq/client`, BlockNote(`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`) 설치
    - `NOTION_API_KEY`, `NOTION_DATABASE_ID` 서버 전용 환경변수 정의 (`.env.local`, `.env.example`)
    - `src/lib/env.ts` — Zod로 env 스키마 검증(앱 시작 시 실패하면 즉시 throw)
    - `NEXT_PUBLIC_*` 미사용 확인, 클라이언트 번들 노출 금지 가드
  - **의존성 / 순서 이유**: 이후 모든 Notion 관련 코드가 env와 SDK에 의존하므로 최우선. 다른 어떤 Task에도 의존하지 않는 무의존 작업.
  - **예상 소요시간**: 0.5일
  - **완료 기준**
    - `npm run build` 성공, `npx tsc --noEmit` 오류 없음
    - env 누락 시 명확한 한국어 에러 메시지와 함께 앱이 기동 실패
    - `package.json`에 신규 의존성 반영, `.env.example`에 키 문서화

- **Task 002: 타입 정의 및 인터페이스 설계**
  - **작업 내용**
    - `src/lib/types/index.ts`에 `ResumeProject`(id, slug, title, category, tags, status, publishedDate, lastEditedTime, blocks) 추가
    - `NotionBlock` discriminated union 정의 (paragraph / heading_1·2·3 / bulleted·numbered list / code / image), `RichTextSpan`(bold·italic·code·link) 타입
    - Server Action 시그니처 타입 스텁 정의: `getProjects`, `getProjectBySlug`, `getProjectForEdit`, `updateProjectMetadata`, `updateProjectContent`, `revalidateProjectCache`
    - 미지원 블록 타입(columns/synced_block/child_database/table/toggle)은 타입에서 명시적으로 제외
  - **의존성 / 순서 이유**: UI(Phase 2)와 로직(Phase 3)이 공유하는 타입 계약. 타입이 먼저 있어야 더미 데이터와 실제 데이터가 동일 형태로 교체 가능. `any` 금지 원칙 준수.
  - **예상 소요시간**: 1일
  - **완료 기준**
    - `NotionBlock`이 discriminated union으로 `type` 기준 좁혀지고 `any` 미사용
    - `npx tsc --noEmit` 통과
    - 모든 Server Action 시그니처가 타입 레벨로 선언(구현 없이 스텁 가능)

- **Task 003: 라우트 골격 및 네비게이션 구성**
  - **작업 내용**
    - 빈 껍데기 페이지 생성: `(marketing)/projects/page.tsx`, `(marketing)/projects/[slug]/page.tsx`, `(dashboard)/dashboard/resume/page.tsx`
    - 홈(`(marketing)/page.tsx`) 확장 지점(자기소개 + 기술스택 + 프로젝트 링크 섹션) 자리 표시자 마련
    - `src/lib/constants.ts` `SIDEBAR_ITEMS`에 "이력 편집" → `/dashboard/resume` 추가, 마케팅 네비에 "프로젝트" → `/projects` 추가
    - 라우트 그룹 충돌 검증: `(marketing)`과 `(dashboard)`가 동일 URL 세그먼트를 갖지 않는지 확인
  - **의존성 / 순서 이유**: Task 002의 타입을 import해 페이지 props 형태를 잡되, 실제 데이터/UI는 비움. 라우트가 먼저 서야 Phase 2에서 각 페이지 UI를 독립적으로 채울 수 있음.
  - **예상 소요시간**: 1일
  - **완료 기준**
    - 4개 신규 경로가 모두 200으로 렌더(빈 상태라도)
    - 라우트 그룹 URL 세그먼트 충돌로 인한 빌드 오류 없음
    - 사이드바/네비에서 신규 페이지로 이동 가능

- **Task 004: Notion 클라이언트 & 쿼리 레이어 골격**
  - **작업 내용**
    - `src/lib/notion/client.ts` — `@notionhq/client` 싱글턴 래퍼(서버 전용, `NOTION_API_KEY` 사용), `import "server-only"` 가드
    - `src/lib/notion/queries.ts` — `queryDatabase(filter?, sort?)`, `getPageContent(pageId)` 함수 시그니처 및 골격(실 호출은 Phase 3에서 채움)
    - 캐싱 전략 골격: `unstable_cache`/`cache()` 래핑 위치, 태그 상수(`notion-db`, `notion-page-{id}`) 정의
    - rate limit 대비 요청 큐잉 유틸의 인터페이스 스텁
  - **의존성 / 순서 이유**: Task 001(SDK/env), 002(타입)에 의존. 서버 전용 경계를 Phase 1에서 확정해두면 Phase 3에서 로직만 채우면 되고, 클라이언트 번들에 키가 새는 실수를 구조적으로 차단.
  - **예상 소요시간**: 1일
  - **완료 기준**
    - `client.ts`/`queries.ts`가 `server-only`로 보호되어 클라이언트 컴포넌트에서 import 시 빌드 에러
    - 함수 시그니처가 PRD 9장 API 설계와 일치
    - `npx tsc --noEmit` 통과

---

### Phase 2: UI/UX 완성 (더미 데이터 활용)

> **목적**: 실제 Notion 연동 없이, 하드코딩된 더미 `ResumeProject[]`로 모든 화면 UI를 완성한다. 전체 사용자 플로우를 초기에 체험 가능하게 만든다.
>
> **왜 이 순서인가**: Notion API는 rate limit·인증·외부 상태 등 불확실성이 크므로, UI는 그와 분리해 안정적인 더미 데이터 위에서 먼저 완성한다. Phase 3에서 더미 데이터를 실제 Server Action 호출로 "교체"만 하면 되도록 데이터 소스를 한 곳(더미 모듈)에 격리한다. UI팀과 백엔드팀 병렬 작업 가능.

- **Task 005: 더미 데이터 및 공용 UI 컴포넌트 구축**
  - **작업 내용**
    - `src/lib/notion/dummy.ts` — 타입에 맞는 더미 `ResumeProject[]`(다양한 category/tags/status/blocks 포함) 작성
    - 공용 컴포넌트: 프로젝트 카드, 필터 바(Category select + Tags multi), 상태 배지, 빈 상태(Empty) 컴포넌트
    - shadcn/ui `radix-nova` 스타일 준수, 기존 `page-header`·`section` 래퍼 재사용
  - **의존성 / 순서 이유**: Phase 3에서 더미를 실제 API로 교체할 때 소스가 한 파일에 모여 있어야 교체 영향도가 작음. 공용 컴포넌트를 먼저 만들어 목록/상세 페이지에서 중복 구현 방지.
  - **예상 소요시간**: 1.5일
  - **완료 기준**
    - 더미 데이터가 `ResumeProject`/`NotionBlock` 타입을 100% 만족(`tsc` 통과)
    - 카드/필터/배지 컴포넌트가 Storybook 없이도 예제 페이지에서 렌더 확인 가능

- **Task 006: 홈 + 프로젝트 목록/필터 페이지 UI**
  - **작업 내용**
    - 홈: 자기소개 + 기술스택 + 프로젝트 링크 목록 섹션 완성(더미 기반)
    - 프로젝트 목록(`projects/page.tsx`): Category/Tags 필터 UI + 필터링된 카드 그리드(클라이언트 상태로 더미 필터링)
    - 반응형 그리드(모바일 1열 / 태블릿 2열 / 데스크톱 3열)
  - **의존성 / 순서 이유**: Task 005의 컴포넌트/더미에 의존. 필터 로직을 UI 레벨에서 먼저 검증하면 Phase 3에서 서버 필터로 옮길 때 동작 기준이 명확.
  - **예상 소요시간**: 2일
  - **완료 기준**
    - Category/Tags 필터 조작 시 카드 목록이 즉시 갱신
    - 3개 브레이크포인트에서 레이아웃 깨짐 없음
    - 카드 클릭 시 상세 경로(`/projects/[slug]`)로 이동

- **Task 007: 프로젝트 상세 + NotionBlockRenderer UI**
  - **작업 내용**
    - `NotionBlockRenderer` 구현: `block.type` 분기 렌더(paragraph, heading_1·2·3, bulleted/numbered list, code(`language`), image(`url`/`caption`))
    - 공용 `RichText` 컴포넌트(bold/italic/code/link span 처리)
    - 중첩 `children` 재귀 렌더링
    - 상세 페이지(`projects/[slug]/page.tsx`)에서 더미 blocks로 렌더 확인
  - **의존성 / 순서 이유**: 렌더러는 read-path의 최종 출력물이자 write-back 스키마 제한의 기준(지원 블록 = 편집 가능 블록). Phase 3의 실제 blocks 조회보다 먼저 더미 blocks로 렌더러를 검증해두면 연동 시 렌더 이슈와 데이터 이슈를 분리 진단 가능.
  - **예상 소요시간**: 2일
  - **완료 기준**
    - 지원 6개 블록 타입 + rich text span 4종이 시각적으로 정확히 렌더
    - 중첩 리스트(children)가 재귀적으로 렌더
    - 미지원 블록은 조용히 무시되거나 명시적 플레이스홀더 처리(크래시 없음)

- **Task 008: 관리자 편집 페이지 UI (BlockNote + 속성 폼)**
  - **작업 내용**
    - `dashboard/resume/page.tsx`에 BlockNote 에디터(`"use client"`) 배치, 커스텀 스키마를 지원 블록 타입으로 제한
    - 속성 폼(Category select / Tags multi-select / Status select / Published date) — React Hook Form + Zod
    - 저장 버튼 · 저장 상태 배너(성공/실패/충돌) UI 자리 마련(동작은 Phase 3)
  - **의존성 / 순서 이유**: 에디터 스키마는 Task 007 렌더러 지원 타입과 1:1 일치해야 하므로 그 뒤. 폼/에디터 UI를 먼저 세워야 Phase 3에서 Server Action만 연결하면 됨.
  - **예상 소요시간**: 2일
  - **완료 기준**
    - BlockNote 에디터가 지원 블록만 편집 가능하도록 스키마 제한
    - 속성 폼이 Zod 검증으로 잘못된 입력 시 한국어 에러 표시
    - 저장/충돌/실패 배너 UI가 상태에 따라 표시(더미 상태 토글로 확인)

---

### Phase 3: 핵심 기능 구현 (Notion 실연동)

> **목적**: Phase 2의 더미 데이터를 실제 Notion 연동으로 교체하고, write-back Server Actions와 충돌 처리를 구현한다.
>
> **왜 이 순서인가**: UI가 안정화된 뒤에 연동해야, 문제 발생 시 "UI 문제 vs 연동 문제"를 구분할 수 있다. 읽기(read-path)를 먼저 실연동해 데이터 형태를 검증한 뒤, 더 위험한 쓰기(write-back)를 진행한다.

- **Task 009: Read-path 실연동 (queryDatabase / getPageContent + 캐싱)** - 우선순위
  - **작업 내용**
    - `queryDatabase`, `getPageContent` 실제 구현 (Notion 응답 → `ResumeProject`/`NotionBlock` 매핑)
    - `getProjects(filter?)`, `getProjectBySlug(slug)`, `getProjectForEdit(pageId)` Server Action 구현 (모두 Zod 입력 검증)
    - `unstable_cache`/`cache()` + 태그(`notion-db`, `notion-page-{id}`) 적용, ISR `revalidate: 300` 폴백
    - 페이지네이션(`blocks.children.list`) 재귀 처리, rate limit 요청 큐잉 적용
    - 더미 데이터 소스를 실제 Server Action 호출로 교체
  - **의존성 / 순서 이유**: Phase 1의 client/queries 골격과 Phase 2의 UI에 의존. write-back(Task 010)이 읽기 결과 형태와 `last_edited_time`에 의존하므로 읽기를 먼저 완성.
  - **예상 소요시간**: 3일
  - **완료 기준**
    - 실제 Notion DB 데이터가 목록/상세 페이지에 정확히 렌더
    - 캐시 태그 기반 조회 동작, 300초 ISR 폴백 확인
    - rate limit(초당 3회) 초과 없이 대량 blocks 조회 성공
    - 모든 Server Action이 Zod 검증 + try-catch 한국어 에러 반환
  - **## 테스트 체크리스트 (Playwright MCP)**
    - `/projects` 접속 → 실제 Notion 프로젝트 목록이 렌더되는지 확인
    - Category/Tags 필터 적용 → 서버 필터 결과가 목록에 반영되는지 확인
    - `/projects/[slug]` 상세 진입 → 지원 6개 블록 타입이 모두 정상 렌더되는지 확인
    - 네트워크 요청 관찰 → `NOTION_API_KEY`가 클라이언트로 노출되지 않는지 확인
    - 존재하지 않는 slug 접근 → 404/에러 UI가 크래시 없이 표시되는지 확인
    - 캐시 재검증: 데이터 조회 반복 시 rate limit 에러 없이 응답하는지 확인

- **Task 010: Write-back Server Actions 및 충돌 처리**
  - **작업 내용**
    - `updateProjectMetadata(pageId, meta)` — `pages.update`로 Category/Tags/Status/Published 갱신 (Zod 검증)
    - `updateProjectContent(pageId, blocks, expectedLastEditedTime)` — 저장 시퀀스 구현:
      1. 속성 갱신 성공 시에만 진행
      2. 현재 children 스냅샷 확보(롤백용)
      3. 기존 children 삭제
      4. 신규 children 100개 배치 append (실패 시 스냅샷 롤백 재시도)
    - 충돌 처리: 저장 직전 `last_edited_time` 재조회 → `expectedLastEditedTime`과 불일치 시 저장 차단 + 경고("Notion 페이지가 외부에서 수정되었습니다 — 새로고침 후 다시 시도하세요"). silent last-write-wins 금지
    - `revalidateProjectCache(pageId)` 내부 헬퍼로 `revalidateTag` 호출 (외부 노출 안 함)
    - BlockNote 블록 ↔ `NotionBlock` 양방향 변환 로직
    - 부분 실패 시 UI 상태 배너로 불일치 노출
  - **의존성 / 순서 이유**: Task 009의 읽기 결과(`last_edited_time`, blocks 형태)와 Task 008의 에디터 UI에 의존. 가장 위험도 높은 작업이라 읽기 안정화 이후 마지막 핵심 기능으로 배치.
  - **예상 소요시간**: 4일
  - **완료 기준**
    - 웹에서 속성/본문 수정 → Notion 원본에 정확히 반영
    - 저장 성공 시 캐시 재검증되어 공개 페이지에 즉시 반영
    - 외부에서 Notion을 먼저 수정한 뒤 저장 시도 → 충돌 경고로 저장 차단(덮어쓰기 안 됨)
    - append 실패 시 스냅샷 롤백이 동작하고, 롤백 실패 시 관리자에게 수동 재시도 안내
  - **## 테스트 체크리스트 (Playwright MCP)**
    - 관리자 편집 페이지 진입 → 실제 blocks + 속성이 폼/에디터에 로드되는지 확인
    - 속성만 수정 후 저장 → Notion 속성 반영 & 성공 배너 확인
    - 본문 블록 추가/수정 후 저장 → delete-all-children → append 후 Notion 본문 반영 확인
    - 저장 후 공개 상세 페이지 재방문 → 변경 내용이 캐시 재검증되어 반영되는지 확인
    - 충돌 시나리오: 편집 화면 로드 후 Notion을 외부 수정 → 저장 시 충돌 경고 노출 & 저장 차단 확인
    - Zod 검증: 잘못된 속성 값 저장 시도 → 한국어 에러 반환 확인
    - 롤백: append 강제 실패 유도 → 스냅샷 롤백 동작 및 UI 배너 확인

- **Task 010-1: 핵심 기능 통합 테스트**
  - **작업 내용**
    - Playwright MCP로 전체 사용자 플로우 E2E 테스트(홈 → 목록 → 필터 → 상세 → 관리자 편집 → 저장 → 공개 반영)
    - read-path + write-back 연계 검증(저장 후 캐시 무효화 → 공개 페이지 반영)
    - 에러 핸들링 및 엣지 케이스: rate limit, 네트워크 실패, 미지원 블록, 빈 데이터, 충돌
  - **의존성 / 순서 이유**: Task 009·010 완료 후 전체 연동을 통합 검증. 개별 Task 테스트가 놓친 상호작용 결함을 잡는 관문.
  - **예상 소요시간**: 1.5일
  - **완료 기준**
    - 전체 사용자 플로우 E2E 시나리오 전부 통과
    - 정의된 엣지 케이스에서 크래시 없이 한국어 에러/폴백 UI 표시
  - **## 테스트 체크리스트 (Playwright MCP)**
    - 엔드투엔드 플로우 1회 완주(열람 → 편집 → 저장 → 반영)
    - Notion API 장애 모의(잘못된 토큰) → 전 페이지가 우아하게 실패하는지 확인
    - 미지원 블록이 포함된 페이지 → 렌더러/에디터가 크래시 없이 처리하는지 확인
    - 동시/연속 저장 → 충돌 감지가 일관되게 동작하는지 확인

---

### Phase 4: 고급 기능 및 최적화

> **목적**: 캐싱·rate limit 전략을 실측 기반으로 튜닝하고, 반응형/접근성 최종 QA 및 배포 파이프라인을 완성한다.
>
> **왜 이 순서인가**: 최적화는 실제 동작하는 기능(Phase 3)이 전제. 성급한 최적화를 피하고, 기능 완성 후 병목이 확인된 지점을 개선한다.

- **Task 011: 캐싱 · Rate limit · 안정성 최적화**
  - **작업 내용**
    - 캐시 태그 무효화 범위 정교화(속성만 변경 vs 본문 변경 시 무효화 태그 구분)
    - rate limit 요청 큐잉 튜닝(백오프/재시도), 벌크 append/delete 큐 검증
    - 트랜잭션 부재 대비 UI 상태 배너/로그 강화(부분 실패 가시화)
    - 로딩/에러 바운더리, Suspense 경계 정리
  - **의존성 / 순서 이유**: Phase 3 실동작에서 측정된 병목/실패 패턴을 근거로 개선하므로 마지막.
  - **예상 소요시간**: 2일
  - **완료 기준**
    - 대량 저장(100+ 블록) 시 rate limit 에러 0건
    - 속성-only 저장 시 불필요한 상세 캐시 무효화가 발생하지 않음
    - 부분 실패 상황이 UI 배너/로그로 100% 가시화

- **Task 012: 반응형 · 접근성 최종 QA 및 배포**
  - **작업 내용**
    - 모바일/태블릿/데스크톱 3개 브레이크포인트 전 페이지 반응형 QA
    - 다크모드 대비, 키보드 내비게이션/포커스, 대비비 등 접근성 점검
    - Vercel 배포 설정, 서버 전용 env 주입 확인(`NEXT_PUBLIC_*` 부재 재확인)
    - `npm run build` / `npm run lint` / `npx tsc --noEmit` 클린 상태 확보
  - **의존성 / 순서 이유**: 모든 기능/최적화 완료 후 최종 릴리즈 게이트. 배포 전 마지막 검증.
  - **예상 소요시간**: 1.5일
  - **완료 기준**
    - 3개 브레이크포인트 전 페이지 레이아웃 이상 없음
    - lint/타입/빌드 무오류, Vercel 프리뷰 배포 성공
    - 프로덕션 번들에 Notion 시크릿 노출 0건
  - **## 테스트 체크리스트 (Playwright MCP)**
    - 뷰포트 리사이즈(모바일/태블릿/데스크톱)별 스크린샷 회귀 확인
    - 다크/라이트 모드 토글 시 전 페이지 렌더 확인
    - 키보드만으로 주요 플로우(내비 → 필터 → 상세 → 편집) 이동 가능 확인
    - 배포 프리뷰 URL에서 핵심 플로우 스모크 테스트

---

## 진행 요약

| Phase | 목표 | Task 수 | 예상 소요 |
| --- | --- | --- | --- |
| Phase 1 | 애플리케이션 골격 구축 | 4 (001~004) | 약 3.5일 |
| Phase 2 | UI/UX 완성 (더미 데이터) | 4 (005~008) | 약 7.5일 |
| Phase 3 | 핵심 기능 구현 (Notion 실연동) | 3 (009, 010, 010-1) | 약 8.5일 |
| Phase 4 | 고급 기능 및 최적화 | 2 (011~012) | 약 3.5일 |

> 모든 Task는 현재 **미완료** 상태입니다. 완료 시 Task 옆에 `✅ - 완료` 및 `See: /tasks/XXX-*.md` 참조를 추가하고, 세부 구현 항목을 체크박스로 전환하세요.
