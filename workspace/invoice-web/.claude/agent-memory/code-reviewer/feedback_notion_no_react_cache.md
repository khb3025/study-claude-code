---
name: feedback-notion-no-react-cache
description: getInvoiceByPageId(lib/notion.ts)는 React cache()로 감싸여있지 않아 페이지/메타데이터 중복 호출 시 Notion API가 중복 실행됨
metadata:
  type: project
---

`src/lib/notion.ts`의 `getInvoiceByPageId`는 일반 async 함수이며 React의 `cache()`로 래핑되어 있지 않다.
Next.js의 request memoization(dedupe)은 `fetch()` 호출에만 자동 적용되고, 임의의 async 함수 호출에는 적용되지 않는다.

**Why:** `generateMetadata`와 페이지 컴포넌트가 각각 `getInvoiceByPageId`를 호출하면 Notion API(페이지 조회 + 항목 조회 2단계)가 요청당 2배로 호출된다 (Task 018 리뷰에서 발견, src/app/invoice/[notionPageId]/page.tsx).

**How to apply:** Notion 관련 페이지에서 generateMetadata와 page 컴포넌트가 동일 데이터를 조회하는 패턴을 볼 때마다 확인. 개선책은 `import { cache } from "react"`로 `getInvoiceByPageId`를 감싸는 것 — Notion API 호출/응답 시간 관점에서 유의미한 성능 이슈이므로 Warning으로 지적.
