import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader } from "@/components/shared/page-header";
import { getInitials, formatCurrency } from "@/lib/utils";

// 더미 사용자 데이터
const USERS = [
  { name: "김철수", email: "kim@example.com", role: "관리자", status: "활성", amount: 320000 },
  { name: "이영희", email: "lee@example.com", role: "사용자", status: "활성", amount: 185000 },
  { name: "박민준", email: "park@example.com", role: "사용자", status: "비활성", amount: 97000 },
  { name: "최지은", email: "choi@example.com", role: "게스트", status: "활성", amount: 540000 },
];

// FAQ 데이터
const FAQ = [
  {
    q: "이 스타터 킷은 무엇인가요?",
    a: "Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui 기반의 프로덕션 레디 스타터 킷입니다. 새 프로젝트를 빠르게 시작할 수 있도록 공통 컴포넌트와 레이아웃이 사전 구성되어 있습니다.",
  },
  {
    q: "shadcn/ui의 radix-nova 스타일이란?",
    a: "표준 default/new-york 스타일과 달리 data-slot, group/button 패턴을 사용하는 최신 radix-ui 기반 스타일입니다. shadcn add 명령으로 자동 설치됩니다.",
  },
  {
    q: "다크모드는 어떻게 동작하나요?",
    a: "next-themes가 html 태그에 .dark 클래스를 주입하고, globals.css의 @custom-variant dark 선언이 이를 감지해 CSS 변수를 전환합니다. OS 설정 자동 연동도 지원합니다.",
  },
];

export default function DataDisplayPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="데이터 표시"
        description="Avatar, Table, Tabs, Accordion, Progress 컴포넌트 예제"
      />

      <Separator />

      {/* Avatar */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Avatar</h2>
        <div className="flex flex-wrap items-center gap-4">
          {USERS.map((user) => (
            <div key={user.email} className="flex items-center gap-2">
              <Avatar>
                {/* 실제 이미지 없으면 이니셜 표시 */}
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Progress */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Progress</h2>
        <div className="max-w-sm space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>스토리지 사용량</span>
              <span className="text-muted-foreground">72%</span>
            </div>
            <Progress value={72} />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>목표 달성률</span>
              <span className="text-muted-foreground">45%</span>
            </div>
            <Progress value={45} />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>온보딩 완료</span>
              <span className="text-muted-foreground">90%</span>
            </div>
            <Progress value={90} />
          </div>
        </div>
      </section>

      <Separator />

      {/* Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Table</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사용자</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">사용 금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {USERS.map((user) => (
              <TableRow key={user.email}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "활성" ? "default" : "secondary"}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(user.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <Separator />

      {/* Tabs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tabs</h2>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="analytics">통계</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              개요 탭 — 프로젝트 현황 및 요약 정보를 표시합니다.
            </p>
          </TabsContent>
          <TabsContent value="analytics" className="mt-4 rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              통계 탭 — 방문자 수, 매출, 전환율 차트가 위치합니다.
            </p>
          </TabsContent>
          <TabsContent value="settings" className="mt-4 rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              설정 탭 — 프로젝트 구성 옵션을 관리합니다.
            </p>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Accordion (FAQ) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Accordion (FAQ)</h2>
        <Accordion type="single" collapsible className="max-w-xl">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
