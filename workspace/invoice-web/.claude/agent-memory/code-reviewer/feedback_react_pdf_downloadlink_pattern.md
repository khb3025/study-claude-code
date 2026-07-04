---
name: react-pdf-downloadlink-pattern
description: PDFDownloadLink는 <a> 태그를 렌더링하므로 그 자식으로 Button(<button>)을 중첩하면 안 됨 — buttonVariants를 className으로 직접 적용해야 함
metadata:
  type: feedback
---

`@react-pdf/renderer`의 `PDFDownloadLink`는 내부적으로 `<a href={instance.url} download={fileName} onClick={...} {...rest}>{children}</a>` 형태로 렌더링된다 (실제 소스: `node_modules/@react-pdf/renderer/lib/react-pdf.browser.js`의 `PDFDownloadLinkBase`, 확인일 2026-07-04). `children`은 `{({ loading, error }) => ...}` render-prop 형태를 지원한다.

이 anchor 안에 `<Button>`(shadcn button.tsx가 렌더링하는 네이티브 `<button>`)을 자식으로 중첩하면 `<a><button>...</button></a>` 구조가 되어 HTML5 콘텐츠 모델 위반(인터랙티브 요소 안에 인터랙티브 요소 중첩)이 발생한다. 접근성 트리에서 링크와 버튼 두 개의 포커스 가능 요소로 노출되어 키보드 Tab 순서가 꼬이고 스크린리더가 중복된 역할을 announce한다.

**Why:** `src/components/invoice/pdf-download-button.tsx` 최초 구현(PDF 다운로드 기능, 2026-07-04 리뷰)에서 `<PDFDownloadLink>{({loading}) => <Button variant="outline" disabled={loading}>...</Button>}</PDFDownloadLink>` 패턴이 사용됨. [[buttonvariants-reuse]] 메모리에서 이미 확립된 "버튼 스타일이 필요하면 buttonVariants를 재사용" 원칙과 정확히 같은 해법으로 고칠 수 있는 케이스: `PDFDownloadLink`는 `...rest` props(className 포함)를 그대로 anchor에 전달하므로, `Button`을 중첩하지 말고 `className={buttonVariants({ variant: "outline" })}`을 `PDFDownloadLink`에 직접 적용해야 한다.

**How to apply:** `PDFDownloadLink`, `next/link`의 `<Link>`, 또는 그 외 자체 `<a>`/`<button>`을 렌더링하는 서드파티 컴포넌트를 리뷰할 때, 그 자식으로 shadcn `<Button>`(또는 다른 인터랙티브 shadcn 컴포넌트)이 중첩되어 있는지 확인. 발견 시 Critical로 지적하고 `buttonVariants()` 직접 적용 방식으로 수정 제안.

추가로, `PDFDownloadLink`의 render-prop은 `{ blob, url, loading, error }`를 제공하는데 `error`를 구조분해하지 않고 무시하는 구현이 흔함 — 폰트 CDN 실패 등으로 PDF 생성이 실패해도 사용자에게 피드백이 없는 상태가 됨. 리뷰 시 `error` 상태 처리 여부도 확인할 것.

관련: [[buttonvariants-reuse]], [[shadcn-pattern-aschild-slot]]
