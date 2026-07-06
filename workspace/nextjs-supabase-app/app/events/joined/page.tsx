import { CalendarX } from "lucide-react";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { EventList } from "@/components/event-list";
import {
  CURRENT_USER_ID,
  DUMMY_EVENTS,
  DUMMY_PARTICIPANTS,
} from "@/app/events/dummy-data";

// 내가 참여자로 등록된 이벤트만 필터링해 보여주는 페이지
export default function JoinedEventsPage() {
  const joinedEventIds = DUMMY_PARTICIPANTS.filter(
    (participant) => participant.user_id === CURRENT_USER_ID,
  ).map((participant) => participant.event_id);
  const joinedEvents = DUMMY_EVENTS.filter((event) =>
    joinedEventIds.includes(event.id),
  );

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">참여 이벤트</h1>
      </div>
      {joinedEvents.length > 0 ? (
        <EventList events={joinedEvents} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <CalendarX className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            참여 중인 이벤트가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}
