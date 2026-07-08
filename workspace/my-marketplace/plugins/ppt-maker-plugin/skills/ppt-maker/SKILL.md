---
name: ppt-maker
description: HTML/CSS/JavaScript로 인터랙티브 프레젠테이션 슬라이드 덱을 만들고, PDF와 편집 가능한 PPTX 파일로 변환한다. 사용자가 "PPT 만들어줘", "발표자료", "슬라이드 덱", "프레젠테이션 제작", "파워포인트로 변환", "PDF로 내보내기(프레젠테이션 맥락)"라고 말하거나, 통계/데이터를 여러 페이지짜리 슬라이드로 정리해달라고 요청하면 반드시 이 skill을 사용한다. 단순히 기존 .pptx나 .html 파일을 읽거나 요약하는 작업에는 사용하지 않는다 — 새 슬라이드 덱을 "만들거나" 기존 HTML 슬라이드를 PDF/PPTX로 "변환"하는 작업에만 사용한다.
---

# ppt-maker

HTML/CSS/JS로 슬라이드 덱을 만들고, 방향키 이동·F5 전체화면·페이지 번호·PDF/PPTX 변환까지 지원하는 발표자료를 생성한다.

## 왜 이런 구조인가

파워포인트 파일 포맷(OOXML)을 처음부터 직접 다루는 것보다, 익숙한 HTML/CSS로 슬라이드를 디자인한 뒤 이를 PDF나 PPTX로 "내보내는" 방식이 훨씬 빠르고 디자인 자유도가 높다. 다만 아무렇게나 만든 HTML은 PPTX로 깔끔하게 변환되지 않는다 — 그래서 이 skill은 검증된 좌표계·구조 규칙(`references/design-rules.md`, RESEARCH.md 기반)을 따르는 슬라이드를 만들고, 그 규칙을 아는 변환 스크립트로 내보내는 2단계 구조를 취한다.

## 워크플로

### 1단계: 슬라이드 덱 HTML 작성

1. `assets/deck-template.html`, `assets/deck-engine.css`, `assets/deck-engine.js`를 대상 프로젝트로 복사한다 (예: `output/<deck-name>/`). 세 파일은 항상 같은 폴더에 함께 둔다 — `deck-template.html`이 나머지 둘을 상대경로로 불러온다.
2. `references/design-rules.md`를 읽고 좌표계(1280×720 고정), div/텍스트 분리 규칙, 색상 변수 구조를 숙지한다. 이 규칙을 어기면 PPTX 변환이 깨진다.
3. 사용자가 요청한 콘텐츠(제목, 데이터, 차트, 통계 등)에 맞춰 `deck-template.html`의 `<section class="slide">` 블록을 필요한 개수만큼 복제·수정한다.
   - 차트가 필요하면 순수 SVG로 직접 그린다. `samples/game-platform-stats.html`(같은 프로젝트의 `samples/` 폴더, 존재한다면)의 `renderLineChart` 패턴을 참고할 수 있다.
   - 클릭 시 순차 등장 효과가 필요하면 요소에 `class="fragment" data-fragment-index="N"`을 추가한다 (엔진이 자동 처리).
   - 페이지 번호는 `deck-engine.js`가 슬라이드 이동 시 자동으로 `.page-num`을 채운다 — 수동으로 관리할 필요 없음.
4. 로컬 파일로 저장 후 브라우저로 열어 육안 확인한다. 확인할 것: 방향키(←/→)로 슬라이드가 넘어가는지, F5 키로 전체화면이 켜지는지, 페이지 번호가 맞는지.

### 2단계: PDF 변환 (필요 시)

```bash
cd .claude/skills/ppt-maker/scripts
npm install   # 최초 1회 (playwright, pptxgenjs 설치)
npx playwright install chromium   # 최초 1회, headless 브라우저 바이너리 설치
node export-pdf.js <완성한 deck HTML 경로> <출력.pdf 경로>
```

내부적으로 `deck-engine.css`의 `body.print-mode` 규칙을 이용해 모든 슬라이드를 페이지 단위로 순차 배치한 뒤 인쇄한다. 사용자가 별도로 요청하지 않는 한 자동 실행하지 말고, "PDF로도 내보낼까요?"처럼 필요할 때 제안한다.

### 3단계: PPTX 변환 (필요 시)

```bash
node export-pptx.js <완성한 deck HTML 경로> <출력.pptx 경로>
```

`scripts/export-pptx.js`는 하이브리드 방식으로 동작한다:
- 텍스트(`h1`~`h6`, `p`, `ul`/`ol`) → pptxgenjs 네이티브 텍스트박스 (PPT에서 편집 가능)
- 단색 배경 도형 → 네이티브 도형(rect/ellipse)
- SVG 차트, `<table>`, 그라디언트/그림자가 있는 div → 스크린샷 크롭 후 이미지로 삽입

이 분류는 휴리스틱이므로 완벽하지 않다. 변환 후 반드시 실제 PowerPoint(또는 LibreOffice)에서 열어 레이아웃이 깨지지 않았는지 확인하고, 필요하면 결과를 사용자에게 보여주며 조정 여부를 물어본다.

## 지원 기능 체크리스트

이 skill로 만든 모든 덱은 아래 4가지를 기본 제공한다 (deck-engine.js/css에 내장되어 있으므로 별도 구현 불필요):

- [x] 방향키(←/→, PageUp/PageDown, Space)로 슬라이드 이동
- [x] F5 키로 전체화면 토글 (Fullscreen API)
- [x] 슬라이드 번호 자동 표시 (`N / 총페이지수`)
- [x] PDF 변환 (`scripts/export-pdf.js`)
- [x] 편집 가능한 PPTX 변환 (`scripts/export-pptx.js`, 하이브리드 방식)

## 주의사항

- `deck-engine.css`/`deck-engine.js`를 슬라이드별로 복사해서 수정하지 말 것 — 여러 덱이 같은 엔진을 공유해야 유지보수가 가능하다. 덱 전용 스타일은 `deck-template.html` 안의 `<style>` 블록에 추가한다.
- 슬라이드 개수가 많아지는 콘텐츠(예: 20페이지 이상)는 `deck-template.html`을 통째로 복사하지 말고, `<section class="slide">` 블록만 필요한 만큼 반복 생성한다.
- 데이터/통계를 다루는 덱을 만들 때 실제 수치가 불확실하면 반드시 사용자에게 출처를 확인하거나, WebSearch로 검증한 뒤 각주로 출처/추정 근거를 명시한다 (`samples/game-platform-stats.html`의 `.footnote` 패턴 참고).
