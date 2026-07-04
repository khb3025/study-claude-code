# 배포 가이드 (Vercel)

이 프로젝트(Next.js 16 App Router)를 Vercel에 배포하기 위한 체크리스트입니다.

## 1. 사전 준비

- [ ] `npx tsc --noEmit` 통과
- [ ] `npm run lint` 대상 범위(`src/`) 통과 — 저장소 내 `mcp-shrimp-task-manager` 서브도구 디렉터리의 lint 오류는 배포 대상 코드가 아니므로 무시 가능
- [ ] `npm run build` 로컬에서 성공적으로 완료되는지 확인
- [ ] Notion 데이터베이스에 실제 견적서/항목 데이터가 있는지 확인 (연동 확인용)

## 2. 환경변수 설정

Vercel 프로젝트 설정(Project Settings → Environment Variables)에 `.env.example` 기준 아래 값을 모두 등록합니다.

| 변수명 | 설명 | 비고 |
|---|---|---|
| `NOTION_API_KEY` | Notion Integration의 Internal Integration Secret | https://www.notion.so/my-integrations 에서 발급 |
| `NOTION_DATABASE_ID` | 견적서 데이터베이스 ID | |
| `NOTION_ITEMS_DATABASE_ID` | 견적서 항목(Relation) 데이터베이스 ID | |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호 | 운영용으로 로컬 개발 값(`test1234` 등)과 다른 값 사용 필수 |
| `ADMIN_SESSION_SECRET` | 세션 토큰 HMAC 서명 키 | 충분히 긴 랜덤 문자열로 새로 생성 (로컬 개발용 시크릿 재사용 금지) |
| `NEXT_PUBLIC_SITE_URL` | 배포된 프로덕션 도메인의 절대 URL (예: `https://invoice.example.com`) | OG 메타데이터의 `url` 필드에 사용되므로 실제 배포 도메인과 반드시 일치해야 함 |

**주의**: `NEXT_PUBLIC_SITE_URL`을 제외한 모든 값은 클라이언트에 노출되면 안 되는 시크릿입니다. Vercel 환경변수 등록 시 "Sensitive" 옵션이 있다면 활성화하세요.

- [ ] Notion Integration이 대상 데이터베이스(견적서 DB, 항목 DB)에 실제로 연결(Connect)되어 있는지 확인 — 연결되어 있지 않으면 API 키가 유효해도 조회가 빈 값/오류로 실패합니다.
- [ ] `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`은 로컬 개발용 값과 다른, 운영 전용 값으로 새로 발급
- [ ] `NEXT_PUBLIC_SITE_URL`을 Vercel이 발급한(또는 연결한 커스텀) 프로덕션 도메인으로 정확히 설정

## 3. Vercel 프로젝트 연결 및 배포

1. Vercel 계정에서 이 GitHub 저장소를 Import 하거나, Vercel CLI로 연결합니다.
   ```bash
   npx vercel link
   ```
2. 위 2단계의 환경변수를 Production/Preview 각 환경에 등록합니다.
   ```bash
   npx vercel env add NOTION_API_KEY production
   npx vercel env add NOTION_DATABASE_ID production
   npx vercel env add NOTION_ITEMS_DATABASE_ID production
   npx vercel env add ADMIN_PASSWORD production
   npx vercel env add ADMIN_SESSION_SECRET production
   npx vercel env add NEXT_PUBLIC_SITE_URL production
   ```
3. 배포를 실행합니다.
   ```bash
   npx vercel --prod
   ```
   (또는 GitHub 연동 시 `main` 브랜치 push로 자동 배포)

Framework Preset은 Vercel이 `next.config.ts`를 감지해 자동으로 "Next.js"로 설정하므로 별도 `vercel.json`은 필요하지 않습니다. Build Command는 기본값(`next build`), Output Directory도 기본값을 사용합니다.

## 4. 배포 후 확인

- [ ] `/admin/login`에서 운영용 `ADMIN_PASSWORD`로 로그인이 되는지 확인
- [ ] `/admin/invoices`에서 실제 Notion 데이터가 정상 표시되는지 확인
- [ ] 실제 견적서 링크(`/invoice/[notionPageId]`)에 접속해 OG 메타데이터(`NEXT_PUBLIC_SITE_URL` 반영 여부)를 카카오톡/슬랙 등에 링크를 붙여넣어 미리보기로 확인
- [ ] PDF 다운로드가 정상 동작하는지 확인 (한글 폰트가 `public/fonts/`에 함께 배포되었는지 확인)
- [ ] 존재하지 않는 `notionPageId`로 접속 시 404 페이지가 정상 표시되는지 확인
- [ ] 다크모드 토글이 정상 동작하고 새로고침 후 유지되는지 확인
- [ ] HTTPS 환경에서 관리자 세션 쿠키에 `Secure` 속성이 적용되는지 확인 (브라우저 개발자 도구 → Application → Cookies)

## 5. 운영 중 유의사항

- Notion API 응답은 60초간 캐싱됩니다(`src/lib/notion.ts`의 `unstable_cache`). Notion에서 데이터를 수정한 직후 화면 반영까지 최대 60초 지연이 있을 수 있습니다.
- 이 앱은 Notion 데이터를 조회만 하며 앱에서 직접 쓰기를 하지 않으므로 캐시 무효화(revalidate) API는 별도로 두지 않았습니다.
- 관리자 인증은 단일 비밀번호 기반 MVP 수준입니다. 다중 관리자 계정, 비밀번호 재설정 등이 필요해지면 별도 설계가 필요합니다.
