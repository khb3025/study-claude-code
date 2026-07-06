import { CalendarX } from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { EventList } from "@/components/event-list";
import { CURRENT_USER_ID, DUMMY_EVENTS } from "@/app/events/dummy-data";

// 내가 주최한 이벤트만 필터링해 보여주는 페이지
export default function MyEventsPage() {
  const myEvents = DUMMY_EVENTS.filter(
    (event) => event.organizer_id === CURRENT_USER_ID,
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">나의 주최 이벤트</h1>
      </div>
      {myEvents.length > 0 ? (
        <EventList events={myEvents} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <CalendarX className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            생성한 이벤트가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
