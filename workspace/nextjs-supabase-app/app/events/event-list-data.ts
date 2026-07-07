import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/event";

export interface EventOrganizerInfo {
  name: string;
  email: string | null;
}

// 이벤트 목록 카드에 필요한 주최자 표시 정보(닉네임/실명공개 규칙 반영)와 확정 참여자 수를 일괄 조회한다
export async function getEventListDisplayData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  events: Event[],
) {
  const organizerIds = Array.from(
    new Set(events.map((event) => event.organizer_id)),
  );
  const eventIds = events.map((event) => event.id);

  const [{ data: profileRows }, { data: participantRows }] = await Promise.all([
    organizerIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, nickname, full_name, name_visible, email")
          .in("id", organizerIds)
      : Promise.resolve({ data: [] as never[] }),
    eventIds.length > 0
      ? supabase
          .from("participants")
          .select("event_id")
          .in("event_id", eventIds)
          .eq("status", "confirmed")
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const organizers: Record<string, EventOrganizerInfo> = {};
  for (const profile of profileRows ?? []) {
    const displayName =
      profile.nickname ?? (profile.name_visible ? profile.full_name : null);
    organizers[profile.id as string] = {
      name: displayName ?? "이름 미설정",
      email: profile.email as string | null,
    };
  }

  const participantCounts: Record<string, number> = {};
  for (const row of participantRows ?? []) {
    const eventId = row.event_id as string;
    participantCounts[eventId] = (participantCounts[eventId] ?? 0) + 1;
  }

  return { organizers, participantCounts };
}
