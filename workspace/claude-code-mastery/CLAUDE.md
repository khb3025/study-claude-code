# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 및 커뮤니케이션 규칙

- **기본 응답 언어**: 한국어
- **코드 주석**: 한국어로 작성
- **커밋 메시지**: 한국어로 작성
- **문서화**: 한국어로 작성
- **변수명/함수명**: 영어 (코드 표준 준수)

## 프로젝트 개요

HTML, CSS, JavaScript, TailwindCSS v3로 구축하는 정적 단일 페이지 개발자 웹 이력서.
빌드 도구 없음 — TailwindCSS는 CDN으로 로드.

## 앱 실행 방법

별도의 빌드 과정 없음. `index.html`을 브라우저에서 직접 열거나 로컬 서버로 실행:

```bash
# Python 내장 서버
python -m http.server 8000
# http://localhost:8000 접속

# VS Code Live Server 확장 사용 시
# index.html 우클릭 → "Open with Live Server"
```

## 아키텍처

단일 페이지(`index.html`) 구조로, 7개 섹션이 수직으로 배치:

```
Hero → About Me → Skills → Experience → Projects → Education → Contact
```

**파일 구조 (개발 완료 기준)**

```
resume/
├── index.html       # 전체 마크업 및 섹션 구조
├── css/
│   └── style.css    # TailwindCSS 보완용 커스텀 스타일만 작성
├── js/
│   └── main.js      # 인터랙션 전담 (스크롤, 다크모드, 햄버거 메뉴)
└── assets/
    └── profile.jpg  # 프로필 이미지
```

**JavaScript 역할 (`main.js`)**
- Intersection Observer로 스크롤 애니메이션 처리
- 다크모드 토글 (`localStorage`에 테마 상태 저장)
- 모바일 햄버거 메뉴 열기/닫기
- 스크롤 위치에 따른 네비게이션 활성 항목 하이라이트

**스타일링 원칙**
- 모든 레이아웃과 컴포넌트 스타일은 TailwindCSS 유틸리티 클래스 우선
- `style.css`는 Tailwind로 표현 불가한 경우에만 사용 (예: 커스텀 애니메이션 keyframe)
- 다크모드는 `dark:` 클래스로 처리 (`tailwind.config.js`의 `darkMode: 'class'` 설정 필요)

## 개발 로드맵

자세한 개발 단계와 체크리스트는 `ROADMAP.md` 참고.
