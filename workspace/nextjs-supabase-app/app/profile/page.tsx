import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Users } from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { ProfileEditDialog } from "@/components/profile-edit-dialog";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

async function ProfileContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  const seedName = profile.full_name || profile.email || user.id;

  // 회원가입 직후 등 닉네임을 아직 설정하지 않은 사용자는 설정 화면으로 안내한다
  if (!profile.nickname) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-lg font-bold">프로필을 설정해주세요</h2>
            <p className="text-sm text-muted-foreground">
              닉네임과 프로필 사진을 설정하면 이벤트를 시작할 수 있어요.
            </p>
          </div>
          <ProfileEditForm
            initialNickname={profile.nickname}
            initialNameVisible={profile.name_visible}
            initialAvatarUrl={profile.avatar_url}
            seedName={seedName}
            mode="setup"
          />
        </CardContent>
      </Card>
    );
  }

  const [
    { count: createdEventCount },
    { count: joinedEventCount },
    { data: adminRow },
  ] = await Promise.all([
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("organizer_id", user.id),
    supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "confirmed"),
    supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const displayName = profile.nickname;
  const joinedAt = new Date(profile.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              avatarUrl={profile.avatar_url}
              name={displayName}
              size="lg"
              className="h-14 w-14 text-lg"
            />
            <div>
              <p className="text-lg font-bold">
                {displayName}
                {profile.name_visible && profile.full_name && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    ({profile.full_name})
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <ProfileEditDialog
            nickname={profile.nickname}
            nameVisible={profile.name_visible}
            avatarUrl={profile.avatar_url}
            seedName={seedName}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/events/mine">
          <Card className="transition-colors hover:bg-accent/50">
            <CardContent className="flex flex-col items-center gap-1 p-5">
              <CalendarDays className="h-6 w-6 text-primary" />
              <p className="text-2xl font-bold">{createdEventCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">만든 이벤트</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/events/joined">
          <Card className="transition-colors hover:bg-accent/50">
            <CardContent className="flex flex-col items-center gap-1 p-5">
              <Users className="h-6 w-6 text-primary" />
              <p className="text-2xl font-bold">{joinedEventCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">참여한 이벤트</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <h3 className="font-semibold">계정 정보</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">역할</span>
            {adminRow ? (
              <Link href="/admin/dashboard" className="text-primary underline">
                관리자
              </Link>
            ) : (
              <span>사용자</span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">가입일</span>
            <span>{joinedAt}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">닉네임</span>
            <span>{profile.nickname}</span>
          </div>
        </CardContent>
      </Card>

      <LogoutButton variant="destructive" className="w-full" />
    </>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">프로필</h1>
      </div>
      <div className="flex flex-col gap-4">
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">불러오는 중...</p>
          }
        >
          <ProfileContent />
        </Suspense>
      </div>
    </div>
  );
}
