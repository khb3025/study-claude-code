import Link from "next/link";
import { CalendarDays, Tent, Users, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EventStatusBadge } from "@/components/event-status-badge";
import { DUMMY_ORGANIZERS, DUMMY_PARTICIPANTS } from "@/app/events/dummy-data";
import type { Event } from "@/types/event";

// 이벤트 썸네일은 실제 이미지 필드 없이(신규 DB 컬럼 추가 없이) id 기반으로 결정되는 장식용 그라디언트다.
const THUMBNAIL_STYLES = [
  { gradient: "from-sky-500 to-blue-600", icon: Waves },
  { gradient: "from-emerald-500 to-teal-600", icon: Tent },
  { gradient: "from-orange-500 to-amber-600", icon: CalendarDays },
];

function getThumbnail(eventId: string) {
  const hash = Array.from(eventId).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return THUMBNAIL_STYLES[hash % THUMBNAIL_STYLES.length];
}

export function EventCard({ event }: { event: Event }) {
  const startsAt = new Date(event.starts_at);
  const organizer = DUMMY_ORGANIZERS[event.organizer_id];
  const participantCount = DUMMY_PARTICIPANTS.filter(
    (participant) =>
      participant.event_id === event.id && participant.status === "confirmed",
  ).length;
  const thumbnail = getThumbnail(event.id);
  const ThumbnailIcon = thumbnail.icon;

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex gap-3 p-3">
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white ${thumbnail.gradient}`}
          >
            <ThumbnailIcon className="h-8 w-8" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate font-semibold">{event.title}</h3>
              <EventStatusBadge status={event.status} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {startsAt.toLocaleString("ko-KR", {
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {organizer?.initial ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {organizer?.name ?? "알 수 없음"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {participantCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
