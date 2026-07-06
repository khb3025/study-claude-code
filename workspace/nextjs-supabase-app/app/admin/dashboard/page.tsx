import { CalendarDays, TrendingUp, UserPlus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventStatusBadge } from "@/components/event-status-badge";
import { DUMMY_EVENTS, DUMMY_ORGANIZERS } from "@/app/events/dummy-data";

// 대시보드 통계 카드용 더미 데이터(실제 DB 집계 연동 전까지 로컬 목업)
const STATS_CARDS = [
  { title: "총 이벤트", value: "128", icon: CalendarDays },
  { title: "총 사용자", value: "542", icon: Users },
  { title: "진행중 이벤트", value: "24", icon: TrendingUp },
  { title: "이번 달 신규 가입", value: "37", icon: UserPlus },
];

const RECENT_SIGNUPS = [
  { name: "김민준", email: "khb3025@gmail.com", joined_at: "2026-07-04" },
  { name: "이서연", email: "seoyeon@example.com", joined_at: "2026-07-03" },
  { name: "박지훈", email: "jihoon@example.com", joined_at: "2026-07-01" },
];

export default function AdminDashboardPage() {
  const recentEvents = DUMMY_EVENTS.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS_CARDS.map((stat) => {
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
                    {DUMMY_ORGANIZERS[event.organizer_id]?.name ??
                      event.organizer_id}
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={event.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 가입자</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>가입일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_SIGNUPS.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.joined_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
