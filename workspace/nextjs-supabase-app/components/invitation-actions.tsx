"use client";

import { useState, useTransition } from "react";
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
import {
  acceptInvitation,
  blockOrganizer,
  declineInvitation,
} from "@/app/events/invite-actions";

interface InvitationActionsProps {
  invitationId: string;
  organizerId: string;
  organizerName: string;
}

// 초대 목록의 수락/거절/주최자 차단 버튼(실제 Server Action 연동)
// 이 컴포넌트는 항상 pending 상태인 초대에 대해서만 렌더링된다(목록 조회가 pending만 가져오므로)
export function InvitationActions({
  invitationId,
  organizerId,
  organizerName,
}: InvitationActionsProps) {
  const [isSubmitting, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={isSubmitting}
          onClick={() =>
            startTransition(async () => {
              const result = await acceptInvitation(invitationId);
              setErrorMessage(result.error);
            })
          }
        >
          수락
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          onClick={() =>
            startTransition(async () => {
              const result = await declineInvitation(invitationId);
              setErrorMessage(result.error);
            })
          }
        >
          거절
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive" disabled={isSubmitting}>
              이 주최자 차단
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {organizerName}님을 차단하시겠습니까?
              </AlertDialogTitle>
              <AlertDialogDescription>
                차단하면 이 주최자가 보내는 향후 초대를 받지 않습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                disabled={isSubmitting}
                onClick={() =>
                  startTransition(async () => {
                    const result = await blockOrganizer(organizerId);
                    setErrorMessage(result.error);
                  })
                }
              >
                차단
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
