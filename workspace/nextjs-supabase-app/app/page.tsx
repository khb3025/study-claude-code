import { CalendarPlus, Link2, Users } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

// 서비스 소개용 웰컴 페이지: "Gather" 브랜드, 핵심 기능 3가지, 시작하기 CTA로 구성
const FEATURES = [
  {
    icon: CalendarPlus,
    title: "간편한 이벤트 생성",
    description: "제목, 날짜, 장소만 입력하면 즉시 이벤트 생성",
  },
  {
    icon: Link2,
    title: "원클릭 초대 시스템",
    description: "자동 생성된 초대 링크를 카카오톡으로 간편 공유",
  },
  {
    icon: Users,
    title: "실시간 참여자 관리",
    description: "참여자 목록 자동 업데이트로 현황 파악",
  },
] as const;

// 이미 로그인된 사용자는 웰컴 페이지를 볼 필요 없이 이벤트 목록으로 바로 이동한다
async function RedirectIfAuthenticated() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/events");
  }

  return null;
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {hasEnvVars && (
        <Suspense>
          <RedirectIfAuthenticated />
        </Suspense>
      )}
      <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
        <div className="flex w-full max-w-5xl items-center justify-end p-3 px-5 text-sm">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </nav>

      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold text-primary">Gather</h1>
          <p className="text-sm text-muted-foreground">
            초대 링크 하나로 모든 것을 해결하는
            <br />
            일회성 이벤트 관리 플랫폼
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardContent className="flex flex-col items-center gap-2 p-5">
                  <Icon className="h-6 w-6 text-primary" />
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href="/auth/login">로그인하기</Link>
        </Button>

        <p className="text-xs text-muted-foreground">
          5-30명 규모의 소규모 이벤트에 최적화된 플랫폼
        </p>
      </div>
    </main>
  );
}
