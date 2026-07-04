---
name: section-classname-bug-pattern
description: Section 컴포넌트(src/components/shared/section.tsx)는 전달받은 className을 바깥 <section>에 붙이지만 children은 내부 <div className="container mx-auto">에 렌더링됨 — 레이아웃용 className(flex/gap 등)을 Section에 전달하면 조용히 무시됨
metadata:
  type: project
---

`Section` 컴포넌트 구조:
```tsx
<section id={id} className={cn("px-4 py-16 md:py-24", className)}>
  <div className="container mx-auto">{children}</div>
</section>
```
전달된 `className`은 바깥 `<section>`에 적용되지만, 실제 children은 그 안의 `container` div에 렌더링된다. 따라서 `className="flex flex-col gap-6"`처럼 **children의 레이아웃을 의도한 className은 적용되지 않는다** (padding 오버라이드처럼 section 자체를 대상으로 하는 className은 정상 동작).

`src/app/invoice/[notionPageId]/page.tsx`에서 이 버그를 페이지 레벨에서 children을 별도 `<div className="flex flex-col gap-6">`로 감싸는 방식으로 수정했음(2026-07-04 리뷰 시점).

**Why:** 같은 안티패턴이 `src/app/page.tsx`의 첫 번째 `Section`(`className="flex flex-col items-center gap-6 pb-8 text-center"`, 약 48번째 줄)에서도 그대로 재현되고 있어 아이콘 정렬(items-center)과 요소 간 간격(gap-6)이 실제로 적용되지 않는 시각적 버그가 현재도 남아있다. 즉 이번 invoice 페이지의 로컬 wrapping은 그 페이지 하나만의 임시 처방이고, 근본 원인(Section의 className이 잘못된 엘리먼트에 적용됨)은 아직 남아있다.

**How to apply:** 이 프로젝트에서 `Section` 사용처를 리뷰할 때는 항상 전달된 className이 (a) section 자체의 padding 등을 오버라이드하려는 의도인지, (b) children의 flex/grid/gap 레이아웃을 의도한 것인지 구분해서 확인할 것. (b)인 경우 현재 Section 구현에서는 무시되므로, 페이지 레벨에서 별도 wrapper div로 감싸거나(임시 처방) `Section` 컴포넌트 자체에 `containerClassName`/`className`을 분리하는 리팩터링을 제안해야 한다. `src/app/page.tsx`가 이 리팩터링이 아직 안 된 상태의 살아있는 예시.
