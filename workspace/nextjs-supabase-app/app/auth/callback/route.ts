import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const explicitNext = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 닉네임을 아직 설정하지 않은 사용자(신규 가입 직후 등)는 프로필 설정 화면으로 안내한다
        const { data: profile } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile?.nickname) {
          redirect(`${origin}/profile`);
        }

        // 초대 링크 등으로 명시적인 이동 경로가 지정된 경우 그 경로를 우선한다
        if (explicitNext) {
          redirect(`${origin}${explicitNext}`);
        }

        // 관리자 계정은 관리자 대시보드로, 그 외에는 이벤트 목록(홈)으로 이동
        const { data: adminRow } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        redirect(`${origin}${adminRow ? "/admin/dashboard" : "/events"}`);
      }

      redirect(`${origin}${explicitNext ?? "/events"}`);
    } else {
      redirect(`${origin}/auth/error?error=${error.message}`);
    }
  }

  redirect(`${origin}/auth/error?error=No code provided`);
}
