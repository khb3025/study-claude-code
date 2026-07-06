"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventStatusBadge } from "@/components/event-status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DUMMY_EVENTS,
  DUMMY_ORGANIZERS,
  DUMMY_PARTICIPANTS,
} from "@/app/events/dummy-data";

// 관리자 이벤트 관리 페이지: 검색, 강제 삭제, 공지 등록 액션 UI
export default function AdminEventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">이벤트 관리</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="이벤트 제목으로 검색" className="pl-9" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>비밀번호</TableHead>
            <TableHead>날짜</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>호스트</TableHead>
            <TableHead>참여자 수</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DUMMY_EVENTS.map((event) => {
            const participantCount = DUMMY_PARTICIPANTS.filter(
              (participant) =>
                participant.event_id === event.id &&
                participant.status === "confirmed",
            ).length;

            return (
              <TableRow key={event.id}>
                <TableCell>{event.title}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {event.password_hash ? "••••••••" : "-"}
                </TableCell>
                <TableCell>
                  {new Date(event.starts_at).toLocaleDateString("ko-KR")}
                </TableCell>
                <TableCell>
                  <EventStatusBadge status={event.status} />
                </TableCell>
                <TableCell>
                  {DUMMY_ORGANIZERS[event.organizer_id]?.name ??
                    event.organizer_id}
                </TableCell>
                <TableCell>{participantCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          공지 등록
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>공지 등록 — {event.title}</DialogTitle>
                          <DialogDescription>
                            참여자에게 전달할 공지사항을 입력하세요.
                          </DialogDescription>
                        </DialogHeader>
                        <Textarea placeholder="공지 내용을 입력하세요" />
                        <DialogFooter>
                          <Button onClick={() => {}}>
                            {/* TODO: 공지 등록 로직 구현 필요 */}
                            등록
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          강제 삭제
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            이벤트를 강제 삭제하시겠습니까?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            &quot;{event.title}&quot; 이벤트가 즉시 삭제되며
                            되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {}}>
                            {/* TODO: 이벤트 강제 삭제 로직 구현 필요 */}
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
