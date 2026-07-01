# PRD: 개발자 이력관리 웹

> **문서 버전** v1.0
> **작성일** 2026-07-01
> **상태** 확정 (Confirmed) — 사용자와 논의를 거쳐 MVP 범위 및 기술 아키텍처 확정
> **대상 저장소** `claude-portfolio` (Next.js 16.2.9 + TypeScript + Tailwind CSS v4 + shadcn/ui `radix-nova`)

---

## 목차

1. [개요 및 목적](#1-개요-및-목적)
2. [기술 스택](#2-기술-스택)gi
3. [주요 기능](#3-주요-기능)
4. [MVP 범위](#4-mvp-범위)
5. [화면 구성](#5-화면-구성)
6. [Notion 데이터베이스 스키마](#6-notion-데이터베이스-스키마)
7. [기술 아키텍처](#7-기술-아키텍처)
8. [데이터 모델](#8-데이터-모델)
9. [API 설계](#9-api-설계)
10. [리스크 및 제약사항](#10-리스크-및-제약사항)
11. [구현 단계](#11-구현-단계)
12. [참고 문서](#12-참고-문서)

---

## 1. 개요 및 목적

### 1.1 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | 개발자 이력관리 웹 |
| 한 줄 요약 | Notion을 CMS(Headless CMS)로 활용하는 개발자 이력 개인 페이지 |
| 핵심 가치 | Notion에 작성한 이력/프로젝트 정보를 웹으로 렌더링하고, 웹 관리자 페이지에서의 수정이 Notion 원본에도 함께 반영되는 **양방향 동기화** |

### 1.2 목적

- Notion에 작성한 이력 페이지 정보를 가져와 공개 웹 페이지로 보여준다. (Read)
- 웹 관리자 페이지에서 정보를 수정하면 Notion 개인 페이지 정보도 함께 반영된다. (Write-back)
- 개발자가 Notion이라는 익숙한 편집 환경과 커스텀 웹 UI를 모두 활용해 이력을 유지·관리할 수 있게 한다.

### 1.3 배경

이 기능은 기존 `claude-portfolio` 포트폴리오 프로젝트에 신규로 추가되며, 기존 라우트 그룹 구조(`(marketing)`, `(dashboard)`)와 상수 관리(`src/lib/constants.ts`) 컨벤션을 그대로 확장한다.

---

## 2. 기술 스택

| 구분 | 스택 | 비고 |
| --- | --- | --- |
| Frontend | **Next.js 16.2.9**[^next-version], TypeScript | App Router, Server Components/Server Actions 우선 |
| CMS | Notion API (`@notionhq/client`) | **신규 의존성** — 현재 `package.json`에 없음 |
| Styling | Tailwind CSS v4, shadcn/ui (`radix-nova` 스타일) | 기존 프로젝트 컨벤션 유지 |
| Icons | Lucide React | 기존 도입됨 |
| Rich Editor | **BlockNote** (block-based, ProseMirror 기반) | **신규 도입** — write-back 에디터 |
| Validation | Zod v4 | env 스키마 검증 및 폼 검증 |
| Deployment | Vercel | ISR/캐시 재검증(`revalidateTag`) 활용 |

[^next-version]: 원 요청서에는 프론트엔드 프레임워크가 **"Next.js 15"** 로 기재되어 있었으나, 실제 저장소가 사용하는 버전에 맞춰 **Next.js 16.2.9** 로 정정하였다. Next.js 16은 breaking change를 포함하므로 구현 전 반드시 `node_modules/next/dist/docs/` 의 해당 가이드를 확인해야 한다. ([12. 참고 문서](#12-참고-문서) 참고)

---

## 3. 주요 기능

| # | 기능 | 유형 | 설명 |
| --- | --- | --- | --- |
| 1 | Notion 이력 정보 웹 렌더링 | Read | Notion 이력 관리 페이지/데이터베이스 정보를 가져와 웹 페이지로 표시 |
| 2 | 프로젝트별 필터링 | Read | 이력 내 프로젝트를 Category / Tags 기준으로 필터링 |
| 3 | **웹 → Notion 반영 (Write-back)** | Write | 웹 관리자 페이지에서 속성/본문 수정 시 Notion 이력 페이지에 양방향 반영 |
| 4 | 반응형 디자인 | UI | 모바일/태블릿/데스크톱 대응 |

> **[MVP 범위 조정 안내]** 기능 #3(Write-back)은 논의를 거쳐 MVP 범위에 **포함**하기로 확정하였다. 원 요청서에는 이 기능이 MVP/구현 단계 섹션에서 **누락**되어 있었으며, 사용자 확인을 거쳐 정정하여 본 PRD의 MVP 및 구현 단계에 반영하였다. ([4. MVP 범위](#4-mvp-범위), [11. 구현 단계](#11-구현-단계) 참고)

---

## 4. MVP 범위

MVP는 아래 4개 항목을 포함한다. (Write-back 포함이 최종 확정 사항)

| 범위 항목 | 포함 여부 | 상세 |
| --- | --- | --- |
| Notion API 연동 (읽기) | ✅ | 데이터베이스 쿼리 + 페이지 본문 blocks 조회 |
| 프로젝트별 소개 페이지 + 필터링 | ✅ | Category/Tags 기반 필터링 목록 + 상세 렌더링 |
| **웹 관리자 write-back** | ✅ | 속성(Category/Tags/Status/Published) 및 본문(Content blocks) 수정 → Notion 반영 |
| 기본 스타일링 + 반응형 | ✅ | Tailwind v4 + shadcn/ui, 반응형 검증 |

### 범위 외 (Out of Scope, MVP 제외)

- 미지원 Notion 블록 타입 렌더링/편집 (`columns`, `synced_block`, `child_database`, `table`, `toggle` 등)
- 다중 사용자/권한 관리(RBAC), 인증 시스템 고도화
- 실시간 협업 편집, 버전 히스토리/롤백 UI
- Notion → 웹 실시간 웹훅 동기화 (폴백 ISR로 대체)

---

## 5. 화면 구성

| 화면 | 경로 (파일) | 신규/확장 | 설명 |
| --- | --- | --- | --- |
| 홈 | `src/app/(marketing)/page.tsx` | 확장 | 자기소개 + 기술스택 + 프로젝트 링크 목록 |
| 프로젝트 목록/필터 | `src/app/(marketing)/projects/page.tsx` | 신규 | 카테고리/태그 필터 목록 페이지 |
| 프로젝트 상세 | `src/app/(marketing)/projects/[slug]/page.tsx` | 신규 | 프로젝트별 본문(Notion blocks) 렌더링 |
| 관리자 편집 | `src/app/(dashboard)/dashboard/resume/page.tsx` | 신규 | BlockNote 에디터 + 속성 폼 + write-back |

### 네비게이션 반영

- 관리자 편집 페이지 진입을 위해 기존 `src/lib/constants.ts`의 `SIDEBAR_ITEMS`에 메뉴 항목(예: "이력 편집" → `/dashboard/resume`)을 추가한다.
- 라우트 그룹 충돌 방지: `(marketing)`과 `(dashboard)` 그룹이 동일 URL 세그먼트를 갖지 않도록 각 페이지는 URL 세그먼트를 명시한다. (`CLAUDE.md`의 아키텍처 규칙 준수)

---

## 6. Notion 데이터베이스 스키마

| 속성명 | Notion 타입 | 설명 |
| --- | --- | --- |
| Title | `title` | 제목 |
| Category | `select` | 카테고리 (필터 기준) |
| Tags | `multi_select` | 태그 (필터 기준) |
| Published | `date` | 발행일 |
| Status | `select` | 상태 — `초안` / `발행됨` |
| Content | page content (blocks) | 본문 (블록 단위 콘텐츠) |

---

## 7. 기술 아키텍처

> 본 섹션은 PRD의 핵심이다. Read-path / Write-back / API 표면을 상세히 정의한다.

### 7.1 Read-path (읽기 경로)

#### 7.1.1 Notion 클라이언트 래퍼

- **파일** `src/lib/notion/client.ts`
- `@notionhq/client`를 감싼 **싱글턴 래퍼**로 구성하며 **서버 전용**이다.
- 인증은 `NOTION_API_KEY` 환경변수로 처리한다. (클라이언트 번들 노출 금지)

#### 7.1.2 쿼리 레이어

- **파일** `src/lib/notion/queries.ts`
- 제공 함수:
  - `queryDatabase(filter?, sort?)` — 데이터베이스 조회
  - `getPageContent(pageId)` — 페이지 본문 blocks 조회
- **Server Component / Server Action에서만 호출**한다. (클라이언트에 API 키 노출 금지)

#### 7.1.3 캐싱 전략

| 항목 | 전략 |
| --- | --- |
| 캐시 매커니즘 | `unstable_cache` / `cache()` 사용 |
| 캐시 태그 | 엔티티별 태그 — `notion-db`, `notion-page-{id}` |
| 무효화 | write-back 성공 시 해당 태그로 `revalidateTag` 호출 |
| 폴백 | Notion에서 직접 편집된 경우 대비 ISR `revalidate: 300` (초) 적용 |

#### 7.1.4 Blocks → React 변환

- 서드파티 렌더러(`react-notion-x` 등) 대신 **커스텀 최소 렌더러**를 직접 구현한다.
- **지원 블록 타입** (이 외 타입은 명시적으로 범위 제외):

  | 블록 타입 | 렌더 대상 |
  | --- | --- |
  | `paragraph` | 문단 |
  | `heading_1` / `heading_2` / `heading_3` | 제목 |
  | `bulleted_list_item` | 순서 없는 목록 |
  | `numbered_list_item` | 순서 있는 목록 |
  | `code` | 코드 블록 (`language` 포함) |
  | `image` | 이미지 (`url` / `caption`) |

- **컴포넌트 구조**:
  - `NotionBlockRenderer` — `block.type`으로 분기하여 렌더링.
  - 중첩 `children`은 `blocks.children.list` 페이지네이션으로 **재귀 처리**한다.
  - rich text span(bold / italic / code / link)은 공용 `RichText` 컴포넌트로 처리한다.

### 7.2 Write-back (양방향 동기화)

#### 7.2.1 에디터 선택 — BlockNote

- **BlockNote**(block-based, ProseMirror 기반)를 채택한다.
- **선택 이유**: Notion의 블록 모델과 스키마가 거의 1:1로 매핑되어, 마크다운 왕복 변환에 따른 데이터 손실 위험이 없다.
- 커스텀 스키마는 **read-path가 지원하는 블록 타입으로 제한**한다. (7.1.4의 지원 타입과 일치)

#### 7.2.2 본문 갱신 전략 — delete-all-children → append

- **채택**: `delete-all-children → append` 방식.
- **미채택**: diff 기반 patch 방식. 이유:
  - Notion에는 원자적 "본문 교체" API가 없다.
  - 블록 ID 안정성 문제로 diff 방식은 과도한 복잡도를 유발한다.

- **저장 시퀀스**:

  | 단계 | 작업 | 실패 대응 |
  | --- | --- | --- |
  | 1 | `pages.update`로 속성(Category/Tags/Status/Published) 갱신 | 실패 시 이후 단계 진행 안 함 |
  | 2 | 현재 children 스냅샷 확보 (롤백용) | — |
  | 3 | 기존 children 삭제 | — |
  | 4 | 새 children을 **100개 단위 배치**로 append (Notion API 배치 제한) | append 실패 시 스냅샷으로 롤백 재시도 |

  - 2~4단계는 **1단계 성공 시에만** 진행한다.
  - append 실패 시 스냅샷으로 롤백을 재시도하며, 롤백마저 실패하면 관리자에게 에러를 노출하고 수동 재시도를 안내한다.

#### 7.2.3 충돌 처리 (Conflict Handling)

- 관리자 편집 화면 **로드 시점의 `last_edited_time`** 을 폼 상태에 보관한다.
- 저장 시 Notion에서 **현재 `last_edited_time`을 재조회**하여 비교한다.
- 값이 다르면 저장을 **차단**하고 경고를 표시한다:
  > "Notion 페이지가 외부에서 수정되었습니다 — 새로고침 후 다시 시도하세요"
- **silent last-write-wins 금지** (조용한 덮어쓰기 금지).

### 7.3 API 표면 (Server Actions 우선)

- 웹과 Notion 연동 로직은 **동일 출처(same-origin)** 에서 실행되므로, 별도 Route Handler 없이 **Server Actions** 를 우선 사용한다.
- 상세 시그니처는 [9. API 설계](#9-api-설계) 참고.

---

## 8. 데이터 모델

> `src/lib/types/index.ts`에 추가할 타입. 아래는 **필드 설계 문서화**이며 실제 구현 코드가 아니다.

### 8.1 `ResumeProject`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `string` | Notion 페이지 ID |
| `slug` | `string` | URL slug |
| `title` | `string` | 제목 |
| `category` | `string` | 카테고리 (Notion `select`) |
| `tags` | `string[]` | 태그 (Notion `multi_select`) |
| `status` | `"초안" \| "발행됨"` | 상태 |
| `publishedDate` | `string` (또는 `Date`) | 발행일 |
| `lastEditedTime` | `string` | 충돌 감지용 `last_edited_time` |
| `blocks` | `NotionBlock[]` | 본문 블록 배열 |

### 8.2 `NotionBlock` (discriminated union)

- `type` 필드를 기준으로 하는 discriminated union이다.
- **공통 필드**: `id`, `richText`
- **타입별 추가 필드**:

  | `type` | 추가 필드 |
  | --- | --- |
  | `paragraph` | — |
  | `heading_1` / `heading_2` / `heading_3` | — |
  | `bulleted_list_item` / `numbered_list_item` | — |
  | `code` | `language` |
  | `image` | `url`, `caption` |

- **선택적 필드**: `children?: NotionBlock[]` (중첩 블록)

- 의사코드 (시그니처 수준 예시):

  ```ts
  type NotionBlock =
    | { type: "paragraph"; id: string; richText: RichTextSpan[]; children?: NotionBlock[] }
    | { type: "heading_1" | "heading_2" | "heading_3"; id: string; richText: RichTextSpan[]; children?: NotionBlock[] }
    | { type: "bulleted_list_item" | "numbered_list_item"; id: string; richText: RichTextSpan[]; children?: NotionBlock[] }
    | { type: "code"; id: string; richText: RichTextSpan[]; language: string }
    | { type: "image"; id: string; richText: RichTextSpan[]; url: string; caption?: string };
  ```

---

## 9. API 설계

> **Server Actions 우선.** 동일 출처이므로 별도 Route Handler는 두지 않는다.

| 함수 | 시그니처 (의사코드) | 용도 | 노출 |
| --- | --- | --- | --- |
| `getProjects` | `getProjects(filter?: { category?: string; status?: string }): Promise<ResumeProject[]>` | 목록 조회 (마케팅 페이지 + 대시보드 테이블 공용) | 공개 |
| `getProjectBySlug` | `getProjectBySlug(slug: string): Promise<ResumeProject>` | 프로젝트 상세 페이지용 | 공개 |
| `getProjectForEdit` | `getProjectForEdit(pageId: string): Promise<ResumeProject>` | 관리자 편집 폼용 (blocks + `last_edited_time` 포함) | 관리자 |
| `updateProjectMetadata` | `updateProjectMetadata(pageId: string, meta: { category; tags; status; published }): Promise<void>` | 속성 전용 write-back | 관리자 |
| `updateProjectContent` | `updateProjectContent(pageId: string, blocks: NotionBlock[], expectedLastEditedTime: string): Promise<void>` | 본문 write-back + 충돌 체크 | 관리자 |
| `revalidateProjectCache` | `revalidateProjectCache(pageId: string): void` | 캐시 재검증 헬퍼 | **내부 전용 (외부 노출 안 함)** |

### 설계 원칙

- 속성 갱신(`updateProjectMetadata`)과 본문 갱신(`updateProjectContent`)을 **분리**하여, 부분 실패 시 영향 범위를 최소화한다.
- `updateProjectContent`는 반드시 `expectedLastEditedTime`을 인자로 받아 저장 직전 충돌 검사를 수행한다. (7.2.3 참고)
- 모든 Server Action은 입력을 **Zod로 검증**하고, 에러는 한국어 메시지로 UI에 전달한다.

---

## 10. 리스크 및 제약사항

| 리스크 | 상세 | 완화 방안 |
| --- | --- | --- |
| **Rate limit** | Notion API는 초당 평균 3회 제한 | 벌크 append/delete 시 **요청 큐잉**으로 호출 속도 제어 |
| **트랜잭션 부재** | 다중 API 호출 간 원자성 보장 없음 (속성 저장 성공 + 본문 저장 실패 시 데이터 불일치 가능) | 저장 시퀀스 순서화(속성→본문) + 롤백 스냅샷 + **UI 상태 배너**로 불일치 노출 |
| **Blocks API 제약** | 배치당 최대 100블록, 중첩 depth 신뢰성 한계 | 100개 단위 배치 처리, 지원 블록 타입/depth 제한 |
| **미지원 블록** | `columns`, `synced_block`, `child_database` 등 | **명시적으로 범위 제외**, 렌더러/에디터 스키마에서 배제 |
| **시크릿 관리** | API 키 노출 위험 | `NOTION_API_KEY`, `NOTION_DATABASE_ID`는 **서버 전용 환경변수**로 관리, `NEXT_PUBLIC_*` **절대 사용 금지**, 앱 시작 시 **Zod로 env 스키마 검증** |
| **외부 편집 충돌** | Notion에서 직접 편집 시 웹 저장과 충돌 | `last_edited_time` 비교로 저장 차단 + 경고 (silent 덮어쓰기 금지) |

---

## 11. 구현 단계

> Write-back을 포함하도록 확장한 **6단계** 로드맵.

| 단계 | 작업 | 산출물 |
| --- | --- | --- |
| 1 | `@notionhq/client` 설치 + 환경 변수 설정(`NOTION_API_KEY`, `NOTION_DATABASE_ID`) + Zod 검증 | 의존성 추가, env 스키마 |
| 2 | Notion 데이터베이스 생성/스키마 확정 + read-path 구현 | `client.ts`, `queries.ts`, 타입 정의 |
| 3 | 홈 페이지 + 프로젝트 목록/필터 페이지 구현 | `(marketing)/page.tsx`, `projects/page.tsx` |
| 4 | 프로젝트 상세 페이지(`NotionBlockRenderer`) 구현 | `projects/[slug]/page.tsx`, 렌더러 컴포넌트 |
| 5 | 관리자 편집 페이지 구현 (BlockNote 에디터 + 속성 폼 + write-back Server Actions + 충돌 체크) | `dashboard/resume/page.tsx`, Server Actions |
| 6 | 스타일링 최적화 + 반응형 검증 | 반응형 QA 완료 |

---

## 12. 참고 문서

- **Next.js 16 breaking change 주의**: 구현 시 반드시 `node_modules/next/dist/docs/` 의 관련 가이드를 **먼저 확인**할 것. `AGENTS.md`에 Next.js 16이 breaking change를 포함한다는 경고가 명시되어 있다. (본 PRD의 프레임워크 버전은 원 요청서의 "Next.js 15"에서 저장소 실제 버전 "Next.js 16.2.9"로 정정됨 — [각주][^next-version] 참고)
- **Notion 연동 컨벤션**: `.claude/agents/notion-api-database-expert.md`에 정의된 컨벤션을 준수할 것.
  - 에러 핸들링 (try-catch + 적절한 에러 메시지)
  - rate limit 관리 (초당 3회 제한 고려)
  - 한국어 주석
  - TypeScript 타입 안정성 보장
  - `NOTION_API_KEY` 등 시크릿 env var 관리 (`NEXT_PUBLIC_*` 금지)
- **프로젝트 아키텍처 규칙**: `CLAUDE.md` — 라우트 그룹 충돌 주의, Server/Client 분리, 상수 중앙 관리(`src/lib/constants.ts`), shadcn `radix-nova` 스타일 컨벤션.
