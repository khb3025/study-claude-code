---
name: buttonvariants-reuse
description: 버튼 스타일이 필요한 컴포넌트는 buttonVariants를 재사용해야 함 — 수동 복제 금지
metadata:
  type: feedback
---

버튼처럼 보이는 스타일(rounded, bg-primary, hover 등)이 필요한 컴포넌트는 `button.tsx`의 `buttonVariants`를 import해서 재사용해야 한다. 수동으로 Tailwind 클래스를 복제하면 안 됨.

**Why:** `button.tsx`의 `buttonVariants` (cva 기반)가 이 프로젝트의 모든 버튼 스타일을 중앙 관리. 수동 복제 시 `button.tsx` 스타일 변경 시 다른 컴포넌트가 뒤처져 시각적 불일치 발생.

**How to apply:** pagination, breadcrumb 등 링크/버튼 형태 컴포넌트 리뷰 시 `h-9 w-9`, `rounded-md`, `bg-primary text-primary-foreground` 등 button 스타일 수동 복제 여부 확인. 발견 시 Warning 이상으로 지적.

올바른 사용:
```typescript
import { buttonVariants } from "@/components/ui/button"

className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), className)}
```

**주의:** `button.tsx`는 `ButtonProps` 타입을 export하지 않음. 타입이 필요하면 `VariantProps<typeof buttonVariants>`를 사용.

관련: [[shadcn-pattern-aschild-slot]]
