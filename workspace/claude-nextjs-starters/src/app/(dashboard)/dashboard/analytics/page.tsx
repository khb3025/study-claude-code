import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/utils";

// 월별 매출 더미 데이터
const MONTHLY_REVENUE = [
  { month: "1월", amount: 32000000, growth: 8.2 },
  { month: "2월", amount: 28500000, growth: -5.1 },
  { month: "3월", amount: 41200000, growth: 13.8 },
  { month: "4월", amount: 38700000, growth: -2.4 },
  { month: "5월", amount: 45100000, growth: 10.5 },
  { month: "6월", amount: 48350000, growth: 12.5 },
];

// 트래픽 소스 더미 데이터
const TRAFFIC_SOURCES = [
  { source: "검색 엔진", visits: 12840, percent: 52 },
  { source: "직접 방문", visits: 5920, percent: 24 },
  { source: "소셜 미디어", visits: 3450, percent: 14 },
  { source: "레퍼럴", visits: 2480, percent: 10 },
];

// 인기 페이지 더미 데이터
const TOP_PAGES = [
  { page: "/", views: 8432, bounce: "32%" },
  { page: "/examples", views: 4218, bounce: "28%" },
  { page: "/dashboard", views: 3105, bounce: "41%" },
  { page: "/examples/components", views: 1876, bounce: "22%" },
  { page: "/examples/forms", views: 1342, bounce: "19%" },
];

const maxAmount = Math.max(...MONTHLY_REVENUE.map((m) => m.amount));

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="통계"
        description="사이트 트래픽과 매출 현황을 분석하세요."
      />

      {/* 월별 매출 */}
      <Card>
        <CardHeader>
          <CardTitle>월별 매출</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MONTHLY_REVENUE.map((item) => (
              <div key={item.month} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="w-8 text-muted-foreground">{item.month}</span>
                  <div className="flex flex-1 items-center gap-3 mx-3">
                    <Progress
                      value={(item.amount / maxAmount) * 100}
                      className="h-2 flex-1"
                    />
                  </div>
                  <span className="w-28 text-right font-medium">
                    {formatCurrency(item.amount)}
                  </span>
                  <Badge
                    variant={item.growth > 0 ? "default" : "destructive"}
                    className="ml-2 w-16 justify-center text-xs"
                  >
                    {item.growth > 0 ? "+" : ""}
                    {item.growth}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 트래픽 소스 */}
        <Card>
          <CardHeader>
            <CardTitle>트래픽 소스</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TRAFFIC_SOURCES.map((item) => (
              <div key={item.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.source}</span>
                  <span className="text-muted-foreground">
                    {item.visits.toLocaleString()} ({item.percent}%)
                  </span>
                </div>
                <Progress value={item.percent} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 인기 페이지 */}
        <Card>
          <CardHeader>
            <CardTitle>인기 페이지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {TOP_PAGES.map((item, i) => (
                <div key={item.page}>
                  <div className="flex items-center justify-between py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-4 text-center text-muted-foreground text-xs">
                        {i + 1}
                      </span>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {item.page}
                      </code>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      <span>{item.views.toLocaleString()} 뷰</span>
                      <span>이탈 {item.bounce}</span>
                    </div>
                  </div>
                  {i < TOP_PAGES.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
