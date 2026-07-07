import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/events";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 닉네임을 아직 설정하지 않은 사용자(신규 가입 직후 등)는 프로필 설정 화면으로 안내한다
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile?.nickname) {
          redirect(`${origin}/profile`);
        }
      }

      redirect(`${origin}${next}`);
    } else {
      redirect(`${origin}/auth/error?error=${error.message}`);
    }
  }

  redirect(`${origin}/auth/error?error=No code provided`);
}
