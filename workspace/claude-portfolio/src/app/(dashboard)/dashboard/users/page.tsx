import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/shared/page-header";
import { getInitials } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
  role: "관리자" | "사용자" | "게스트";
  status: "활성" | "비활성";
  joinedAt: string;
};

const USERS: User[] = [
  { id: "U001", name: "김철수", email: "kim@example.com", role: "관리자", status: "활성", joinedAt: "2025-01-15" },
  { id: "U002", name: "이영희", email: "lee@example.com", role: "사용자", status: "활성", joinedAt: "2025-02-20" },
  { id: "U003", name: "박민준", email: "park@example.com", role: "사용자", status: "비활성", joinedAt: "2025-03-05" },
  { id: "U004", name: "최지은", email: "choi@example.com", role: "게스트", status: "활성", joinedAt: "2025-04-11" },
  { id: "U005", name: "정우성", email: "jung@example.com", role: "사용자", status: "활성", joinedAt: "2025-05-08" },
  { id: "U006", name: "한소희", email: "han@example.com", role: "사용자", status: "비활성", joinedAt: "2025-06-01" },
];

const STATUS_VARIANT: Record<User["status"], "default" | "secondary"> = {
  활성: "default",
  비활성: "secondary",
};

const ROLE_VARIANT: Record<User["role"], "default" | "outline" | "secondary"> = {
  관리자: "default",
  사용자: "outline",
  게스트: "secondary",
};

export default function UsersPage() {
  const activeCount = USERS.filter((u) => u.status === "활성").length;
  const adminCount = USERS.filter((u) => u.role === "관리자").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="사용자 관리"
        description="등록된 사용자 목록을 확인하고 관리하세요."
      />

      {/* 요약 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{USERS.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              활성 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              관리자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{adminCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* 사용자 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사용자</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">가입일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
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
                  <TableCell>
                    <Badge variant={ROLE_VARIANT[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[user.status]}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {user.joinedAt}
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
