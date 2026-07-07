import { Suspense } from "react";
import { EventList } from "@/components/event-list";
import { EventQuickLinks } from "@/components/event-quick-links";
import { createClient } from "@/lib/supabase/server";
import { getEventListDisplayData } from "@/app/events/event-list-data";
import type { Event } from "@/types/event";

async function EventListSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .is("deleted_at", null)
    .order("starts_at");

  if (!events || events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 등록된 이벤트가 없습니다.
      </p>
    );
  }

  // 내가 차단한 주최자의 이벤트는 목록에서 제외한다
  let visibleEvents = events as Event[];
  if (user) {
    const { data: blacklistRows } = await supabase
      .from("blacklists")
      .select("blocked_organizer_id")
      .eq("blocker_id", user.id);
    const blockedOrganizerIds = new Set(
      (blacklistRows ?? []).map((row) => row.blocked_organizer_id as string),
    );
    if (blockedOrganizerIds.size > 0) {
      visibleEvents = visibleEvents.filter(
        (event) => !blockedOrganizerIds.has(event.organizer_id),
      );
    }
  }

  if (visibleEvents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        아직 등록된 이벤트가 없습니다.
      </p>
    );
  }

  const { organizers, participantCounts } = await getEventListDisplayData(
    supabase,
    visibleEvents,
  );

  return (
    <EventList
      events={visibleEvents}
      organizers={organizers}
      participantCounts={participantCounts}
    />
  );
}

// 내가 받은 대기중(pending)인 초대 수를 조회한다. 내가 차단한 주최자의 초대는 이미 목록에서 제외되므로 여기서도 제외한다.
async function EventQuickLinksSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <EventQuickLinks />;
  }

  const [{ data: invitationRows }, { data: blacklistRows }] = await Promise.all(
    [
      supabase
        .from("invitations")
        .select("inviter_id")
        .eq("invitee_id", user.id)
        .eq("status", "pending"),
      supabase
        .from("blacklists")
        .select("blocked_organizer_id")
        .eq("blocker_id", user.id),
    ],
  );

  const blockedOrganizerIds = new Set(
    (blacklistRows ?? []).map((row) => row.blocked_organizer_id as string),
  );
  const pendingInvitationCount = (invitationRows ?? []).filter(
    (row) => !blockedOrganizerIds.has(row.inviter_id as string),
  ).length;

  return <EventQuickLinks pendingInvitationCount={pendingInvitationCount} />;
}

export default function EventsPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold">이벤트 목록</h1>
      <Suspense fallback={<EventQuickLinks />}>
        <EventQuickLinksSection />
      </Suspense>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <EventListSection />
      </Suspense>
    </div>
  );
}
