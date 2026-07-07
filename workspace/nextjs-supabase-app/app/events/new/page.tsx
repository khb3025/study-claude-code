import { BackToEventsLink } from "@/components/back-to-events-link";
import { EventForm } from "@/components/event-form";

export default function NewEventPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">이벤트 생성</h1>
      </div>
      <div className="max-w-xl">
        <EventForm mode="create" />
      </div>
    </div>
  );
}
