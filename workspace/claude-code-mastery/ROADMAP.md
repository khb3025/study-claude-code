# 개발자 웹 이력서 개발 ROADMAP

## 프로젝트 개요

- **목표**: HTML, CSS, JavaScript, TailwindCSS를 활용한 개발자 웹 이력서 제작
- **목표 기간**: 2주
- **결과물**: 정적 웹 이력서 (단일 페이지)

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 마크업 | HTML5 |
| 스타일 | CSS3, TailwindCSS v3 |
| 인터랙션 | Vanilla JavaScript |
| 배포 | GitHub Pages |

---

## 이력서 구성 섹션

### 1. Hero (상단 소개)
- 이름, 직함 (예: Frontend Developer)
- 한 줄 소개
- GitHub / LinkedIn / 이메일 링크 버튼

### 2. About Me (자기소개)
- 2~3문장 짧은 소개
- 관심 분야 / 개발 철학

### 3. Skills (기술 스택)
- Frontend: HTML, CSS, JavaScript, React, TailwindCSS
- Backend: Node.js, Java, Spring Boot
- Tools: Git, GitHub, VS Code, Figma

### 4. Experience (경력)
- 회사명, 직함, 기간
- 주요 업무 내용 (bullet point)

### 5. Projects (프로젝트)
- 프로젝트명, 설명, 사용 기술
- GitHub 링크 / 데모 링크

### 6. Education (학력)
- 학교명, 전공, 졸업년도

### 7. Contact (연락처)
- 이메일, GitHub, LinkedIn 링크

---

## 개발 단계

### Phase 1 — 프로젝트 세팅 (1일)

- [ ] 프로젝트 폴더 구조 생성
- [ ] TailwindCSS CDN 또는 CLI 설정
- [ ] `index.html` 기본 템플릿 작성
- [ ] 디자인 컬러 팔레트 및 폰트 결정

```
resume/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    └── profile.jpg
```

---

### Phase 2 — HTML 구조 작성 (2일)

- [ ] 전체 섹션 시맨틱 태그로 마크업
  - `<header>`, `<section>`, `<footer>` 활용
- [ ] 네비게이션 바 (`<nav>`) 작성
- [ ] 각 섹션별 콘텐츠 더미 데이터 채우기

---

### Phase 3 — TailwindCSS 스타일링 (3일)

- [ ] 반응형 레이아웃 구성 (모바일 우선)
  - `sm:`, `md:`, `lg:` 브레이크포인트 적용
- [ ] Hero 섹션 — 배경 그라데이션, 텍스트 스타일
- [ ] Skills 섹션 — 뱃지/태그 UI
- [ ] Projects 섹션 — 카드 UI
- [ ] 다크모드 지원 (`dark:` 클래스)
- [ ] 색상 테마 커스터마이징 (`tailwind.config.js`)

---

### Phase 4 — JavaScript 인터랙션 (2일)

- [ ] 스크롤 시 네비게이션 하이라이트
- [ ] 햄버거 메뉴 (모바일 토글)
- [ ] 스크롤 애니메이션 (Intersection Observer)
- [ ] 다크모드 토글 버튼
- [ ] 섹션 부드러운 스크롤 이동

---

### Phase 5 — 콘텐츠 완성 및 디테일 (2일)

- [ ] 실제 이력서 내용으로 데이터 교체
- [ ] 프로필 사진 최적화 및 삽입
- [ ] 아이콘 적용 (Font Awesome 또는 Heroicons)
- [ ] 링크 연결 (GitHub, LinkedIn 등)
- [ ] 메타 태그 및 OG 태그 작성 (SEO)

---

### Phase 6 — 테스트 및 배포 (2일)

- [ ] 크로스 브라우저 테스트 (Chrome, Firefox, Safari)
- [ ] 모바일 반응형 최종 확인
- [ ] Lighthouse 성능 점수 확인 (목표: 90+)
- [ ] GitHub Pages 배포
- [ ] 커스텀 도메인 연결 (선택)

---

## 이력서 샘플 데이터

```
이름       : 홍길동
직함       : Frontend Developer
이메일     : hong@example.com
GitHub     : github.com/honggildong
LinkedIn   : linkedin.com/in/honggildong

경력
- (주)테크스타트 | Frontend Developer | 2023.01 ~ 현재
  · React 기반 사내 관리자 대시보드 개발
  · TailwindCSS 도입으로 스타일 작업 효율 40% 향상

프로젝트
- 버킷리스트 앱 | HTML, CSS, JavaScript
  · 목표 관리 웹 앱 개발 / GitHub Pages 배포

학력
- ○○대학교 컴퓨터공학과 | 2019.03 ~ 2023.02 졸업
```

---

## 참고 리소스

- [TailwindCSS 공식 문서](https://tailwindcss.com/docs)
- [Font Awesome 아이콘](https://fontawesome.com)
- [Google Fonts](https://fonts.google.com)
- [GitHub Pages 배포 가이드](https://pages.github.com)
