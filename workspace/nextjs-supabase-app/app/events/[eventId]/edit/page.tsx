import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BackToEventsLink } from "@/components/back-to-events-link";
import { EventForm } from "@/components/event-form";
import { createClient } from "@/lib/supabase/server";
import type { EventFormValues } from "@/types/event";
import EditEventLoading from "./loading";

async function EditEventForm({ eventId }: { eventId: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  // 주최자가 아니면 수정 페이지에 접근할 수 없다
  if (!event || !user || event.organizer_id !== user.id) {
    notFound();
  }

  const initialValues: Partial<EventFormValues> = {
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    starts_at: new Date(event.starts_at),
    capacity: event.capacity,
    join_type: event.join_type as EventFormValues["join_type"],
    schedule: event.schedule ?? "",
    items_to_bring: event.items_to_bring ?? "",
    recurrence_type:
      event.recurrence_type as EventFormValues["recurrence_type"],
    recurrence_weekday: event.recurrence_weekday ?? undefined,
    recurrence_week_of_month: event.recurrence_week_of_month ?? undefined,
    recurrence_day_of_month: event.recurrence_day_of_month ?? undefined,
    recurrence_time: event.recurrence_time ?? "",
    settlement_visible: event.settlement_visible,
    image_url: event.image_url,
  };

  return (
    <EventForm mode="edit" eventId={event.id} initialValues={initialValues} />
  );
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackToEventsLink />
        <h1 className="text-2xl font-bold">이벤트 수정</h1>
      </div>
      <div className="max-w-xl">
        <Suspense fallback={<EditEventLoading />}>
          <EditEventResolved params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function EditEventResolved({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EditEventForm eventId={eventId} />;
}
