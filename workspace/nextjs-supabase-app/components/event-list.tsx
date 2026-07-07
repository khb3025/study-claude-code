"use client";

import { useState } from "react";
import { EventCard } from "@/components/event-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EVENT_STATUS, type Event, type EventStatus } from "@/types/event";
import type { EventOrganizerInfo } from "@/app/events/event-list-data";

type ListFilter = EventStatus | "all" | "deleted";

const FILTERS: { value: ListFilter; label: string }[] = [
  { value: "all", label: "전체" },
  {
    value: EVENT_STATUS.RECRUITING.value,
    label: EVENT_STATUS.RECRUITING.label,
  },
  { value: EVENT_STATUS.CLOSED.value, label: EVENT_STATUS.CLOSED.label },
  { value: EVENT_STATUS.FINISHED.value, label: EVENT_STATUS.FINISHED.label },
  { value: "deleted", label: "삭제됨" },
];

interface EventListProps {
  events: Event[];
  organizers?: Record<string, EventOrganizerInfo>;
  participantCounts?: Record<string, number>;
}

export function EventList({
  events,
  organizers = {},
  participantCounts = {},
}: EventListProps) {
  const [filter, setFilter] = useState<ListFilter>("all");

  const filteredEvents =
    filter === "all"
      ? events
      : filter === "deleted"
        ? events.filter((event) => event.deleted_at !== null)
        : events.filter((event) => event.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as ListFilter)}
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
          <EventCard
            key={event.id}
            event={event}
            organizerName={organizers[event.organizer_id]?.name}
            organizerEmail={organizers[event.organizer_id]?.email}
            participantCount={participantCounts[event.id] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
