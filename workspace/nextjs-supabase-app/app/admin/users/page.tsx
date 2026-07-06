"use client";

import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 관리자 사용자 관리 페이지용 더미 목록(실제 auth.users 조인 전까지 로컬 목업)
const DUMMY_ADMIN_USERS = [
  {
    name: "김민준",
    email: "khb3025@gmail.com",
    joined_at: "2026-01-10",
    status: "활성",
  },
  {
    name: "이서연",
    email: "seoyeon@example.com",
    joined_at: "2026-02-14",
    status: "활성",
  },
  {
    name: "박지훈",
    email: "jihoon@example.com",
    joined_at: "2026-03-22",
    status: "활성",
  },
  {
    name: "최도영",
    email: "doyoung@example.com",
    joined_at: "2026-06-01",
    status: "정지",
  },
];

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">사용자 관리</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="이름 또는 이메일로 검색" className="pl-9" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead>상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DUMMY_ADMIN_USERS.map((user) => (
            <TableRow key={user.email}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.joined_at}</TableCell>
              <TableCell>
                <Badge
                  variant={user.status === "활성" ? "default" : "destructive"}
                >
                  {user.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
