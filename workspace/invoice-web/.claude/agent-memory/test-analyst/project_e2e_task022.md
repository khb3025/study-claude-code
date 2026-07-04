---
name: project-e2e-task022
description: Task 022 고도화 기능 통합 테스트(관리자 검색/필터/링크복사/다크모드/404) 완료 및 결과
metadata:
  type: project
---

Shrimp Task 022 "고도화 기능 통합 테스트"를 2026-07-04에 Playwright MCP(Chrome 단일 브라우저)로 검증 완료. 모든 시나리오 통과, 코드 수정 없음.

**검증된 라우트 구조** (당시 기준):
- `/admin/login` — 비밀번호 로그인 폼 (`.env.local`의 `ADMIN_PASSWORD`)
- `/admin` — 대시보드 (플레이스홀더, "추후 단계에서 추가됩니다")
- `/admin/invoices` — 실제 목록/검색/필터 기능이 있는 페이지 (route group `(dashboard)` 하위)
- `/invoice/[notionPageId]` — 공개 견적서 조회, `not-found.tsx`로 404 처리
- 미들웨어 인증 가드 정상 동작 확인: 비로그인 상태로 `/admin/invoices` 접속 시 `/admin/login`으로 리다이렉트됨

**발견한 비차단 특이사항** (버그 아님, 참고용):
- `/invoice/[notionPageId]/not-found.tsx`의 "홈으로 돌아가기" 버튼이 `/`로 링크되는데, CLAUDE.md에는 "별도의 홈페이지는 없음"이라 적혀있음. 그러나 실제로는 `src/app/page.tsx`가 존재하고 정상 렌더링됨 — CLAUDE.md 문서가 코드 현황보다 오래된 것으로 보임. 재확인 필요.
- 없는 notionPageId로 404 페이지 진입 시 콘솔에 "Encountered a script tag while rendering React component" 에러가 찍히는데, 스택 출처가 `node_modules/next`의 내부 청크(devtools 관련)이며 프로젝트 소스에는 `<script>` 태그가 전혀 없음(grep 확인). Next.js 16 프레임워크 내부 이슈로 추정, 앱 코드 버그 아님.

**적용 방법:** 다음에 이 프로젝트에서 회귀 테스트할 때 위 라우트 구조를 그대로 가정하지 말고 현재 코드로 재확인할 것. PDF 다운로드 버튼은 이 시점에 `disabled` 상태였음(react-pdf/renderer 미설치, PRD 상 예정된 기능) — 이후 설치되면 별도 테스트 필요.
