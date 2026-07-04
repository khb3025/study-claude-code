---
name: feedback-playwright-mcp-usage
description: 이 프로젝트에서 Playwright MCP로 UI 조작 시 셀렉터/도구 선택 관련 주의사항
metadata:
  type: feedback
---

이 프로젝트의 shadcn `radix-nova` 스타일 Select(콤보박스)는 네이티브 `<select>`가 아니라 `role="combobox"` 버튼 + `role="listbox"`/`role="option"` 구조다. `mcp__playwright__browser_select_option`은 네이티브 select에만 동작하므로 실패한다.
**이유:** Radix UI 기반 커스텀 컴포넌트라서 `<select>` 엘리먼트가 아예 없음.
**적용 방법:** 상태/드롭다운 필터 등을 테스트할 때는 `browser_click`으로 콤보박스를 열고, 스냅샷에서 나온 `option` 항목을 다시 `browser_click`으로 선택하는 2단계 방식을 사용할 것.

또한 `browser_click`/`browser_type`의 `target` 파라미터는 사람이 읽기 좋은 설명 문자열이 아니라 직전 스냅샷에서 얻은 정확한 `ref` 값(예: `f22e28`)을 넣어야 안정적으로 매칭된다. 설명 문자열만 넣으면 "does not match any elements" 에러가 자주 발생했다.
