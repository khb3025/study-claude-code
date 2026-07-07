import { Search, UserRoundX } from "lucide-react";
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
import { createClient } from "@/lib/supabase/server";

interface AdminUsersPageProps {
  searchParams: Promise<{ q?: string }>;
}

// 관리자 사용자 관리 페이지: 이름/이메일로 검색 가능한 실제 profiles 목록(조회/검색까지만 지원)
export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, email, nickname, full_name, created_at")
    .order("created_at", { ascending: false });

  const trimmed = q?.trim();
  if (trimmed) {
    query = query.or(`email.ilike.%${trimmed}%,nickname.ilike.%${trimmed}%`);
  }

  const { data: users } = await query;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">사용자 관리</h1>

      <form className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="이름 또는 이메일로 검색"
          className="pl-9"
        />
      </form>

      {users && users.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>가입일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
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
        <EmptyState
          icon={<UserRoundX />}
          title="조건에 맞는 사용자가 없습니다."
        />
      )}
    </div>
  );
}
