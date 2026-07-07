import { Suspense } from "react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FriendRequestActions } from "@/components/friend-request-actions";
import { FriendSearch } from "@/components/friend-search";
import { createClient } from "@/lib/supabase/server";

interface FriendProfile {
  id: string;
  nickname: string | null;
  full_name: string | null;
  name_visible: boolean;
  email: string | null;
}

function getDisplayName(
  profile: FriendProfile | undefined,
  fallbackId: string,
) {
  if (!profile) return fallbackId;
  return (
    profile.nickname ??
    (profile.name_visible ? profile.full_name : null) ??
    "이름 미설정"
  );
}

// 친구 목록/친구 요청 페이지: 수락된 친구와 대기중인(받은) 요청을 구분해 보여준다
// 친구 관계는 user_id -> friend_id 단방향으로 저장되지만, accepted 상태라면
// 어느 쪽에서 요청했든 양쪽 모두에게 "친구"로 보여야 하므로 양방향 조회 후 병합한다.
async function FriendsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>
    );
  }

  const { data: friendshipRows } = await supabase
    .from("friendships")
    .select("id, user_id, friend_id, status, created_at")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .order("created_at", { ascending: false });
  const friendships = friendshipRows ?? [];

  // 받은 요청: 상대방이 나에게(friend_id = 나) 보낸 대기중인 요청만 해당
  const pendingRequests = friendships.filter(
    (row) => row.status === "pending" && row.friend_id === user.id,
  );
  // 수락된 친구: 내가 보냈든 받았든 status가 accepted면 상대방 id를 뽑아낸다
  const acceptedFriendships = friendships.filter(
    (row) => row.status === "accepted",
  );

  const relatedUserIds = Array.from(
    new Set([
      ...pendingRequests.map((row) => row.user_id),
      ...acceptedFriendships.map((row) =>
        row.user_id === user.id ? row.friend_id : row.user_id,
      ),
    ]),
  );

  const { data: profileRows } =
    relatedUserIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, nickname, full_name, name_visible, email")
          .in("id", relatedUserIds)
      : { data: [] };
  const profileMap = new Map(
    (profileRows ?? []).map((profile) => [
      profile.id as string,
      profile as FriendProfile,
    ]),
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">받은 친구 요청</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              대기중인 친구 요청이 없습니다.
            </p>
          ) : (
            pendingRequests.map((request) => {
              const profile = profileMap.get(request.user_id);
              const displayName = getDisplayName(profile, request.user_id);
              return (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {profile?.email}
                      </span>
                    </div>
                  </div>
                  <FriendRequestActions friendshipId={request.id} />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">친구 목록</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {acceptedFriendships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 친구가 없습니다.
            </p>
          ) : (
            acceptedFriendships.map((friendship) => {
              const friendId =
                friendship.user_id === user.id
                  ? friendship.friend_id
                  : friendship.user_id;
              const profile = profileMap.get(friendId);
              const displayName = getDisplayName(profile, friendId);
              return (
                <div
                  key={friendship.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {profile?.email}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">친구</Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function FriendsPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">친구</h1>
      </div>

      <FriendSearch />

      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <FriendsContent />
      </Suspense>
    </div>
  );
}
