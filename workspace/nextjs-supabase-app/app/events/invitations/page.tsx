import { Suspense } from "react";
import { Mail } from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { Card, CardContent } from "@/components/ui/card";
import { InvitationActions } from "@/components/invitation-actions";
import { OrganizerBlockSearch } from "@/components/organizer-block-search";
import { createClient } from "@/lib/supabase/server";

// 받은 이벤트 초대 목록: 아직 응답하지 않은(pending) 초대만 보여주며 수락/거절, 주최자 차단 액션을 제공한다.
// 수락/거절한 초대는 더 이상 대기 상태가 아니므로 조회 시점에 목록에서 제외된다.
async function InvitationList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <Mail className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>
      </div>
    );
  }

  const { data: invitationRows } = await supabase
    .from("invitations")
    .select("id, event_id, inviter_id, created_at")
    .eq("invitee_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // 내가 차단한 주최자가 보낸 초대는 목록에서 제외한다
  const { data: blacklistRows } = await supabase
    .from("blacklists")
    .select("blocked_organizer_id")
    .eq("blocker_id", user.id);
  const blockedOrganizerIds = new Set(
    (blacklistRows ?? []).map((row) => row.blocked_organizer_id as string),
  );

  const invitations = (invitationRows ?? []).filter(
    (invitation) => !blockedOrganizerIds.has(invitation.inviter_id),
  );

  const eventIds = Array.from(
    new Set(invitations.map((invitation) => invitation.event_id)),
  );
  const inviterIds = Array.from(
    new Set(invitations.map((invitation) => invitation.inviter_id)),
  );

  const { data: eventRows } =
    eventIds.length > 0
      ? await supabase.from("events").select("id, title").in("id", eventIds)
      : { data: [] };
  const eventTitleMap = new Map(
    (eventRows ?? []).map((event) => [
      event.id as string,
      event.title as string,
    ]),
  );

  const { data: profileRows } =
    inviterIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, nickname, full_name, name_visible")
          .in("id", inviterIds)
      : { data: [] };
  const organizerNameMap = new Map(
    (profileRows ?? []).map((profile) => {
      const displayName =
        profile.nickname ?? (profile.name_visible ? profile.full_name : null);
      return [profile.id as string, displayName ?? "이름 미설정"];
    }),
  );

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
        <Mail className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">받은 초대가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {invitations.map((invitation) => {
        const eventTitle =
          eventTitleMap.get(invitation.event_id) ?? "알 수 없는 이벤트";
        const organizerName =
          organizerNameMap.get(invitation.inviter_id) ?? "이름 미설정";

        return (
          <Card key={invitation.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{eventTitle}</span>
                <p className="text-sm text-muted-foreground">
                  주최자: {organizerName}
                </p>
              </div>
              <InvitationActions
                invitationId={invitation.id}
                organizerId={invitation.inviter_id}
                organizerName={organizerName}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function InvitationsPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">초대 목록</h1>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">주최자 검색</h2>
        <OrganizerBlockSearch />
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <InvitationList />
      </Suspense>
    </div>
  );
}
