import { Suspense } from "react";
import { CalendarX } from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { EmptyState } from "@/components/empty-state";
import { EventList } from "@/components/event-list";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";
import { getEventListDisplayData } from "@/app/events/event-list-data";
import type { Event } from "@/types/event";

// 내가 참여자로 등록된 이벤트만 조회해 보여주는 서버 컴포넌트.
// 취소(cancelled)/강퇴(kicked) 상태인 참여 기록은 더 이상 "참여 중"이 아니므로 제외한다.
async function JoinedEventsList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>
    );
  }

  const { data: participantRows } = await supabase
    .from("participants")
    .select("event_id")
    .eq("user_id", user.id)
    .not("status", "in", "(cancelled,kicked)");

  const joinedEventIds = Array.from(
    new Set((participantRows ?? []).map((row) => row.event_id as string)),
  );

  if (joinedEventIds.length === 0) {
    return (
      <EmptyState icon={<CalendarX />} title="참여 중인 이벤트가 없습니다." />
    );
  }

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .in("id", joinedEventIds)
    .order("starts_at");

  if (!events || events.length === 0) {
    return (
      <EmptyState icon={<CalendarX />} title="참여 중인 이벤트가 없습니다." />
    );
  }

  const { organizers, participantCounts } = await getEventListDisplayData(
    supabase,
    events as Event[],
  );

  return (
    <EventList
      events={events as Event[]}
      organizers={organizers}
      participantCounts={participantCounts}
    />
  );
}

export default function JoinedEventsPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">참여 이벤트</h1>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[104px] w-full rounded-lg" />
            ))}
          </div>
        }
      >
        <JoinedEventsList />
      </Suspense>
    </div>
  );
}
