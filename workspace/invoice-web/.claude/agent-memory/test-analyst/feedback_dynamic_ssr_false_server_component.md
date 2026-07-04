---
name: feedback-dynamic-ssr-false-server-component
description: Next.js 16.2.x에서 next/dynamic({ ssr:false })를 async Server Component(page.tsx)에 직접 쓰면 빌드 에러 발생 — 반드시 별도 Client Component로 감싸야 함
metadata:
  type: feedback
---

Next.js 16.2.9에서는 `next/dynamic`의 `ssr: false` 옵션을 Server Component(예: `page.tsx`의 async 컴포넌트) 안에서 직접 호출하면 "`ssr: false` is not allowed with `next/dynamic` in Server Components" 빌드 에러가 발생해 페이지 전체가 500으로 깨진다.

**이유:** AGENTS.md에 명시된 대로 이 프로젝트의 Next.js 버전은 breaking change가 있는 버전이라 학습 데이터의 관례(App Router page.tsx에서 dynamic(ssr:false) 흔히 사용하던 패턴)가 그대로 통하지 않는다. Task 023(성능 최적화) 검증 중 PDF 다운로드 버튼 지연 로딩 적용 시 실제로 발생을 확인.

**적용 방법:** 브라우저 전용 API에 의존하는 컴포넌트를 지연 로딩해야 할 때는, `dynamic(..., { ssr: false })` 호출 자체를 `"use client"` 래퍼 컴포넌트 안으로 옮기고, Server Component(page.tsx)에서는 그 래퍼 컴포넌트만 import해서 사용할 것. (예: `src/components/invoice/pdf-download-button-loader.tsx` 참고)

Related: [[project_e2e_task022]]
