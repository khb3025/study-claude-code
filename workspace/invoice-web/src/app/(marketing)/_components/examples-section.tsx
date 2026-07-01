import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EXAMPLE_SECTIONS } from "@/lib/constants";

export function ExamplesSection() {
  return (
    <section id="examples" className="px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            예제 모음
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            실제 동작하는 예제를 통해 스타터킷의 모든 기능을 탐색해보세요.
            각 예제는 소스 코드와 함께 제공됩니다.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLE_SECTIONS.map((section) => (
            <div
              key={section.href}
              className="flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg border border-border p-2">
                  <section.icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{section.label}</h3>
              </div>
              <p className="flex-1 text-sm text-muted-foreground mb-4">
                {section.description}
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {section.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button asChild className="w-full">
                <Link href={section.href}>예제 보기</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
