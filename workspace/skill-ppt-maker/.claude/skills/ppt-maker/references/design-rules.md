# 디자인 규칙 (RESEARCH.md 요약)

전체 리서치 근거와 출처는 프로젝트 루트의 `RESEARCH.md`를 참고. 여기서는 슬라이드 HTML을 작성할 때 실제로 지켜야 할 규칙만 정리한다.

## 좌표계 / 레이아웃
- 모든 슬라이드는 **1280×720px(16:9) 고정 좌표계**. `vw`/`vh` 금지 — 브라우저마다 값이 달라져 PDF/PPTX 변환 시 좌표가 어긋난다.
- 프리뷰 반응형은 `deck-engine.js`가 `transform: scale()`로 자동 처리한다. 슬라이드 내부 콘텐츠는 항상 절대 좌표(px) 기준으로 작성한다.
- 레이아웃은 CSS Grid named area로 구성 (`grid-template-areas`).
- **필수 규칙**: 배경·테두리·그림자는 `<div>`에만, 텍스트는 `<h1>`~`<h6>`/`<p>`/`<ul>`/`<ol>`에만 적용한다. `scripts/export-pptx.js`가 이 구분을 근거로 도형(shape)과 텍스트박스(text)를 판별하므로, 이 규칙을 어기면 PPTX 변환 결과가 틀어진다.

## 타이포그래피 & 테마
- 제목 36–44pt / 부제 15–16pt / 본문 13–14pt 이내로 유지 (deck-engine.css 기본값 사용 권장). 슬라이드당 폰트 크기 3종 이내.
- 색상은 2계층 CSS 변수(primitive → semantic)를 `deck-engine.css`의 `:root`에서 오버라이드해서 커스터마이징한다. 임의로 새 색상 시스템을 만들지 않는다.
- 다크/라이트는 `data-theme` 속성으로만 전환한다 (`prefers-color-scheme`는 PDF/PPTX 변환 시 무시될 수 있어 사용하지 않는다).
- 커스텀 폰트가 필요하면 로컬 `.woff2`를 base64로 `@font-face` 인라인한다. 외부 CDN 링크는 사용하지 않는다 (변환 시 네트워크 차단 환경에서 깨짐).

## 차트 / 데이터 시각화
- 표준 막대/선/파이 차트는 순수 CSS 또는 인라인 SVG로 직접 그린다 (예: `samples/game-platform-stats.html`의 `renderLineChart` 참고). 이런 차트 요소는 export-pptx.js가 자동으로 이미지로 캡처해 삽입한다.
- 표(`<table>`)는 헤더 강조 + 저채도 zebra striping, 숫자는 우측 정렬.
- 아이콘은 인라인 SVG 사용. PPTX 변환 시 이미지로 캡처되므로 별도 처리 불필요.

## 애니메이션
- 클릭 시 순차 등장은 `class="fragment" data-fragment-index="N"`을 요소에 부여하면 `deck-engine.js`가 자동 처리한다.
- 슬라이드 전환 애니메이션은 이번 skill 범위에 포함하지 않는다 (PPTX 네이티브 애니메이션은 pptxgenjs 지원이 약해 1차 버전에서 제외 — RESEARCH.md 4절 참고).

## Export 변환 시 알아둘 점
- **PDF**: `body.print-mode` 클래스가 슬라이드를 페이지 단위로 순차 배치한다. 커스텀 CSS를 추가할 때 `position: absolute` 남용, `overflow: hidden`에 의존하는 레이아웃은 print-mode에서 깨질 수 있으니 주의.
- **PPTX**: 하이브리드 변환이라 완벽하지 않다. 텍스트/단순 도형은 편집 가능한 네이티브 객체로, 나머지(SVG 차트, 표, 그라디언트/그림자 있는 div)는 이미지로 삽입된다. 변환 후 실제 PowerPoint에서 열어 레이아웃이 의도대로 나왔는지 확인을 권장한다.
