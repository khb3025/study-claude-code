import { ArrowRight, Download, Loader2, Mail, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";

function ExampleGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function ButtonsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="버튼 & 배지"
        description="Button과 Badge 컴포넌트의 모든 variant, size, 상태 조합"
      />

      <Separator />

      {/* Button Variants */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Button — Variant</h2>
        <ExampleGroup title="기본 (variant)">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </ExampleGroup>

        <ExampleGroup title="크기 (size)">
          <Button size="xs">XSmall</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </ExampleGroup>

        <ExampleGroup title="아이콘 포함">
          <Button>
            <Mail className="size-4" />
            이메일 보내기
          </Button>
          <Button variant="outline">
            <Download className="size-4" />
            다운로드
          </Button>
          <Button variant="secondary">
            다음
            <ArrowRight className="size-4" />
          </Button>
        </ExampleGroup>

        <ExampleGroup title="아이콘 전용 (icon)">
          <Button size="icon" variant="default">
            <Plus className="size-4" />
          </Button>
          <Button size="icon" variant="outline">
            <Trash2 className="size-4" />
          </Button>
          <Button size="icon-sm" variant="ghost">
            <Mail className="size-4" />
          </Button>
        </ExampleGroup>

        <ExampleGroup title="상태">
          <Button disabled>비활성화</Button>
          <Button variant="outline" disabled>
            비활성화 (outline)
          </Button>
          {/* 로딩 상태 — 실제 구현 시 isLoading 상태 연결 */}
          <Button disabled>
            <Loader2 className="size-4 animate-spin" />
            처리 중…
          </Button>
        </ExampleGroup>
      </section>

      <Separator />

      {/* Badge Variants */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Badge — Variant</h2>
        <ExampleGroup title="기본 (variant)">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </ExampleGroup>

        <ExampleGroup title="사용 패턴">
          <Badge variant="secondary">신규</Badge>
          <Badge variant="default">
            <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-400" />
            온라인
          </Badge>
          <Badge variant="destructive">오류</Badge>
          <Badge variant="outline">v2.0.0</Badge>
        </ExampleGroup>
      </section>
    </div>
  );
}
