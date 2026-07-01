import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { EXAMPLE_SECTIONS } from "@/lib/constants";

export default function ExamplesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="예제 모음"
        description="실제 동작하는 예제를 통해 스타터킷의 모든 기능을 탐색해보세요. 각 예제는 소스 코드와 함께 제공됩니다."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {EXAMPLE_SECTIONS.map((section) => (
          <div
            key={section.href}
            className="flex flex-col rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg border border-border p-2">
                <section.icon className="size-4" />
              </div>
              <h2 className="font-semibold">{section.label}</h2>
            </div>
            <p className="flex-1 text-sm text-muted-foreground mb-4">
              {section.description}
            </p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {section.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button asChild size="sm" className="w-full">
              <Link href={section.href}>예제 보기</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
