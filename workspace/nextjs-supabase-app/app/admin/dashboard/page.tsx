import {
  CalendarDays,
  CalendarX,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { createClient } from "@/lib/supabase/server";
import { getEventListDisplayData } from "@/app/events/event-list-data";
import type { Event, EventStatus } from "@/types/event";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthIso = startOfMonth.toISOString();

  const [
    { count: totalEventCount },
    { count: activeEventCount },
    { count: totalUserCount },
    { count: newSignupCount },
    { data: recentEvents },
    { data: recentSignups },
  ] = await Promise.all([
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "recruiting"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonthIso),
    supabase
      .from("events")
      .select("id, title, organizer_id, status, starts_at, deleted_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("profiles")
      .select("email, nickname, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const { organizers } = await getEventListDisplayData(
    supabase,
    (recentEvents ?? []) as Event[],
  );

  const statsCards = [
    { title: "총 이벤트", value: totalEventCount ?? 0, icon: CalendarDays },
    { title: "총 사용자", value: totalUserCount ?? 0, icon: Users },
    { title: "진행중 이벤트", value: activeEventCount ?? 0, icon: TrendingUp },
    { title: "이번 달 신규 가입", value: newSignupCount ?? 0, icon: UserPlus },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 이벤트</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents && recentEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>주최자</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>
                      {organizers[event.organizer_id]?.name ??
                        event.organizer_id}
                    </TableCell>
                    <TableCell>
                      <EventStatusBadge status={event.status as EventStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={<CalendarX />}
              title="등록된 이벤트가 없습니다."
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 가입자</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSignups && recentSignups.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>가입일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSignups.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell>
                      {user.nickname ?? user.full_name ?? "이름 미설정"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState icon={<Users />} title="가입한 사용자가 없습니다." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
