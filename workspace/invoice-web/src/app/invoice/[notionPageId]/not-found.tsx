import Link from "next/link";

import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";

export default function InvoiceNotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <Section>
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">견적서를 찾을 수 없습니다</h1>
          <p className="text-sm text-muted-foreground">
            요청하신 견적서가 존재하지 않거나 삭제되었습니다. 발행자에게 올바른 링크를 다시
            요청해 주세요.
          </p>
          <Button asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </Section>
    </main>
  );
}
