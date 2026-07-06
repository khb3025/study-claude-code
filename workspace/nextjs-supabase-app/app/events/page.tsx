import { EventList } from "@/components/event-list";
import { EventQuickLinks } from "@/components/event-quick-links";
import { DUMMY_EVENTS } from "@/app/events/dummy-data";

export default function EventsPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <h1 className="text-2xl font-bold">이벤트 목록</h1>
      <EventQuickLinks />
      <EventList events={DUMMY_EVENTS} />
    </div>
  );
}
