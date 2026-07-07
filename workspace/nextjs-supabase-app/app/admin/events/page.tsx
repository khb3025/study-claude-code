import { CalendarX, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { EventStatusBadge } from "@/components/event-status-badge";
import { AdminEventRowActions } from "@/components/admin-event-row-actions";
import { createClient } from "@/lib/supabase/server";
import { getEventListDisplayData } from "@/app/events/event-list-data";
import type { Event, EventStatus } from "@/types/event";

interface AdminEventsPageProps {
  searchParams: Promise<{ q?: string }>;
}

// 관리자 이벤트 관리 페이지: 제목 검색, 공지 등록, 강제 삭제(소프트 삭제) 액션 제공
export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: events } = await query;
  const { organizers, participantCounts } = await getEventListDisplayData(
    supabase,
    (events ?? []) as Event[],
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">이벤트 관리</h1>

      <form className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="이벤트 제목으로 검색"
          className="pl-9"
        />
      </form>

      {events && events.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>비밀번호</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>호스트</TableHead>
              <TableHead>참여자 수</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {event.password_hash ? "••••••••" : "-"}
                </TableCell>
                <TableCell>
                  {new Date(event.starts_at).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell>
                  <EventStatusBadge status={event.status as EventStatus} />
                </TableCell>
                <TableCell>
                  {organizers[event.organizer_id]?.name ?? event.organizer_id}
                </TableCell>
                <TableCell>{participantCounts[event.id] ?? 0}</TableCell>
                <TableCell className="text-right">
                  <AdminEventRowActions
                    eventId={event.id}
                    eventTitle={event.title}
                    adminNotice={event.admin_notice}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<CalendarX />}
          title="조건에 맞는 이벤트가 없습니다."
        />
      )}
    </div>
  );
}
