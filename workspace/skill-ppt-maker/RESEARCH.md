# PPT 생성 Skill 리서치 문서

HTML/CSS/JavaScript 기반으로 PowerPoint 슬라이드를 생성하는 skill을 설계하기 위해 5개 분야(레이아웃/그리드, 타이포그래피/테마, 차트/데이터시각화, 애니메이션/트랜지션, Export 변환 파이프라인)로 나눠 진행한 리서치 결과를 정리한다.

> **참고**: Anthropic 공식 [`anthropics/skills`](https://github.com/anthropics/skills) 저장소에 이미 `pptx/html2pptx.md`, `pptx/pptxgenjs.md`라는 유사 스킬 선례가 존재한다. 이번 설계에서 좌표계, div/텍스트 분리 규칙 등 다수를 그대로 채택했다.

---

## 1. 레이아웃 / 그리드 엔진

### 결론
- 좌표계는 **1280×720px(16:9) 고정**을 기준으로 한다. pptxgenjs 관례상 720×405pt와 매핑하기 쉽고, `vw`/`vh` 같은 상대 단위는 브라우저마다 값이 달라져 좌표 오차가 생기므로 배제한다.
- 반응형 프리뷰는 `transform: scale(ratio); transform-origin: top left`로 처리한다 (`ratio = min(windowWidth/1280, windowHeight/720)`). 실제 export 좌표에는 영향을 주지 않는, 프리뷰 전용 계층으로 취급한다. reveal.js, bespoke-scale이 채택한 표준 패턴이다.
- CSS Grid의 named area로 마스터 슬라이드 템플릿을 구성한다. 예: `grid-template-areas: "title title" "body image"`.
- **핵심 규칙**: 배경색·테두리·그림자는 `<div>`에만, 텍스트는 `<p>`, `<h1>`~`<h6>`, `<ul>`, `<ol>`에만 적용한다. 이는 html2pptx가 이미 검증한 규칙으로, PPTX 변환기가 이 구분을 근거로 "도형(shape)"과 "텍스트박스"를 판별할 수 있게 한다.
- impress.js는 `data-x/y/z`, `data-scale` 등 px 고정값만 허용하며 상대 단위를 지원하지 않는다 — 좌표계를 반드시 고정해야 한다는 점에서 결론과 일치한다.

### 출처
- [Presentation Size | reveal.js](https://revealjs.com/presentation-size/)
- [Layout | reveal.js](https://revealjs.com/layout/)
- [GitHub - bespokejs/bespoke-scale](https://github.com/bespokejs/bespoke-scale)
- [Scaled/Proportional Content with CSS and JavaScript | CSS-Tricks](https://css-tricks.com/scaled-proportional-blocks-with-css-and-javascript/)
- [skills/skills/pptx/html2pptx.md · anthropics/skills](https://github.com/anthropics/skills/blob/main/skills/pptx/html2pptx.md)
- [skills/skills/pptx/pptxgenjs.md · anthropics/skills](https://github.com/anthropics/skills/blob/main/skills/pptx/pptxgenjs.md)
- [What unit is width and height from presLayout? · gitbrent/PptxGenJS](https://github.com/gitbrent/PptxGenJS/discussions/1216)
- [impress.js DOCUMENTATION.md](https://github.com/impress/impress.js/blob/master/DOCUMENTATION.md)
- [A Complete Guide to CSS Grid Layout | CSS-Tricks](https://css-tricks.com/complete-guide-css-grid-layout/)

---

## 2. 타이포그래피 & 비주얼 테마

### 결론
- 폰트는 로컬 `.woff2` 파일을 **base64로 `@font-face`에 직접 인라인**해 완전 오프라인 임베딩한다. 외부 CDN 의존 시 headless 브라우저 캡처 단계에서 네트워크 실패나 User-Agent 제한으로 폰트가 로드되지 않을 위험이 있다. Puppeteer/Playwright 사용 시에는 `document.fonts.ready`를 반드시 대기해야 폰트 미로딩으로 인한 깨짐을 방지할 수 있다.
- 색상은 **2계층 CSS 변수 구조**로 설계한다: primitive(`--color-blue-600`) → semantic(`--color-accent`, `--color-bg`). 브랜드 컬러 교체 시 semantic 레이어만 재매핑하면 된다.
- 다크/라이트 테마는 `data-theme` 속성 명시적 토글로 처리한다. `prefers-color-scheme` 미디어쿼리는 정적 캡처(PPT 변환) 환경에서 무시될 수 있어 신뢰할 수 없다.
- 타이포그래피 스케일 권장값: 제목 36–44pt, 부제 28–32pt, 본문 18–24pt, 캡션 12–16pt. 비율은 1.25~1.333(Major Third/Perfect Fourth) 또는 골든레이시오(1.618). 줄간격은 제목 1.0–1.15, 본문 1.15–1.35. 한 슬라이드에 폰트 크기는 3종 이내로 제한해 위계를 명확히 한다.
- Canva/Beautiful.ai/Google Slides 등 기존 템플릿 시스템은 공통적으로 heading/body/accent 폰트 프리셋과 색상 세트를 테마 단위로 고정하고 마스터 슬라이드에서 상속하는 구조를 취한다.

### 출처
- [Rendering PDF with webfonts · puppeteer/puppeteer#422](https://github.com/puppeteer/puppeteer/issues/422)
- [How to fix Puppeteer font issues](https://www.browserless.io/blog/puppeteer-print)
- [The developer's guide to design tokens and CSS variables](https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/)
- [What Font Size Is Best for Presentations?](https://www.presentations.ai/blog/what-font-size-is-best-for-presentations)
- [Type Sizing: The Golden Ratio](https://www.wynhouse.co/post/type-sizing-the-golden-ratio)
- [Canva font pairing guide](https://www.canva.com/learn/the-ultimate-guide-to-font-pairing/)
- [Beautiful.ai vs. Google Slides](https://www.beautiful.ai/comparison/beautiful-ai-vs-google-slides)
- [Come to the light-dark() Side | CSS-Tricks](https://css-tricks.com/come-to-the-light-dark-side/)

---

## 3. 차트 / 데이터 시각화

### 결론
- 표준 차트(막대/선/파이)는 **pptxgenjs `addChart()` 네이티브 객체**로 생성한다. PPT 안에서 데이터 편집·스타일 변경이 가능하고 파일 용량도 작다.
- 커스텀 인포그래픽이나 복잡한 시각화는 HTML/SVG로 그린 뒤 headless 브라우저로 크롭 캡처해 `addImage`로 삽입한다. Chart.js(Canvas)는 결국 `toDataURL()`로 래스터화해야 하고, D3(SVG)는 PowerPoint의 SVG 지원이 앱마다 불완전해 실무에서는 이미지 변환 우회가 흔하다.
- 표는 헤더를 별도 배경색 + 굵은 글씨로 구분하고, 저채도 zebra striping으로 가독성을 확보한다(대비가 너무 강하면 오히려 노이즈가 된다). 숫자 컬럼은 우측 정렬.
- 아이콘은 Lucide/Heroicons 같은 SVG 세트를 사용하되, PPT의 SVG 지원이 불완전하므로 고해상도 PNG(2–4x)로 변환해 삽입하는 편이 안전하다.

### 출처
- [Home | PptxGenJS](https://gitbrent.github.io/PptxGenJS/)
- [Charts | PptxGenJS](https://gitbrent.github.io/PptxGenJS/docs/api-charts/)
- [addChart/addImage 충돌 이슈 #655](https://github.com/gitbrent/PptxGenJS/issues/655)
- [9 Design Techniques for User-Friendly Tables](https://uxmovement.com/content/9-design-techniques-for-user-friendly-tables/)
- [Zebra striping 가독성 논의](https://medium.com/@designbyfgs/do-zebra-striping-practices-in-table-ui-design-enhance-readability-or-create-visual-noise-5d98cc59f4fd)
- [Lucide Icons](https://lucide.dev/)

---

## 4. 애니메이션 & 트랜지션

### 결론
- HTML 프리뷰 단계에서는 reveal.js 스타일의 `.fragment` 클래스 패턴(요소에 `.fragment`를 걸고 클릭 시 `.visible` 토글)으로 오브젝트 등장 효과를, 슬라이드 전환은 CSS `transform`/`opacity` transition으로 구현한다. `transform`/`opacity`만 애니메이션하면 컴포지터 스레드에서 처리되어 성능이 안정적이다.
- reveal.js의 **Auto-Animate**(FLIP 기법과 유사, 인접 슬라이드 간 매칭 요소를 자동 보간)는 PPT의 "Morph" 전환과 개념적으로 동일하며 참고할 만하다.
- 단순 페이드/줌 전환은 CSS만으로 충분하고, 오브젝트별 순차 등장처럼 정밀한 시퀀싱이 필요할 때만 GSAP 타임라인 도입을 고려한다.
- **한계**: .pptx(OOXML)는 `<p:timing>`(오브젝트 애니메이션), `<p:transition>`(슬라이드 전환)을 SMIL 기반 XML로 기술하는데, pptxgenjs 코어 라이브러리는 이 부분 지원이 약하다(GitHub #823, 수년째 미반영). `dom-to-pptx`, 포크 버전 등 서드파티 도구가 일부 지원하지만 HTML/CSS 애니메이션을 pptx 네이티브 애니메이션으로 1:1 자동 변환하는 범용 도구는 없다.
- **초기 버전 범위**: PPTX 네이티브 애니메이션 생성은 이번 skill의 범위에서 제외하고, HTML 프리뷰용 효과로만 한정한다. 필요 시 추후 자체 XML 생성 로직 추가를 검토한다.

### 출처
- [Transitions | reveal.js](https://revealjs.com/transitions/)
- [Auto-Animate | reveal.js](https://revealjs.com/auto-animate/)
- [Fragments | reveal.js](https://revealjs.com/fragments/)
- [Working with animation | Microsoft Learn](https://learn.microsoft.com/en-us/office/open-xml/presentation/working-with-animation)
- [Office Open XML - Slide Transitions](http://officeopenxml.com/prSlide-transitions.php)
- [[QUESTION] Please add transitions support · Issue #823 · gitbrent/PptxGenJS](https://github.com/gitbrent/PptxGenJS/issues/823)
- [GitHub - atharva9167j/dom-to-pptx](https://github.com/atharva9167j/dom-to-pptx)
- [CSS and JavaScript animation performance | MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance)

---

## 5. Export / 변환 파이프라인 (핵심 병목)

### 결론
- pptxgenjs는 "PPTX 빌더"이지 "HTML 변환기"가 아니다. 일반 HTML/CSS 레이아웃(flex, grid, gradient 등)을 자동 매핑하는 API가 없으므로, 브라우저에서 `getBoundingClientRect()` + `getComputedStyle()`로 요소별 위치·스타일을 추출해 EMU 좌표로 변환하는 커스텀 레이어가 필요하다.
- **하이브리드 전략**을 채택한다: Playwright로 슬라이드 DOM을 순회해 텍스트/사각형/이미지는 pptxgenjs `addText`/`addShape`/`addImage`로 네이티브 객체 매핑하고, 그라디언트·그림자 등 CSS 고급 효과만 해당 요소를 크롭 캡처해 이미지 레이어로 배경에 삽입한다. `dom-to-pptx`, `html-to-editable-pptx`가 이미 이런 하이브리드 접근을 구현한 선례다.
- 단순 폴백으로 전체 슬라이드를 PNG로 캡처해 `addImage`로 통째로 삽입하는 방식도 있으나, 텍스트가 완전히 래스터화되어 PPT에서 선택/편집/검색이 불가능해진다. 구현 리스크는 최소이나 "편집 가능한 PPT"라는 목표와는 거리가 있다.
- SVG는 아이콘·로고·단순 도형에 적합하지만, 구버전 PowerPoint 호환을 위해 SVG와 PNG 사본을 함께 저장하면서 파일이 오히려 커지는 경우가 있다(최신 Microsoft 365는 개선됨). 사진/복잡한 그라디언트는 PNG/JPEG가 유리하다.
- Node.js 실전 스택: **pptxgenjs + Playwright(Chromium headless) + Sharp(이미지 압축)**. Playwright는 폰트 렌더링 안정성과 크로스브라우저 지원 면에서 Puppeteer보다 2026년 기준 우세하다는 평가.

### 출처
- [GitHub - gitbrent/PptxGenJS](https://github.com/gitbrent/PptxGenJS)
- [Presentation API Comparison 2026 | SlideForge](https://slideforge.dev/blog/presentation-apis-2026)
- [Puppeteer vs Playwright for Screenshots in 2026](https://www.screenshotapi.net/blog/puppeteer-vs-playwright-for-screenshots-which-should-you-use-in-2026)
- [GitHub - atharva9167j/dom-to-pptx](https://github.com/atharva9167j/dom-to-pptx)
- [GitHub - Hasasasa/html-to-editable-pptx](https://github.com/Hasasasa/html-to-editable-pptx)
- [Advanced HTML Conversion to PowerPoint PPTX via Node.js (HTML2PPTX)](https://products.fileformat.com/presentation/nodejs/html2pptx/)
- [Why does adding SVG images to PowerPoint sometimes make the file so large?](https://neuxpower.com/blog/why-does-adding-svg-images-to-powerpoint-sometimes-make-the-file-so-large)

---

## MVP 방향 및 다음 단계

**MVP 목표(사용자 확정)**: 하이브리드 네이티브 방식. 텍스트/도형은 pptxgenjs 네이티브 객체로 편집 가능하게 생성하고, CSS 고급 효과만 이미지로 배경 삽입한다. 처음부터 편집 가능한 PPTX 산출을 목표로 하며, 전체 캡처 폴백 방식은 채택하지 않는다.

skill 코드 구현 착수 전 확인이 필요한 항목:

1. `anthropics/skills`의 `pptx/html2pptx.md`, `pptx/pptxgenjs.md`를 직접 읽고 이번 skill의 SKILL.md/구조를 어느 정도까지 재사용할지 결정
2. Playwright의 `getBoundingClientRect()` + `getComputedStyle()` 추출 로직과 pptxgenjs EMU 좌표 변환 매핑 규칙 구체화 (텍스트/도형/이미지 판별 기준 포함)
3. skill 디렉토리 구조 설계 (`SKILL.md`, `templates/`, `assets/fonts/`, `scripts/` 등)
4. PPTX 네이티브 애니메이션 지원 여부(2차 확장 검토)
