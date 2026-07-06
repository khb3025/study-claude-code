"use client";

import { useState } from "react";
import { EventCard } from "@/components/event-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EVENT_STATUS, type Event, type EventStatus } from "@/types/event";

const FILTERS: { value: EventStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  {
    value: EVENT_STATUS.RECRUITING.value,
    label: EVENT_STATUS.RECRUITING.label,
  },
  { value: EVENT_STATUS.CLOSED.value, label: EVENT_STATUS.CLOSED.label },
  { value: EVENT_STATUS.FINISHED.value, label: EVENT_STATUS.FINISHED.label },
];

export function EventList({ events }: { events: Event[] }) {
  const [filter, setFilter] = useState<EventStatus | "all">("all");

  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((event) => event.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as EventStatus | "all")}
      >
        <TabsList>
          {FILTERS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
