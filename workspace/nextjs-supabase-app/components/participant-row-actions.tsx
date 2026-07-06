"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { ParticipantStatus } from "@/types/event";

interface ParticipantRowActionsProps {
  status: ParticipantStatus;
}

// 참여자 행의 액션 버튼: 승인 대기 상태는 승인/거절, 그 외에는 강퇴 버튼을 노출한다
export function ParticipantRowActions({ status }: ParticipantRowActionsProps) {
  if (status === "pending_approval") {
    return (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => {}}>
          {/* TODO: 참여 승인 로직 구현 필요 */}
          승인
        </Button>
        <Button size="sm" variant="destructive" onClick={() => {}}>
          {/* TODO: 참여 거절 로직 구현 필요 */}
          거절
        </Button>
      </div>
    );
  }

  if (status === "kicked" || status === "cancelled") {
    return null;
  }

  return (
    <div className="flex justify-end">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive">
            강퇴
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>참여자를 강퇴하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              강퇴 사유를 입력해주세요. 사유는 참여자에게 전달될 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3">
            <Textarea placeholder="강퇴 사유를 입력하세요" />
            <div className="flex items-center gap-2">
              <Checkbox id="kick-reason-hidden" />
              <Label
                htmlFor="kick-reason-hidden"
                className="text-sm font-normal"
              >
                사유를 참여자에게 전달하지 않음
              </Label>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => {}}>
              {/* TODO: 강퇴 처리 서버 액션 연동 필요 */}
              강퇴 확정
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
