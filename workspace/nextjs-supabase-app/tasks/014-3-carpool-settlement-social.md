# Task 014-3: 카풀/정산/초대/친구/블랙리스트 화면 적용 및 접근성 보강 (F003·F004·F008·F009·F010)

## 명세

카풀/정산/이메일 초대/블랙리스트/친구 관련 화면과 다이얼로그에 빈 상태/로딩 패턴을 적용하고, 아이콘 전용 컨트롤에 접근 가능한 이름(`aria-label`)을 보강한다.

## 관련 파일

- `app/friends/page.tsx`, `loading.tsx`(신규), `error.tsx`(신규)
- `app/events/invitations/page.tsx`, `loading.tsx`(신규), `error.tsx`(신규)
- `components/settlement-share-toggle.tsx` (수정)
- `components/carpool-invite-passenger-dialog.tsx` (수정)

## 구현 내용

1. `app/friends/page.tsx`: "대기중인 친구 요청이 없습니다.", "아직 친구가 없습니다." 두 곳의 plain text 빈 상태를 `EmptyState`(아이콘 포함)로 교체. `Suspense` fallback을 `Skeleton`으로 교체. `loading.tsx`/`error.tsx` 신설.
2. `app/events/invitations/page.tsx`: "로그인이 필요합니다.", "받은 초대가 없습니다." 두 곳의 개별 마크업(테두리+아이콘 인라인 구현)을 공통 `EmptyState`로 통합. `loading.tsx`/`error.tsx` 신설.
3. **접근성 보강**: 조사 결과 카풀/정산/초대/친구/블랙리스트 관련 버튼은 대부분 아이콘+가시적 텍스트(`<UserPlus /> 친구 추가` 등) 조합이라 이미 텍스트로 접근 가능한 이름이 제공되고 있었다. 실제로 접근 가능한 이름이 없던 두 곳을 발견해 수정했다:
   - `components/settlement-share-toggle.tsx`: 정산 완료 체크박스가 인접한 "미완료" 텍스트와 시각적으로만 연결되어 있고 프로그래밍적으로 연결되지 않아 `aria-label="정산 완료 처리"` 추가.
   - `components/carpool-invite-passenger-dialog.tsx`: 탑승자 선택 체크박스가 `<label>`로 감싸여 있으나 Radix 기반 컴포넌트라 스크린리더 연결이 불확실해 `aria-label={\`${user.name} 탑승자로 선택\`}`을 명시적으로 추가.

## 판단 근거

- Task 014의 "범위 확장 금지" 원칙에 따라, 이미 텍스트로 접근 가능한 이름이 확보된 버튼(대부분의 카풀/정산/초대 버튼)은 건드리지 않고, 실제로 접근성 갭이 있는 두 곳만 수정했다.
- `carpool-invite-passenger-dialog.tsx`의 "초대할 수 있는 참여자가 없습니다." 같은 다이얼로그 내부 인라인 안내 문구는 페이지 레벨 목록이 아니라 다이얼로그 안의 보조 텍스트이므로, `EmptyState`(테두리 박스)로 교체하지 않고 기존 plain text를 유지해 다이얼로그 내 과도한 시각적 무게를 피했다.
- 카풀 관련 서버 액션은 관리자 화면에 노출되지 않으므로 `revalidatePath` 변경은 Task 014-4(관리자 화면 캐시 감사)로 범위를 명확히 분리했다.

## 검증

- `npm run type-check`, 변경 파일 대상 `eslint`, `prettier --write`, `npm run build` 모두 통과.
- **[2026-07-07 Playwright MCP 검증]** 관리자 계정으로:
  - `/friends`: "대기중인 친구 요청이 없습니다." EmptyState와 실제 친구 목록(후후훗) 동시 정상 렌더링 확인
  - `/events/invitations`: "받은 초대가 없습니다." EmptyState 정상 렌더링 확인
  - `/events/[eventId]` 카풀 탭 → "탑승자 초대" 다이얼로그 오픈 확인(현재 초대 가능 대상 0명이라 체크박스 접근성 라벨은 코드 리뷰로 검증, 다이얼로그 자체 회귀 없음 확인)

## 테스트 체크리스트 (Playwright)

- [x] `/friends` EmptyState 및 실제 데이터 동시 렌더링 확인
- [x] `/events/invitations` EmptyState 렌더링 확인
- [x] 카풀 탑승자 초대 다이얼로그 정상 오픈/닫기 확인(회귀 없음)
- [ ] 탑승자 선택 체크박스 aria-label 실사용 시나리오 — 초대 가능 대상이 있는 테스트 데이터가 없어 코드 리뷰로 대체
