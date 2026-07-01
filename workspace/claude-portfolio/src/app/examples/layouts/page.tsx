import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { CodeBlock } from "@/components/shared/code-block";

const GRID_CODE = `// 2/3열 그리드 레이아웃
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <div className="rounded-lg border p-4">카드 1</div>
  <div className="rounded-lg border p-4">카드 2</div>
  <div className="rounded-lg border p-4">카드 3</div>
</div>

// 12열 베이스 그리드 (사이드바 + 콘텐츠)
<div className="grid grid-cols-12 gap-6">
  <aside className="col-span-12 md:col-span-3">사이드바</aside>
  <main className="col-span-12 md:col-span-9">메인 콘텐츠</main>
</div>`;

const FLEX_CODE = `// 수평 정렬 — justify / items
<div className="flex items-center justify-between">
  <span>왼쪽</span>
  <span>오른쪽</span>
</div>

// 스택 — flex-col + gap
<div className="flex flex-col gap-4">
  <div>항목 1</div>
  <div>항목 2</div>
  <div>항목 3</div>
</div>

// 반응형 방향 전환
<div className="flex flex-col gap-4 sm:flex-row">
  <div className="flex-1">왼쪽 (모바일: 상단)</div>
  <div className="flex-1">오른쪽 (모바일: 하단)</div>
</div>`;

const DASHBOARD_CODE = `// 대시보드 레이아웃 — Sidebar + Main
// app/(dashboard)/layout.tsx

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="hidden w-64 border-r border-border bg-background md:flex md:flex-col">
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard">대시보드</Link>
          <Link href="/dashboard/users">사용자</Link>
          <Link href="/dashboard/settings">설정</Link>
        </nav>
      </aside>

      {/* 메인 */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
          <h1 className="text-lg font-semibold">대시보드</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}`;

const STAT_CARD_CODE = `// 통계 카드 그리드
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  {stats.map((stat) => (
    <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{stat.label}</p>
      <p className="mt-1 text-2xl font-bold">{stat.value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
    </div>
  ))}
</div>`;

const CENTERED_CODE = `// 중앙 정렬 컨테이너 — Hero / CTA 섹션에 자주 사용
<section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
  <h1 className="max-w-3xl text-4xl font-bold">제목</h1>
  <p className="mt-4 max-w-xl text-muted-foreground">설명 텍스트</p>
  <div className="mt-8 flex gap-4">
    <Button size="lg">시작하기</Button>
    <Button size="lg" variant="outline">더 알아보기</Button>
  </div>
</section>

// 일반 페이지 컨테이너
<div className="container mx-auto px-4 py-16">
  {/* 최대 너비 제한 + 좌우 여백 */}
</div>`;

export default function LayoutsPage() {
  return (
    <div className="space-y-12">
      <PageHeader
        title="레이아웃 예제"
        description="Grid, Flex, Dashboard, 반응형 레이아웃 구현 패턴"
      />

      <Separator />

      {/* Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Grid 레이아웃</h2>
        <p className="text-sm text-muted-foreground">
          Tailwind CSS grid 유틸리티로 반응형 카드 그리드와 컬럼 레이아웃을 구성합니다.
        </p>
        <div className="rounded-lg border border-border p-4 space-y-4">
          {/* 3열 카드 그리드 */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">3열 카드 그리드</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["카드 1", "카드 2", "카드 3"].map((label) => (
              <div key={label} className="rounded-md border border-border bg-muted/30 p-4 text-sm text-center">
                {label}
              </div>
            ))}
          </div>
          {/* 사이드바 + 콘텐츠 */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">사이드바 + 콘텐츠</p>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-3 rounded-md border border-border bg-muted/30 p-3 text-sm text-center">
              사이드바
            </div>
            <div className="col-span-9 rounded-md border border-border bg-muted/30 p-3 text-sm text-center">
              메인 콘텐츠
            </div>
          </div>
        </div>
        <CodeBlock code={GRID_CODE} />
      </section>

      <Separator />

      {/* Flex */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Flex 레이아웃</h2>
        <p className="text-sm text-muted-foreground">
          flex + gap 조합으로 수평/수직 정렬과 반응형 방향 전환을 구현합니다.
        </p>
        <div className="rounded-lg border border-border p-4 space-y-4">
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
            <span className="text-sm">왼쪽 콘텐츠</span>
            <span className="text-sm text-muted-foreground">오른쪽 콘텐츠</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {["항목 A", "항목 B", "항목 C"].map((item) => (
              <div
                key={item}
                className="flex-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-center"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <CodeBlock code={FLEX_CODE} />
      </section>

      <Separator />

      {/* 통계 카드 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">통계 카드 그리드</h2>
        <p className="text-sm text-muted-foreground">
          대시보드에서 자주 사용하는 KPI / 통계 카드 패턴입니다.
        </p>
        <div className="rounded-lg border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "총 매출", value: "₩12.4M", change: "+12.5% 이번 달" },
              { label: "활성 사용자", value: "2,350", change: "+8.2% 이번 달" },
              { label: "신규 주문", value: "456", change: "+4.6% 이번 달" },
              { label: "전환율", value: "3.24%", change: "-0.1% 이번 달" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
              </div>
            ))}
          </div>
        </div>
        <CodeBlock code={STAT_CARD_CODE} />
      </section>

      <Separator />

      {/* Dashboard Layout 코드 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">대시보드 레이아웃 구조</h2>
        <p className="text-sm text-muted-foreground">
          사이드바 + 메인 영역으로 구성된 대시보드 레이아웃 코드입니다.
          이 프로젝트의{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            src/app/(dashboard)/layout.tsx
          </code>
          를 참고하세요.
        </p>
        <CodeBlock code={DASHBOARD_CODE} />
      </section>

      <Separator />

      {/* 중앙 정렬 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">중앙 정렬 컨테이너</h2>
        <p className="text-sm text-muted-foreground">
          Hero 섹션, CTA 섹션에 자주 사용하는 중앙 정렬 + 최대 너비 패턴입니다.
        </p>
        <div className="rounded-lg border border-border p-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <h3 className="max-w-xs text-xl font-bold">섹션 제목</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              설명 텍스트가 여기에 위치합니다.
            </p>
          </div>
        </div>
        <CodeBlock code={CENTERED_CODE} />
      </section>
    </div>
  );
}
