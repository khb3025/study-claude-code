import { Suspense } from "react";
import { CalendarX } from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { EventList } from "@/components/event-list";
import { createClient } from "@/lib/supabase/server";
import { getEventListDisplayData } from "@/app/events/event-list-data";
import type { Event } from "@/types/event";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <CalendarX className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">생성한 이벤트가 없습니다.</p>
    </div>
  );
}

// 내가 주최한 이벤트만 조회해 보여주는 서버 컴포넌트
async function MyEventsList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">로그인이 필요합니다.</p>
    );
  }

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("starts_at");

  if (!events || events.length === 0) {
    return <EmptyState />;
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

export default function MyEventsPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">나의 주최 이벤트</h1>
      </div>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <MyEventsList />
      </Suspense>
    </div>
  );
}
