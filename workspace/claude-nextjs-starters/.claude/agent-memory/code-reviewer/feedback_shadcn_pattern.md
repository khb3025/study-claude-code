---
name: shadcn-pattern-aschild-slot
description: 이 프로젝트의 shadcn/ui 컴포넌트는 asChild + Slot.Root 패턴 필수 — Next.js Link 합성 위해
metadata:
  type: feedback
---

이 프로젝트의 shadcn/ui 컴포넌트(링크 역할을 하는 것)는 반드시 `asChild` + `Slot.Root` 패턴을 구현해야 한다.

**Why:** Next.js App Router에서 클라이언트 사이드 내비게이션을 위해 `next/link`의 `<Link>` 컴포넌트를 합성할 수 있어야 한다. `breadcrumb.tsx`와 `button.tsx` 모두 이 패턴을 채택함. `<a>` 하드코딩은 서버 사이드 풀 페이지 리로드를 유발.

**How to apply:** 링크나 버튼 역할의 컴포넌트 리뷰 시 `asChild?: boolean`과 `const Comp = asChild ? Slot.Root : "a"` 패턴이 있는지 반드시 확인. 없으면 Critical로 지적.

**중요 제약 — 하드코딩 자식 컴포넌트에는 asChild 사용 금지:**

`Slot.Root`는 `React.Children.only()`로 정확히 1개의 자식 React 엘리먼트만 수신해야 한다. 컴포넌트 내부에 자체 자식(아이콘, 텍스트 등)을 JSX로 하드코딩하는 경우 `asChild=true` 시 항상 런타임 오류 발생:

```
Error: React.Children.only expected to receive a single React element child.
```

JSX 명시 자식은 `{...props}` 스프레드로 전달된 `props.children`을 항상 덮어쓰기 때문에 두 개의 자식이 `Slot.Root`에 전달된다. 따라서:

- 자체 자식 없이 `{...props}` 만 전달하는 컴포넌트 → `asChild` 안전 (예: `BreadcrumbLink`, `PaginationLink`)
- 아이콘/텍스트 등 자체 자식을 하드코딩하는 컴포넌트 → `asChild` 사용 불가 (예: `PaginationPrevious`, `PaginationNext`)

패턴 예시:
```typescript
import { Slot } from "radix-ui"

// 올바른 패턴: 자체 자식 없음
function MyLink({ asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "a"
  return <Comp data-slot="my-link" {...props} />
}

// 잘못된 패턴: 자체 자식이 있어 Slot.Root 충돌
function MyButtonLink({ asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp {...props}>
      <Icon />        // ← asChild=true 시 Slot.Root 런타임 오류
      <span>텍스트</span>
    </Comp>
  )
}
```

관련: [[buttonvariants-reuse]]
