"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
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
import { cancelParticipation } from "@/app/events/participant-actions";

interface ParticipantCancelButtonProps {
  participantId: string;
  eventId: string;
  // 서버 컴포넌트에서 event.starts_at 기준으로 미리 계산해 내려주는 컷오프 여부(24시간 이내면 true).
  // RPC와 동일한 정책을 UX에도 즉시 반영하기 위함(confirmed 상태에만 의미가 있음).
  isCutoff: boolean;
}

// 참여자 본인이 참여를 취소하는 버튼(주최자 액션과 분리된 별도 컴포넌트).
// confirmed 상태이면서 컷오프(이벤트 시작 24시간 이내) 구간이면 버튼 대신 안내 문구를 보여준다.
export function ParticipantCancelButton({
  participantId,
  eventId,
  isCutoff,
}: ParticipantCancelButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (isCutoff) {
    return (
      <span className="text-xs text-muted-foreground">
        이벤트 시작 24시간 전부터는 취소할 수 없습니다
      </span>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={isPending}>
          참여 취소
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>참여를 취소하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            취소 후 다시 참여하려면 재신청이 필요할 수 있습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>돌아가기</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await cancelParticipation(participantId, eventId);
              })
            }
          >
            취소 확정
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
