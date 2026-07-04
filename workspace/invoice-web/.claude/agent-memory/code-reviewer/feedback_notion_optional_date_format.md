---
name: notion-optional-date-format-crash
description: Notion 선택적 date/rich_text 속성은 빈 문자열로 매핑되므로 formatDate에 그대로 넘기면 런타임 크래시 발생
metadata:
  type: feedback
---

`src/lib/notion.ts`의 `extractDateStart()`는 Notion 페이지에 date 속성이 비어있으면 빈 문자열(`""`)을 반환한다 (null이 아님). 이 값을 `src/lib/utils.ts`의 `formatDate()`에 그대로 넘기면 내부적으로 `new Date("")` → Invalid Date → `Intl.DateTimeFormat.format()`이 `RangeError: Invalid time value`를 throw하여 페이지 렌더링이 크래시된다.

**Why:** Notion 견적서 DB는 사람이 수동으로 입력하는 데이터 소스라 발행일/유효기간 같은 date 속성이 비어있는 케이스가 실제로 발생하기 쉽다. `getInvoiceByPageId()`가 이런 레코드를 정상적으로 `Invoice` 객체로 반환하기 때문에(에러가 아님), 호출부(페이지 컴포넌트)에서 빈 문자열을 걸러내지 않으면 그대로 크래시로 이어진다. `invoice/[notionPageId]/page.tsx` 최초 구현(Task 002) 리뷰에서 발견 — `formatDate(invoice.issueDate)` / `formatDate(invoice.validUntil)`를 가드 없이 호출하고 있었음.

**How to apply:** Notion에서 가져온 `Invoice`/`InvoiceItem`의 date 필드(`issueDate`, `validUntil` 등)를 `formatDate()`에 넘기는 코드를 리뷰할 때는 항상 빈 문자열 케이스를 확인할 것. `formatCurrency`/`formatNumber`에 넘기는 number 필드들은 `extractNumber*` 계열 함수가 `?? 0`으로 기본값 처리하므로 상대적으로 안전하지만, date 계열은 빈 문자열 기본값이라 위험하다. 수정 제안: `invoice.issueDate ? formatDate(invoice.issueDate) : "미정"` 같은 폴백 처리, 또는 `formatDate` 자체에 빈 문자열/Invalid Date 가드를 추가하는 것을 권장.

**중복 확산 주의 (2026-07-04, PDF 다운로드 기능 리뷰):** 동일한 `formatDateOrFallback()` 함수가 `src/app/invoice/[notionPageId]/page.tsx`에 이어 `src/components/invoice/pdf-download-button.tsx`에도 토씨 하나 안 틀리고 복붙되어 두 파일에 중복 존재. 이 파일이 늘어날 때마다(예: 추후 이메일 발송 템플릿, 인쇄 뷰 등) 같은 함수가 계속 복제될 위험이 높음. 리뷰 시 이 함수가 3번째 파일에 또 복붙되는지 확인하고, 발견되면 `lib/utils.ts` 또는 별도 invoice 전용 유틸 파일로 추출해 단일 소스로 공유하도록 Warning으로 지적할 것.
