import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

// 관리자 통계 분석 페이지: get_monthly_stats RPC로 월별 이벤트/가입자 추이를 조회(조회 전용)
export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: monthlyStats } = await supabase.rpc("get_monthly_stats");

  interface MonthlyStatRow {
    stat_month: string;
    event_count: number;
    signup_count: number;
  }

  const stats = ((monthlyStats ?? []) as MonthlyStatRow[]).map((row) => ({
    month: new Date(row.stat_month).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    }),
    events: row.event_count,
    signups: row.signup_count,
  }));

  const maxValue = Math.max(
    1,
    ...stats.flatMap((item) => [item.events, item.signups]),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">통계 분석</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            월별 이벤트 수 / 신규 가입자 추이
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {stats.length > 0 ? (
            stats.map((item) => (
              <div key={item.month} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.month}</span>
                  <span className="text-muted-foreground">
                    이벤트 {item.events} · 신규가입 {item.signups}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(item.events / maxValue) * 100}%` }}
                    />
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-sky-500"
                      style={{ width: `${(item.signups / maxValue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              집계할 데이터가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">월별 수치 표</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>월</TableHead>
                  <TableHead>이벤트 수</TableHead>
                  <TableHead>신규 가입자</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((item) => (
                  <TableRow key={item.month}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell>{item.events}</TableCell>
                    <TableCell>{item.signups}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              집계할 데이터가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
