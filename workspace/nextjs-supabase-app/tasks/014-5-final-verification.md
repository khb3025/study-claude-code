# Task 014-5: 최종 접근성 점검 및 마감 검증

## 명세

프로필/인증 화면의 남은 접근성 갭을 마무리하고, 프로젝트 전체에 대해 `get_advisors` 재점검, ESLint/타입 체크/프로덕션 빌드 검증을 수행한 뒤 `docs/ROADMAP.md` Phase 4를 완료 처리한다. Task 014(014-1~014-5)의 최종 게이트.

## 관련 파일

- `components/profile-edit-form.tsx` (수정)
- `components/login-form.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx`, `update-password-form.tsx` (수정)
- `docs/ROADMAP.md` (수정)

## 구현 내용

1. **접근성**: `profile-edit-form.tsx`의 프로필 사진 변경 버튼이 아바타 이미지만 담고 있어 접근 가능한 이름이 없었음 → `aria-label="프로필 사진 변경"` 추가.
2. **폼 피드백 일관성**: 인증 관련 4개 폼(로그인/회원가입/비밀번호 찾기/비밀번호 재설정)의 에러 메시지가 `text-red-500`을 사용해, 프로젝트 전반에서 쓰이는 `text-destructive`(디자인 토큰)와 불일치했다. 4개 파일 모두 `text-destructive`로 통일.
3. **최종 검증**: `npm run type-check`, 변경 파일 대상 `eslint`/`prettier`, `npm run build` 전체 통과 확인. `mcp__supabase__get_advisors(security)`/`get_advisors(performance)` 재점검.
4. **ROADMAP 갱신**: `docs/ROADMAP.md`의 `### Phase 4: 마감 및 최적화`에 ✅ 표시, Task 014를 완료 처리하고 014-1~014-5 서브 문서 링크 및 핵심 변경 요약을 반영.

## 판단 근거

- `app/auth/login`, `app/auth/error` 등은 정적에 가까운 페이지라 별도 `loading.tsx`가 실익이 크지 않다고 판단해 라우트 세그먼트 로딩 파일은 추가하지 않고, 실제 발견된 갭(색상 불일치, 접근성 라벨 누락)만 수정했다 — "범위 확장 금지" 원칙 유지.
- `text-red-500`과 `text-destructive`는 라이트 모드에서는 유사해 보이지만 다크 모드 대응이나 테마 변경 시 `text-destructive`(CSS 변수 기반)만 자동으로 따라가므로, 디자인 토큰 일관성 차원에서 통일했다.

## 검증

- `npm run type-check`, `eslint`, `prettier --write`, `npm run build` 모두 통과.
- **[2026-07-07 Playwright MCP 검증]** 관리자 계정으로:
  - `/profile` → "수정" 다이얼로그 오픈 → 접근성 스냅샷에서 `button "프로필 사진 변경"`으로 정상 노출 확인
  - `/auth/login` 접속 시 이미 로그인된 세션이라 `/events`로 정상 리다이렉트되는 것 확인(회귀 없음)
- `mcp__supabase__get_advisors(security)`: 기존 RPC anon/authenticated 호출 경고 + `auth_leaked_password_protection`(기존부터 존재)만 확인, 신규 이슈 없음.
- `mcp__supabase__get_advisors(performance)`: 기존부터 존재하던 INFO 레벨 unused index 3건만 확인(이번 작업은 DB 마이그레이션이 없어 당연히 무관), 신규 이슈 없음.

## Phase 4 전체 요약 (014-1~014-5)

| 서브태스크 | 핵심 산출물 |
|---|---|
| 014-1 | `Skeleton`, `EmptyState`, `error.tsx` 표준 패턴 확정, `app/events` 시범 적용 |
| 014-2 | `mine`/`joined`/`[eventId]`/`[eventId]/edit`에 패턴 적용, 참여자 0건·탭 필터 0건 갭 수정 |
| 014-3 | `friends`/`invitations`에 패턴 적용, 실제 발견된 2건의 접근성 갭(체크박스 aria-label) 수정 |
| 014-4 | 관리자 4개 화면에 패턴 적용, `revalidatePath` 감사표 작성 및 8개 액션 보강 |
| 014-5 | 프로필 접근성 갭 1건, 폼 에러 색상 불일치 4건 수정, 최종 검증 및 ROADMAP 반영 |

## 테스트 체크리스트 (Playwright)

- [x] `/profile` 편집 다이얼로그 접근성 이름 확인
- [x] `/auth/login` 리다이렉트 회귀 없음 확인
- [x] `get_advisors(security/performance)` 신규 이슈 없음 확인
- [x] `docs/ROADMAP.md` Phase 4 ✅ 반영 확인
