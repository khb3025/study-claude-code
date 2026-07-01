import {
  Users,
  TrendingUp,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

// 통계 카드 데이터
type StatCard = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
};

const STAT_CARDS: StatCard[] = [
  { title: "총 매출", value: formatCurrency(48350000), change: "+12.5%", icon: DollarSign },
  { title: "신규 사용자", value: "2,340", change: "+8.2%", icon: Users },
  { title: "주문 수", value: "1,893", change: "+3.1%", icon: ShoppingCart },
  { title: "성장률", value: "18.2%", change: "+4.6%", icon: TrendingUp },
];

// 최근 주문 더미 데이터
type Order = {
  id: string;
  customer: string;
  status: "완료" | "처리중" | "취소";
  amount: number;
  date: Date;
};

const RECENT_ORDERS: Order[] = [
  { id: "#1234", customer: "김철수", status: "완료", amount: 125000, date: new Date(Date.now() - 1000 * 60 * 5) },
  { id: "#1235", customer: "이영희", status: "처리중", amount: 89000, date: new Date(Date.now() - 1000 * 60 * 32) },
  { id: "#1236", customer: "박민준", status: "완료", amount: 342000, date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: "#1237", customer: "최지은", status: "취소", amount: 56000, date: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: "#1238", customer: "정우성", status: "처리중", amount: 198000, date: new Date(Date.now() - 1000 * 60 * 60 * 12) },
];

const STATUS_VARIANT: Record<Order["status"], "default" | "secondary" | "destructive"> = {
  완료: "default",
  처리중: "secondary",
  취소: "destructive",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="사이트 전반의 현황을 한눈에 확인하세요."
      />

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                {stat.change} 지난달 대비
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 최근 주문 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문 번호</TableHead>
                <TableHead>고객</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="text-right">일시</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_ORDERS.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.amount)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatRelativeTime(order.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
