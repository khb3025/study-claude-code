import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";

// 이미 로그인된 사용자가 로그인 페이지에 직접 접근하면 이벤트 목록으로 이동시킨다
async function RedirectIfAuthenticated() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/events");
  }

  return null;
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Suspense>
        <RedirectIfAuthenticated />
      </Suspense>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
