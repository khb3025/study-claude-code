# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 앱 실행 방법

별도의 빌드 과정 없음. `index.html`을 브라우저에서 직접 열거나 로컬 서버로 실행:

```bash
python -m http.server 8000
# http://localhost:8000 접속
```

Tailwind CSS는 CDN으로 로드 — npm install 불필요.

## 아키텍처

두 개의 JavaScript 모듈을 `<script>` 태그로 순서대로 로드:

**`js/storage.js`** — 데이터 계층 전담. `BucketStorage`는 일반 객체 리터럴로, `bucketList` 키를 사용한 모든 LocalStorage 접근을 담당. 각 메서드는 매번 LocalStorage에서 직접 읽고 쓰며, 인메모리 상태를 별도로 보관하지 않음.

**`js/app.js`** — UI 계층 전담. `BucketListApp` 클래스가 DOM 이벤트 처리와 화면 렌더링을 담당. `BucketStorage` 메서드를 호출한 뒤 `this.render()`로 전체 목록을 다시 그림. 동적으로 생성된 HTML의 인라인 `onclick` 핸들러가 전역 `app` 인스턴스를 직접 참조.

데이터 흐름은 단방향: 사용자 액션 → Storage 변경 → `render()`가 LocalStorage를 새로 읽어 화면 갱신.

## 핵심 컨벤션

- **XSS 방어**: 사용자 입력은 반드시 `escapeHtml()`을 거친 후 `innerHTML`에 삽입. 이 메서드는 임시 DOM 텍스트 노드를 활용 — 우회 금지.
- **항목 ID**는 `Date.now().toString()` — 정수가 아닌 타임스탬프 문자열.
- 새 항목은 `unshift`로 맨 앞에 추가되므로 최신 항목이 목록 위에 표시됨.
- 모달 상태는 `this.editingId`로 관리. 모달을 닫을 때 반드시 이 값을 초기화해야 함.
