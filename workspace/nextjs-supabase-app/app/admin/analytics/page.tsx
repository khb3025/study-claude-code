import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 월별 이벤트/가입자 추이 더미 데이터(차트 라이브러리 없이 Tailwind bar로 표현)
const MONTHLY_STATS = [
  { month: "2월", events: 12, signups: 20 },
  { month: "3월", events: 18, signups: 28 },
  { month: "4월", events: 22, signups: 31 },
  { month: "5월", events: 15, signups: 24 },
  { month: "6월", events: 27, signups: 40 },
  { month: "7월", events: 24, signups: 37 },
];

const MAX_VALUE = Math.max(
  ...MONTHLY_STATS.flatMap((item) => [item.events, item.signups]),
);

export default function AdminAnalyticsPage() {
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
          {MONTHLY_STATS.map((item) => (
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
                    style={{ width: `${(item.events / MAX_VALUE) * 100}%` }}
                  />
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${(item.signups / MAX_VALUE) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">월별 수치 표</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>월</TableHead>
                <TableHead>이벤트 수</TableHead>
                <TableHead>신규 가입자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MONTHLY_STATS.map((item) => (
                <TableRow key={item.month}>
                  <TableCell>{item.month}</TableCell>
                  <TableCell>{item.events}</TableCell>
                  <TableCell>{item.signups}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
