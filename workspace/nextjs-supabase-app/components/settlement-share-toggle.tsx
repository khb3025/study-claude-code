"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
import { toggleSettlementPaid } from "@/app/events/settlement-actions";

// 정산 항목의 입금 완료 여부를 토글하는 체크박스(주최자 전용, 그 외 사용자는 텍스트만 표시)
// 완료로 전환하면 이후 상태를 되돌릴 수 없으므로, 전환 전 경고 알림창으로 재확인을 받는다.
export function SettlementShareToggle({
  shareId,
  eventId,
  isPaid,
  editable,
}: {
  shareId: string;
  eventId: string;
  isPaid: boolean;
  editable: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (!editable || isPaid) {
    return <span>{isPaid ? "완료" : "미완료"}</span>;
  }

  return (
    <AlertDialog>
      <div className="flex items-center gap-2">
        <AlertDialogTrigger asChild>
          <Checkbox
            checked={isPaid}
            disabled={isPending}
            aria-label="정산 완료 처리"
          />
        </AlertDialogTrigger>
        <span>미완료</span>
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>정산을 완료 처리하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            완료로 전환하면 이후에는 다시 미완료로 되돌릴 수 없습니다. 완료
            시각이 기록되어 당사자가 언제든 정산 완료 확인증을 확인할 수
            있습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await toggleSettlementPaid(shareId, true, eventId);
              })
            }
          >
            완료 처리
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
