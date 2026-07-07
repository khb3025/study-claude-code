import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { ProfileAvatar } from "./profile-avatar";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">로그인</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/sign-up">회원가입</Link>
        </Button>
      </div>
    );
  }

  // 데스크톱 상단 내비게이션에서도 모바일과 동일하게 /profile로 진입할 수 있게 한다
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, avatar_url")
    .eq("id", user.sub as string)
    .maybeSingle();
  const displayName = profile?.nickname || (user.email as string);

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm sm:inline">
        {displayName}님 안녕하세요!
      </span>
      <Button asChild size="sm" variant="outline">
        <Link href="/profile" className="flex items-center gap-1.5">
          <ProfileAvatar
            avatarUrl={profile?.avatar_url}
            name={displayName}
            size="sm"
          />
          프로필
        </Link>
      </Button>
      <LogoutButton />
    </div>
  );
}
