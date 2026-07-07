"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { setAdminNotice } from "@/app/admin/actions";
import { deleteEvent } from "@/app/events/actions";

interface AdminEventRowActionsProps {
  eventId: string;
  eventTitle: string;
  adminNotice: string | null;
}

// 관리자 이벤트 관리 표의 행별 액션(공지 등록/강제 삭제)
export function AdminEventRowActions({
  eventId,
  eventTitle,
  adminNotice,
}: AdminEventRowActionsProps) {
  const [noticeContent, setNoticeContent] = useState(adminNotice ?? "");
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isNoticePending, startNoticeTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleSaveNotice = () => {
    setNoticeError(null);
    startNoticeTransition(async () => {
      const result = await setAdminNotice(eventId, noticeContent);
      if (result?.error) {
        setNoticeError(result.error);
      }
    });
  };

  const handleForceDelete = () => {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteEvent(eventId, { skipRedirect: true });
      if (result?.error) {
        setDeleteError(result.error);
      }
    });
  };

  return (
    <div className="flex justify-end gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            공지 등록
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공지 등록 — {eventTitle}</DialogTitle>
            <DialogDescription>
              참여자에게 전달할 공지사항을 입력하세요. 비워두면 공지가
              삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="공지 내용을 입력하세요"
            value={noticeContent}
            onChange={(e) => setNoticeContent(e.target.value)}
          />
          {noticeError && (
            <p className="text-sm text-destructive">{noticeError}</p>
          )}
          <DialogFooter>
            <Button onClick={handleSaveNotice} disabled={isNoticePending}>
              {isNoticePending ? "저장 중..." : "등록"}
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
            <AlertDialogTitle>이벤트를 강제 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{eventTitle}&quot; 이벤트가 목록에서 즉시 사라집니다.
              참여자의 참여/정산 이력은 계속 조회할 수 있도록 보존됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceDelete}
              disabled={isDeletePending}
            >
              {isDeletePending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
