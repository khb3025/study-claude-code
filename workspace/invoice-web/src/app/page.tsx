import { FileText, NotebookPen, Link2, Download, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/shared/section";
import { SITE_CONFIG } from "@/lib/constants";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const ISSUER_STEPS: Step[] = [
  { icon: NotebookPen, title: "노션에서 견적서 작성", description: "노션 데이터베이스에 견적서 정보와 항목을 입력합니다." },
  { icon: Link2, title: "고유 링크 전달", description: "자동 생성된 견적서 URL을 이메일이나 메신저로 클라이언트에게 공유합니다." },
];

const CLIENT_STEPS: Step[] = [
  { icon: Link2, title: "링크로 접속", description: "전달받은 고유 URL로 접속하면 별도 가입이나 로그인 없이 바로 견적서를 확인할 수 있습니다." },
  { icon: FileText, title: "견적서 확인", description: "공급자 정보, 항목별 내역, 총 금액, 유효기간을 웹 화면에서 확인합니다." },
  { icon: Download, title: "PDF 다운로드", description: "필요하면 PDF 다운로드 버튼으로 견적서를 저장하거나 인쇄할 수 있습니다." },
];

function StepList({ steps }: { steps: Step[] }) {
  return (
    <>
      {steps.map((step, index) => (
        <div key={step.title} className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {index + 1}
          </div>
          <div>
            <p className="flex items-center gap-1.5 font-medium">
              <step.icon aria-hidden="true" className="size-4 text-muted-foreground" />
              {step.title}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Section className="flex flex-col items-center gap-6 pb-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileText aria-hidden="true" className="size-7" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{SITE_CONFIG.name}</h1>
          <p className="mx-auto max-w-md text-balance text-muted-foreground">
            {SITE_CONFIG.description}
          </p>
        </div>
        <Badge variant="secondary">회원가입·로그인 없이 고유 링크로 바로 확인</Badge>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>발행자 (견적서 작성)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <StepList steps={ISSUER_STEPS} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>클라이언트 (견적서 확인)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <StepList steps={CLIENT_STEPS} />
            </CardContent>
          </Card>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          받으신 견적서 링크가 없거나 만료되었다면, 견적서를 발행한 담당자에게 문의해주세요.
        </p>
      </Section>
    </main>
  );
}
